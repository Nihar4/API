const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const DeleteStrategy_Eureka = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = 'DELETE FROM strategy_Eureka WHERE id = ?';
        const params = [id];
        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { DeleteStrategy_Eureka };
