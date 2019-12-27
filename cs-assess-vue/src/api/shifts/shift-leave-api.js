import request from '@/utils/request'

// 根据条件查询请假申请列表
export function selectLeaveApplyList(params) {
  return request({
    url: '/csa/shiftLeave/selectLeaveApplyList',
    method: 'get',
    params
  })
}

// 普通客服申请请假
export function saveLeaveApply(data) {
  return request({
    url: '/csa/shiftLeave/saveLeaveApply',
    method: 'post',
    data: data
  })
}

// 管理人员审核请假申请
export function auditLeaveApply(data) {
  return request({
    url: '/csa/shiftLeave/auditLeaveApply',
    method: 'post',
    data: data
  })
}
