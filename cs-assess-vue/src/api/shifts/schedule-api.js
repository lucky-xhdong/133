import request from '@/utils/request'

// 根据预设规则对组或者人排班
export function schedulingWithRegular(data) {
  return request({
    url: '/csa/schedule/schedulingWithRegular',
    method: 'post',
    data: data
  })
}

// 对一个或多个人设置当月每一天的班次
export function schedulingWithOrdinary(data) {
  return request({
    url: '/csa/schedule/schedulingWithOrdinary',
    method: 'post',
    data: data
  })
}

