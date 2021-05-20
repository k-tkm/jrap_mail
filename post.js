const express = require("express");
const mysql = require("mysql");
const app = express();

//mysqlに接続

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.post("/mail/", function (req, res) {
  //mysqlに接続
  var con = mysql.createConnection({
    host: "database-score.c3idtfkpwxpj.ap-northeast-1.rds.amazonaws.com",
    user: "tkm",
    password: "oiho3456ddf",
    database: "mail_db",
  });
  //
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });
  //sql文
  const sql = `INSERT INTO name_mail (username, email) VALUES ('${req.body.username}','${req.body.email}')`;
  //formの内容をmysqlに挿入
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("I record inserted");
  });
});

app.listen(8000);
