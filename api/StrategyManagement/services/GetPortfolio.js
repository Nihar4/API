const { default: yahooFinance } = require("yahoo-finance2");
const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { GetPredictionOnlyWorker } = require("./GetPerformanceDataWorker");
const { getStockPrediction } = require("./getStockPrediction");


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

                await Promise.all(result.data.map(async (item) => {
                    const pred = await getStockPrediction(item.symbol);
                    if (pred) {
                        item.pred_percentage = pred * 100;
                        const StockData = await yahooFinance.quote(`${item.symbol}`);
                        item.market_cap = StockData.marketCap;
                        item.currentPrice = StockData.regularMarketPrice;
                        item.amount = item.noOfShares * StockData.regularMarketPrice;
                    } else {
                        calcPred.push(item.symbol);
                    }
                }));
                if (calcPred.length > 0) {
                    const predictions = await GetPredictionOnlyWorker(calcPred);
                    predictions.forEach((pred) => {
                        const item = result.data.find(stock => stock.symbol === pred.symbol);
                        if (item) {
                            item.pred_percentage = Number((pred.pred_percentage * 100).toFixed(2));
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
