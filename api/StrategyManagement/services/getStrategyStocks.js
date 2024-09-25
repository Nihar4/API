const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { getAllData } = require("./getAllData");
const { getStockDetails } = require("./getStockDetails");

const getStrategyStocks = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const query = `
        SELECT symbol
        FROM bucket_stocks
        WHERE id = ?;
      `;
            const params = [id];

            const result = await ExecuteQuery(query, params);

            const dlData = await getAllData(id);
            let totalReturn = 0;
            let totalStocksWithPrediction = 0;

            const promises = result.map(async (stockObj) => {
                const stockSymbol = stockObj.symbol;
                const stockDetails = await getStockDetails(stockSymbol);

                const matchingDlData = dlData.dl_data.find(dlObj => dlObj.security === stockSymbol);

                if (matchingDlData) {
                    stockDetails.predict_percentage = parseFloat(matchingDlData.predict_percentage);
                    stockDetails.date_completed = matchingDlData.date_completed || new Date();
                    stockDetails.status = matchingDlData.status;

                    if (!isNaN(stockDetails.predict_percentage)) {
                        totalReturn += parseFloat(stockDetails.predict_percentage) * 100;
                        totalStocksWithPrediction++;
                    }

                }
                else {
                    stockDetails.predict_percentage = null;
                    stockDetails.date_completed = new Date();
                    stockDetails.status = "Pending";
                }

                return {
                    symbol: stockSymbol,
                    ...stockDetails,
                };
            });

            const stockDetailsArray = await Promise.all(promises);
            const averageReturn = totalStocksWithPrediction > 0 ? totalReturn / totalStocksWithPrediction : 0;
            // const averageReturn = totalReturn;

            resolve({ data: stockDetailsArray, return: averageReturn });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { getStrategyStocks };
