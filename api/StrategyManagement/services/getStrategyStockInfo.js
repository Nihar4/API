const { ExecuteQuery } = require("../../../utils/ExecuteQuery");
const { getAllData } = require("./getAllData");
const { getStockDetails } = require("./getStockDetails");


function FormatNumber(number, precision = 2) {
    if (!number) {
        number = 0;
    }
    return parseFloat(parseFloat(number).toFixed(precision));
}

function CalculateCapitalGains(stock_code, data, currentPrice) {

    data = data.map((d) => {
        return { ...d, quantity: parseInt(d.quantity), price: parseFloat(d.netprice) }
    });

    let sellData = data.filter((d) => { return d.type === 'Sell' });
    data = data.filter((d) => { return d.type === 'Buy' });

    const realisedGain = [];
    sellData.forEach((sell, sellIndex) => {
        data.forEach((buy, buyIndex) => {
            if (sell.quantity > 0) {
                if (sell.quantity < buy.quantity) {

                    buy.quantity -= sell.quantity;

                    const pushObj = {
                        total_buy_quantity: parseInt(sell.quantity),
                        average_buy_price: FormatNumber(buy.price),
                        buy_value: FormatNumber(sell.quantity * buy.price),
                        total_sell_quantity: parseInt(sell.quantity),
                        average_sell_price: FormatNumber(sell.price),
                        sell_value: FormatNumber(sell.price * sell.quantity),
                    };
                    // if (DateDiff(buy.date, sell.date) < 366) {
                    //     pushObj.ltcg = FormatNumber(0);
                    //     pushObj.stcg = FormatNumber(
                    //         (sell.price * sell.quantity - sell.quantity * buy.price)
                    //     );
                    // } else {
                    //     pushObj.stcg = FormatNumber(0);
                    //     pushObj.ltcg = FormatNumber(
                    //         (sell.price * sell.quantity - sell.quantity * buy.price)
                    //     );
                    // }
                    pushObj.gain = FormatNumber(
                        (sell.price * sell.quantity - sell.quantity * buy.price)
                    );
                    realisedGain.push(pushObj);
                    sell.quantity = 0;
                } else {
                    sell.quantity -= buy.quantity;
                    buy.delete = true;
                    const pushObj = {
                        total_buy_quantity: parseInt(buy.quantity),
                        average_buy_price: FormatNumber(buy.price),
                        buy_value: FormatNumber(buy.quantity * buy.price),
                        total_sell_quantity: parseInt(buy.quantity),
                        average_sell_price: FormatNumber(sell.price),
                        sell_value: FormatNumber(sell.price * buy.quantity),
                    };
                    // if (DateDiff(buy.date, sell.date) < 366) {
                    //     pushObj.ltcg = 0;
                    //     pushObj.stcg = FormatNumber(
                    //         (sell.price * buy.quantity - buy.quantity * buy.price)
                    //     );
                    // } else {
                    //     pushObj.stcg = 0;
                    //     pushObj.ltcg = FormatNumber(
                    //         (sell.price * buy.quantity - buy.quantity * buy.price)
                    //     );
                    // }
                    pushObj.gain = FormatNumber(
                        (sell.price * buy.quantity - buy.quantity * buy.price)
                    );
                    realisedGain.push(pushObj);
                }
            } else {
                sell.delete = true;
            }
        });

        data = data.filter(function (obj) {
            if (!obj.delete) {
                return obj;
            }
        });
    });

    sellData = sellData.filter(function (obj) {
        if (!obj.delete) {
            return obj;
        }
    });

    const unrealise = [];

    data.forEach((element) => {
        const temp = {
            date: element.date,
            total_buy_quantity: parseInt(element.quantity),
            average_buy_price: FormatNumber(element.price),
            buy_value: FormatNumber(element.quantity * element.price),
            current_price: FormatNumber(currentPrice),
            current_value: FormatNumber(element.quantity * currentPrice),
            fifo_cost: FormatNumber(element.price),
            unrealised_gain: FormatNumber(
                (
                    element.quantity * currentPrice -
                    element.quantity * element.price
                )
            ),
            total_returns: FormatNumber(
                ((currentPrice * 100) / element.price - 100)
            ),
        };
        unrealise.push(temp);
    });

    let sum_total_qnt = 0;
    let sum_buy_value = 0;

    if (unrealise.length !== 0) {
        unrealise.forEach((element) => {
            sum_total_qnt += parseInt(element.total_buy_quantity);
            sum_buy_value += FormatNumber(element.buy_value);
        });

        unrealise.push({
            date: "-",
            total_buy_quantity: parseInt(sum_total_qnt),
            average_buy_price: FormatNumber(sum_buy_value / sum_total_qnt),
            buy_value: FormatNumber(sum_buy_value),
            current_price: FormatNumber(currentPrice),
            current_value: FormatNumber(sum_total_qnt * currentPrice),
            fifo_cost: FormatNumber(sum_buy_value / sum_total_qnt),
            unrealised_gain: FormatNumber(
                (sum_total_qnt * currentPrice - sum_buy_value)
            ),
            total_returns: FormatNumber(
                ((currentPrice * 100) / (sum_buy_value / sum_total_qnt) - 100)
            ),
        });
    } else {
        unrealise.push({
            date: "-",
            stockCode: stock_code,
            total_buy_quantity: FormatNumber(0),
            average_buy_price: FormatNumber(0),
            buy_value: FormatNumber(0),
            current_price: FormatNumber(currentPrice),
            current_value: FormatNumber(0),
            fifo_cost: FormatNumber(0),
            unrealised_gain: FormatNumber(0),
            total_returns: FormatNumber(0),
        });
    }

    let total_buy_quantity = 0;
    let buy_value = 0;
    let total_sell_quantity = 0;
    let sell_value = 0;
    let total_stcg = 0;
    let total_ltcg = 0;
    let total_gain = 0;

    realisedGain.forEach((element) => {
        total_buy_quantity += parseInt(element.total_buy_quantity);
        buy_value += FormatNumber(element.buy_value);
        total_sell_quantity += parseInt(element.total_sell_quantity);
        sell_value += FormatNumber(element.sell_value);
        // total_ltcg += FormatNumber(element.ltcg);
        // total_stcg += FormatNumber(element.stcg);
        total_gain += FormatNumber(element.gain)
    });

    realisedGain.push({
        total_buy_quantity: parseInt(total_buy_quantity),
        average_buy_price: total_buy_quantity === 0 ? 0 : FormatNumber(buy_value / total_buy_quantity),
        buy_value: FormatNumber(buy_value),
        total_sell_quantity: parseInt(total_sell_quantity),
        average_sell_price: total_sell_quantity === 0 ? 0 : FormatNumber(sell_value / total_sell_quantity),
        sell_value: FormatNumber(sell_value),
        // ltcg: FormatNumber(total_ltcg),
        // stcg: FormatNumber(total_stcg),
        gain: FormatNumber(total_gain)
    });

    return {
        'realised': realisedGain,
        'unrealised': unrealise
    };
};

