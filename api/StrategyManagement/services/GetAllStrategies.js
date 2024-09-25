const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetAllStrategies = async (email) => {
    return new Promise(async (resolve, reject) => {
        const query = `SELECT * FROM buckets WHERE email='${email}'`;
        try {
            const data = await ExecuteQuery(query);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { GetAllStrategies };
