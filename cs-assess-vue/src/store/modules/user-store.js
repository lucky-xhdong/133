// 用户相关store
import { setToken, removeToken } from '@/utils/auth'
import { getQueryStringArgs } from '@/utils'
import { getUserId2NameMap } from '@/api/users/user-api'

const user = {
  state: {
    token: '',
    user: {}, // 用户信息
    appliedUserList: [],
    usersUnlimited: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USER: (state, data) => {
      state.user = data
    },
    SET_AppliedUserList: (state, data) => {
      state.appliedUserList = data
    },
    SET_UsersUnlimited: (state, data) => {
      state.usersUnlimited = data
    }
  },

  actions: {
    // 前端登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_USER', {})
        removeToken()
        resolve()
      })
    },

    // 根据url参数登录
    LoginByLocation({ commit }) {
      return new Promise((resolve) => {
        const args = getQueryStringArgs()
        if (args.token) {
          setToken(args.token)
          commit('SET_TOKEN', args.token)
          resolve(true)
        }
        resolve(false)
      })
    },

    // 获取用户姓名
    GetUserId2NameMap({ commit }) {
      return new Promise((resolve, reject) => {
        getUserId2NameMap().then(res => {
          commit('SET_AppliedUserList', res.data)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default user
