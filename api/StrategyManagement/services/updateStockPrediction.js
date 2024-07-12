const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const updateStockPrediction = async (symbol, prediction) => {
    try {

        const checkQuery = `
            SELECT * FROM stock_prediction
            WHERE symbol = ?
        `;

        const existingRecords = await ExecuteQuery(checkQuery, [symbol]);

        let query;
        if (existingRecords.length > 0) {
            query = `
                UPDATE stock_prediction
                SET prediction = ?, timestamp = CONVERT_TZ(NOW(), '+00:00', '+05:30')
                WHERE symbol = ?
            `;
            await ExecuteQuery(query, [prediction, symbol]);
        } else {
            query = `
                INSERT INTO stock_prediction (symbol, prediction, timestamp)
                VALUES (?, ?, CONVERT_TZ(NOW(), '+00:00', '+05:30'))
            `;
            await ExecuteQuery(query, [symbol, prediction]);
        }

    } catch (error) {
        console.error("Error during upsert operation:", error);
        throw error;
    }
};

module.exports = { updateStockPrediction };
