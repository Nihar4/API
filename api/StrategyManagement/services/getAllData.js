const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const getAllData = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = `
            SELECT dj.*
            FROM swiftfoliosuk.dl_jobs dj
            INNER JOIN (
                SELECT security, MAX(date_completed) AS max_date
                FROM swiftfoliosuk.dl_jobs
                WHERE strategy_id = ?
                GROUP BY security
            ) AS latest_jobs
            ON dj.security = latest_jobs.security AND dj.date_completed = latest_jobs.max_date
            WHERE dj.strategy_id = ?
        `;
        const params = [id, id];

        const query2 = `SELECT *
            FROM dl_jobs 
            WHERE strategy_id = ? AND status = 'Pending'`
        const params2 = [id]
        try {
            const data = await ExecuteQuery(query, params);
            const data2 = await ExecuteQuery(query2, params2);
            resolve({ dl_data: data, isPending: data2.length > 0 ? true : false });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { getAllData };
