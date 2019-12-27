import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang cn

import '@/styles/common/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

import '@/icons' // icon
import '@/permission' // permission control
import './mock' // simulation data

import * as filters from './filters' // global filters
import _const from './views/common/const' // 常量

Vue.use(ElementUI, {
  locale,
  size: 'medium' // set element-ui default size
})
Vue.prototype._const = _const // 常量挂载到Vue实例

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
