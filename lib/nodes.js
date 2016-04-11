var request = require('request')
  , settings = require('./settings')
  , Stats = require('../models/stats');

var base_url = 'http://127.0.0.1:' + settings.port + '/api/';

function getDateToEpoch(d) {
    // d = javascript date obj
    // returns epoch timestamp
    return (d.getTime() - d.getMilliseconds()) / 1000;
}

function getisipPrivate(ip) {
    var parts = ip.split('.');
    return parts[0] === '10' || (parts[0] === '172' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31)) || (parts[0] === '192' && parts[1] === '168');
}
function getipNodeSplit(ip_node) {
    var IPaddy = ip_node.split(':')
    return IPaddy;
}

function getelapsedTime(timeStart, timeEnd) {
    var eT = 0;
    var eTType = "MS";
    var elapsedMS = (timeEnd - timeStart);
    eT = elapsedMS;
    if (elapsedMS > 61000) {
        eT = ((elapsedMS / 1000) / 60);
        eTType = "Mins"
    } else if (elapsedMS > 1000) {
        eT = (elapsedMS / 1000);
        eTType = "Secs"
    }
    return (eT + " " + eTType);
}

function getsizeTypeBytes(bytes) {
    var ByteType = "B";
    var dataSize = bytes;
    if (bytes > 1208925819614629174706175) {
        ByteType = "YB";
        dataSize = (bytes / 1208925819614629174706176);
    } else if (bytes > 1180591620717411303423) {
        ByteType = "ZB";
        dataSize = (bytes / 1180591620717411303424);
    } else if (bytes > 1152921504606846975) {
        ByteType = "EB";
        dataSize = (bytes / 1152921504606846976);
    } else if (bytes > 1125899906842623) {
        ByteType = "PB";
        dataSize = (bytes / 1125899906842624);
    } else if (bytes > 1099511627775) {
        ByteType = "TB";
        dataSize = (bytes / 1099511627776);
    } else if (bytes > 1073741823) {
        ByteType = "GB";
        dataSize = (bytes / 1073741824);
    } else if (bytes > 1048575) {
        ByteType = "MB";
        dataSize = (bytes / 1048576);
    } else if (bytes > 1023) {
        ByteType = "KB";
        dataSize = (bytes / 1024);
    }
    return (dataSize.toFixed(1) + " " + ByteType);
}

function getconnectioninfo(cb) {
    var uri = base_url + 'getpeerinfo';
    var conninfo = [];
    request({ uri: uri, json: true }, function (error, response, body) {
        if (error) {
            return cb([]);
        } else {
            var peers = body;
            var ipAddy = [];
            for (var i = 0; i < peers.length; i++) {
                var dateEnd = getDateToEpoch(new Date());
                ipAddy = getipNodeSplit(peers[i].addr);
                var rSubVer = peers[i].subver.replace(/[/]/g, '')
                var bssent = "-";
                var brecv = "-";
                var ssent = "-";
                var srecv = "-";
                if (typeof peers[i].bytessent != 'undefined') {
                    bssent = peers[i].bytessent;
                    brecv = peers[i].bytesrecv;
                    ssent = getsizeTypeBytes(peers[i].bytessent);
                    srecv = getsizeTypeBytes(peers[i].bytesrecv);
                    }
                var peerinfo = {
                    addr: ipAddy[0],
                    port: ipAddy[1],
                    addrport: peers[i].addr,
                    services: peers[i].services,
                    lastsend: peers[i].lastsend,
                    lastrecv: peers[i].lastrecv, 
                    lastsendET: getelapsedTime(peers[i].lastsend, dateEnd),
                    lastrecvET: getelapsedTime(peers[i].lastrecv, dateEnd),
                    bytessent: bssent,
                    bytesrecv: brecv,
                    sizesent: ssent,
                    sizerecv: srecv,
                    conntime: peers[i].conntime, 
                    version: peers[i].version, 
                    subver: rSubVer, 
                    inbound: peers[i].inbound,
                    releasetime: peers[i].releasetime, 
                    startingheight: peers[i].startingheight,
                    banscore: peers[i].banscore,
                    ipprivate: getisipPrivate(ipAddy[0])
                }
                conninfo.push(peerinfo);
            }
            return cb(conninfo);
        }
    });
}

module.exports = {
    get_peerinfo: function (cb) {
        getconnectioninfo(cb, function (conninfo) {
            if (err) {
                return cb([]);
            } else {
                return cb(conninfo);
            }
        });
    }
}

