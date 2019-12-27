import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
 **/
export const constantRouterMap = [
  { path: '/user', component: () => import('@/views/user/userManage'), hidden: true },
  { path: '/org', component: () => import('@/views/org/orgManage'), hidden: true },
  { path: '/data', component: () => import('@/views/kpi/data/originalData'), hidden: true },
  { path: '/result', component: () => import('@/views/kpi/data/scoreResult'), hidden: true },
  { path: '/praise', component: () => import('@/views/kpi/praise/praise'), hidden: true },
  { path: '/mistake', component: () => import('@/views/kpi/mistake/mistake'), hidden: true },
  { path: '/trainingRecord', component: () => import('@/views/kpi/trainingRecord/trainingRecord'), hidden: true },
  { path: '/userRelation', component: () => import('@/views/kpi/userRelation/userRelation'), hidden: true },
  { path: '/typing', component: () => import('@/views/kpi/typing/typing'), hidden: true },
  { path: '/satisfaction', component: () => import('@/views/kpi/satisfaction/satisfaction'), hidden: true },
  { path: '/callTest', component: () => import('@/views/kpi/callTest/callTest'), hidden: true },
  { path: '/assessModel', component: () => import('@/views/kpi/assessModel/assessModel'), hidden: true },
  { path: '/shift', component: () => import('@/views/shifts/shift/shift'), hidden: true },
  { path: '/shiftRule', component: () => import('@/views/shifts/shiftRule/shiftRule'), hidden: true },
  { path: '/shiftLeave', component: () => import('@/views/shifts/shiftLeave/shiftLeave'), hidden: true },
  { path: '/shiftChange', component: () => import('@/views/shifts/shiftChange/shiftChange'), hidden: true },
  { path: '/allShiftMonthView', component: () => import('@/views/shifts/shiftResult/allShiftMonthView'), hidden: true },
  { path: '/personShiftMonthView', component: () => import('@/views/shifts/shiftResult/personShiftMonthView'), hidden: true },
  { path: '/groupShiftMonthView', component: () => import('@/views/shifts/shiftResult/groupShiftMonthView'), hidden: true },
  { path: '/allShiftDayView', component: () => import('@/views/shifts/shiftResult/allShiftDayView'), hidden: true },
  { path: '/attendanceDayView', component: () => import('@/views/shifts/shiftResult/attendanceDayView'), hidden: true },
  { path: '/leaveDialog', component: () => import('@/views/common/shifts/leaveDialog'), hidden: true },
  { path: '/test', component: () => import('@/views/test'), hidden: true },
  // 静态页
  { path: '/401', component: () => import('@/views/error/401'), hidden: true },
  { path: '/404', component: () => import('@/views/error/404'), hidden: true },

  // 通配页
  { path: '/', component: Layout, hidden: true },
  { path: '*', redirect: '/404', hidden: true }

]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

