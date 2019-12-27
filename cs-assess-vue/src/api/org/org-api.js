import request from '@/utils/request'

export function getAllUpmsOrgList() {
  return request({
    url: '/csa/org/getUpmsOrgList',
    method: 'get'
  })
}

export function getOrgInfoById(params) {
  return request({
    url: '/csa/org/getOrgById',
    method: 'get',
    params: params
  })
}

export function saveOrgInfo(data) {
  return request({
    url: '/csa/org/saveOrg',
    method: 'post',
    data: data
  })
}
