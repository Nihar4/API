const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const InsertStock = async (id, symbol) => {
    return new Promise(async (resolve, reject) => {


        const query = 'INSERT INTO bucket_stocks (id , symbol) VALUES (?,?)';
        const params = [id, symbol];

        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { InsertStock };
