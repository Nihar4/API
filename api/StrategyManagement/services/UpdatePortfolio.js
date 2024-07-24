const { default: yahooFinance } = require("yahoo-finance2");
const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const UpdatePortfolio = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const strategy_id = data.id;
            const totalInvestment = data.totalPortfolio.toString();
            const remainingAmount = data.cashAmount.toString();

            const portfolio = data.data.map(item => ({
                symbol: item.symbol,
                noOfShares: item.noOfShares,
                currentPrice: item.currentPrice,
                weight: item.weight,
                market_cap: item.market_cap,
                amount: item.amount
            }));

            const portfolioString = JSON.stringify({ ...data, data: portfolio });

            const selectQuery = `SELECT * FROM portfolio_holdings WHERE strategy_id = ?`

            const selectData = await ExecuteQuery(selectQuery, [strategy_id]);

            if (selectData.length == 0) {
                const InsertQuery = `
                INSERT INTO portfolio_performance (
                strategy_id, 
                portfolio_value, 
                index_value,
                timestamp
                ) VALUES (
                ?, ?, ?, CONVERT_TZ(NOW(), '+00:00', '+05:30')
                )
            `;
                const niftyValue = await yahooFinance.quote('^NSEI');
                const InsertValues = [
                    strategy_id,
                    10000000,
                    niftyValue.regularMarketPrice
                ];
                await ExecuteQuery(InsertQuery, InsertValues);

            }

            const query = `
        INSERT INTO portfolio_holdings (
          strategy_id, 
          portfolio, 
          portfolio_value, 
          cash_value, 
          timestamp
        ) VALUES (
          ?, ?, ?, ?, CONVERT_TZ(NOW(), '+00:00', '+05:30')
        )
      `;

            const values = [
                strategy_id,
                portfolioString,
                totalInvestment,
                remainingAmount
            ];

            await ExecuteQuery(query, values);
            resolve({ message: "Portfolio updated successfully" });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { UpdatePortfolio };
