

const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const DeletePortfolioStrategy = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = 'DELETE FROM portfolio_management WHERE id = ?';
        const params = [id];
        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { DeletePortfolioStrategy };
