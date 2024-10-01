const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const getjobqueue = async (email_id) => {
    return new Promise(async (resolve, reject) => {
        const query = 'SELECT * FROM dl_jobs WHERE email = ? ORDER BY date_created DESC LIMIT 500';
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