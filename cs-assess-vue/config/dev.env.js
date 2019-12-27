'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  HOST: 'http://124.251.115.187:8867',
  BASE_API: '"http://localhost:8801/csaserver"',

  // 客服控制台首页
  LIKN_CUSTCONSOLE_INDEX: '"http://localhost:8863/workorder"'
})
