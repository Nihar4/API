const { ExecuteQuery } = require("../../../utils/ExecuteQuery");

const InsertStrategy = async (email, id, name, description) => {
    return new Promise(async (resolve, reject) => {


        const query = 'INSERT INTO buckets (email,id, name, description) VALUES (?,?, ?, ?)';
        const params = [email, id, name, description];

        try {
            const data = await ExecuteQuery(query, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { InsertStrategy };
