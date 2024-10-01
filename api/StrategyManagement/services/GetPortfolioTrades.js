const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const GetPortfolioTrades = async (strategy_id) => {
  return new Promise(async (resolve, reject) => {
    const query = `
      SELECT 
        t.email,
        t.strategy_id,
        t.internal_ref_number,
        t.symbol,
        t.quantity,
        t.tentativeprice,
        t.netprice,
        t.amount,
        t.type,
        t.date,
        COALESCE(p.asset_class_name, 'Other') AS category
      FROM trades t
      LEFT JOIN portfolio_management p 
        ON t.email = p.email AND t.symbol = p.stock AND p.id = '${strategy_id}'
      WHERE t.strategy_id = '${strategy_id}'
      ORDER BY t.date DESC
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
