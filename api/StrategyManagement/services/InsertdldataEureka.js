const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const stat = require("simple-statistics");
const fs = require("fs");
// const { PCA } = require("ml-pca");
const dataset = require("ml-dataset-iris").getNumbers();
const PCA = require("pca-js");
var cov = require("compute-covariance");
var PortfolioAllocation = require("portfolio-allocation");

const getData = async (id) => {
  const query = `SELECT stock FROM strategy_Eureka WHERE id = ${id}`;
  const data = await ExecuteQuery(query);
  // console.log(data.length);

  const temp_data_array = [];
  const predicted_change_array = [];
  const stock_array = [];

  for (const row of data) {
    // console.log(row["stock"]);
    const stock_no = row["stock"].split(".")[0];
    stock_array.push(row["stock"]);
    // console.log(stock_no);

    const query = `SELECT column_name FROM information_schema.columns WHERE table_name = 'master_benchmarks_price' AND column_name LIKE '%${encodeURIComponent(
      stock_no
    )}'`;
    const result = await ExecuteQuery(query);

    const columnName = result[0].column_name;
    // console.log(columnName);

    const data_query = `SELECT  \`${columnName}\` FROM master_benchmarks_price WHERE \`${columnName}\` IS NOT NULL`;
    const data_result = await ExecuteQuery(data_query);
    const value_array = [];
    for (const value of data_result) {
      value_array.push(parseFloat(value[columnName]));
    }
    temp_data_array.push(value_array);

    const q = `SELECT * FROM dl_jobs WHERE strategy_id=${id} AND security='${row["stock"]}'`;
    // console.log(q);
    const data = await ExecuteQuery(q);
    const sortedData = data.sort(
      (a, b) => new Date(b.date_completed) - new Date(a.date_completed)
    );
    const latestPrediction = sortedData[0].predict_percentage;
    predicted_change_array.push(parseFloat(latestPrediction));
  }

  let min_size = temp_data_array[0].length;
  for (const data_array of temp_data_array) {
    min_size = Math.min(min_size, data_array.length);
  }
  //   console.log(min_size);
  const final_data = [];
  for (const data_array of temp_data_array) {
    let data = data_array.slice(-min_size);
    final_data.push(data);
  }

  const percentage_change_array = [];

  for (const array of final_data) {
    const percentage_change = [];
    for (let i = 1; i < array.length - 1; i++) {
      percentage_change.push(array[i] / array[i - 1] - 1);
    }
    percentage_change_array.push(percentage_change);
  }
  // console.log(stock_array);

  return {
    final_data: final_data,
    percentage_change_array: percentage_change_array,
    predicted_change_array: predicted_change_array,
    stock_array: stock_array,
  };
};

const InsertdldataEureka = async (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const stock_data = await getData(id);

      const normalize_data = [];
      const stock_array = stock_data.stock_array;

      for (const array of stock_data.final_data) {
        const temp_array = [];
        const mean = array.reduce((acc, val) => acc + val, 0) / array.length;

        for (const value of array) {
          temp_array.push(value - mean);
        }

        normalize_data.push(temp_array);
      }

      const mat = cov(stock_data.percentage_change_array);

      min_weight = [];
      max_weight = [];

      for (const value of stock_array) {
        min_weight.push(parseFloat(data[value][0]) / 100);
        max_weight.push(parseFloat(data[value][1]) / 100);
      }
      console.log(min_weight, max_weight);

      // const x = PortfolioAllocation.meanVarianceEfficientFrontierPortfolios(stock_data.predicted_change_array,mat);
      const x = PortfolioAllocation.meanVarianceEfficientFrontierPortfolios(
        stock_data.predicted_change_array,
        mat,
        { constraints: { minWeights: min_weight, maxWeights: max_weight } }
      );
      const response_data = [];
      for (const data of x) {
        const obj = {};
        obj.risk = parseFloat(parseFloat(data[2] * 100));
        obj.return = parseFloat(parseFloat(data[1] * 100));
        obj.weights = data[0];

        response_data.push(obj);
      }
      const allEqual = response_data.every(
        (obj) => JSON.stringify(obj) === JSON.stringify(response_data[0])
      );

      if (allEqual) {
        resolve(response_data.slice(0, 2));
      }
      else {
        resolve(response_data);
      }

      // resolve([]);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

module.exports = { InsertdldataEureka };
