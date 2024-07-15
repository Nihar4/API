const { default: yahooFinance } = require("yahoo-finance2");
const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { GetPredictionOnlyWorker } = require("./GetPerformanceDataWorker");
const { getStockPrediction } = require("./getStockPrediction");
const { GetPerformaceData } = require("./GetPerformaceData");


const GetPortfolio = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const query = `
                SELECT *
                FROM portfolio_performance
                WHERE strategy_id = ?
                ORDER BY timestamp DESC
                LIMIT 1
            `;
            const data = await ExecuteQuery(query, [id]);

            let result = {
                totalPortfolio: 10000000,
                totalInvestmentAmount: 0,
                cashAmount: 10000000,
                id: id,
                data: []
            };

            if (data.length > 0) {
                result = JSON.parse(data[0].portfolio);
                const calcPred = [];

                const symbolArray = result.data.map((item) => item.symbol);
                const StockData = await yahooFinance.quote(symbolArray);

                await Promise.all(result.data.map(async (item, index) => {
                    const pred = await getStockPrediction(item.symbol);
                    if (pred) {
                        item.pred_percentage = pred * 100;
                        item.market_cap = StockData[index].marketCap;
                        item.currentPrice = StockData[index].regularMarketPrice;
                        item.amount = item.noOfShares * StockData[index].regularMarketPrice;
                    } else {
                        calcPred.push(item.symbol);
                    }
                }));
                if (calcPred.length > 0) {
                    const predictions = await GetPerformaceData(calcPred, id);
                    console.log(predictions.data.length);
                    predictions.data.forEach((pred) => {
                        const item = result.data.find(stock => stock.symbol === pred.symbol);
                        if (item) {
                            item.pred_percentage = Number((pred.pred_percentage).toFixed(2));
                            item.market_cap = pred.market_cap;
                            item.currentPrice = pred.currentPrice;
                            item.amount = (pred.currentPrice * item.noOfShares)
                        }
                    });
                }
                let totalInvestmentAmount = 0;
                result.data.map((item) => totalInvestmentAmount += item.amount);
                result.totalInvestmentAmount = totalInvestmentAmount;
                result.totalPortfolio = totalInvestmentAmount + result.cashAmount;
            }

            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { GetPortfolio };
