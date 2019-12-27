import request from '@/utils/request'

export function queryUserList(params) {
  return request({
    url: '/csa/user/getUsersByCondition',
    method: 'get',
    params
  })
}

export function save(data) {
  return request({
    url: '/csa/user/saveUserInfo',
    method: 'post',
    data: data
  })
}

export function saveUsers2Org(data) {
  return request({
    url: '/csa/org2user/saveUser2OrgBatch',
    method: 'post',
    data: data
  })
}

// 获取用户名
export function getUserId2NameMap() {
  return request({
    url: '/csa/user/getUserId2NameMap',
    method: 'get'
  })
}

// 获取当前登录用户信息
export function getUser() {
  return request({
    url: '/csa/user/getUser',
    method: 'get'
  })
}

// 根据邮箱导入用户
export function importUser(params) {
  return request({
    url: '/csa/user/importUser',
    method: 'post',
    params: params
  })
}

// 移除用户关系
export function removeUser2Org(data) {
  return request({
    url: '/csa/org2user/removeUser2Org',
    method: 'post',
    data
  })
}

// 查询用户列表不分页
export function getUsersUnlimited(params) {
  return request({
    url: '/csa/user/getUsersUnlimited',
    method: 'get',
    params
  })
}

