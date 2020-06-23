const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host:'localhost',
//     user:'root',
//     database:'mydb2',
//     password:'1234'
// });

const pool = mysql.createPool({
    host:'****************************',
    user:'*****************',
    database:'******************',
    password:'************'
});

module.exports = pool.promise();

//CHANGE HERE AS WELL WHENEVER SWITCHING DBs 1