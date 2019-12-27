import request from '@/utils/request'

export function selectList(params) {
  return request({
    url: '/csa/typingSatisfaction/selectList',
    method: 'get',
    params
  })
}

export function save(data) {
  return request({
    url: '/csa/typingSatisfaction/save',
    method: 'post',
    data: data
  })
}

export function update(data) {
  return request({
    url: '/csa/typingSatisfaction/update',
    method: 'post',
    data: data
  })
}

// 上传excel模板文件
export function uploadTypingSpeedExcel(data) {
  return request({
    url: '/csa/excelUpload/uploadTypingSpeedExcel',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}
