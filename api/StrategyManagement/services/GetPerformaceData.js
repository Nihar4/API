const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;
const stat = require("simple-statistics");
const fs = require("fs");
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

const getData = async (stock) => {
  try {
    if ("EH" == stock.split(".")[1]) {
      let stockName = stock.split(".")[0];
      const query = `SELECT column_name FROM information_schema.columns WHERE table_name = 'master_benchmarks_price' AND column_name LIKE '%${encodeURIComponent(stockName)}'`;

      const result = await ExecuteQuery(query);
      const columnName = result[0].column_name;
      const data_query = `SELECT Month_Year, \`${columnName}\` FROM master_benchmarks_price WHERE \`${columnName}\` IS NOT NULL`;

      const data_result = await ExecuteQuery(data_query);

      const adjCloseArray = [];
      const date_array = [];

      data_result.forEach((row) => {
        const [month, year] = row.Month_Year.split("-");
        const date = new Date(year, month - 1, 1).toLocaleDateString();

        adjCloseArray.push(parseFloat(row[columnName]));
        date_array.push(date);
      });


      return { adjCloseArray: adjCloseArray, date_array: date_array, symbol: stock };
    } else {
      const queryOptions = { period1: "1970-01-01" /* ... */ };

      let stockDetails = await yahooFinance.historical(`${stock}`, queryOptions);

      const adjCloseArray = stockDetails.map((stockDetail) => stockDetail.adjClose);
      const date_array = stockDetails.map((stockDetail) => stockDetail.date.toLocaleDateString());


      return { adjCloseArray: adjCloseArray, date_array: date_array, symbol: stock };
    }
  } catch (error) {
    console.log(`Error fetching data for ${stock}:`, error);
    // throw error;
  }
};

const processStock = async (stock, stockData) => {
  try {

    const data = stockData.adjCloseArray;

    var status = 0;

    if ("EH" == stock.split(".")[1]) {
      status = 1;
    } else {
      if (data.length < 1200) {
        status = 0;
        return status;
      } else {
        status = 1;
      }
    }

    if (status === 1) {
      var primaryData = data.slice(-22);
      var corrInitial = -1;
      var iterations = 0;
      var topData = [];
      var usedIndices = new Set();

      // optimize

      // while (iterations < data.length - 22) {
      // var randomIndex = iterations
      while (iterations < 2000000) {
        var randomIndex = Math.floor(Math.random() * (data.length - 22));
        if (!usedIndices.has(randomIndex)) {
          var randomData = data.slice(randomIndex, randomIndex + 22);
          var corr = stat.sampleCorrelation(primaryData, randomData);

          corrInitial = corr;
          let prev_value;

          if (randomIndex != 0) {
            prev_value = data[randomIndex - 1];
          } else {
            prev_value = data[0];
          }

          randomData = [prev_value, ...randomData];

          topData.push({ randomData, corr });
          usedIndices.add(randomIndex);
        }
        iterations++;
      }

      // while (iterations < 2000000) {
      //   var randomIndex = Math.floor(Math.random() * (data.length - 22));
      //   var randomData = data.slice(randomIndex, randomIndex + 22);

      //   var corr = stat.sampleCorrelation(primaryData, randomData);

      //   corrInitial = corr;
      //   let prev_value;

      //   if (randomIndex != 0) {
      //     prev_value = data[randomIndex - 1];
      //   } else {
      //     prev_value = data[0];
      //   }

      //   randomData = [prev_value, ...randomData];
      //   if (!usedIndices.has(randomIndex)) {
      //     topData.push({ randomData, corr });
      //     usedIndices.add(randomIndex);
      //   }
      //   iterations++;
      // }

      // console.log(data.length, topData.length)

      topData.sort((a, b) => b.corr - a.corr);
      topData = topData.slice(0, 5);

      const predicted = [];

      for (let i = 0; i < topData.length; i++) {
        const { randomData, corr } = topData[i];

        const gray_array = [];

        for (let i = 1; i < randomData.length; i++) {
          const result = randomData[i] / randomData[i - 1] - 1;
          gray_array.push(result);
        }

        let last_data_value = data[data.length - 1];

        const predicted_data = [];

        for (let i = 0; i < gray_array.length; i++) {
          const value = last_data_value * (gray_array[i] + 1);
          predicted_data.push(value);
          last_data_value = value;
        }

        const percentage =
          predicted_data[predicted_data.length - 1] / data[data.length - 1] - 1;

        predicted.push({ predicted_data, corr, percentage });
      }

      const prediction_return = CalcPrediction(stock, stockData, predicted)



      return (prediction_return)
    }
  } catch (error) {
    console.error(`Error processing data for ${stock}:`, error);
    return (error);
  }

}

const CalcPrediction = (stockName, stockData, result) => {

  let average_randomData = [];
  for (let i = 0; i < 22; i++) {
    let sum = 0;
    for (let j = 0; j < 5; j++) {
      sum += result[j].predicted_data[i];
    }
    average_randomData.push(sum / 5);
  }

  if ("EH" == stockName.split(".")[1]) {
    average_randomData = average_randomData.slice(0, 1);
  }

  let avg_corr;
  if ("EH" == stockName.split(".")[1]) {
    let sum = 0;
    for (let i = 0; i < result.length; i++) {
      sum += result[i].corr;
    }
    avg_corr = sum / 1;
  } else {
    let sum = 0;
    for (let i = 0; i < result.length; i++) {
      sum += result[i].corr;
    }
    avg_corr = sum / result.length;
  }

  let predictedDataString;
  if ("EH" == stockName.split(".")[1]) {
    predictedDataString = result
      .map((entry) => entry.predicted_data.slice(0, 1).join(","))
      .join(",");
  } else {
    predictedDataString = result
      .map((entry) => entry.predicted_data.join(","))
      .join(",");
  }

  const averageRandomDataString = average_randomData.join(",");
  const combinedString = `${predictedDataString},${averageRandomDataString}`;

  const avg_percentage =
    average_randomData[average_randomData.length - 1] /
    stockData.adjCloseArray[stockData.adjCloseArray.length - 1] -
    1;

  let objj = {
    symbol: stockName,
    pred_percentage: avg_percentage,
    market_cap: stockData.marketCap,
    currentPrice: stockData.regularMarketPrice
  };



  return objj;
}

const GetPerformaceData = async (dataArray, id) => {
  const startTime = new Date().getTime();

  let symbolsArray = dataArray.flat();

  const promises = symbolsArray.map(symbol => getData(symbol));
  const symbolsData = await Promise.all(promises);
  const quoteResults = await yahooFinance.quote(symbolsArray);

  const combinedData = symbolsArray.map((symbol, index) => ({
    name: symbol,
    ...symbolsData[index],
    ...quoteResults[index]
  }));

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;
  console.log(`Execution time: ${executionTime} milliseconds`);

  const stockPromises = combinedData.map(async (item) => {
    try {
      const stockName = item.name.trim();
      const res = await processStock(stockName, item);
      return res;
    } catch (error) {
      console.log(`Error processing stock ${item}:`, error);
    }
  })

  const results = await Promise.all(stockPromises);

  results.map(async (res) => {
    await updateStockPrediction(res.symbol, res.pred_percentage);
  })

  const totalInvestment = await getTotalInvestmentValue(results, id);
  const filterRes = processResults(results, totalInvestment);
  console.log(filterRes.data.length)
  return filterRes;
}

module.exports = { GetPerformaceData };