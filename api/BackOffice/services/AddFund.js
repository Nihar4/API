const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const generateID = () => {
    return Math.floor(Date.now()).toString().substring(0, 12);
};

const AddFund = async (email, name) => {
    return new Promise(async (resolve, reject) => {
        const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const id = generateID();
        console.log(id);

        const query1 = `INSERT INTO funds (email, id, name, date_time) VALUES (?, ?, ?, ?)`;
        const params1 = [email, id, name, currentDateTime];

        const query2 = `INSERT INTO funds_details (id, description, logo_url, firm_assets, strategy_assets, strategy_url, team_id, date_updated) VALUES (?, NULL, NULL, NULL, NULL, NULL, NULL, NULL)`;
        const params2 = [id];

        try {
            const result1 = await ExecuteQuery(query1, params1);

            const result2 = await ExecuteQuery(query2, params2);

            resolve({ id: id });
        } catch (error) {
            reject(error);
        }
    });
};



module.exports = { AddFund };
