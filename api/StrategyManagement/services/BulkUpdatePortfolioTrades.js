

const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { isEmpty } = require("../../../utils/Validation");
const { fetchQuoteData } = require("../../../utils/YahooFinanceApi");

const GetTradeIRN = async (strategy_id) => {

    const query = `
      SELECT 
        t.internal_ref_number
      FROM swiftfoliosuk.trades t where strategy_id = ?
    `;
    try {
        const data = await ExecuteQuery(query, strategy_id);
        const internalRefNumbers = data.map(row => row.internal_ref_number);
        return internalRefNumbers;
    } catch (error) {
        console.log(error);
        return error;
    }

};

const validateTradeData = async (data, strategy_id) => {

    const IRNS = await GetTradeIRN(strategy_id);
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
            return { isValid: false, error: `Invalid Internal Ref Number: ${IRN}` };
        }
        else {
            const irnDigits = IRN.toString().length;
            if (irnDigits < 10) {
                return { isValid: false, error: `Ref Number ${IRN} has less than 10 digits.` };
            }
            if (!IRNS.includes(IRN)) {
                return { isValid: false, error: `Internal Ref Number: ${IRN} Not Exist` };
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
    return { isValid: true };
};


const BulkUpdatePortfolioTrades = async (strategy_id, email, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const validation = await validateTradeData(data, strategy_id);
            if (!validation.isValid) {
                resolve({ error: true, msg: validation.error });
                return;
            }

            const updatePromises = [];

            data.forEach((row) => {
                const [symbolData, IRN, quantity, tentativeprice, netprice, type, date] = row;

                const price = !isNaN(netprice) ? netprice : tentativeprice;
                const amount = price * quantity;
                let typeFormate = type.toLowerCase() === "buy" ? "Buy" : type.toLowerCase() === "sell" ? "Sell" : "";

                const tradeDate = date
                    ? `'${new Date(new Date(date).getTime() - 5.5 * 60 * 60 * 1000).toISOString()}'`
                    : `'${new Date().toISOString()}'`;

                const updateQuery = `
                    UPDATE swiftfoliosuk.trades 
                    SET 
                        quantity = ${quantity}, 
                        tentativeprice = '${tentativeprice}', 
                        netprice = '${netprice}', 
                        amount = ${amount}, 
                        type = '${typeFormate}', 
                        date = ${tradeDate}
                    WHERE strategy_id = '${strategy_id}' 
                    AND email = '${email}' 
                    AND internal_ref_number = '${IRN}'
                `;

                updatePromises.push(ExecuteQuery(updateQuery));
            });

            if (updatePromises.length > 0) {
                const results = await Promise.all(updatePromises);
                resolve({ error: false, results });
            } else {
                console.log("No valid rows to update.");
                resolve({ error: true, msg: "No valid rows to update." });
            }
        } catch (error) {
            console.error("Error during update operation:", error);
            reject(error);
        }
    });
};



module.exports = { BulkUpdatePortfolioTrades };
