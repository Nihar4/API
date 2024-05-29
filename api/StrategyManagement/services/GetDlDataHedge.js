const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { getLongName } = require("./getLongName");

const GetDlDataHedge = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = 'SELECT * FROM swiftfoliosuk.dl_jobs WHERE strategy_id = ?';
        const params = [id];
        // console.log(id);

        try {
            const data = await ExecuteQuery(query, params);
            // console.log(data);

            for(const row of data){
                const stock = row['security'];
                // console.log(stock);
                const query = `SELECT column_name FROM information_schema.columns WHERE table_name = 'master_benchmarks_price' AND column_name LIKE '%${encodeURIComponent(stock)}'`;
                // console.log(query);
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
