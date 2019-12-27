import request from '@/utils/request'

export function selectCallTestList(params) {
  return request({
    url: '/csa/callTest/selectCallTestList',
    method: 'get',
    params
  })
}

export function saveCallTest(data) {
  return request({
    url: '/csa/callTest/saveCallTest',
    method: 'post',
    data: data
  })
}

export function updateUserRelation(data) {
  return request({
    url: '/csa/callTest/updateUserRelation',
    method: 'post',
    data: data
  })
}
