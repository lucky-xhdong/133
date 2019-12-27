import request from '@/utils/request'

// 根据条件查询整体班务月视图
export function getMonthShiftView(data) {
  return request({
    url: '/csa/shiftResult/getMonthShiftView',
    method: 'post',
    data: data
  })
}

// 根据条件查询整体班务日视图
export function getDayShiftView(params) {
  return request({
    url: '/csa/shiftResult/getDayShiftView',
    method: 'get',
    params
  })
}

// 计算每15分钟上班人数
export function getDayShiftViewCount(params) {
  return request({
    url: '/csa/shiftResult/getDayShiftViewCount',
    method: 'get',
    params
  })
}

// 管理人员或普通客服查询个人班务月视图
export function getPersonalMonthShiftView(params) {
  return request({
    url: '/csa/shiftResult/getPersonalMonthShiftView',
    method: 'get',
    params
  })
}

// 管理人员或普通客服查询所在小组班务月视图
export function getGroupMonthShiftView(params) {
  return request({
    url: '/csa/shiftResult/getGroupMonthShiftView',
    method: 'get',
    params
  })
}

// 根据日期查询当前班次和客服人员信息
export function getDayShiftView4Edit(params) {
  return request({
    url: '/csa/shiftResult/getDayShiftView4Edit',
    method: 'get',
    params
  })
}

// 编辑日排班，提交排班结果
export function insertShiftResultBatch(data) {
  return request({
    url: '/csa/shiftResult/insertShiftResultBatch',
    method: 'post',
    data: data
  })
}

// 编辑日排班，删除移走的已选择成员
export function deleteShiftResultBatch(data) {
  return request({
    url: '/csa/shiftResult/deleteShiftResultBatch',
    method: 'post',
    data: data
  })
}
