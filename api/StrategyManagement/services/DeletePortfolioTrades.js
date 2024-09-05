const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const DeletePortfolioTrades = async (strategy_id, internal_ref_numbers) => {
    return new Promise(async (resolve, reject) => {
        const placeholders = internal_ref_numbers.map(() => '?').join(',');

        const query = `
      DELETE FROM swiftfoliosuk.trades
      WHERE strategy_id = ?
      AND internal_ref_number IN (${placeholders})
    `;

        const params = [strategy_id, ...internal_ref_numbers];

        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { DeletePortfolioTrades };
