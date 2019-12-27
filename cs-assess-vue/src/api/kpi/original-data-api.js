import request from '@/utils/request'

export function getOriginDataList(params) {
  return request({
    url: '/csa/originalData/getOriginDataList',
    method: 'get',
    params: params
  })
}

export function updateOriginData(data) {
  return request({
    url: '/csa/originalData/updateOriginDataByUserId',
    method: 'post',
    data: data
  })
}
