import request from '@/utils/request'

// 根据所选月份下载排班模版
export function selectAttendanceList(params) {
  return request({
    url: '/csa/attendance/selectAttendanceList',
    method: 'get',
    params
  })
}
