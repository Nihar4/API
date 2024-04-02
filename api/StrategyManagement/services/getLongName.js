const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;

const getLongName = async (stock) => {
  return new Promise(async (resolve, reject) => {
    if (stock == stock.split(".")[0]) {
      const query = `SELECT column_name FROM information_schema.columns WHERE table_name = 'master_benchmarks_price' AND column_name LIKE '%${stock}'`;
      const result = await ExecuteQuery(query);

      const columnName = result[0].column_name;
      longname = columnName
        .substring(0, columnName.lastIndexOf("_"))
        .replace(/_/g, " ");

      resolve({
        longname
      });
      return;
    } else {
        const results = await yahooFinance.quote(stock);
        // resolve(results);
        // return;
        const longname = results.longName ? results.longName : results.shortName;
        resolve({longname})
    }
  });
};

module.exports = { getLongName };
