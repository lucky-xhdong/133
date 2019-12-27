<template>
  <el-row class="personShiftMonthView">
    <el-row class="form-wrapper">
      <!-- form表单 查询条件 start -->
         <!--<el-form :model="addForm" ref="addForm" :rules="rules">-->
      <el-form :inline="true" :model="queryForm" ref="queryForm" :rules="rules" class="sc-form">
        <el-form-item label="排班月份：" prop="shiftDate">
          <el-date-picker
            v-model="queryForm.shiftDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="客服名称：" prop="csaUserId" v-if="userOrgRole === 'assess_admin'">
          <el-select v-model="queryForm.csaUserId" filterable placeholder="请选择客服" clearable>
            <el-option
              v-for="(item, index) in $store.state.userStore.appliedUserList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="loading" @click="initCalendar">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <!--班务月视图 start-->
    <div class="calendar-wrapper" id="calendar">
      <!-- 年份 月份 -->
      <div class="cw-header">
        <!--<a href="javascript:;" class="arrow arrow-left" @click="pickPrev(currentYear,currentMonth)"><</a>-->
        <span class="txt-date">{{ currentYear }}年{{ currentMonth }}月</span>
        <!--<a href="javascript:;" class="arrow arrow-right" @click="pickNext(currentYear,currentMonth)">></a>-->
      </div>
      <!-- 星期 -->
      <div class="weekday">
        <ul>
          <li><span class="txt">星期一</span></li>
          <li><span class="txt">星期二</span></li>
          <li><span class="txt">星期三</span></li>
          <li><span class="txt">星期四</span></li>
          <li><span class="txt">星期五</span></li>
          <li><span class="txt">星期六</span></li>
          <li><span class="txt">星期日</span></li>
        </ul>
      </div>
      <!-- 日期 -->
      <div class="month" v-loading="loading">
        <ul>
          <!-- v-for循环 每一次循环用<li>标签创建一天 -->
          <li v-for="(day, index) in days" :key="index">
            <!--如果不是本月  改变类名加灰色 start-->
            <div v-if="day.day.getMonth()+1 != currentMonth" class="other-month">
              <p class="txt-day">{{ day.day.getDate() }}</p>
            </div>
            <!--如果不是本月  改变类名加灰色 end-->
            <!--如果是本月  还需要判断是不是这一天 start-->
            <div v-else class="current-month">
              <!--今天 同年同月同日 start-->
              <div class="day-wrapper active" v-if="
                  day.day.getFullYear() == new Date().getFullYear() &&
                  day.day.getMonth() == new Date().getMonth() &&
                  day.day.getDate() == new Date().getDate()">
                <!-- 如果有日期表示正常出勤 start-->
                <div class="day-wrapper__inner" v-if="day.date && day.date !== ''">
                  <!-- 如果resultStatus为1 表示正常 start-->
                  <div class="day-normal" v-if="day.resultStatus === 1">
                    <el-tag class="el-tag__state">班</el-tag>
                    <p class="txt-day">{{ day.day.getDate() }}</p>
                    <p class="txt-shift-name">{{day.shiftName}}</p>
                    <p class="txt-start-time" v-if="day.fpLoginTime">上班：{{day.fpLoginTime}}</p>
                    <p class="txt-login-time" v-if="day.loginTime">签入：{{day.loginTime}}</p>
                    <p class="txt-logout-time" v-if="day.logoutTime">签出：{{day.logoutTime}}</p>
                    <p class="txt-end-time" v-if="day.fpLogoutTime">下班：{{day.fpLogoutTime}}</p>
                  </div>
                  <!-- 如果resultStatus为1 表示正常 end-->
                  <!-- 如果resultStatus为2 表示已请假显示请假类型 start-->
                  <div class="day-vacation" v-else-if="day.resultStatus === 2">
                    <p class="txt-day">{{ day.day.getDate() }}</p>
                    <el-tag type="warning" class="el-tag__state">假</el-tag>
                    <p class="txt-shift-name">{{day._leaveType}}</p>
                  </div>
                  <!-- 如果resultStatus为2 表示已请假显示请假类型 end-->
                  <!-- 如果resultStatus为3 表示已调班 显示调过之后的班次信息 start-->
                  <div class="day-switch" v-else-if="day.resultStatus === 3">
                    <el-tag type="danger" class="el-tag__state">调</el-tag>
                    <p class="txt-day">{{ day.day.getDate() }}</p>
                    <p class="txt-shift-name">{{day.shiftName}}</p>
                    <p class="txt-start-time" v-if="day.fpLoginTime">上班：{{day.fpLoginTime}}</p>
                    <p class="txt-login-time" v-if="day.loginTime">签入：{{day.loginTime}}</p>
                    <p class="txt-logout-time" v-if="day.logoutTime">签出：{{day.logoutTime}}</p>
                    <p class="txt-end-time" v-if="day.fpLogoutTime">下班：{{day.fpLogoutTime}}</p>
                  </div>
                  <!-- 如果resultStatus为3 表示已调班 显示调过之后的班次信息 end-->
                </div>
                <!-- 如果有日期表示正常出勤 end-->
                <!-- 没有日期表示休假 start-->
                <div class="day-wrapper__inner" v-else>
                  <div class="day-normal">
                    <p class="txt-day active">{{ day.day.getDate() }}</p>
                    <el-tag type="success" class="el-tag__state">休</el-tag>
                  </div>
                </div>
                <!-- 没有日期表示休假 end-->
              </div>
              <!--今天 同年同月同日 end-->
              <div class="day-wrapper" v-else>
                <!-- 如果有日期表示正常出勤 start-->
                <div class="day-wrapper__inner" v-if="day.date && day.date !== ''">
                  <!-- 如果resultStatus为1 表示正常 start-->
                  <div class="day-normal" v-if="day.resultStatus === 1">
                    <el-tag class="el-tag__state">班</el-tag>
                    <p class="txt-day">{{ day.day.getDate() }}</p>
                    <p class="txt-shift-name">{{day.shiftName}}</p>
                    <p class="txt-start-time" v-if="day.fpLoginTime">上班：{{day.fpLoginTime}}</p>
                    <p class="txt-login-time" v-if="day.loginTime">签入：{{day.loginTime}}</p>
                    <p class="txt-logout-time" v-if="day.logoutTime">签出：{{day.logoutTime}}</p>
                    <p class="txt-end-time" v-if="day.fpLogoutTime">下班：{{day.fpLogoutTime}}</p>
                  </div>
                  <!-- 如果resultStatus为1 表示正常 end-->
                  <!-- 如果resultStatus为2 表示已请假显示请假类型 start-->
                  <div class="day-vacation" v-else-if="day.resultStatus === 2">
                    <p class="txt-day">{{ day.day.getDate() }}</p>
                    <el-tag type="warning" class="el-tag__state">假</el-tag>
                    <p class="txt-shift-name">{{day._leaveType}}</p>
                  </div>
                  <!-- 如果resultStatus为2 表示已请假显示请假类型 end-->
                  <!-- 如果resultStatus为3 表示已调班 显示调过之后的班次信息 start-->
                  <div class="day-switch" v-else-if="day.resultStatus === 3">
                    <el-tag type="danger" class="el-tag__state">调</el-tag>
                    <p class="txt-day">{{ day.day.getDate() }}</p>
                    <p class="txt-shift-name">{{day.shiftName}}</p>
                    <p class="txt-start-time" v-if="day.fpLoginTime">上班：{{day.fpLoginTime}}</p>
                    <p class="txt-login-time" v-if="day.loginTime">签入：{{day.loginTime}}</p>
                    <p class="txt-logout-time" v-if="day.logoutTime">签出：{{day.logoutTime}}</p>
                    <p class="txt-end-time" v-if="day.fpLogoutTime">下班：{{day.fpLogoutTime}}</p>
                  </div>
                  <!-- 如果resultStatus为3 表示已调班 显示调过之后的班次信息 end-->
                </div>
                <div class="day-wrapper__inner" v-else>
                  <div class="day-normal">
                    <p class="txt-day">{{ day.day.getDate() }}</p>
                    <el-tag type="success" class="el-tag__state">休</el-tag>
                  </div>
                </div>
                <!-- 如果有日期表示正常出勤 end-->
              </div>
            </div>
            <!--如果是本月  还需要判断是不是这一天 end-->
          </li>
        </ul>
      </div>
    </div>
    <!--班务月视图 end-->
  </el-row>
