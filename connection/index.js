const mysql = require("mysql");
const connection = mysql.createPool({
  host: "yottol-rds.copzpeo4bk3d.ap-south-1.rds.amazonaws.com",
  user: "root",
  password: "BxCdkbmW8gVG1Cj5jpA0",
  database: "swiftfoliosuk",
  multipleStatements: true,
});


const connectDB = async () => {
  connection.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database: ' + err.stack);
      return;
    }
    console.log('Connected to the database as ID ' + connection.threadId);
    connection.release();
  });
}

module.exports = { connection, connectDB };