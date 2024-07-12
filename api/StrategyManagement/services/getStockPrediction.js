const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const getStockPrediction = async (symbol) => {
    try {
        const currentTimestamp = new Date();

        const query = `
            SELECT * FROM stock_prediction
            WHERE symbol = ?
        `;

        const results = await ExecuteQuery(query, [symbol]);

        if (results.length > 0) {
            const predictionData = results[0];
            const predictionTimestamp = new Date(predictionData.timestamp);

            const fifteenDaysAgoTimestamp = new Date();
            fifteenDaysAgoTimestamp.setDate(currentTimestamp.getDate() - 15);

            if (predictionTimestamp >= fifteenDaysAgoTimestamp) {
                return predictionData.prediction;
            }
            else {
                return false;
            }
        }

        return false;
    } catch (error) {
        console.error("Error fetching stock prediction:", error);
        throw error;
    }
};

module.exports = { getStockPrediction };
