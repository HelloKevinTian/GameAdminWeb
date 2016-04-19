/**
 *  公用信息
 */
var request = require('request');
var util = require('util');
var async = require("async");
var mongo = require('mongoskin');
var logger = require('ss-logger').getLogger(__filename);
var config = require('../cfg/server.json');

var dbs = {};
var dbOptions = {
    safe: true,
    maxPoolSize: config.mongodb.max_pool_size || 1000
};

var _dbName = util.format('%s:%s/%s/?auto_reconnect', config.mongodb.host, config.mongodb.port, config.mongodb.db);

var _db = mongo.db(_dbName, dbOptions);

/**
 * 获取db控制对象
 */
function getDB(host, port, db) {
    db = db || 'test';

    var dbName = util.format('%s:%s/%s/?auto_reconnect', host, port, db);
    var name = util.format('%s:%s/%s', host, port, db);
    if (dbs[name]) {
        return dbs[name];
    };
    var db = mongo.db(dbName, dbOptions);
    dbs[name] = db;
    return db;
};

/**
 * 获取游戏服务器数据库
 */
function getGameDB(msg, serverIndex, endcb) {
    var server = {};
    var db = null;
    async.waterfall([
            function(cb) {
                _db.collection('servers').findOne({
                    serverIndex: serverIndex
                }, function(err, data) {
                    if (err || !data) {
                        logger.error(err);
                        msg.querySuccess = false;
                        msg.message = "获取游戏服务器配置错误";
                        cb(true);
                    } else {
                        server = data;
                        cb();
                    }
                });
            },
            function(cb) {
                try {
                    var gameHost = server.gameHost;
                    var gamePort = server.gamePort;
                    var gameDB = server.gameDB;
                    if (!gameDB || !gamePort || !gameDB) {
                        msg.querySuccess = false;
                        msg.message = '连接游戏数据库[ '
                        msg.message += server.serverName;
                        msg.message += ' ] 错误';
                        logger.error('连接游戏数据库[%s]错误', server.serverName);
                    } else {
                        db = getDB(gameHost, gamePort, gameDB);
                    }
                    cb();

                } catch (e) {
                    msg.querySuccess = false;
                    msg.message = '连接游戏数据库错误[ '
                    msg.message += e;
                    msg.message += ' ] ';
                    cb();
                }
            }
        ],
        function(err) {
            endcb(!msg.querySuccess, db);
        });
};


/**
 * 通过api_key获取账号信息
 */
function getMemberByApiKey(api_key, callback) {
    var url = util.format('http://%s:%s/getMember', config.login.host, config.login.port);

    var options = {
        uri: url,
        method: 'GET',
        timeout: 4000,
        qs: {
            "api_key": api_key
        },
        json: true
    };

    request(options, function(error, response, result) {
        if (error || !result.querySuccess) {
            callback(error || result.message);
        } else {
            callback(null, result.member);
        }
    });
};

/**
 * 通过uid获取账号信息
 */
function getMemberByUid(uid, callback) {
    var url = util.format('http://%s:%s/getMember', config.login.host, config.login.port);

    var options = {
        uri: url,
        method: 'POST',
        timeout: 4000,
        json: {
            "uid": uid
        }
    };

    request(options, function(error, response, result) {
        if (error || !result.querySuccess) {
            callback(error || result.message);
        } else {
            callback(null, result.member);
        }
    });
};

/**
 * 导出对象
 */
module.exports = {
    'db': _db,
    'getDB': getDB,
    'getGameDB': getGameDB,
    'getMemberByApiKey': getMemberByApiKey,
    'getMemberByUid': getMemberByUid
};