const { ExecuteQuery } = require("../../utils/ExecuteQuery");
const yahooFinance = require("yahoo-finance2").default;

const getsearchliveEureka = async (req, res, next) => {
  try {
    const { search } = req.query;

    if (!search || search.length == 0) {
      res.json({ error: true, message: "Require search" });
    }

    const db_query = ` SHOW COLUMNS FROM master_benchmarks_price WHERE Field != 'Month_Year';`;
    const db_result = await ExecuteQuery(db_query);
    const transformedArray = db_result.map((item) => {
      const decodedField = decodeURIComponent(item.Field);
      const symbol = decodedField.split("_").pop()+".EH";
      let longname = decodedField;
      if (decodedField.includes("_")) {
        longname = decodedField.substring(0, decodedField.lastIndexOf("_")).replace(/_/g, " ");
      }
      return { symbol, longname, exchange: "EurekaHedge" };
    });


    res.json(transformedArray);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getsearchliveEureka;
