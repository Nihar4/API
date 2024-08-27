const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetPortfolioTrades = async (strategy_id) => {
    return new Promise(async (resolve, reject) => {
        const query = `
      SELECT 
        t.email,
        t.strategy_id,
        t.symbol,
        t.quantity,
        t.tentativeprice,
        t.netprice,
        t.amount,
        t.type,
        t.date,
        p.asset_class_name AS category
      FROM swiftfoliosuk.trades t
      LEFT JOIN swiftfoliosuk.portfolio_management p 
        ON t.email = p.email AND t.symbol = p.stock
      WHERE t.strategy_id = '${strategy_id}'
    `;

        try {
            const data = await ExecuteQuery(query);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { GetPortfolioTrades };
