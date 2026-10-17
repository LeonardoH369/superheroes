const {Sequelize}=require('sequelize');const c=require('./cli').development;module.exports=new Sequelize(c.database,c.username,c.password,c);
