const { default: yahooFinance } = require("yahoo-finance2");
const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetPortfolioChart = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const query = `
                SELECT *
                FROM portfolio_performance
                WHERE strategy_id = ?
            `;
            const data = await ExecuteQuery(query, [id]);
            if (data.length == 0) resolve([]);

            data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            const firstPortfolioValue = parseFloat(data[0].portfolio_value);
            const firstIndexValue = parseFloat(data[0].index_value);

            const normalizedData = data.map(row => ({
                portfolioValue: parseFloat(row.portfolio_value),
                indexValue: parseFloat(row.index_value),
                basePortfolioValue: (parseFloat(row.portfolio_value) / firstPortfolioValue) * 100,
                portfolioValueChange: (((parseFloat(row.portfolio_value) / firstPortfolioValue) * 100) - 100),
                baseIndexValue: (parseFloat(row.index_value) / firstIndexValue) * 100,
                indexValueChange: ((parseFloat(row.index_value) / firstIndexValue) * 100) - 100,
                date: (row.timestamp)
            }));
            resolve(normalizedData);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { GetPortfolioChart };
