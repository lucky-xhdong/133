import request from '@/utils/request'

// 获取表扬列表
export function selectPraiseApplyList(params) {
  return request({
    url: '/csa/praise/selectPraiseApplyList',
    method: 'get',
    params
  })
}

// 新增表扬
export function savePraiseApply(data) {
  return request({
    url: '/csa/praise/savePraiseApply',
    method: 'post',
    data: data
  })
}

// 更新/删除表扬
export function updatePraiseApply(data) {
  return request({
    url: '/csa/praise/updatePraiseApply',
    method: 'post',
    data: data
  })
}

// 审核表扬
export function auditPraiseApply(params) {
  return request({
    url: '/csa/praise/auditPraiseApply',
    method: 'post',
    params
  })
}
