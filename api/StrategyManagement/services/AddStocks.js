const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const AddStocks = async (email,strategy_id, stock_code) => {
  return new Promise(async (resolve, reject) => {

    const today = new Date().toISOString();
    // console.log(today);
    const query =
      "INSERT INTO swiftfoliosuk.dl_jobs (email,strategy_id, security, date_created, output_data, correlation,date_completed, status) VALUES (?,?, ?, ?,NULL, NULL, NULL, 'Pending')";
    const params = [email,strategy_id, stock_code,today];

    try {
      const data = await ExecuteQuery(query, params);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { AddStocks };
