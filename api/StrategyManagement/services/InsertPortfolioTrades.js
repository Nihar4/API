const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { isEmpty } = require("../../../utils/Validation");
const { fetchQuoteData } = require("../../../utils/YahooFinanceApi");

const GetTradeIRN = async () => {

    const query = `
      SELECT 
        t.internal_ref_number
      FROM swiftfoliosuk.trades t
    `;
    try {
        const data = await ExecuteQuery(query);
        const internalRefNumbers = data.map(row => row.internal_ref_number);
        return internalRefNumbers;
    } catch (error) {
        console.log(error);
        return error;
    }

};

const validateTradeData = async (data) => {

    const IRNS = await GetTradeIRN();
    const uploadIrns = [];

    const symbols = [];

    for (let row of data) {
        const [symbolData, IRN, quantity, tentativeprice, netprice, type, date] = row;
        if (isEmpty(symbolData)) {
            return { isValid: false, error: `Symbol can not be empty` };
        }
        if (isEmpty(quantity) || quantity <= 0) {
            return { isValid: false, error: `Invalid quantity: ${quantity}` };
        }
        if (isEmpty(tentativeprice) || tentativeprice <= 0) {
            return { isValid: false, error: `Invalid Tentative Price: ${tentativeprice}` };
        }
        if (isEmpty(netprice) || netprice <= 0) {
            return { isValid: false, error: `Invalid Net Price: ${netprice}` };
        }

        const typeFormate = type.toLowerCase() === "buy" ? "Buy" : type.toLowerCase() === "sell" ? "Sell" : "";
        if (isEmpty(typeFormate)) {
            return { isValid: false, error: `Invalid trade type: ${type}` };
        }

        if (isEmpty(IRN)) {
            const internal_ref_number = Date.now().toString();
            const generated_ref_number =
                Math.floor(100 + Math.random() * 900) +
                internal_ref_number.slice(3, 5) +
                internal_ref_number.slice(-5)
            uploadIrns.push(generated_ref_number);
        }
        else {
            const irnDigits = IRN.toString().length;
            if (irnDigits < 10) {
                return { isValid: false, error: `Ref Number ${IRN} has less than 10 digits.` };
            }
            if (IRNS.includes(IRN) || uploadIrns.includes(IRN)) {
                return { isValid: false, error: `Duplicate Ref Number: ${IRN}` };
            }
            else {
                uploadIrns.push(IRN);
            }
        }
        symbols.push(symbolData);
    }
    const yahooData = await fetchQuoteData(symbols);
    for (let i = 0; i < symbols.length; i = i + 1) {
        if (isEmpty(yahooData[i])) {
            return { isValid: false, error: `Invalid symbol: ${symbols[i]}` };
        }
    }
    return { isValid: true, uploadIrns };
};


const InsertPortfolioTrades = async (strategy_id, email, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let query = `INSERT INTO swiftfoliosuk.trades (email, strategy_id, internal_ref_number, symbol, quantity, tentativeprice, netprice, amount, type, date) VALUES `;

            const valuesArray = [];

            const validation = await validateTradeData(data);
            if (!validation.isValid) {
                resolve({ error: true, msg: validation.error })
                return;
            }
            const IRNS = validation.uploadIrns;
            data.forEach((row, index) => {
                const [symbolData, IRN, quantity, tentativeprice, netprice, type, date] = row;

                const generated_ref_number = IRNS[index];

                const price = !isNaN(netprice) ? netprice : tentativeprice;
                const amount = price * quantity;
                let typeFormate = "";
                typeFormate = type.toLowerCase() == "buy" ? "Buy" : type.toLowerCase() == "sell" ? "Sell" : "";

                const tradeDate = date ? `'${new Date(new Date(date).getTime() - 5.5 * 60 * 60 * 1000).toISOString()}'` : `'${new Date().toISOString()}'`;

                valuesArray.push(
                    `('${email}', '${strategy_id}', '${generated_ref_number}', '${symbolData}', ${quantity}, '${tentativeprice}', '${netprice}', ${amount}, '${typeFormate}', ${tradeDate})`
                );

            });

            if (valuesArray.length > 0) {
                query += valuesArray.join(", ");
                const result = await ExecuteQuery(query);
                resolve({ error: false, result });
            } else {
                console.log("No valid rows to insert.");
                resolve({ error: true, msg: "No valid rows to insert." })
            }
        } catch (error) {
            console.error("Error during insert operation:", error);
            reject(error);
        }
    });
};

module.exports = { InsertPortfolioTrades };
