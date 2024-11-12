const { connection } = require("../connection/index")

const ExecuteQueryNew = (query, params) => {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, result) => {
            if (err) {
                reject(err.message);
            }
            resolve(JSON.stringify(result));
        });
    });
}

module.exports = { ExecuteQueryNew }