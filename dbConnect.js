var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'mysql.eecs.oregonstate.edu',
  user            : 'cs290_pfohlj',
  password        : '4567',
  database        : 'cs290_pfohlj'
});

module.exports.pool = pool;