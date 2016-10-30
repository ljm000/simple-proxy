'use strict';

const co = require('co');
const requestStats = require('request-stats');

const LogService = require('../service').Log;
const logger = require('../lib/logger');

let log = function* (info) {
  // 非代理访问不记录
  if (!info.req.headers['x-proxy-id']) {
    return;
  }

  // 格式化记录信息
  let bytes = info.req.bytes + info.res.bytes;
  let options = {
    proxy_id: info.req.headers['x-proxy-id'],
    ip: info.req.headers['x-forwarded-for'],
    is_complete: info.ok,
    status: info.res.status,
    method: info.req.method,
    path: info.req.path,
    ua: info.req.headers['user-agent'],
    bytes: bytes,
    time: info.time,
    speed: bytes * 8 / info.time,
  };

  // 插入数据库
  return yield LogService.addAsync(options);
};

let stats = function (req, res, next) {
  // 监听事件，记录日志
  requestStats(req, res, function (info) {
    co.wrap(log)(info).catch(function (err) {
      logger.error(err);
    });
  });

  next();
};

module.exports = () => stats;