</template>
<script>
  import orgTree from '../../common/orgTree'
  import { formatDateByTimestamp } from '@/utils'
  import { getUser } from '@/api/users/user-api'
  import { getPersonalMonthShiftView } from '@/api/shifts/shift-result-api'
  // 格式化日期 返回类似 2016-01-02 格式的字符串
  const formatDate = function(year, month, day) {
    const y = year
    let m = month
    if (m < 10) m = '0' + m
    let d = day
    if (d < 10) d = '0' + d
    return y + '-' + m + '-' + d
  }
  export default {
    components: { orgTree },
    data() {
      return {
        queryForm: {
          shiftDate: '', // 某一天（必填）
          csaUserId: '' // 用户id（必填）
        }, // 查询列表表单
        loading: false,
        csaUserId: '', // 默认取当前登录用户的id
        userOrgRole: '', // 用户角色
        dialogAddFormVisible: false, // 是否显示新增班次弹窗
        dialogDeleteVisible: false, // 是否显示删除弹窗
        errorTip: '',
        showErrorTip: false,
        tableData: [], // table数据列表
        formLabelWidth: '120px', // 表单标签宽度
        regularForm: {
          csaOrgId: '', // 组织结构
          shiftRuleId: '', // 排班规则id
          userList: [], //
          shiftRuleList: [] //
        },
        ordinaryForm: {
          csaOrgId: '',
          scheduleDate: '',
          userList: []
        },
        rules: {
        },
        currentDay: 1,
        currentMonth: 1,
        currentYear: 1970,
        currentWeek: 0,
        allDaysOfCurrentMonth: [], // 当前月份的所有日期
        days: [],
        leaveTypeList: [
          { key: 1, label: '年假' },
          { key: 2, label: '事假' },
          { key: 3, label: '产假' },
          { key: 4, label: '婚假' },
          { key: 5, label: '丧假' },
          { key: 6, label: '陪产假' },
          { key: 7, label: '产检假' }
        ]
      }
    },
    created() { // 在vue初始化时调用
      this.init()
    },
    methods: {
      async init() {
        this.csaUserId = (await getUser()).data.id || 244
        this.userOrgRole = (await getUser()).data.userOrgRole
        this.$store.dispatch('GetUserId2NameMap')
        this.initCalendar()
      },
      /**
       * 提交普通排班表单
       * @curDate:当前日期
       */
      initCalendar() {
        // 日历渲染
        let date = ''
        if (this.queryForm.shiftDate === '') this.queryForm.shiftDate = new Date()
        const now = new Date(this.queryForm.shiftDate)
        date = new Date(formatDate(now.getFullYear(), now.getMonth() + 1, 1))
        this.currentDay = date.getDate()
        this.currentYear = date.getFullYear()
        this.currentMonth = date.getMonth() + 1
        this.currentWeek = date.getDay() // 1...6,0
        if (this.currentWeek === 0) {
          this.currentWeek = 7
        }
        const sDate = formatDate(this.currentYear, this.currentMonth, this.currentDay)
        this.days.length = 0
        // 今天是周日，放在第一行第7个位置，前面6个
        // 初始化本周
        for (let i = this.currentWeek - 1; i >= 0; i--) {
          const d = new Date(sDate)
          d.setDate(d.getDate() - i)

          const oDay = {}
          oDay.day = d

          this.days.push(oDay) // 将日期放入data 中的days数组 供页面渲染使用
        }
        // 初始化其他周
        for (let i = 1; i <= 35 - this.currentWeek; i++) {
          const d = new Date(sDate)
          d.setDate(d.getDate() + i)

          const oDay = {}
          oDay.day = d

          this.days.push(oDay)
        }

        // 调用后端接口获取排班数据
        this.getPersonalMonthShiftInfo(now)
      },

      // 获取个人月视图信息
      getPersonalMonthShiftInfo(now) {
        this.loading = true
        // 如果是当前月取第一天
        if (this.queryForm.shiftDate.toString() === new Date().toString()) {
          this.queryForm.shiftDate = formatDate(now.getFullYear(), now.getMonth() + 1, 1)
        } else {
          this.queryForm.shiftDate = formatDateByTimestamp(new Date(this.queryForm.shiftDate))
        }
        const params = {
          shiftDate: this.queryForm.shiftDate
        }
        if (!this.queryForm.csaUserId || this.queryForm.csaUserId === '') {
          params.csaUserId = this.csaUserId
        } else {
          params.csaUserId = this.queryForm.csaUserId
        }
        const _this = this
        return new Promise((resolve, reject) => {
          getPersonalMonthShiftView(params).then(res => {
            _this.loading = false
            for (let i = 0; i < _this.days.length; i++) {
              for (const k in res.data) {
                if (formatDateByTimestamp(new Date(_this.days[i].day)) === k) {
                  _this.days[i].date = k
                  // 班次信息
                  if (res.data[k].shiftVO) {
                    _this.days[i].shiftName = res.data[k].shiftVO.shiftName
                  }
                  // 排班结果信息
                  if (res.data[k].shiftResultVO) {
                    _this.days[i].resultStatus = res.data[k].shiftResultVO.resultStatus // 排班状态：1正常，2已请假，3已调班
                    const leaveType = res.data[k].shiftResultVO.leaveType // 请假类型：1.事假,2病假,3婚假,4.丧假,5.产假,6.年假,7其他，当排班状态为已请假时有值
                    if (leaveType) {
                      _this.days[i]._leaveType = _this.leaveTypeList.find(cur => {
                        return cur.value === _this.days[i].leaveType
                      }).label
                    }
                  }
                  // 打卡记录信息
                  if (res.data[k].loginLog) {
                    const fpLoginTime = res.data[k].loginLog.fpLoginTime // 上班打卡时间
                    const fpLogoutTime = res.data[k].loginLog.fpLogoutTime // 下班打卡时间
                    const loginTime = res.data[k].loginLog.loginTime // 签入时间
                    const logoutTime = res.data[k].loginLog.logoutTime // 签出时间
                    if (fpLoginTime) {
                      _this.days[i].fpLoginTime = formatDateByTimestamp(fpLoginTime, 'hh:mm:ss')
                    }
                    if (fpLogoutTime) {
                      _this.days[i].fpLogoutTime = formatDateByTimestamp(fpLogoutTime, 'hh:mm:ss')
                    }
                    if (loginTime) {
                      _this.days[i].loginTime = formatDateByTimestamp(loginTime, 'hh:mm:ss')
                    }
                    if (logoutTime) {
                      _this.days[i].logoutTime = formatDateByTimestamp(logoutTime, 'hh:mm:ss')
                    }
                  }
                }
              }
            }
            resolve(res)
          }).catch(error => {
            _this.loading = false
            reject(error)
          })
        })
      },

      /**
       * 重置查询输入项
       */
      resetQueryForm() {
        this.queryForm = {
          shiftDate: '', // 某一天（必填）
          csaUserId: '' // 用户id（必填）
        }
        this.initCalendar()
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/shifts/shiftResult";
</style>
