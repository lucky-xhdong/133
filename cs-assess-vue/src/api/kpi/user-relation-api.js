import request from '@/utils/request'

export function selectUserRelationList(params) {
  return request({
    url: '/csa/userRelation/selectUserRelationList',
    method: 'get',
    params
  })
}

export function saveUserRelation(data) {
  return request({
    url: '/csa/userRelation/saveUserRelation',
    method: 'post',
    data: data
  })
}

export function updateUserRelation(data) {
  return request({
    url: '/csa/userRelation/updateUserRelation',
    method: 'post',
    data: data
  })
}
