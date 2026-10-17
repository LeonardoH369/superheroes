function id(value){if(!/^[1-9]\d*$/.test(value)||!Number.isSafeInteger(Number(value))){const e=new Error('Identificador inválido');e.status=400;throw e;}return Number(value);}
function missing(record){if(!record){const e=new Error('Registro no encontrado');e.status=404;throw e;}return record;}
const text=(value)=>typeof value==='string'?value.trim():'';
module.exports={id,missing,text};
