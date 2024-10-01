const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const updatePortfolioCash = async (id, cash, email) => {
    try {
        const description = "";
        const amount = 0;
        const balance = cash;
        const datetime = new Date().toISOString().slice(0, 19)

        const query = `
            INSERT INTO cash (email, strategy_id, description, amount, balance, datetime)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const params = [email, id, description, amount, balance, datetime];

        await ExecuteQuery(query, params);

    } catch (error) {
        console.error("Error during insert operation:", error);
        throw error;
    }
};

module.exports = { updatePortfolioCash };
