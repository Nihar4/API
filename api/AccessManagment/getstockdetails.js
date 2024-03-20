const { ExecuteQuery } = require("../../utils/ExecuteQuery");

const getstockdetails = async (req, res, next) => {
  try {
    const query = "SELECT code, name FROM security_list WHERE code <> ''";
    const stockDetails = await ExecuteQuery(query);
    // console.log(stockDetails);

    res.json({
      error: false,
      data: stockDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error });
  }
};

module.exports = getstockdetails;
