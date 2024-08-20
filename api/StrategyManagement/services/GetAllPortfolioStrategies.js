

const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetAllPortfolioStrategies = async (email) => {
    return new Promise(async (resolve, reject) => {
        const query = `SELECT * FROM portfolio_management WHERE email='${email}'`;
        try {
            const data = await ExecuteQuery(query);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { GetAllPortfolioStrategies };
