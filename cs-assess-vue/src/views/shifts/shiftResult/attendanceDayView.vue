<template>
  <el-row class="workerStateDayView">
    <el-row class="form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="sc-form">
        <el-form-item label="上班日期：" prop="attendanceDate">
          <el-date-picker
            v-model="queryForm.attendanceDate"
            type="date"
            placeholder="请选择上班日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="组织结构：" prop="csaOrgId">
          <org-tree ref="orgTree" v-model="queryForm.csaOrgId"></org-tree>
        </el-form-item>
        <el-form-item label="客服名称：" prop="csaUserId">
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
          <el-button type="primary" icon="el-icon-search" :loading="loading" @click="selectAttendanceInfo(pageNumber)">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <!--班务日视图 start-->
    <el-row class="table-wrapper">
      <!-- table数据列表 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        style="width: 100%">
        <el-table-column v-for="(item, index) in tableConfigItems"
                         :key=index
                         :prop=item.prop
                         :label=item.label
                         :fixed=item.fixed
                         :min-width=item.width>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryForm.pageNumber"
        :page-size="queryForm.pageSize"
        :total="queryForm.total"
        class="page-wrapper">
      </el-pagination>
      <!-- END table数据列表 -->
    </el-row>
    <!--班务日视图 end-->
  </el-row>
</template>
<script>
  import orgTree from '../../common/orgTree'
  import { formatDateByTimestamp } from '@/utils'
  import { selectAttendanceList } from '@/api/shifts/attendance-api'
  export default {
    components: { orgTree },
    data() {
      return {
        queryForm: {
          attendanceDate: '', // 日期yyyy-MM-dd
          csaUserId: '', // 用户id
          csaOrgId: '', // 组织结构id
          pageNumber: 1, // 当前页
          pageSize: 20, // 每页行数
          total: 0
        }, // 查询列表表单
        loading: false,
        pageNumber: 1, // 默认查询第1页
        errorTip: '',
        tag: 4,
        tableData: [], // table数据列表
        formLabelWidth: '120px', // 表单标签宽度
        rules: {
        },
        tableConfigItems: [
          {
            label: '客服名', prop: 'userNameAndNo', width: ''
          }, {
            label: '班次', prop: '_shiftName', width: ''
          }, {
            label: '上班', prop: '_fpLoginTime', width: ''
          }, {
            label: '签入', prop: '_loginTime', width: ''
          }, {
            label: '签出', prop: '_logoutTime', width: ''
          }, {
            label: '下班', prop: '_fpLogoutTime', width: ''
          }, {
            label: '状态', prop: '_attendanceStatus', width: ''
          }
        ], // table表格配置项
        attendanceStatusList: [ // 考勤状态：0初始,1正常,2迟到,3早退,4旷工,5迟到且早退,6请假,7调班,8休息
          { key: 0, label: '初始' },
          { key: 1, label: '正常' },
          { key: 2, label: '迟到' },
          { key: 3, label: '早退' },
          { key: 4, label: '旷工' },
          { key: 5, label: '迟到且早退' },
          { key: 6, label: '请假' },
          { key: 7, label: '调班' },
          { key: 8, label: '休息' }
        ]
      }
    },
    created() { // 在vue初始化时调用
      this.$store.dispatch('GetUserId2NameMap')
      this.selectAttendanceInfo(this.pageNumber)
    },
    methods: {
      selectAttendanceInfo(pageNumber) {
        const _this = this
        this.queryForm.pageNumber = pageNumber || this.pageNumber // 当前页
        if (this.$refs.orgTree) {
          const aOrgTree = this.$refs.orgTree.selectedOptions
          this.queryForm.csaOrgId = ''
          if (aOrgTree && aOrgTree.length > 0) {
            this.queryForm.csaOrgId = aOrgTree[aOrgTree.length - 1]
          }
        }
        if (!this.queryForm.attendanceDate) {
          this.queryForm.attendanceDate = formatDateByTimestamp(new Date(), 'yyyy-MM-dd')
        } else {
          this.queryForm.attendanceDate = formatDateByTimestamp(this.queryForm.attendanceDate, 'yyyy-MM-dd')
        }
        this.loading = true
        return new Promise((resolve, reject) => {
          selectAttendanceList(_this.queryForm).then(res => {
            _this.loading = false
            _this.tableData = res.rows.map(item => {
              if (item.shiftResultVO && item.shiftResultVO.csaShiftVO) {
                item._shiftName = item.shiftResultVO.csaShiftVO.shiftName
              }
              return Object.assign({}, item, {
                _fpLoginTime: item.fpLoginTime ? formatDateByTimestamp(item.fpLoginTime, 'yyyy-MM-dd hh:mm:ss') : '--',
                _loginTime: item.fpLoginTime ? formatDateByTimestamp(item.loginTime, 'yyyy-MM-dd hh:mm:ss') : '--',
                _logoutTime: item.logoutTime ? formatDateByTimestamp(item.logoutTime, 'yyyy-MM-dd hh:mm:ss') : '--',
                _fpLogoutTime: item.fpLogoutTime ? formatDateByTimestamp(item.fpLogoutTime, 'yyyy-MM-dd hh:mm:ss') : '--',
                _attendanceStatus: this.attendanceStatusList.find(cur => {
                  return cur.key === item.attendanceStatus
                }).label
              })
            })
            _this.queryForm.pageSize = res.pageSize
            _this.queryForm.total = res.total
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
      resetQueryForm(form) {
        this.$refs[form].resetFields()
        this.queryForm = {
          attendanceDate: '', // 日期yyyy-MM-dd
          csaUserId: '', // 用户id
          csaOrgId: '', // 组织结构id
          pageNumber: 1, // 必填
          pageSize: 10 // 必填
        }
        this.selectAttendanceInfo(this.pageNumber)
      },

      handleSizeChange(val) {
        this.queryForm.pageSize = val
        this.selectAttendanceInfo(val)
      },
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.selectAttendanceInfo(val)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/shifts/shiftResult";
</style>
