<template>
  <el-row class="groupShiftMonthView">
    <el-row class="form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="sc-form">
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
        <el-form-item label="组织结构：" prop="orgId" v-if="userOrgRole === 'assess_admin'">
          <org-tree ref="orgTree" v-model="queryForm.orgId"></org-tree>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="loading" @click="init">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm">重置</el-button>
          <el-button type="primary" @click="showLeaveForm" icon="el-icon-edit">请假</el-button>
          <el-tooltip class="item" effect="dark" content="请在列表里选择个人班次和要调换的班次" placement="bottom" v-if="oGroupShiftView.shiftInfo.length > 0">
            <span>
              <el-button type="primary" @click="showChangeApplyForm" :disabled="!isChangedApply" icon="el-icon-edit">调班</el-button>
            </span>
          </el-tooltip>
          <el-button type="primary" @click="showChangeApplyForm" :disabled="!isChangedApply" icon="el-icon-edit" v-else>调班</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <!--小组班务月视图 start-->
    <el-row class="table-wrapper">
      <!-- table数据列表 -->
      <div class="table-wrapper__left">
        <!--渲染左侧客服姓名 start-->
        <table class="user-table">
          <thead>
          <tr>
            <th><div class="cell">客服姓名</div></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(user, index) in oGroupShiftView.userInfo" :key="index">
            <td>
              <div class="cell"><a href="javascript:;" class="txt-shift">{{user.name}}</a></div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <!--渲染左侧客服姓名 end-->
      <!--渲染右侧排班信息 start-->
      <div class="table-wrapper__right">
        <table class="shift-table">
          <thead>
          <tr>
            <th v-for="(calander, index) in oGroupShiftView.calendar" :key="index">
              <div class="cell"><span class="txt-shift">{{calander.date}}</span></div>
            </th>
          </tr>
          </thead>
          <tbody v-if="oGroupShiftView.shiftInfo.length > 0" v-loading="loading">
          <tr v-for="(row, rowIndex) in oGroupShiftView.shiftInfo" :key="rowIndex">
            <td v-for="(column, columnIndex) in row.shiftInfoList" :key="columnIndex">
              <div class="tag-wrapper" v-if="column.hasData === true">
                <el-tag v-if="column.shifts.shiftResultVO.resultStatus === 1">班</el-tag>
                <el-tag v-else-if="column.shifts.shiftResultVO.resultStatus === 2" type="warning">假</el-tag>
                <el-tag v-else-if="column.shifts.shiftResultVO.resultStatus === 3" type="danger">调</el-tag>
              </div>
              <div class="tag-wrapper" v-else>
                <el-tag type="success">休</el-tag>
              </div>
              <div v-if="column.hasData === true">
                <div class="cell" v-if="csaUserId === column.csaUserId" :class='{active:selfChecked === columnIndex}'><!--自己的班次-->
                  <a href="javascript:;" class="txt-shift" v-if="column.shifts.shiftResultVO.resultStatus === 1" @click="chooseChangedShifts(row, column, rowIndex, columnIndex)">{{column.shifts.shiftVO.shiftName}}</a>
                  <span class="txt-shift" v-if="column.shifts.shiftResultVO.resultStatus === 2">{{column.shifts.shiftResultVO._leaveType}}</span>
                  <a href="javascript:;" class="txt-shift" v-if="column.shifts.shiftResultVO.resultStatus === 3" @click="chooseChangedShifts(row, column, rowIndex, columnIndex)">{{column.shifts.shiftVO.shiftName}}</a>
                </div>
                <div class="cell" v-else :class='{active:rowChecked === rowIndex && columnChecked === columnIndex}'><!--别人的班次-->
                  <a href="javascript:;" class="txt-shift" v-if="column.shifts.shiftResultVO.resultStatus === 1" @click="chooseChangedShifts(row, column, rowIndex, columnIndex)">{{column.shifts.shiftVO.shiftName}}</a>
                  <span class="txt-shift" v-if="column.shifts.shiftResultVO.resultStatus === 2">{{column.shifts.shiftResultVO._leaveType}}</span>
                  <a href="javascript:;" class="txt-shift" v-if="column.shifts.shiftResultVO.resultStatus === 3" @click="chooseChangedShifts(row, column, rowIndex, columnIndex)">{{column.shifts.shiftVO.shiftName}}</a>
                </div>
              </div>
              <div v-else><div class="cell"></div></div>
            </td>
          </tr>
          </tbody>
          <tbody v-else>
          <tr>
            <td :colspan=oGroupShiftView.calendar.length><p class="no-data">暂无数据</p></td>
          </tr>
          </tbody>
        </table>
      </div>
      <!--渲染右侧排班信息 end-->
      <!-- END table数据列表 -->
    </el-row>
    <el-alert class="el-alert-tip" :title="alertTipTitle" :type="alertTipType" v-show="showAlertTip"></el-alert>
    <!--小组班务月视图 end-->
    <!-- 请假 start-->
    <leave-dialog ref="leaveDialog"></leave-dialog>
    <!-- 请假 end-->
    <!-- 调班 start-->
    <el-dialog title='调班' class="leave-dialog" :visible.sync="dialogChangeApplyFormVisible" width="25%"
               :close-on-click-modal="false">
      <el-form :model="changeApplyForm" ref="changeApplyForm">
        <el-form-item label="申请人信息" :label-width="formLabelWidth">
          <el-input v-model="changeApplyForm.userName" placeholder="申请人信息" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="申请班次" :label-width="formLabelWidth">
          <el-input v-model="changeApplyForm.shiftName" placeholder="申请班次" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="申请日期" :label-width="formLabelWidth">
          <el-input v-model="changeApplyForm.shiftDate" placeholder="申请日期" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="调班人信息" prop="leaveDate" :label-width="formLabelWidth">
          <el-input v-model="changeApplyForm.appliedUserName" placeholder="调班人信息" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="调班班次" :label-width="formLabelWidth">
          <el-input v-model="changeApplyForm.appliedShiftName" placeholder="调班班次" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="调班日期" :label-width="formLabelWidth">
          <el-input v-model="changeApplyForm.appliedShiftDate" placeholder="调班日期" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="调班描述" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="changeApplyForm.changeApplyDesc" placeholder="请输入调班描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelChangeApplyForm('changeApplyForm')">取 消</el-button>
        <el-button type="primary" @click="submitChangeApplyForm('changeApplyForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 调班 end-->
  </el-row>