const getStockTrades = async (id, symbol) => {
    const query = `
        SELECT *
        FROM trades
        WHERE strategy_id = ? AND symbol = ?;
    `;
    const params = [id, symbol];

    const result = await ExecuteQuery(query, params);
    return result;
};

const getCashTrades = async (id) => {
    const query = `
        SELECT balance
FROM swiftfoliosuk.cash
WHERE strategy_id = ?
ORDER BY datetime DESC
LIMIT 1;
    `;
    const params = [id];

    const result = await ExecuteQuery(query, params);
    if (result.length > 0)
        return result[0].balance;
    else
        return 0;
};

const calculateTotalPercentage = (result) => {
    return result.reduce((total, item) => {
        return total + parseFloat(item.percentage);
    }, 0);
};

const getStrategyStockInfo = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let portfolio_value = 0;

            const query = `
                SELECT asset_class_name, stock AS symbol, percentage
                FROM portfolio_management
                WHERE id = ?;
            `;
            const params = [id];

            const result = await ExecuteQuery(query, params);

            const totalPercentage = calculateTotalPercentage(result);
            const cash = 100 - totalPercentage;
            const currentCashBalance = await getCashTrades(id);

            const groupedAssets = result.reduce((acc, current) => {
                const { asset_class_name, symbol, percentage } = current;

                if (!acc[asset_class_name]) {
                    acc[asset_class_name] = {
                        name: asset_class_name,
                        stocks: [],
                    };
                }

                acc[asset_class_name].stocks.push({ symbol, percentage });
                return acc;
            }, {});

            const finalResult = Object.values(groupedAssets);
            const dlData = await getAllData(id);

            let totalPredictedPercentage = 0;
            const promises = finalResult.flatMap(assetClass =>
                assetClass.stocks.map(async (asset, index) => {
                    const stockDetails = await getStockDetails(asset.symbol);
                    const stockTrades = await getStockTrades(id, asset.symbol);
                    const gainInfo = CalculateCapitalGains(asset.symbol, stockTrades, stockDetails.regularMarketPrice);
                    stockDetails.percentage_change = stockDetails.percentage_change == "-" ? stockDetails.regularMarketChangePercent : stockDetails.percentage_change
                    const dl_stock_data = dlData.dl_data.find(dl => dl.security === asset.symbol);

                    if (dl_stock_data) {
                        stockDetails.predict_percentage = parseFloat(dl_stock_data.predict_percentage).toFixed(4);
                    }
                    let current_qty = gainInfo.unrealised[gainInfo.unrealised.length - 1].total_buy_quantity;
                    let current_value = current_qty * stockDetails.regularMarketPrice;
                    let inv_prive = gainInfo.unrealised[gainInfo.unrealised.length - 1].fifo_cost;
                    let inv_value = inv_prive * current_qty;
                    let total_return = (current_value / inv_value - 1) * 100;
                    let real_gain = gainInfo.realised[gainInfo.realised.length - 1].gain;
                    let unreal_gain = gainInfo.unrealised[gainInfo.unrealised.length - 1].unrealised_gain;
                    portfolio_value = portfolio_value + current_value;
                    totalPredictedPercentage = totalPredictedPercentage + (dl_stock_data.predict_percentage * asset.percentage / 100)
                    assetClass.stocks[index] = { ...stockDetails, ...asset, current_qty, current_value, inv_prive, inv_value, total_return, real_gain, unreal_gain };
                })
            );

            await Promise.all(promises);


            portfolio_value = portfolio_value + currentCashBalance;

            const cashData = {
                symbol: "CASH",
                percentage: cash,
                currentPrice: 1,
                target_qty: portfolio_value * cash / 100,
                current_qty: currentCashBalance,
            }

            finalResult.map((assetClass, assetIndex) => {
                let total_percentage = 0;
                let total_current_value = 0;
                let total_current_weight = 0;
                let total_inv_value = 0;
                let final_return = 0;
                let total_today_cont = 0;

                assetClass.stocks.map((stock, index) => {
                    let target_qty = portfolio_value * stock.percentage / 100 / stock.regularMarketPrice;
                    let current_weight = (stock.current_value / portfolio_value) * 100;
                    let active_weight = current_weight - stock.percentage;
                    let today_cont = (stock.regularMarketChangePercent * current_weight) / 100;

                    total_percentage += parseFloat(stock.percentage);
                    total_current_value += stock.current_value;
                    total_current_weight += current_weight;
                    total_inv_value += stock.inv_value;
                    total_today_cont += today_cont;

                    assetClass.stocks[index] = { ...stock, target_qty, current_weight, active_weight, today_cont };
                })

                final_return = ((total_current_value / total_inv_value) - 1) * 100;
                finalResult[assetIndex] = { ...assetClass, total_current_value, total_current_weight, total_inv_value, total_percentage, total_today_cont, final_return }
            }
            );



            const res = { portfolio_value, data: finalResult, cashData: cashData, totalPredictedPercentage }
            resolve(res);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { getStrategyStockInfo };
