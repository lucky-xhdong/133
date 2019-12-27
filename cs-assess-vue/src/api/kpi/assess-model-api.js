import request from '@/utils/request'

export function selectAllModelList(params) {
  return request({
    url: '/csa/assessResult/selectAllModelList',
    method: 'get',
    params
  })
}

export function queryAssessModelDetailList(data) {
  return request({
    url: '/csa/modelDetail/queryAssessModelDetailList',
    method: 'post',
    data: data
  })
}

export function updateAssessModelDetail(data) {
  return request({
    url: '/csa/modelDetail/updateAssessModelDetail',
    method: 'post',
    data: data
  })
}
