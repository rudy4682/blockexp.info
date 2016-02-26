var request = require('request');
var summary = {};
var buys = [];
var sells = [];
var base_url = 'https://alcurex.org/api/market.php';

function utilGet_OHLC(coin, exchange, cb) {
    request({ uri: base_url + '?currency=' + exchange + '&interval=24&pair=' + coin + '_' + exchange, json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else {
            summary['volume_exc'] = body['tradeamount'];
            request({ uri: base_url + '?currency=' + coin + '&interval=24&pair=' + coin + '_' + exchange , json: true }, function (error, response, body) {
                if (error) {
                    return cb(error, null);
                } else {
                    summary['volume'] = body['tradeamount'];
                    request({ uri: base_url + '?pair=' + coin + '_' + exchange + '&history=on&historyinterval=24&price=All', json: true }, function (error, response, body) {
                        if (error) {
                            return cb(error, null);
                        } else {
                            stat1 = body[coin + '_' + exchange];
                            summary['low'] = stat1[0].price.toFixed(8);
                            summary['high'] = stat1[0].price.toFixed(8);
                            summary['open'] = stat1[0].price.toFixed(8);
                            summary['close'] = stat1[0].price.toFixed(8);
                            summary['last'] = stat1[0].price.toFixed(8);
                            var opentime = stat1[0].time;
                            var closetime = stat1[0].time;
                            if (stat1.length > 0) {
                                for (var i = 0; i < stat1.length; i++) {
                                    if (stat1[i].price < summary['low']) { summary['low'] = stat1[i].price.toFixed(8); }
                                    if (stat1[i].price > summary['high']) { summary['high'] = stat1[i].price.toFixed(8); }
                                    if (stat1[i].time < opentime) {
                                        opentime = stat1[i].time;
                                        summary['open'] = stat1[i].price.toFixed(8);
                                    }
                                    if (stat1[i].time > closetime) {
                                        closetime = stat1[i].time;
                                        summary['close'] = stat1[i].price.toFixed(8);
                                        summary['last'] = stat1[i].price.toFixed(8);
                                    }
                                }
                            }
                        }
                        return cb(null, summary);
                    });
                }
            });
        }
    });
}

function get_buyorders(coin, exchange, cb) {
    request({ uri: base_url + '?pair=' + coin + '_' + exchange + '&price=buy' , json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else {
            var orders = body[coin + '_' + exchange];
            var limit = 100;
            if (orders.length < limit) { limit = orders.length; }
            summary['bid'] = parseFloat(orders[0].price).toFixed(8);
            if (orders.length > 0) {
                for (var i = 0; i < limit; i++) {
                    var order = {
                        amount: parseFloat(orders[i].volume).toFixed(8),
                        price: parseFloat(orders[i].price).toFixed(8),
                        total: (parseFloat(orders[i].volume).toFixed(8) * parseFloat(orders[i].price)).toFixed(8)
                    }
                    buys.push(order);
                    if (i == limit - 1) {
                        get_sellorders(coin, exchange, cb), function (error, Object) {
                            if (error) {
                                return cb(error, [], []);
                            } else {
                                return cb(null, buys, sells);
                            }
                        };
                    }
                }
            } else {
                return cb(error, [], []);
            }
        }
    });
}
function get_sellorders(coin, exchange, cb) {
    request({ uri: base_url + '?pair=' + coin + '_' + exchange + '&price=sell' , json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else {
            var orders = body[coin + '_' + exchange];
            var limit = 100;
            if (orders.length < limit) { limit = orders.length; }
            summary['ask'] = parseFloat(orders[0].price).toFixed(8);
            if (orders.length > 0) {
                for (var i = 0; i < limit; i++) {
                    var order = {
                        amount: parseFloat(orders[i].volume).toFixed(8),
                        price: parseFloat(orders[i].price).toFixed(8),
                        //  total: parseFloat(orders.buyorders[i].total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders[i].volume).toFixed(8) * parseFloat(orders[i].price)).toFixed(8)
                    }
                    sells.push(order);
                }
            } else {
                null, buys, []
            }
            return cb(null, buys, sells);
        }
    });
}

function get_summary(coin, exchange, cb) {
    request({ uri: base_url + '?currency=' + exchange + '&interval=24&pair=' + coin + '_' + exchange, json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else {
            summary['volume_exc'] = body['tradeamount'];
            request({ uri: base_url + '?currency=' + coin + '&interval=24&pair=' + coin + '_' + exchange , json: true }, function (error, response, body) {
                if (error) {
                    return cb(error, null);
                } else {
                    summary['volume'] = body['tradeamount'];
                    request({ uri: base_url + '?pair=' + coin + '_' + exchange + '&history=on&historyinterval=24&price=All', json: true }, function (error, response, body) {
                        if (error) {
                            return cb(error, null);
                        } else {
                            stat1 = body[coin + '_' + exchange];
                            summary['low'] = stat1[0].price.toFixed(8);
                            summary['high'] = stat1[0].price.toFixed(8);
                            summary['open'] = stat1[0].price.toFixed(8);
                            summary['close'] = stat1[0].price.toFixed(8);
                            summary['last'] = stat1[0].price.toFixed(8);
                            var opentime = stat1[0].time;
                            var closetime = stat1[0].time;
                            if (stat1.length > 0) {
                                for (var i = 0; i < stat1.length; i++) {
                                    if (stat1[i].price < summary['low']) { summary['low'] = stat1[i].price.toFixed(8); }
                                    if (stat1[i].price > summary['high']) { summary['high'] = stat1[i].price.toFixed(8); }
                                    if (stat1[i].time < opentime) {
                                        opentime = stat1[i].time;
                                        summary['open'] = stat1[i].price.toFixed(8);
                                    }
                                    if (stat1[i].time > closetime) {
                                        closetime = stat1[i].time;
                                        summary['close'] = stat1[i].price.toFixed(8);
                                        summary['last'] = stat1[i].price.toFixed(8);
                                    }
                                }
                                return cb(null, summary);
                            }
                        }
                    });
                }
            });
        }
    });
}


function get_trades(coin, exchange, cb) {
    var req_url = base_url + '?pair=' + coin + '_' + exchange + '&history=on&limit=100';
    request({ uri: req_url, json: true }, function (error, response, body) {
        var Errors = null;
        if (error) {
            return cb(error, null);
        } else {
            return cb(null, body[coin + '_' + exchange]);
        }
    });
}

module.exports = {
    get_data: function (coin, exchange, cb) {
        var error = null;
        get_buyorders(coin, exchange, function (err, buys, sells) {
            if (err) { error = err; }
            get_trades(coin, exchange, function (err, trades) {
                if (err) { error = err; }
                get_summary(coin, exchange, function (err, stats) {
                    if (err) { error = err; }
                    return cb(error, { buys: buys, sells: sells, chartdata: [], trades: trades, stats: stats });
                });
            });
        });
    }
};

