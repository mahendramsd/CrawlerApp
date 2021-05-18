const mysql = require("mysql"); 

var mysqlCoonection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "msd123",
    database : "crawler_db", 
    multipleStatements : true
});

mysqlCoonection.connect((error) => {
    if(!error) {
        console.log("Database Connected");
    } else {
        onsole.log("Database Connection Failed");
    }
});

module.exports = mysqlCoonection;