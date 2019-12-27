import request from '@/utils/request'

// 获取差错列表
export function selectMistakeList(params) {
  return request({
    url: '/csa/mistake/selectMistakeList',
    method: 'get',
    params
  })
}

// 新增差错
export function saveMistake(data) {
  return request({
    url: '/csa/mistake/saveMistake',
    method: 'post',
    data: data
  })
}

// 更新/删除差错
export function updateMistake(data) {
  return request({
    url: '/csa/mistake/updateMistake',
    method: 'post',
    data: data
  })
}
