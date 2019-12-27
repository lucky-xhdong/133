import request from '@/utils/request'

// 根据条件查询调班申请列表
export function selectChangeList(params) {
  return request({
    url: '/csa/shiftChange/selectChangeList',
    method: 'get',
    params
  })
}

// 普通客服提交调班申请
export function saveChangeApply(data) {
  return request({
    url: '/csa/shiftChange/saveChangeApply',
    method: 'post',
    data: data
  })
}

// 班长审核调班申请
export function auditChangeApply(data) {
  return request({
    url: '/csa/shiftChange/auditChangeApply',
    method: 'post',
    data: data
  })
}
