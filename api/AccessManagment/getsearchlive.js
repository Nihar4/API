const { ExecuteQuery } = require("../../utils/ExecuteQuery");

const getsearchlive = async (req, res, next) => {
  try {
    const { search } = req.query;
    // console.log(search)
    const query = `
            SELECT *
            FROM security_list
            WHERE code LIKE ? OR name LIKE ?;
        `;

    const results = await ExecuteQuery(query, [`%${search}%`, `%${search}%`]);

    res.json(results);
  } catch (error) {
    console.log( error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getsearchlive;
