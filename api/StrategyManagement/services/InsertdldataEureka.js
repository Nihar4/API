const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;
const stat = require("simple-statistics");
const fs = require("fs");
// const { PCA } = require("ml-pca");
const dataset = require("ml-dataset-iris").getNumbers();
const PCA = require("pca-js");
var cov = require("compute-covariance");
var MeanVarianceEfficientFrontier = require("portfolio-allocation");

const getData = async (id) => {
  const query = `SELECT stock FROM strategy_Eureka WHERE id = ${id}`;
  const data = await ExecuteQuery(query);
  console.log(data.length);

  const temp_data_array = [];
  const predicted_change_array = [];

  for (const row of data) {
    console.log(row["stock"]);
    const stock_no = row["stock"];
    console.log(stock_no);

    const query = `SELECT column_name FROM information_schema.columns WHERE table_name = 'master_benchmarks_price' AND column_name LIKE '%${encodeURIComponent(stock_no)}'`;
    const result = await ExecuteQuery(query);

    const columnName = result[0].column_name;
    const data_query = `SELECT  \`${columnName}\` FROM master_benchmarks_price WHERE \`${columnName}\` IS NOT NULL`;

    const data_result = await ExecuteQuery(data_query);
    const value_array = [];
    for (const value of data_result) {
      value_array.push(parseFloat(value[columnName]));
    }
    temp_data_array.push(value_array);

    const q = `SELECT * FROM dl_jobs WHERE strategy_id=${id} AND security=${row["stock"]}`;
    const data = await ExecuteQuery(q);
    const sortedData = data.sort(
      (a, b) => new Date(b.date_completed) - new Date(a.date_completed)
    );
    const latestPrediction = sortedData[0].predict_percentage;
    predicted_change_array.push(parseFloat(latestPrediction));

    // for(const value of data){
    //   predicted_change_array.push(parseFloat(value.predict_percentage));
    // }
    // console.log(data);
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
  console.log(predicted_change_array);

  return {
    final_data: final_data,
    percentage_change_array: percentage_change_array,
    predicted_change_array: predicted_change_array,
  };
};

const InsertdldataEureka = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await getData(id);
      // const pca = new PCA(data.final_data);
      // let a = [];
      // for(let i=0;i<data.final_data[0].length;i++){
      //   a.push(1);
      // }

      // const newPoints = [
      //   a,
      //   a,
      //   a
      // ];
      // resolve({"predict" : pca.predict(newPoints) , "getExplained" : pca.getExplainedVariance()});

      /* ----------------------------------------------------------------------------------------------------- */

      // resolve(data.final_data);
      const normalize_data = [];

      for (const array of data.final_data) {
        const temp_array = [];
        const mean = array.reduce((acc, val) => acc + val, 0) / array.length;

        for (const value of array) {
          temp_array.push(value - mean);
        }

        normalize_data.push(temp_array);
      }

      // resolve(normalize_data)

      const mat = cov(data.percentage_change_array);
      const result = [mat, data.predicted_change_array];
      // resolve(result);

      // var vectors = PCA.getEigenVectors(mat);
      // // resolve(vectors);
      // for(let i=0;i<vectors.length;i++){
      //   for(let j=0;j<vectors[i].vector.length;j++){
      //       console.log(vectors[i].vector[j]);
      //   }
      //   console.log("");
      // }
      // // resolve(vectors[0].vector[0]);
      // const x= PCA.computeVarianceCovariance(data);
      // resolve(x);

      // resolve(PCA.computeVarianceCovariance(data));
      // var first = PCA.computePercentageExplained(vectors,vectors[0])
      // var two = PCA.computePercentageExplained(vectors,vectors[0],vectors[1])
      // var three = PCA.computePercentageExplained(vectors,vectors[0],vectors[1],vectors[2])
      // var four = PCA.computePercentageExplained(vectors,vectors[0],vectors[1],vectors[2],vectors[3])
      // var five = PCA.computePercentageExplained(vectors,vectors[0],vectors[1],vectors[2],vectors[3],vectors[4])
      // resolve({first,two,three,four,five});

      const x = MeanVarianceEfficientFrontier(mat,data.predicted_change_array);
      resolve(x);

    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

module.exports = { InsertdldataEureka };
