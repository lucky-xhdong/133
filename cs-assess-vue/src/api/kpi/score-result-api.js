import request from '@/utils/request'

export function getResultDataList(params) {
  return request({
    url: '/csa/assessResult/selectResultList',
    method: 'get',
    params: params
  })
}

export function getAllModelList() {
  return request({
    url: '/csa/assessResult/selectAllModelList',
    method: 'get'
  })
}

export function getModelItem() {
  return request({
    url: '/csa/assessResult/getModelItem',
    method: 'get'
  })
}
