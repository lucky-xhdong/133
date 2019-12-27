import request from '@/utils/request'

// 获取培训列表
export function selectTrainingRecordList(params) {
  return request({
    url: '/csa/trainingRecord/selectTrainingRecordList',
    method: 'get',
    params
  })
}

// 新增培训
export function saveTrainingRecord(data) {
  return request({
    url: '/csa/trainingRecord/saveTrainingRecord',
    method: 'post',
    data: data
  })
}

// 更新/删除培训
export function updateTrainingRecord(data) {
  return request({
    url: '/csa/trainingRecord/updateTrainingRecord',
    method: 'post',
    data: data
  })
}

// 审核培训
export function auditTrainingRecord(params) {
  return request({
    url: '/csa/trainingRecord/auditTrainingRecord',
    method: 'post',
    params
  })
}
