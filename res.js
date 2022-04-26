const mysql = require("mysql")
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_auth",
})
db.connect((err) => {
  // you should probably add reject instead of throwing error
  // reject(new Error());
  if (err) {
    throw err
  }
  console.log("Mysql: Connected")
})
db.promise = (sql) => {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(new Error())
      } else {
        resolve(result)
      }
    })
  })
}

var data
db.promise(`SELECT * FROM t_auth WHERE 1`)
  .then((result) => {
    console.log(result)
    data = result
    console.log("ini data", data)
  })
  .catch((err) => {
    console.log(err)
  })
console.log(data)
