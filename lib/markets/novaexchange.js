var request = require('request');
function toTimestamp(strDate) {
    var datum = Date.parse(strDate);
    return datum / 1000;
}

function formatdate(date1) {
    var formatted = (date1.getUTCFullYear()) + '-' + pad((date1.getUTCMonth() + 1)) + '-' + pad(date1.getUTCDate());
    return formatted;
}

var base_url = 'https://novaexchange.com/';
function get_summary(coin, exchange, cb) {
    var summary = {};
    request({ uri: base_url + 'remote/markets/', json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else if (body.status == "success") {
            var markets = body.markets
            for (var i = 0; i < markets.length; i++) {
                if (markets[i].marketname == exchange + '_' + coin) {
                    summary['bid'] = parseFloat(markets[i].bid).toFixed(8);
                    summary['ask'] = parseFloat(markets[i].ask).toFixed(8);
                    summary['volume'] = parseFloat(markets[i].volume24h).toFixed(8);
                    summary['change24h'] = parseFloat(markets[i].change24h).toFixed(2);
                    summary['high'] = parseFloat(markets[i].high24h).toFixed(8);
                    summary['low'] = parseFloat(markets[i].low24h).toFixed(8);
                    summary['last'] = parseFloat(markets[i].last_price).toFixed(8);
                    i = markets.length;
                }
            }
            return cb(null, summary);
        } else {
            return cb(error, null);
        }
    });
}
function get_trades(coin, exchange, cb) {
    var req_url = base_url + 'remote/market/orderhistory/' + exchange + '_' + coin + '/';
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.status == "success") {
            var tTrades = body.items;
            var trades = [];
            if (tTrades == "No trade history for this period") {
                return cb(tTrades, null);

            } else {
                for (var i = 0; i < tTrades.length; i++) {
                    var Trade = {
                        ordertype: tTrades[i].tradetype,
                        amount: parseFloat(tTrades[i].amount).toFixed(8),
                        price: parseFloat(tTrades[i].price).toFixed(8),
                        total: (parseFloat(tTrades[i].amount).toFixed(8) * parseFloat(tTrades[i].price)).toFixed(8),
                        datetime: tTrades[i].datestamp,
                        timestamp: toTimestamp(tTrades[i].datestamp + 'Z'),
                        baseamount: parseFloat(tTrades[i].baseamount).toFixed(8)
                    }
                    trades.push(Trade);
                }
            }
            return cb(null, trades);
        } else {
            return cb(body.message, null);
        }
    });
}

function get_orders(coin, exchange, cb) {
    var req_url = base_url + 'remote/market/openorders/' + exchange + '_' + coin + '/both/';
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.status == "success") {
            var orders = body;
            var buys = [];
            var sells = [];
            if (orders['buyorders'].length > 0) {
                for (var i = 0; i < orders['buyorders'].length; i++) {
                    var order = {
                        amount: parseFloat(orders.buyorders[i].amount).toFixed(8),
                        price: parseFloat(orders.buyorders[i].price).toFixed(8),
                        //  total: parseFloat(orders.buyorders[i].total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.buyorders[i].amount).toFixed(8) * parseFloat(orders.buyorders[i].price)).toFixed(8),
                        base: parseFloat(orders.buyorders[i].baseamount).toFixed(8),
                    }
                    buys.push(order);
                }
            } else { }
            if (orders['sellorders'].length > 0) {
                for (var x = 0; x < orders['sellorders'].length; x++) {
                    var order = {
                        amount: parseFloat(orders.sellorders[x].amount).toFixed(8),
                        price: parseFloat(orders.sellorders[x].price).toFixed(8),
                        //    total: parseFloat(orders.sellorders[x].total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.sellorders[x].amount).toFixed(8) * parseFloat(orders.sellorders[x].price)).toFixed(8),
                        base: parseFloat(orders.sellorders[x].baseamount).toFixed(8),
                    }
                    sells.push(order);
                    if (x == orders['sellorders'].length - 1) {
                        return cb(null, buys, sells);
                    }
                }
            }

        } else {
            return cb(body.message, [], [])
        }
    });
}

module.exports = {
    get_data: function (coin, exchange, Crymktid, cb) {
        var error = null;
        get_orders(coin, exchange, function (err, buys, sells) {
            if (err) { error = err; }
            get_trades(coin, exchange, function (err, trades) {
                if (err) { error = err; }
                get_summary(coin, exchange, function (err, stats) {
                    if (err) { error = err; }
                    return cb(error, { buys: buys, sells: sells, trades: trades, stats: stats });
                });
            });
        });
    }
};


