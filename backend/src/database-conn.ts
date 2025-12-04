import mysql from 'mysql2';

const connection = mysql.createConnection({
    database: process.env.MYSQL_DB,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PWD,
    user: process.env.MYSQL_USER
})

export default connection;
