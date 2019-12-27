<template>
  <el-row class="shiftChange-container">
    <el-row class="breadcrumb-wrapper" data-before="当前位置：" v-show="showBreadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
        <el-breadcrumb-item><a href="javascript: history.go(-1);">小组班务月视图</a></el-breadcrumb-item>
        <el-breadcrumb-item><b>调班申请记录</b></el-breadcrumb-item>
      </el-breadcrumb>
      <a href="javascript: history.go(-1);" class="btn-back">返回>></a>
    </el-row>
    <el-row class="sc-form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="sc-form">
        <el-form-item label="审核状态：" prop="trainingAuditStatus">
          <el-select v-model="queryForm.changeApplyStatus" placeholder="审核状态" clearable>
            <el-option v-for="(item, index) in changeApplyStatusList"
                       v-if="item.value !== 0"
                       :key="index"
                       :label=item.label
                       :value=item.value>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组织结构">
          <org-tree ref="orgTree"></org-tree>
        </el-form-item>
        <el-form-item label="用户名" prop="shiftName">
          <el-input v-model="queryForm.userName"></el-input>
        </el-form-item>
        <el-form-item label="申请日期">
          <el-form-item prop="createTimeStart" class="el-form__mini">
            <el-date-picker
              v-model="queryForm.createTimeStart"
              type="datetime"
              placeholder="开始日期"
              value-format="timestamp">
            </el-date-picker>
          </el-form-item>&nbsp;至&nbsp;
          <el-form-item prop="createTimeEnd" class="el-form__mini">
            <el-date-picker
              v-model="queryForm.createTimeEnd"
              type="datetime"
              placeholder="结束日期"
              value-format="timestamp">
            </el-date-picker>
          </el-form-item>
        </el-form-item>
        <el-form-item label="换班日期">
          <el-form-item prop="createTimeStart" class="el-form__mini">
            <el-date-picker
              v-model="queryForm.shiftDate"
              type="date"
              placeholder="换班日期"
              value-format="timestamp">
            </el-date-picker>
          </el-form-item>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getChangeList(pageNumber)" :loading="loading">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <el-row class="sc-table-wrapper">
      <!-- table数据列表 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column v-for="(item, index) in tableConfigItems"
                         :key=index
                         :prop=item.prop
                         :label=item.label
                         :min-width=item.width>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="300">
          <template slot-scope="scope">
            <span v-if="userOrgRole === 'group_leader'">
            <el-button type="primary" icon="el-icon-edit" size="mini" v-if="scope.row.changeApplyStatus === 2" disabled="disabled" @click="showAuditForm(scope.row)">审核</el-button>
            <el-button type="primary" icon="el-icon-edit" size="mini" v-else @click="showAuditForm(scope.row)">审核</el-button>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        v-if="tableData.length > 0"
        :current-page="queryForm.pageNumber"
        :page-size="queryForm.pageSize"
        :total="queryForm.total"
        class="shift-page">
      </el-pagination>
      <!-- END table数据列表 -->
    </el-row>
    <!-- 审核弹窗 start -->
    <el-dialog :title=dialogTitle class="audit-dialog" :visible.sync="dialogAuditFormVisible" width="640px" :close-on-click-modal="false" >
      <el-form :model="auditForm" ref="auditForm" :rules="rules">
        <el-form-item label="申请班次" :label-width="formLabelWidth">
          <el-input v-model="auditForm.shiftName1" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="调班班次" :label-width="formLabelWidth">
          <el-input v-model="auditForm.shiftName2" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="申请时间" :label-width="formLabelWidth">
          <el-input v-model="auditForm.createTime" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="申请类型" :label-width="formLabelWidth">
          <el-input v-model="auditForm.changeApplyType" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="调班原因" :label-width="formLabelWidth">
          <el-input v-model="auditForm.changeApplyDesc" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="审核结果" prop="auditResult" :label-width="formLabelWidth">
          <el-radio-group v-model="auditResult">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="0">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核描述" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="auditForm.auditReply"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAuditForm('auditForm')">取 消</el-button>
        <el-button type="primary" @click="submitAuditForm('auditForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 审核弹窗 end -->
  </el-row>
