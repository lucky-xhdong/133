// 用户相关store
import { selectShiftListUnlimited } from '@/api/shifts/shift-api'

const shift = {
  state: {
    shiftList: []
  },

  mutations: {
    SET_ShiftList: (state, data) => {
      state.shiftList = data
    }
  },

  actions: {
    // 获取用户姓名
    SelectShiftListUnlimited({ commit }) {
      const params = {
        delete: 0
      }
      return new Promise((resolve, reject) => {
        selectShiftListUnlimited(params).then(res => {
          commit('SET_ShiftList', res.data)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default shift
