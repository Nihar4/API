const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetPortfolioStrategy = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = `SELECT * FROM portfolio_management WHERE id = ${id} `;
        try {
            const data = await ExecuteQuery(query);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { GetPortfolioStrategy };
