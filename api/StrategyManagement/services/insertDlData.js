
const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;
const stat = require("simple-statistics");
const fs = require("fs");

const getData = async (stock) => {
  const queryOptions = { period1: "1970-01-01" /* ... */ };

  let stockDetails = await yahooFinance.historical(`${stock}`, queryOptions);
  // console.log(stockDetails);

  const adjCloseArray = stockDetails.map((stockDetail) => stockDetail.adjClose);
  const date_array = stockDetails.map((stockDetail) =>
    stockDetail.date.toLocaleDateString()
  );

  // console.log(date_array);
  return { adjCloseArray: adjCloseArray, date_array: date_array };
};

async function processData(data) {
  var status = 0;

  if (data.length < 500) {
    status = 0;

    return status;
  } else {
    status = 1;
  }

  if (status === 1) {
    var primaryData = data.slice(-110);
    var corrInitial = -1;
    var iterations = 0;
    var topData = [];
    var usedIndices = new Set();


    while (corrInitial < 0.95 && iterations < 1000000) {
      var randomIndex = Math.floor(Math.random() * (data.length - 110));
      var randomData = data.slice(randomIndex, randomIndex + 110);

      var corr = stat.sampleCorrelation(primaryData, randomData);

      // if(corr > corrInitial){
      corrInitial = corr;
      // }
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
    // console.log(iterations);

    topData.sort((a, b) => b.corr - a.corr);

    topData = topData.slice(0, 5);

    const predicted = [];

    // console.log(topData);

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
}

const insertDlData = async (stock, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let stockName = stock.replace(".L", "");
      const data = await getData(stock);

      const result = await processData(data.adjCloseArray);

      const average_randomData = [];

      for (let i = 0; i < 110; i++) {
        let sum = 0;
        for (let j = 0; j < 5; j++) {
          sum += result[j].predicted_data[i];
        }
        average_randomData.push(sum / 5);
      }

      let avg_corr;
      let sum = 0;
      for (let i = 0; i < result.length; i++) {
        sum += result[i].corr;
      }

      const predictedDataString = result
        .map((entry) => entry.predicted_data.join(","))
        .join(",");
      const averageRandomDataString = average_randomData.join(",");

      const combinedString = `${predictedDataString},${averageRandomDataString}`;

      avg_corr = sum / result.length;
      avg_percentage =
        average_randomData[average_randomData.length - 1] /
        data.adjCloseArray[data.adjCloseArray.length - 1] -
        1;
      // console.log("avg")
      // console.log(average_randomData, avg_corr, avg_percentage);

      // console.log(result);

      //   const csvFilePath = "output.csv";

      //   fs.writeFileSync(csvFilePath, "");
      //   fs.appendFileSync(csvFilePath, stock + "\n");

      //   fs.appendFileSync(csvFilePath, data.adjCloseArray.join(",") + "\n");
      //   fs.appendFileSync(csvFilePath, data.date_array.join(",") + "\n");
      //   fs.appendFileSync(csvFilePath, result.gray_array.join(",") + "\n");
      //   fs.appendFileSync(csvFilePath, result.predicted_data.join(",") + "\n");
      //   fs.appendFileSync(csvFilePath, result.predicted_data.length + "\n");

      if (result == 0) {
        resolve("data is not enough");
        return;
      }

      const today = new Date().toISOString().slice(0, 10);

      const query = `UPDATE swiftfoliosuk.dl_jobs SET \`output_data\` = '${combinedString}', \`correlation\` = '${avg_corr}', \`predict_percentage\` = ${avg_percentage}, \`date_completed\` = '${today}', \`status\` = 'Complete' WHERE \`security\` = '${stockName}' AND \`strategy_id\` = ${id}`;
      await ExecuteQuery(query);
      console.log("executed successfully");
      resolve();
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

module.exports = { insertDlData };
