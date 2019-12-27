// 数据字典

// 操作类型
export const operateType = {
  update: '编辑',
  create: '添加'
}

export const UNITE_STATUS_MAP = {
  0: '有效',
  1: '无效'
}

export const USER_ORG_ROLES = [{
  key: 'member',
  value: '普通成员'
}, {
  key: 'group_leader',
  value: '组长'
}, {
  key: 'assess_admin',
  value: '管理员'
}]

export const USER_LEVELS = [
  { value: 0, label: '新员工' }, // 0：新员工，1：客服专员，2：高级客服，3：资深客服,4：VIP客服，5：普通运营,6: 高级运营,7: 资深运营,8:管理一级, 9:管理二级 10：管理三级
  { value: 1, label: '客服专员' },
  { value: 2, label: '高级客服' },
  { value: 3, label: '资深客服' },
  { value: 4, label: 'VIP客服' },
  { value: 5, label: '普通运营' },
  { value: 6, label: '高级运营' },
  { value: 7, label: '资深运营' },
  { value: 8, label: '管理一级' },
  { value: 9, label: '管理二级' },
  { value: 10, label: '管理三级' }
]

export const USER_ORG_ROLE_MAP = {
  member: '普通成员',
  group_leader: '组长',
  assess_admin: '管理员'
}