</template>
<script>
  import orgTree from '../../common/orgTree'
  import leaveDialog from '../../common/shifts/leaveDialog'
  import { getUser } from '@/api/users/user-api'
  import { formatDateByTimestamp } from '@/utils'
  import { getGroupMonthShiftView } from '@/api/shifts/shift-result-api'
  import { saveChangeApply } from '@/api/shifts/shift-change-api'
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
    components: { orgTree, leaveDialog },
    data() {
      return {
        queryForm: {
          shiftDate: '', // 某月第一天（必填）
          csaUserId: '', // 用户id（必填）
          orgId: '' // 组织id（非必填）
        }, // 查询列表表单
        loading: false,
        csaUserId: '', //
        pageNumber: 1, // 默认查询第1页
        formLabelWidth: '120px', // 表单标签宽度
        dialogLeaveFormVisible: false,
        dialogChangeApplyFormVisible: false,
        shiftLimit: 2, // 默认限制两个班次
        showAlertTip: false,
        alertTipTitle: '',
        alertTipType: '',
        userOrgRole: '',
        changeApplyForm: {
          userName: '',
          shiftDate: '',
          shiftName: '', // 主动申请人班次
          shiftResultId: '',
          appliedUserName: '',
          appliedShiftDate: '',
          appliedShiftName: '', // 被申请人班次
          appliedShiftResultId: '',
          changeApplyDesc: ''
        },
        leaveTypeList: [
          { key: 1, label: '年假' },
          { key: 2, label: '事假' },
          { key: 3, label: '产假' },
          { key: 4, label: '婚假' },
          { key: 5, label: '丧假' },
          { key: 6, label: '陪产假' },
          { key: 7, label: '产检假' }
        ],
        dialogTitle: '',
        oGroupShiftView: {
          calendar: [],
          userInfo: [],
          shiftInfo: [],
          aSelectedGrid: []
        },
        selfChecked: -1,
        rowChecked: -1,
        columnChecked: -1,
        fileList: [],
        isChangedApply: false // 是否可调班，默认不可点
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

      // 获取小组班务月视图
      initCalendar() {
        // 获取排班日期
        if (this.queryForm.shiftDate === '') this.queryForm.shiftDate = new Date()
        const now = new Date(this.queryForm.shiftDate)
        if (this.queryForm.shiftDate.toString() === new Date().toString()) {
          this.queryForm.shiftDate = formatDate(now.getFullYear(), now.getMonth() + 1, 1) // 默认传当前月份第一天
        } else {
          this.queryForm.shiftDate = formatDateByTimestamp(new Date(this.queryForm.shiftDate), 'yyyy-MM-dd')
        }
        // 获取组织id
        if (this.$refs.orgTree) {
          const aOrgTree = this.$refs.orgTree.selectedOptions
          this.queryForm.orgId = ''
          if (aOrgTree && aOrgTree.length > 0) {
            this.queryForm.orgId = aOrgTree[aOrgTree.length - 1]
          }
        }
        // 渲染日历
        const fullYear = new Date(this.queryForm.shiftDate).getFullYear()
        const month = (new Date(this.queryForm.shiftDate).getMonth() + 1).toString().padStart(2, '0')
        const lastDayOfMonth = new Date(fullYear, month, 0).getDate()
        this.oGroupShiftView.calendar = []
        // 循环日历表头
        for (var i = 1; i <= lastDayOfMonth; i++) {
          i = i.toString().padStart(2, '0')
          this.oGroupShiftView.calendar.push({
            label: fullYear + '-' + month + '-' + i,
            date: month + '月' + i + '日'
          })
        }
        // 调用后端接口获取视图信息
        this.getGroupMonthShiftInfo()
      },

      // 获取小组月视图信息
      getGroupMonthShiftInfo() {
        const _this = this
        // 收集接口入参
        const params = {
          shiftDate: this.queryForm.shiftDate,
          orgId: this.queryForm.orgId
        }
        if (this.queryForm.csaUserId === '') {
          params.csaUserId = this.csaUserId
        } else {
          params.csaUserId = this.queryForm.csaUserId
        }
        this.loading = true

        // 发送请求
        return new Promise((resolve, reject) => {
          getGroupMonthShiftView(params).then(res => {
            _this.loading = false
            if (res.data.length === 0) {
              _this.oGroupShiftView.userInfo = []
              _this.oGroupShiftView.shiftInfo = []
            }
            const aUserName = []
            // 循环后端接口
            for (let i = 0; i < res.data.length; i++) {
              _this.oGroupShiftView.userInfo[i] = [] // 存入用户信息
              _this.oGroupShiftView.shiftInfo[i] = {} // 存入班次信息
              _this.oGroupShiftView.shiftInfo[i].isChecked = -1 // 存入班次信息
              _this.oGroupShiftView.shiftInfo[i].shiftInfoList = [] // 存入班次信息
              if (res.data[i]) {
                for (const k in res.data[i]) {
                  aUserName.push({
                    name: res.data[i][k].shiftResultVO.userName
                  })
                }
                for (let j = 0; j < _this.oGroupShiftView.calendar.length; j++) {
                  // 获取每一天的数据
                  const shiftInfo = res.data[i][_this.oGroupShiftView.calendar[j].label]
                  // 如果有数据
                  if (shiftInfo) {
                    // 转换请假类型
                    const leaveType = shiftInfo.shiftResultVO.leaveType
                    if (leaveType) {
                      shiftInfo.shiftResultVO._leaveType = _this.leaveTypeList.find(cur => {
                        return cur.key === leaveType
                      }).label
                    }
                    _this.oGroupShiftView.shiftInfo[i].shiftInfoList.push({
                      user: shiftInfo.shiftResultVO.userName,
                      csaUserId: shiftInfo.shiftResultVO.csaUserId,
                      hasData: true,
                      row: i,
                      column: j,
                      checked: false,
                      shifts: shiftInfo
                    })
                  } else {
                    _this.oGroupShiftView.shiftInfo[i].shiftInfoList.push({
                      user: '',
                      csaUserId: '',
                      hasData: false,
                      row: i,
                      column: j,
                      checked: false,
                      shifts: {}
                    })
                  }
                }
              }
            }
            // 将名字重复部分去掉
            const hash = {}
            _this.oGroupShiftView.userInfo = aUserName.reduce((item, next) => {
              hash[next.name] ? '' : hash[next.name] = true && item.push(next)
              return item
            }, [])
            resolve(res)
          }).catch(error => {
            _this.loading = false
            reject(error)
          })
        })
      },

      /**
       * 选择要调换的班次
       * @row 班次所在的行对象
       * @column 班次所在的列对象
       * @rowIndex 班次所在的行索引
       * @columnIndex 班次所在的列索引
       */
      chooseChangedShifts(row, column, rowIndex, columnIndex) {
        // 如果id与相等表示是自己的班次
        if (this.csaUserId === column.csaUserId) {
          if (columnIndex === this.selfChecked) {
            this.selfChecked = -1
            this.changeApplyForm.userName = ''
            this.changeApplyForm.shiftResultId = ''
            this.changeApplyForm.shiftDate = ''
            this.changeApplyForm.shiftName = ''
          } else {
            this.selfChecked = columnIndex
            this.changeApplyForm.userName = column.shifts.shiftResultVO.userName // 申请人姓名
            this.changeApplyForm.shiftResultId = column.shifts.shiftResultVO.id // 记住班次id
            this.changeApplyForm.shiftDate = column.shifts.shiftResultVO.shiftDate // 记住申请日期
            this.changeApplyForm.shiftName = column.shifts.shiftVO.shiftName // 记住申请人班次
          }
        } else {
          if (columnIndex === this.columnChecked && rowIndex === this.rowChecked) {
            this.columnChecked = -1
            this.rowChecked = -1
            this.changeApplyForm.appliedUserName = ''
            this.changeApplyForm.appliedShiftResultId = ''
            this.changeApplyForm.appliedShiftDate = ''
            this.changeApplyForm.appliedShiftName = ''
            this.changeApplyForm.appliedCsaUserId = ''
          } else {
            this.columnChecked = columnIndex
            this.rowChecked = rowIndex
            this.changeApplyForm.appliedUserName = column.shifts.shiftResultVO.userName // 记住班次id
            this.changeApplyForm.appliedShiftResultId = column.shifts.shiftResultVO.id // 记住班次id
            this.changeApplyForm.appliedShiftDate = column.shifts.shiftResultVO.shiftDate // 记住被申请人日期
            this.changeApplyForm.appliedShiftName = column.shifts.shiftVO.shiftName // 记住被申请人班次
            this.changeApplyForm.appliedCsaUserId = column.shifts.shiftResultVO.csaUserId // 记住被申请人id
          }
        }
        // 如果申请人和被申请人id都已取到，显示提示语和调班按钮
        if (this.changeApplyForm.shiftResultId && this.changeApplyForm.appliedShiftResultId) {
          this.showAlertTip = true // 显示提示语
          this.isChangedApply = true// 显示调班按钮
          this.alertTipTitle = '您已选择两个可调换班次，可申请调班！'
          this.alertTipType = 'success'
        } else {
          this.showAlertTip = false // 隐藏提示语
          this.isChangedApply = false // 禁用调班按钮
          this.alertTipTitle = ''
          this.alertTipType = ''
        }
      },

      /**
       * 显示新增请假弹窗
       */
      showLeaveForm() {
        this.$refs.leaveDialog.dialogLeaveFormVisible = true
      },

      // 展示调班弹窗
      showChangeApplyForm() {
        this.dialogChangeApplyFormVisible = true
      },

      // 提交调班表单
      submitChangeApplyForm() {
        const _this = this
        const params = {}
        params.shiftResultId = this.changeApplyForm.shiftResultId
        params.appliedShiftResultId = this.changeApplyForm.appliedShiftResultId
        params.changeApplyDesc = this.changeApplyForm.changeApplyDesc
        params.appliedCsaUserId = this.changeApplyForm.appliedCsaUserId
        return new Promise((resolve, reject) => {
          saveChangeApply(params).then(res => {
            _this.dialogChangeApplyFormVisible = false
            _this.$message({
              message: res.rspMsg,
              type: res.rspCode === _this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
              showClose: true
            })
            const date = +new Date()
            location.href = '#/shiftChange?date=' + date
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },

      // 取消调班
      cancelChangeApplyForm() {
        this.dialogChangeApplyFormVisible = false // 关闭申请调班弹窗
        this.isChangedApply = false // 调班按钮置灰不可点
        this.showAlertTip = false // 调班提示语隐藏
        this.oGroupShiftView.aSelectedGrid = [] // 将存放已选择的班次的数组清空，已便重新选择
        this.selfChecked = -1
        this.rowChecked = -1
        this.columnChecked = -1
        this.changeApplyForm = {
          shiftResultId: '',
          appliedShiftResultId: '',
          shiftName: '', // 主动申请人班次
          appliedShiftName: '', // 被申请人班次
          changeApplyDesc: ''
        }
      },

      /**
       * 重置查询输入项
       */
      resetQueryForm() {
        this.queryForm = {
          shiftDate: '', // 某月第一天（必填）
          csaUserId: '', // 用户id（必填）
          orgId: '' // 组织id（非必填）
        }
        this.init()
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/shifts/shiftResult";
</style>
