'use strict';

const _ = require('lodash');
const config = require('config');

const cron = require('../lib/cron');
const LogService = require('../service').Log;
const IpLocationService = require('../service').IpLocation;

// 暂定每五分钟
let set_location = cron(config.proxy_log.cron.set_location, function* () {
  if (config.proxy_log.save_days <= 0) {
    return;
  }

  let ips = yield LogService.findIpsAsync();
  for (let ip of ips) {
    let location = yield IpLocationService.getAsync(ip);
    if (location) {
      location = _.pick(location, ['region', 'city', 'isp']);
    } else {
      location = {region: '', city: '', isp: ''};
    }

    yield LogService.updateByIpAsync(ip, location);
  }
});

// 每小时的 *:03:00 执行任务
let data_clean = cron(config.proxy_log.cron.data_clean, function* () {
  if (config.proxy_log.save_days <= 0) {
    return;
  }

  yield LogService.deleteByTimeAsync(config.proxy_log.save_days);
});

module.exports = {
  data_clean,
  set_location,
};