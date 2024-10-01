const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { fetchQuoteData } = require("../../../utils/YahooFinanceApi");

const ProcessPortfolioTrades = async (strategy_id, email, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = `INSERT INTO trades 
                (email, strategy_id, internal_ref_number, symbol, quantity, tentativeprice, netprice, amount, type, date) 
                VALUES `;

            const valuesArray = [];

            for (const [symbol, quantity] of Object.entries(data)) {
                if (!isNaN(quantity) && quantity > 0) {
                    const internal_ref_number = Date.now().toString();
                    const generated_ref_number =
                        Math.floor(100 + Math.random() * 900) +
                        internal_ref_number.slice(3, 5) +
                        internal_ref_number.slice(-5);

                    const symbolData = await fetchQuoteData(symbol);
                    console.log(symbolData)
                    const tentativeprice = symbolData.regularMarketPrice;

                    const amount = tentativeprice * quantity;
                    const type = 'Buy';
                    const date = new Date().toISOString();

                    valuesArray.push(
                        `('${email}', '${strategy_id}', '${generated_ref_number}', '${symbol}', ${quantity}, '${tentativeprice}', NULL, ${amount}, '${type}', '${date}')`
                    );
                } else {
                    console.log(`Invalid data for symbol: ${symbol}, quantity: ${quantity}`);
                }
            }

            if (valuesArray.length > 0) {
                query += valuesArray.join(", ");
                const result = await ExecuteQuery(query);
                resolve(result);
            } else {
                console.log("No valid trades to insert.");
                resolve("No valid trades to insert.");
            }
        } catch (error) {
            console.error("Error during insert operation:", error);
            reject(error);
        }
    });
};

module.exports = { ProcessPortfolioTrades };
