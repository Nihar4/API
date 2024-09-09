const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { fetchQuoteData } = require("../../../utils/YahooFinanceApi");

const getLongName = async (stock) => {
  return new Promise(async (resolve, reject) => {
    if ("EH" == stock.split(".")[1]) {
      const query = `SELECT column_name FROM information_schema.columns WHERE table_name = 'master_benchmarks_price' AND column_name LIKE '%${(stock.split(".")[0])}'`;
      const result = await ExecuteQuery(query);

      const columnName = result[0].column_name;
      stock_name = columnName
        .substring(0, columnName.lastIndexOf("_"))
        .replace(/_/g, " ");

      const longname = stock_name ? stock_name : stock.split(".")[0];

      resolve({
        longname
      });
      return;
    } else {
      let results;
      try {

        results = await fetchQuoteData(stock);
      } catch (error) {
        console.log(error);
      }
      // resolve(results);
      // return;
      const longname = results.longName ? results.longName : results.shortName;
      resolve({ longname })
    }
  });
};

module.exports = { getLongName };
