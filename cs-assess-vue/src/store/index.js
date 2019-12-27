import Vue from 'vue'
import Vuex from 'vuex'
import userStore from './modules/user-store'
import shiftStore from './modules/shift-store'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    userStore,
    shiftStore
  },
  getters
})

export default store
