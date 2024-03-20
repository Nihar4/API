const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const getAllData = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = 'SELECT * FROM swiftfoliosuk.dl_jobs WHERE strategy_id = ?';
        const params = [id];

        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { getAllData };
