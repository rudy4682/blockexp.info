var request = require('request');

var base_url = 'https://api.cryptsy.com/api/v2/markets';
function get_summary(coin, exchange, Crymktid, cb) {
    var summary = {};
    request({ uri: base_url + '/' + coin + '_' + exchange + '/ticker', json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else if (body.success === true) {
            summary['bid'] = body.data['bid'].toFixed(8);
            summary['ask'] = body.data['ask'].toFixed(8);
            request({ uri: base_url + '/' + coin + '_' + exchange , json: true }, function (error, response, body) {
                if (error) {
                    return cb(error, null);
                } else if (body.success === true) {
                    summary['volume'] = body.data['24hr']['volume'];
                    summary['volume_btc'] = body.data['24hr']['volume_btc'];
                    summary['high'] = body.data['24hr']['price_high'];
                    summary['low'] = body.data['24hr']['price_low'];
                    summary['last'] = body.data['last_trade']['price'];
                    return cb(null, summary);
                } else {
                    return cb(error, null);
                }
            });
        } else {
            return cb(error, null);
        }
    });
}
function get_trades(coin, exchange, Crymktid, cb) {
    var req_url = base_url + '/' + coin + '_' + exchange + '/tradehistory?limit=100';
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.success == true) {
            return cb(null, body.data);
        } else {
            return cb(body.message, null);
        }
    });
}

function get_orders(coin, exchange, Crymktid, cb) {
    var req_url = base_url + '/' + coin + '_' + exchange + '/orderbook?type=both?limit=50';
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.success == true) {
            var orders = body.data;
            var buys = [];
            var sells = [];
            if (orders['buyorders'].length > 0) {
                for (var i = 0; i < orders['buyorders'].length; i++) {
                    var order = {
                        amount: parseFloat(orders.buyorders[i].quantity).toFixed(8),
                        price: parseFloat(orders.buyorders[i].price).toFixed(8),
                        //  total: parseFloat(orders.buyorders[i].total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.buyorders[i].quantity).toFixed(8) * parseFloat(orders.buyorders[i].price)).toFixed(8)
                    }
                    buys.push(order);
                }
            } else { }
            if (orders['sellorders'].length > 0) {
                for (var x = 0; x < orders['sellorders'].length; x++) {
                    var order = {
                        amount: parseFloat(orders.sellorders[x].quantity).toFixed(8),
                        price: parseFloat(orders.sellorders[x].price).toFixed(8),
                        //    total: parseFloat(orders.sellorders[x].total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.sellorders[x].quantity).toFixed(8) * parseFloat(orders.sellorders[x].price)).toFixed(8)
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

function get_chartdata(coin, exchange, cb) {
    var end = Date.now();
    end = end / 1000;
    start = end - 86400;
    var req_url = base_url + '/' + coin + '_' + exchange + '/ohlc?start=' + start + '&end=' + end + '&interval=minute';
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (error) {
            return cb(error, []);
        } else {
            if (body.success == true) {
                var processed = [];
                for (var i = 0; i < body.data.length; i++) {
                    var cData = {
                        date: body.data[i].date,
                        open: parseFloat(body.data[i].open).toFixed(8),
                        high: parseFloat(body.data[i].high).toFixed(8),
                        low:  parseFloat(body.data[i].low).toFixed(8),
                        close:  parseFloat(body.data[i].close).toFixed(8),
                        times:  body.data[i].timestamp * 1000,
                        volume:  parseFloat(body.data[i].volume).toFixed(8)
                    }
                    processed.push(cData);
                    if (i == body.data.length - 1) {
                        return cb(null, processed);
                    }
                }
            } else {
                return cb(body.message, []);
            }
        }
    });
}

module.exports = {
    get_data: function (coin, exchange, Crymktid, cb) {
        var error = null;
        get_orders(coin, exchange, Crymktid, function (err, buys, sells) {
            if (err) { error = err; }
            get_trades(coin, exchange, Crymktid, function (err, trades) {
                if (err) { error = err; }
                get_summary(coin, exchange, Crymktid, function (err, stats) {
                    if (err) { error = err; }
                    get_chartdata(coin, exchange, function (err, chartdata) {
                        if (err) { error = err; }
                        return cb(error, { buys: buys, sells: sells, chartdata: chartdata, trades: trades, stats: stats });
                    });
                });
            });
        });
    }
};

