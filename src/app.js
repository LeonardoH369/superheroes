const express=require('express');const path=require('node:path');
const app=express();app.disable('x-powered-by');app.set('view engine','ejs');app.set('views',path.join(__dirname,'views'));
app.use((req,res,next)=>{res.set('Content-Security-Policy',"default-src 'self'; img-src 'self' https: http:; style-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");res.set('X-Content-Type-Options','nosniff');res.locals.appName='superheroes';res.locals.notice='';next();});
app.use(express.static(path.join(__dirname,'../public')));app.use(express.urlencoded({extended:false,limit:'24kb'}));app.use(require('./middleware/forms'));
app.use(require('./routes/web'));app.use((req,res)=>res.status(404).render('error',{title:'No encontrado',message:'La página solicitada no existe.'}));
app.use((err,req,res,next)=>{const status=err.status||500;if(status===500)console.error(err);res.status(status).render('error',{title:status===500?'Error del servidor':'Solicitud inválida',message:status===500?'No se pudo completar la operación.':err.message});});
module.exports=app;
