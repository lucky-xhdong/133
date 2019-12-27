import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 200000, // 请求超时时间
  withCredentials: true, // 表示跨域请求时是否需要使用凭证
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

// request拦截器
service.interceptors.request.use(config => {
  if (store.getters.token) {
    config.headers['token'] = store.getters.token // 让每个请求携带自定义token 请根据实际情况自行修改

    // 多用户处理
    const cookiesToken = getToken()
    if (cookiesToken && store.getters.token !== cookiesToken) {
      Message({
        message: '本机已登录其他账号，请登出当前账号',
        type: 'error',
        duration: 5 * 1000
      })
    }
  }
  return config
}, error => {
  // Do something with request error
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.rspCode && res.rspCode !== '000000') {
      // 000102:会话超时, 000200:非法的token, 000201:token为空, 000202:token过期
      if (res.rspCode === '000200' || res.rspCode === '000201' || res.rspCode === '000202' || res.rspCode === '000102') {
        MessageBox.confirm('登录超时，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('FedLogOut').then(() => {
            let top = window
            if (window.top != null) {
              top = window.top
            }
            top.location.href = process.env.LIKN_CUSTCONSOLE_INDEX
          })
        }).catch(() => {
        })
      } else {
        Message({
          message: res.rspMsg,
          type: 'error',
          duration: 5 * 1000,
          showClose: true
        })
      }
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    Message({
      message: error.message + '：' + error.config.url,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