</template>
<script>
  import { formatDateByTimestamp } from '@/utils'
  import { getUser } from '@/api/users/user-api'
  import { selectChangeList, auditChangeApply } from '@/api/shifts/shift-change-api'
  import orgTree from '../../common/orgTree'

  export default {
    components: { orgTree },
    data() {
      return {
        showBreadcrumb: false,
        queryForm: {
          changeApplyStatus: '', // 调班申请状态1待审核，2审核通过，3审核拒绝
          userName: '', // 用户名
          csaOrgId: '', // 组织id
          createTimeStart: '', // 调班开始时间
          createTimeEnd: '', // 调班结束时间
          shiftDate: '', // 换班日期
          pageNumber: 1, // 当前页
          pageSize: 20 // 每页行数
        }, // 查询列表表单
        loading: false,
        pageNumber: 1, // 默认查询第1页
        dialogAuditFormVisible: false, // 是否显示审核弹窗
        auditForm: {
          shiftName1: '', // 申请班次
          shiftName2: '', // 调班班次
          createTime: '', // 申请时间
          changeApplyType: '', // 申请类型
          changeApplyDesc: '', // 调班原因
          changeApplyId: '', // 申请班次
          auditReply: '' // 审核描述
        },
        auditResult: 1, // 审核结果
        tableConfigItems: [
          {
            label: '创建人', prop: 'createByName', width: ''
          }, {
            label: '申请班次', prop: '_shiftInfo', width: ''
          }, {
            label: '调班班次', prop: '_appliedShiftInfo', width: ''
          }, {
            label: '申请类型', prop: '_changeApplyType', width: ''
          }, {
            label: '申请时间', prop: '_createTime', width: ''
          }, {
            label: '申请原因', prop: 'changeApplyDesc', width: ''
          }, {
            label: '审核人', prop: 'auditByName', width: ''
          }, {
            label: '审核时间', prop: '_auditTime', width: ''
          }, {
            label: '审核原因', prop: 'changeApplyDesc', width: ''
          }, {
            label: '审核状态', prop: '_changeApplyStatus', width: ''
          }
        ], // table表格配置项
        tableData: [], // table数据列表
        changeApplyTypeList: [
          { key: 1, label: '主动调班' },
          { key: 2, label: '被动调班' }
        ],
        fileList: [],
        formLabelWidth: '150px', // 表单标签宽度
        rules: {
          createTimeStart: [
            { required: true, message: '请选择开始日期', trigger: 'change' }
          ],
          createTimeEnd: [
            { required: true, message: '请选择结束日期', trigger: 'change' }
          ]
        },
        dialogTitle: '',
        changeApplyStatusList: [ // 审核状态：1待审核，2审核通过，3审核拒绝
          { value: 1, label: '待审核' },
          { value: 2, label: '审核通过' },
          { value: 3, label: '审核拒绝' }
        ],
        userEmail: '',
        csaOrgId: '',
        userOrgRole: ''
      }
    },
    created() {
      this.getChangeList(this.pageNumber) // 查询调班列表
      this.getUser()
      // 根据路由参数判断有值显示面包屑导航，没有则不显示
      if (this.$router.history.current.query.date) {
        this.showBreadcrumb = true
      } else {
        this.showBreadcrumb = false
      }
    },
    methods: {
      // 获取用户信息
      getUser() {
        return new Promise((resolve, reject) => {
          getUser().then((res) => {
            this.userEmail = res.data.email
            this.csaOrgId = res.data.csaOrgId
            this.userOrgRole = res.data.userOrgRole
            resolve(res)
          }).catch((error) => {
            reject(error)
          })
        })
      },
      /**
       * 查询调班列表
       * */
      getChangeList(pageNumber) {
        const _this = this
        const params = {}
        this.loading = true
        this.queryForm.pageNumber = pageNumber || this.pageNumber // 当前页
        if (this.$refs.orgTree) {
          const aOrgTree = this.$refs.orgTree.selectedOptions
          this.queryForm.csaOrgId = ''
          if (aOrgTree && aOrgTree.length > 0) {
            this.queryForm.csaOrgId = aOrgTree[aOrgTree.length - 1]
          }
        }

        if (this.queryForm.changeApplyStatus) params.changeApplyStatus = this.queryForm.changeApplyStatus
        if (this.queryForm.userName) params.userName = this.queryForm.userName
        if (this.queryForm.csaOrgId) params.csaOrgId = this.queryForm.csaOrgId
        if (this.queryForm.createTimeStart) params.createTimeStartStr = formatDateByTimestamp(this.queryForm.createTimeStart, 'yyyy-MM-dd hh:mm:ss').toString()
        if (this.queryForm.createTimeEnd) params.createTimeEndStr = formatDateByTimestamp(this.queryForm.createTimeEnd, 'yyyy-MM-dd hh:mm:ss').toString()
        if (this.queryForm.shiftDate) params.shiftDateStr = formatDateByTimestamp(this.queryForm.shiftDate, 'yyyy-MM-dd').toString()
        params.pageNumber = this.queryForm.pageNumber
        params.pageSize = this.queryForm.pageSize
        return new Promise((resolve, reject) => {
          selectChangeList(params).then((res) => {
            _this.loading = false
            if (res.rows && res.rows.length > 0) {
              _this.tableData = res.rows.map((item, index) => {
                item._changeApplyType = _this.changeApplyTypeList.find(cur => {
                  return cur.key === item.changeApplyType
                }).label
                item._changeApplyStatus = _this.changeApplyStatusList.find(cur => {
                  return cur.value === item.changeApplyStatus
                }).label
                return Object.assign({}, item, {
                  _shiftInfo: item.userName1 + ' / ' + item.shiftDate2 + ' / ' + item.shiftName2,
                  _appliedShiftInfo: item.userName2 + ' / ' + item.shiftDate1 + ' / ' + item.shiftName1,
                  _createTime: formatDateByTimestamp(item.createTime, 'yyyy-MM-dd hh:mm:ss'),
                  _auditTime: item.auditTime ? formatDateByTimestamp(item.auditTime, 'yyyy-MM-dd hh:mm:ss') : ''
                })
              })
              _this.queryForm.pageSize = res.pageSize
              _this.queryForm.total = res.total
            } else {
              _this.tableData = []
            }
            resolve(res)
          }).catch((error) => {
            _this.loading = false
            reject(error)
          })
        })
      },

      /**
       * 显示审核弹窗
       */
      showAuditForm(row) {
        this.dialogTitle = '审核调班信息'
        this.dialogAuditFormVisible = true
        const changeApplyType = this.changeApplyTypeList.find(cur => {
          return cur.key === row.changeApplyType
        }).label
        if (row && row.id) {
          this.auditForm = {
            shiftName1: row.shiftName1, // 申请班次
            shiftName2: row.shiftName2, // 调班班次
            createTime: formatDateByTimestamp(row.createTime, 'yyyy-MM-dd hh:mm:ss'), // 申请时间
            changeApplyType: changeApplyType, // 申请类型
            changeApplyDesc: row.changeApplyDesc, // 调班原因
            changeApplyId: row.id // 调班原因
          }
        }
      },

      /**
       * 提交审核弹窗
       */
      submitAuditForm() {
        const _this = this
        const params = {}
        params.changeApplyId = this.auditForm.changeApplyId
        params.auditResult = this.auditResult
        params.auditReply = this.auditForm.auditReply
        return new Promise((resolve, reject) => {
          auditChangeApply(params).then((res) => {
            _this.dialogAuditFormVisible = false
            _this.getChangeList(_this.pageNumber)
            _this.$message({
              message: res.rspMsg,
              type: res.rspCode === _this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
              showClose: true
            })
          }).catch((error) => {
            reject(error)
          })
        })
      },

      /**
       * 隐藏审核弹窗
       */
      cancelAuditForm(form) {
        this.dialogAuditFormVisible = false
        this.$refs[form].resetFields()
      },

      /**
       * 重置查询输入项
       */
      resetQueryForm(form) {
        this.$refs[form].resetFields()
        this.queryForm = {
          changeApplyStatus: '', // 调班申请状态1待初审，2待终审，3审核通过，4审核驳回，5已撤销
          userName: '', // 用户名
          csaOrgId: '', // 组织id
          createTimeStart: '', // 调班开始时间（必填）
          createTimeEnd: '', // 调班结束时间（必填）
          pageNumber: 1, // 当前页
          pageSize: 20 // 每页行数
        }
        this.getChangeList(this.pageNumber)
      },

      // 初始页currentPage、初始每页数据数pagesize和数据data
      handleSizeChange(val) {
        this.queryForm.pagesize = val
        this.getChangeList(val)
      },
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.getChangeList(val)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/shifts/shiftChange";
</style>
