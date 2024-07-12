const { Worker } = require('worker_threads');
const { ExecuteQuery } = require('../../../utils/ExecuteQuery');
const { updateStockPrediction } = require('./updateStockPrediction');

const getTotalInvestmentValue = async (results, id) => {
    const query = `
      SELECT *
      FROM portfolio_performance
      WHERE strategy_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `;
    const data = await ExecuteQuery(query, [id]);
    if (data.length == 0) return 10000000;

    let totalInvestmentValue = 0;
    const portfolio = JSON.parse(data[0].portfolio);
    portfolio.data.forEach(portfolioItem => {
        const stockItem = results.find(stock => stock.symbol === portfolioItem.symbol);
        if (stockItem) {
            totalInvestmentValue += portfolioItem.noOfShares * stockItem.currentPrice;
        }
    });
    totalInvestmentValue = totalInvestmentValue + Number(data[0].cash_value);
    console.log(totalInvestmentValue);
    return Number(totalInvestmentValue.toFixed(2));
}

const processResults = (results, totalInvestment) => {
    const filteredResults = results.filter(item => item.pred_percentage > 0);

    const sortedResults = filteredResults.sort((a, b) => b.pred_percentage - a.pred_percentage);

    const topResults = sortedResults.slice(0, 25).map(item => ({
        ...item,
        pred_percentage: item.pred_percentage * 100
    }));

    const totalMarketCap = topResults.reduce((sum, item) => sum + item.market_cap, 0);
    let totalAmount = 0;
    const investmentDetails = topResults.map(item => {
        const weight = (item.market_cap / totalMarketCap) * 100;
        const investmentAmount = (weight / 100) * totalInvestment;
        const noOfShares = Math.floor(investmentAmount / item.currentPrice);
        const amount = Number((noOfShares * item.currentPrice).toFixed(2));
        totalAmount += amount;
        totalAmount = Number(totalAmount.toFixed(2));

        return {
            symbol: item.symbol,
            market_cap: item.market_cap,
            pred_percentage: item.pred_percentage,
            currentPrice: item.currentPrice,
            weight: weight,
            noOfShares: noOfShares,
            amount: amount
        };
    });
    return { data: investmentDetails, totalPortfolio: totalInvestment, totalInvestmentAmount: totalAmount, cashAmount: Number((totalInvestment - totalAmount).toFixed(2)) };
};

const GetPerformanceDataWorker = async (dataArray, id) => {
    const results = [];
    let completedWorkers = 0;
    let numWorkers = 6;

    const batchedData = chunkArray(dataArray.flat(), numWorkers);

    const workerPromises = batchedData.map((batch) => {
        return new Promise((resolve, reject) => {
            const worker = new Worker('./api/StrategyManagement/services/worker.js', { workerData: batch });

            worker.on('message', (message) => {
                results.push(...message);
                completedWorkers += batch.length;
                console.log(results.flat().length, dataArray.flat().length)
                resolve()
            });

            worker.on('error', (error) => {
                reject(error);
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });
    });

    await Promise.all(workerPromises);
    results.map(async (res) => {
        await updateStockPrediction(res.symbol, res.pred_percentage);
    })
    const totalInvestment = await getTotalInvestmentValue(results, id);
    const filterRes = processResults(results, totalInvestment);
    console.log(filterRes.data.length)
    return filterRes;
};

const GetPredictionOnlyWorker = async (dataArray) => {
    const results = [];
    let completedWorkers = 0;
    let numWorkers = 6;
    console.log(dataArray)

    const batchedData = chunkArray(dataArray.flat(), numWorkers);

    const workerPromises = batchedData.map((batch) => {
        return new Promise((resolve, reject) => {
            const worker = new Worker('./api/StrategyManagement/services/worker.js', { workerData: batch });

            worker.on('message', (message) => {
                results.push(...message);
                completedWorkers += batch.length;
                console.log(results.flat().length, dataArray.flat().length)
                resolve()
            });

            worker.on('error', (error) => {
                reject(error);
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });
    });

    await Promise.all(workerPromises);
    results.map(async (res) => {
        await updateStockPrediction(res.symbol, res.pred_percentage);
    })
    return results;
};

const chunkArray = (array, numWorkers) => {
    const chunks = [];
    const chunkSize = Math.ceil(array.length / numWorkers)
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};

module.exports = { GetPerformanceDataWorker, GetPredictionOnlyWorker };
