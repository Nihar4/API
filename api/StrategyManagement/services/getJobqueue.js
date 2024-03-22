const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const getjobqueue = async (email_id) => {
    return new Promise(async (resolve, reject) => {
        const query = 'SELECT * FROM swiftfoliosuk.dl_jobs WHERE email = ?';
        const params = [email_id];

        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { getjobqueue };