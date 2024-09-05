const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const UpdatePortfolioTrades = async (strategy_id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const tradeDate = new Date().toISOString();
            const updateQuery = `
                        UPDATE swiftfoliosuk.trades 
                        SET 
                            quantity = ${data.quantity}, 
                            netprice = '${data.netprice}', 
                            amount = ${data.amount}, 
                            date = '${tradeDate}'
                        WHERE 
                            strategy_id = '${strategy_id}' 
                            AND internal_ref_number = '${data.internal_ref_number}'
                    `;
            const result = await ExecuteQuery(updateQuery);
            resolve(result);
        } catch (error) {
            console.error("Error during insert operation:", error);
            reject(error);
        }
    });
};

module.exports = { UpdatePortfolioTrades };
