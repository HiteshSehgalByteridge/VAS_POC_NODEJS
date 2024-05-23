
const mySql = require('mysql2');

const mySqlConnection = mySql.createConnection({
    host: 'localhost',
    database: 'vas_db_1',
    user: 'root',
    password: 'root'
});

module.exports = mySqlConnection;

