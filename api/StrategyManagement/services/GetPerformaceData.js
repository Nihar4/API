const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;
const stat = require("simple-statistics");
const fs = require("fs");

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

      return { adjCloseArray: adjCloseArray, date_array: date_array };
    } else {
      const queryOptions = { period1: "1970-01-01" /* ... */ };

      let stockDetails = await yahooFinance.historical(`${stock}`, queryOptions);

      const adjCloseArray = stockDetails.map((stockDetail) => stockDetail.adjClose);
      const date_array = stockDetails.map((stockDetail) => stockDetail.date.toLocaleDateString());

      return { adjCloseArray: adjCloseArray, date_array: date_array };
    }
  } catch (error) {
    console.error(`Error fetching data for ${stock}:`, error);
    throw error;
  }
};

async function processData(data, stock) {
  try {
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

      while (iterations < 2000000) {
        var randomIndex = Math.floor(Math.random() * (data.length - 22));
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
        if (!usedIndices.has(randomIndex)) {
          topData.push({ randomData, corr });
          usedIndices.add(randomIndex);
        }
        iterations++;
      }

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

      return predicted;
    }
  } catch (error) {
    console.error(`Error processing data for ${stock}:`, error);
    throw error;
  }
}

const GetPerformaceData = async (data) => {
  return new Promise(async (resolve, reject) => {
    const res_array = [];
    const stockArray = [];

    try {
      await Promise.all(
        data.map(async (stockObj, stockIndex) => {
          await Promise.all(
            stockObj.stock.split(",").map(async (item, index) => {
              try {
                const stockName = item.trim();
                const data = await getData(stockName);
                const result = await processData(data.adjCloseArray, stockName);
                console.log(stockName);

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
                  data.adjCloseArray[data.adjCloseArray.length - 1] -
                  1;

                stockArray.push(stockName);
                let marketCap = 0;

                try {
                  marketCap = await yahooFinance.quote(`${stockName}`);
                } catch (error) {
                  console.log(`Error fetching market cap for ${stockName}:`, error);
                }

                let objj = {
                  stock: stockName,
                  pred_percentage: avg_percentage,
                  market_cap: marketCap.marketCap,
                };

                res_array.push(objj);
              } catch (error) {
                console.log(`Error processing stock ${item}:`, error);
              }
            })
          );
        })
      );
      resolve(res_array);
    } catch (error) {
      console.log(`Error processing performance data:`, error);
      reject(error);
    }
  });
};

module.exports = { GetPerformaceData };