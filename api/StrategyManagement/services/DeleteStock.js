const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const DeleteStock = async (id, symbol, email) => {
    return new Promise(async (resolve, reject) => {
        const query = 'DELETE FROM bucket_stocks WHERE id = ? AND symbol = ?';
        const params = [id, symbol];
        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { DeleteStock };
