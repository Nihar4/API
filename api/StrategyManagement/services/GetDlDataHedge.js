const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { getLongName } = require("./getLongName");

const GetDlDataHedge = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = 'SELECT * FROM swiftfoliosuk.dl_jobs WHERE strategy_id = ?';
        const params = [id];

        try {
            const data = await ExecuteQuery(query, params);

            for(const row of data){
                const stock = row['security'];
                const query = `SELECT column_name FROM information_schema.columns WHERE table_name = 'master_benchmarks_price' AND column_name LIKE '%${encodeURIComponent(stock)}'`;
                const result = await ExecuteQuery(query);
          
                const columnName = result[0].column_name;
                stock_name = columnName
                  .substring(0, columnName.lastIndexOf("_"))
                  .replace(/_/g, " ");
                
                
                const longname = stock_name ? stock_name:stock;
                row['longname'] = longname;
          
            }
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { GetDlDataHedge };
