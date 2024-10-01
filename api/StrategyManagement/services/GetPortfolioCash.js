const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetPortfolioCash = async (strategy_id) => {
    return new Promise(async (resolve, reject) => {
        const query = `
      SELECT 
        *
      FROM cash 
      WHERE strategy_id = '${strategy_id}'
    `;

        try {
            const data = await ExecuteQuery(query);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { GetPortfolioCash };
