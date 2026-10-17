const {randomBytes,createHmac,timingSafeEqual}=require('node:crypto');
const secret=process.env.CSRF_SECRET||randomBytes(32).toString('hex');
const sign=token=>createHmac('sha256',secret).update(token).digest('hex');
module.exports=(req,res,next)=>{
  const cookie=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('form_token='));
  const value=cookie?cookie.slice(11):'';const [token,signature]=value.split('.');
  const valid=token&&signature&&/^[a-f0-9]{48}$/.test(token)&&/^[a-f0-9]{64}$/.test(signature)&&timingSafeEqual(Buffer.from(signature),Buffer.from(sign(token)));
  if(req.method==='POST'&&(!valid||typeof req.body._csrf!=='string'||req.body._csrf!==token))return res.status(403).render('error',{title:'Formulario vencido',message:'Recarga el formulario e inténtalo de nuevo.'});
  res.locals.csrf=valid?token:randomBytes(24).toString('hex');
  if(!valid)res.cookie('form_token',`${res.locals.csrf}.${sign(res.locals.csrf)}`,{httpOnly:true,sameSite:'strict',secure:req.secure,path:'/'});
  next();
};
