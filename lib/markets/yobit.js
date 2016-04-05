var request = require('request');

var base_url = 'https://yobit.net/api/3';

function get_summary(coin, exchange, cb) {
  var req_url = base_url + '/ticker/' + coin + '_' + exchange;
  request({uri: req_url, json: true}, function (error, response, body) {
    if (error) {
      return cb(error, null);
    } else {
      if (body.message) {
        return cb(body.message, null)
            } else {
                var summary = {};
                summary['buy'] = body[coin + '_' + exchange]['buy'].toFixed(8);
                summary['sell'] = body[coin + '_' + exchange]['sell'].toFixed(8);
                summary['vol_cur'] = body[coin + '_' + exchange]['vol_cur'].toFixed(8);
                summary['vol'] = body[coin + '_' + exchange]['vol'].toFixed(8);
                summary['high'] = body[coin + '_' + exchange]['high'].toFixed(8);
                summary['low'] = body[coin + '_' + exchange]['low'].toFixed(8);
                summary['last'] = body[coin + '_' + exchange]['last'].toFixed(8);
                summary['avg'] = body[coin + '_' + exchange]['avg'].toFixed(8);
                summary['updated'] = body[coin + '_' + exchange]['updated'];
                return cb(null, summary);
      }
    }
  });
}

function get_trades(coin, exchange, cb) {
  var req_url = base_url + '/trades/' + coin + '_' + exchange;
  request({uri: req_url, json: true}, function (error, response, body) {
    if (error) {
      return cb(error, null);
    } else {
      if (body.message) {
        return cb(body.message, null)
      } else {
        return cb (null, body[coin + '_' + exchange]);
      }
    }
  });
}

function get_orders(coin, exchange, cb) {
  var req_url = base_url + '/depth/' + coin + '_' + exchange;
  request({uri: req_url, json: true}, function (error, response, body) {
    if (body.success == 0) {
      return cb(body.error, null, null);
    } else {
      return cb(null, body[coin + '_' + exchange]['bids'], body[coin + '_' + exchange]['asks']);
    }
  });
}

module.exports = {
  get_data: function(coin, exchange, cb) {
    var error = null;
    get_orders(coin, exchange, function(err, buys, sells) {
      if (err) { error = err; }
      get_trades(coin, exchange, function(err, trades) {
        if (err) { error = err; }
        get_summary(coin, exchange, function(err, stats) {
          if (err) { error = err; }
          return cb(error, {buys: buys, sells: sells, chartdata: [], trades: trades, stats: stats});
        });
      });
    });
  }
};
