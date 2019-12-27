import request from '@/utils/request'

// 根据所选月份下载排班模版
export function downloadShiftResultTemplate(params) {
  return request({
    url: '/csaExcel/excelDownload/downloadShiftResultTemplate',
    method: 'get',
    params
  })
}

// 排班结果Excel上传
export function uploadShiftResultExcel(data) {
  return request({
    url: '/csa/excelUpload/uploadShiftResultExcel',
    method: 'post',
    data: data
  })
}
