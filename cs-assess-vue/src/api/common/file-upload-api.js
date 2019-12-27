import request from '@/utils/request'

// 上传文件到文件服务器
export function upload(data) {
  return request({
    url: '/csa/fileUpload/upload',
    method: 'post',
    data: data
  })
}
