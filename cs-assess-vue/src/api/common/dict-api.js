import request from '@/utils/request'

export function getAllDataItemInfo() {
  return request({
    url: '/csa/dict/getAllDataItemInfo',
    method: 'get'
  })
}
