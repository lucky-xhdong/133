import request from '@/utils/request'

// 获取班次列表
export function selectShiftList(data) {
  return request({
    url: '/csa/shift/selectShiftList',
    method: 'post',
    data: data
  })
}

// 新增/修改班次
export function saveShift(data) {
  return request({
    url: '/csa/shift/saveShift',
    method: 'post',
    data: data
  })
}

// 根据条件查询班次列表不分页
export function selectShiftListUnlimited(params) {
  return request({
    url: '/csa/shift/selectShiftListUnlimited',
    method: 'get',
    params
  })
}
