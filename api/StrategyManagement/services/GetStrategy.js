const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetStrategy = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = `SELECT * FROM strategy WHERE id = ${id}`;
        try {
            const data = await ExecuteQuery(query);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { GetStrategy };
