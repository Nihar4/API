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

            const query = `
        INSERT INTO swiftfoliosuk.portfolio_performance (
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
