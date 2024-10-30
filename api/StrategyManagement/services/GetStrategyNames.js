const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetStrategyNames = async (id, email) => {
    return new Promise(async (resolve, reject) => {
        const query = `SELECT name FROM buckets WHERE email = ? AND id != ?`;
        const params = [email, id];

        try {
            const data = await ExecuteQuery(query, params);

            const namesArray = data.map(row => row.name);

            resolve(namesArray);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { GetStrategyNames };
