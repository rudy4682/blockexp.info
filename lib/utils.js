
function getDateToEpoch(dDate) {
    return (dDate.getTime() - dDate.getMilliseconds()) / 1000;
}

function getisPrivateIP(ip) {
    var parts = ip.split('.');
    return parts[0] === '10' || (parts[0] === '172' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31)) || (parts[0] === '192' && parts[1] === '168');
}
function getIPaddy(ip_node) {
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




module.exports = {
    get_elapsedTime: function (timeStart, timeEnd, cb) {
        getelapsedTime(timeStart, timeEnd, function (timeElaspsedStr) {
            return cb(timeElaspsedStr);
        });
    },

    get_ipNodeSplit: function (ipaddress, cb) {
        return cb(getIPaddy(ipaddress));
    },
    
    get_isipPrivate: function (ipaddress){
        getisPrivateIP(ipaddress, function (isPrivate) {
            return (isPrivate)
        });
    },

get_DateToEpoch: function (dDate, cb) {
        return cb(getDateToEpoch(dDate));
    },

    get_sizeTypeBytes: function (bytes, cb) {
        getsizeTypeBytes(bytes, function (bytesStr) {
            return cb(bytesStr)
        });
    },
    
}







