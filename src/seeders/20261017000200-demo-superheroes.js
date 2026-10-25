module.exports={async up(q){await require('../storage').seedPhotos();const now=new Date();await q.bulkInsert('superheroes',[
{real_name:'Elena Torres',alias:'Aurora',photo_path:'/storage/photos/demo-aurora.jpg',information:'Ingeniera de energía que transforma la luz en escudos protectores. Defiende su ciudad y colabora en proyectos de energía limpia.'},
{real_name:'Mateo Vega',alias:'Centinela',photo_path:'/storage/photos/demo-centinela.jpg',information:'Especialista en robótica. Su armadura permite rescates de precisión y le ayuda a proteger a su comunidad.'},
{real_name:'Lucía Ríos',alias:'Marea',photo_path:'/storage/photos/demo-marea.jpg',information:'Bióloga marina con la habilidad de controlar corrientes de agua. Su misión es preservar los océanos y la vida marina.'}
].map(x=>({...x,created_at:now,updated_at:now})));},async down(q){await q.bulkDelete('superheroes',{alias:['Aurora','Centinela','Marea']});}};
