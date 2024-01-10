const { connection } = require("../connection/index")

const ExecuteQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

module.exports = { ExecuteQuery }