const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {once}=require('node:events');
const fs=require('node:fs/promises');const path=require('node:path');const os=require('node:os');
const {randomUUID}=require('node:crypto');
assert.equal(process.env.DB_NAME,'superheroes_test','Usar exclusivamente superheroes_test');
const temp=path.join(os.tmpdir(),'superheroes-activity10-'+randomUUID());process.env.STORAGE_ROOT=temp;
const sharp=require('sharp');const app=require('../src/app');const db=require('../src/config/database');const Hero=require('../src/models/Superhero');
const run=randomUUID().slice(0,8);const values={real_name:'Persona de prueba',alias:'Prueba '+run,information:'Personaje ficticio de prueba.'};
let server,base,cookie,csrf,png,created,oldPhoto,newPhoto;
before(async()=>{
  await db.authenticate();await fs.mkdir(path.join(temp,'photos'),{recursive:true});
  png=await sharp({create:{width:40,height:40,channels:3,background:'#234567'}}).png().toBuffer();
  server=app.listen(0,'127.0.0.1');await once(server,'listening');base='http://127.0.0.1:'+server.address().port;
  const r=await fetch(base+'/superheroes/create');cookie=r.headers.get('set-cookie').split(';')[0];csrf=(await r.text()).match(/name="_csrf" value="([^"]+)"/)[1];
});
after(async()=>{
  if(created)await Hero.destroy({where:{id:created},force:true});
  if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}await db.close();
  // Exclusivamente el directorio temporal de esta prueba; nunca storage de la aplicación.
  await fs.rm(temp,{recursive:true,force:true});
});
async function post(url,fields={},file,token=csrf){const body=/\/(delete|restore)$/.test(url)?new URLSearchParams():new FormData();for(const[k,v]of Object.entries({...fields,_csrf:token}))body.set(k,v);if(file)body.set('photo',new Blob([file],{type:'image/png'}),'foto.png');return fetch(base+url,{method:'POST',headers:{cookie},body,redirect:'manual'});}
async function page(url){const r=await fetch(base+url,{headers:{cookie}});return {status:r.status,text:await r.text()};}
const photoFile=url=>path.join(temp,'photos',path.basename(url));
test('listado activo y papelera separan registros por deleted_at',async()=>{
  assert.ok(await Hero.count({paranoid:false})>=10);const p=await page('/superheroes');assert.equal(p.status,200);assert.match(p.text,/Aurora/);assert.doesNotMatch(p.text,/<h2>Bastión<\/h2>/);
  assert.match((await page('/superheroes/trash')).text,/Bastión/);assert.match((await page('/superheroes/create')).text,/multipart\/form-data/);
});
test('alta exige archivo y rechaza URLs o rutas manuales',async()=>{
  assert.equal((await post('/superheroes',values)).status,422);
  assert.equal((await post('/superheroes',{...values,photo_url:'https://example.com/foto.png'},png)).status,422);
  assert.equal((await post('/superheroes',{...values,photo_path:'../../x'},png)).status,422);
  assert.equal((await fs.readdir(path.join(temp,'photos'))).length,0);
});
test('alta guarda JPEG local con ruta relativa y sirve la imagen',async()=>{
  const r=await post('/superheroes',values,png);assert.equal(r.status,303);created=Number(r.headers.get('location').match(/superheroes\/(\d+)/)[1]);
  oldPhoto=(await Hero.findByPk(created)).photo_path;assert.match(oldPhoto,/^\/storage\/photos\/[a-f0-9-]+\.jpg$/);assert.equal((await sharp(photoFile(oldPhoto)).metadata()).format,'jpeg');
  const image=await fetch(base+oldPhoto);assert.equal(image.status,200);assert.match(image.headers.get('content-type'),/image\/jpeg/);
  assert.equal((await page('/superheroes/'+created)).status,200);assert.equal((await page('/superheroes/'+created+'/edit')).status,200);
});
test('edición sin archivo conserva foto y escapa HTML',async()=>{
  assert.equal((await post('/superheroes/'+created+'/update',{...values,information:'<script>alert(1)</script>'})).status,303);
  assert.equal((await Hero.findByPk(created)).photo_path,oldPhoto);const p=await page('/superheroes/'+created);assert.match(p.text,/&lt;script&gt;/);assert.doesNotMatch(p.text,/<script>alert/);
});
test('reemplazar foto conserva archivo anterior y crea uno distinto',async()=>{
  assert.equal((await post('/superheroes/'+created+'/update',values,png)).status,303);newPhoto=(await Hero.findByPk(created)).photo_path;assert.notEqual(newPhoto,oldPhoto);await fs.access(photoFile(oldPhoto));await fs.access(photoFile(newPhoto));
});
test('CSRF impide altas y escrituras de archivos',async()=>{
  const before=await fs.readdir(path.join(temp,'photos'));assert.equal((await post('/superheroes',{...values,alias:'CSRF '+run},png,'bad')).status,403);assert.deepEqual(await fs.readdir(path.join(temp,'photos')),before);
  assert.equal((await post('/superheroes/'+created+'/delete',{},undefined,'bad')).status,403);
});
test('rechaza archivos falsos y mayores de 5 MB sin persistirlos',async()=>{
  const before=await fs.readdir(path.join(temp,'photos'));
  assert.equal((await post('/superheroes',{...values,alias:'Falso '+run},Buffer.from('<script>hola</script>'))).status,422);
  assert.equal((await post('/superheroes',{...values,alias:'Grande '+run},Buffer.alloc(5*1024*1024+1))).status,422);
  assert.deepEqual(await fs.readdir(path.join(temp,'photos')),before);
});
test('baja conserva fila y fotos y oculta ficha y edición',async()=>{
  assert.equal((await page('/superheroes/'+created+'/delete')).status,200);assert.equal((await post('/superheroes/'+created+'/delete')).status,303);assert.equal(await Hero.findByPk(created),null);
  const h=await Hero.findByPk(created,{paranoid:false});assert.ok(h.deletedAt);assert.equal(h.photo_path,newPhoto);await fs.access(photoFile(oldPhoto));await fs.access(photoFile(newPhoto));assert.equal((await fetch(base+newPhoto)).status,200);
  assert.equal((await page('/superheroes/'+created)).status,404);assert.equal((await page('/superheroes/'+created+'/edit')).status,404);assert.match((await page('/superheroes/trash')).text,new RegExp(values.alias));
});
test('restauración exige CSRF y recupera misma fila y fotografía',async()=>{
  assert.equal((await page('/superheroes/'+created+'/restore')).status,200);assert.equal((await post('/superheroes/'+created+'/restore',{},undefined,'bad')).status,403);
  assert.equal((await post('/superheroes/'+created+'/restore')).status,303);const h=await Hero.findByPk(created);assert.equal(h.deletedAt,null);assert.equal(h.photo_path,newPhoto);
  assert.equal((await page('/superheroes/'+created)).status,200);assert.doesNotMatch((await page('/superheroes/trash')).text,new RegExp(values.alias));assert.equal((await post('/superheroes/'+created+'/restore')).status,409);
});
test('alias únicos e identificadores inválidos son rechazados',async()=>{
  assert.equal((await post('/superheroes',values,png)).status,422);assert.equal((await page('/superheroes/no')).status,400);assert.equal((await page('/superheroes/999999999')).status,404);assert.equal((await page('/superheroes/999999999/restore')).status,404);
});
