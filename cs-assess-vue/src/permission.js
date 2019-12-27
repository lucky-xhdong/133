import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css' // Progress 进度条样式
import { MessageBox } from 'element-ui'
const whiteList = ['/login', '/auto-login', '/401', '/404', '/user', '/data', '/praise', '/mistake', '/trainingRecord',
  '/userRelation', '/typing', '/satisfaction', '/callTest', '/assessModel', '/shift', '/result', '/shiftRule', '/shiftLeave',
  '/shiftChange', '/allShiftMonthView', '/personShiftMonthView', '/groupShiftMonthView', '/attendanceDayView',
  '/allShiftDayView', '/leaveDialog', '/test'] // 不重定向白名单
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (whiteList.indexOf(to.path) !== -1) {
    next()
  } else {
    store.dispatch('LoginByLocation').then((result) => {
      if (result) {
        next()
      } else {
        MessageBox.alert('访问失败，请从客服控制台 - 点击菜单进入', '操作提示', {
          confirmButtonText: '确定',
          type: 'warning',
          callback: action => {
            let top = window
            if (window.top != null) {
              top = window.top
            }
            top.location.href = process.env.LIKN_CUSTCONSOLE_INDEX
          }
        })
        NProgress.done()
      }
    }).catch(() => {
      NProgress.done()
    })
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
