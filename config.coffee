log4js = require('log4js')
mysql  = require('mysql')

# 服务器运行
exports.host   = '127.0.0.1'
exports.port   = '80'
exports.domain = 'proxy.ticknet.cn'

# 配置日志输出
logger = log4js.getLogger()
logger.setLevel('info')
exports.logger = logger

# Mysql相关信息
mysqlInfo =
    host:     'localhost'
    user:     '数据库用户名'
    password: '数据库密码'
    database: '数据库的库名'
exports.mysqlPool  = mysql.createPool mysqlInfo
exports.mysqlQuery = (sql, callback) ->
    exports.mysqlPool.getConnection (err, con) ->
        if err then return callback err
        con.query sql, (err, rows) ->
            callback err, rows
            con.release()

# 企业号相关信息
exports.wechat =
    corpId : '企业号的corpId'
    secret : '企业号的secret'