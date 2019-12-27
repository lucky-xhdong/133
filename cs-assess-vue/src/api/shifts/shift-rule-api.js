import request from '@/utils/request'

// 查询排班规则列表
export function getShiftRuleList(data) {
  return request({
    url: '/csa/shiftRule/getShiftRuleList',
    method: 'post',
    data: data
  })
}

// 新增或修改排班规则
export function saveShiftRule(data) {
  return request({
    url: '/csa/shiftRule/saveShiftRule',
    method: 'post',
    data: data
  })
}

// 根据条件查询排班规则列表不分页
export function selectShiftRuleListUnlimited(params) {
  return request({
    url: '/csa/shiftRule/selectShiftRuleListUnlimited',
    method: 'get',
    params
  })
}

