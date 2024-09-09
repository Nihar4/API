const { parentPort, workerData } = require('worker_threads');
const stat = require("simple-statistics");

const processData = async (stock, stockData) => {
    try {

        const data = stockData.adjCloseArray;

        var status = 0;

        if ("EH" == stock.split(".")[1]) {
            status = 1;
        } else {
            if (data.length < 1200) {
                status = 0;
                return status;
            } else {
                status = 1;
            }
        }

        if (status === 1) {
            var primaryData = data.slice(-22);
            var corrInitial = -1;
            var iterations = 0;
            var topData = [];
            var usedIndices = new Set();
            while (iterations < data.length - 22) {
                var randomIndex = iterations
                if (!usedIndices.has(randomIndex)) {
                    var randomData = data.slice(randomIndex, randomIndex + 22);
                    var corr = stat.sampleCorrelation(primaryData, randomData);

                    corrInitial = corr;
                    let prev_value;

                    if (randomIndex != 0) {
                        prev_value = data[randomIndex - 1];
                    } else {
                        prev_value = data[0];
                    }

                    randomData = [prev_value, ...randomData];

                    topData.push({ randomData, corr });
                    usedIndices.add(randomIndex);
                }
                iterations++;
            }

            // console.log(data.length, topData.length)

            topData.sort((a, b) => b.corr - a.corr);
            topData = topData.slice(0, 5);

            const predicted = [];

            for (let i = 0; i < topData.length; i++) {
                const { randomData, corr } = topData[i];

                const gray_array = [];

                for (let i = 1; i < randomData.length; i++) {
                    const result = randomData[i] / randomData[i - 1] - 1;
                    gray_array.push(result);
                }

                let last_data_value = data[data.length - 1];

                const predicted_data = [];

                for (let i = 0; i < gray_array.length; i++) {
                    const value = last_data_value * (gray_array[i] + 1);
                    predicted_data.push(value);
                    last_data_value = value;
                }

                const percentage =
                    predicted_data[predicted_data.length - 1] / data[data.length - 1] - 1;

                predicted.push({ predicted_data, corr, percentage });
            }

            const prediction_return = CalcPrediction(stock, stockData, predicted)



            return (prediction_return)
        }
    } catch (error) {
        console.error(`Error processing data for ${stock}:`, error);
        return (error);
    }

}

const CalcPrediction = (stockName, stockData, result) => {

    let average_randomData = [];
    for (let i = 0; i < 22; i++) {
        let sum = 0;
        for (let j = 0; j < 5; j++) {
            sum += result[j].predicted_data[i];
        }
        average_randomData.push(sum / 5);
    }

    if ("EH" == stockName.split(".")[1]) {
        average_randomData = average_randomData.slice(0, 1);
    }

    let avg_corr;
    if ("EH" == stockName.split(".")[1]) {
        let sum = 0;
        for (let i = 0; i < result.length; i++) {
            sum += result[i].corr;
        }
        avg_corr = sum / 1;
    } else {
        let sum = 0;
        for (let i = 0; i < result.length; i++) {
            sum += result[i].corr;
        }
        avg_corr = sum / result.length;
    }

    let predictedDataString;
    if ("EH" == stockName.split(".")[1]) {
        predictedDataString = result
            .map((entry) => entry.predicted_data.slice(0, 1).join(","))
            .join(",");
    } else {
        predictedDataString = result
            .map((entry) => entry.predicted_data.join(","))
            .join(",");
    }

    const averageRandomDataString = average_randomData.join(",");
    const combinedString = `${predictedDataString},${averageRandomDataString}`;

    const avg_percentage =
        average_randomData[average_randomData.length - 1] /
        stockData.adjCloseArray[stockData.adjCloseArray.length - 1] -
        1;

    let objj = {
        symbol: stockName,
        pred_percentage: avg_percentage,
        market_cap: stockData.marketCap,
        currentPrice: stockData.regularMarketPrice
    };



    return objj;
}

const processStock = async () => {
    const stockArray = workerData;
    try {
        const stockPromises = stockArray.map(async (item) => {
            try {
                const stockName = item.name.trim();
                const res = await processData(stockName, item);
                return res;
            } catch (error) {
                console.log(`Error processing stock ${item}:`, error);
            }
        })

        const allPromises = stockPromises.flat();
        const results = await Promise.all(allPromises);
        parentPort.postMessage(results)
        return (results);
    } catch (error) {
        console.log(`Error processing performance data:`, error);
        return (error);
    }
};

processStock();
