var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql      = require('mysql');
var squel = require("squel");
var SqlString = require('sqlstring');

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'nodemysql'
});


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use('/users', usersRouter); 

class Dbfeatures {
  constructor(){
    this.name = name;
  }
}

db.connect((err)=>{
  if(err){
    throw err;
  }
  console.log('mysql connected');
});

app.get('/', async (req,res)=>{
  let sql1 = 'select * from orders';
  let sql2 = 'select * from purchase_receipt';
  let firstTable;
  db.query(sql1, (err, result) => {
    firstTable = result; 

    db.query(sql2, (err,result)=>{
      secondTable = result;
      res.render('index', { firstTable: firstTable, secondTable: result });
    })
    
  }); 
})

app.post('/paramquery', (req,res)=>{
  let a = req.body.row;
  let b = req.body.limit;
  let sql;
  if(req.body.limit){
    if(req.body.sign == "="){
      sql = `select * from orders WHERE ${a} = ${b}`;
      sql = SqlString.format('select * from orders WHERE ?? = ?', [req.body.row,req.body.limit]);
    }
    if(req.body.sign == ">"){
      sql = SqlString.format('select * from orders WHERE ?? > ?', [req.body.row,req.body.limit]);
    }
    if(req.body.sign == "="){
      sql = SqlString.format('select * from orders WHERE ?? < ?', [req.body.row,req.body.limit]);
    }
    console.log(sql);
  }
  else{
    sql = `select * from orders`;
  }
  db.query('select * from orders',(err,result)=>{
    let fulldata = result;
    db.query(sql, (err,result)=>{
      if(err) throw err;
      res.render('query',{fulldata,result});
    })
  });
})





app.post('/paramquery2', (req,res)=>{
  let sql = `select * from orders`;
  function getValue(obj,key){
    let wtf;
    if(key =='orderID'){
      wtf = obj.orderID;
      
    }
    if(key == 'price'){
      wtf = obj.price;
    }
    if(key == 'count'){
      wtf = obj.count;
    }
    return wtf;
  };
  let array = [];



  db.query(sql,(err,result)=>{
    if(req.body.limit){
      result.map(function(item){
 
        if(req.body.sign == ">"){
          if(getValue(item,req.body.row) > req.body.limit){
            array.push(item);
          }
   
        }
        if(req.body.sign == "<"){
          if(getValue(item,req.body.row) < req.body.limit){
            array.push(item);
          }

        }  
        if(req.body.sign == "="){
          let newVal = getValue(item,req.body.row);
 
          if(newVal == req.body.limit){
            array.push(item);
           
          }
        }
      })
      
      let sql1 = 'select * from orders';
      let firstTable;
      db.query(sql1, (err, result) => {
        firstTable = result; 
          res.render('query',{fulldata:firstTable, result:array});
      });

    }
 
  });

});
  

app.get('/createdb', (req, res) => {
  let sql = 'CREATE DATABASE nodemysql1';
  db.query(sql, (err, result) => {
      if(err) throw err;
      console.log(result);
      res.send('Database created...');
  });
});

app.get('/gettable', (req,res)=>{
  let sql = "select * from orders where orderID > 1";
  db.query(sql, (err,result)=>{
    console.log()
    res.send(result);
  });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
