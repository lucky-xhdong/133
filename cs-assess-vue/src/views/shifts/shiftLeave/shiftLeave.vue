<template>
  <el-row class="shiftLeave-container">
    <el-row class="breadcrumb-wrapper" data-before="当前位置：" v-show="showBreadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
        <el-breadcrumb-item><a href="javascript: history.go(-1);">小组班务月视图</a></el-breadcrumb-item>
        <el-breadcrumb-item><b>请假申请记录</b></el-breadcrumb-item>
      </el-breadcrumb>
      <a href="javascript: history.go(-1);" class="btn-back">返回>></a>
    </el-row>
    <el-row class="sc-form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="sc-form">
        <el-form-item label="审核状态：" prop="trainingAuditStatus">
          <el-select v-model="queryForm.leaveApplyStatus" placeholder="审核状态" clearable>
            <el-option v-for="(item, index) in leaveApplyStatusList"
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
          <el-input v-model="queryForm.csaUserName"></el-input>
        </el-form-item>
        <el-form-item label="请假日期">
          <el-form-item prop="leaveStartDate" class="el-form__mini">
            <el-date-picker
              v-model="queryForm.leaveStartDate"
              type="datetime"
              placeholder="开始日期"
              value-format="timestamp">
            </el-date-picker>
          </el-form-item>&nbsp;至&nbsp;
          <el-form-item prop="leaveEndDate" class="el-form__mini">
            <el-date-picker
              v-model="queryForm.leaveEndDate"
              type="datetime"
              placeholder="结束日期"
              value-format="timestamp">
            </el-date-picker>
          </el-form-item>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getLeaveApplyList(pageNumber)" :loading="loading">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showLeaveForm">新增</el-button>
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
            <el-button type="primary" icon="el-icon-view" size="mini" @click="viewLeaveInfo(scope.row)">查看</el-button>
            <el-button type="primary" icon="el-icon-edit" size="mini" v-if="scope.row.leaveApplyStatus === 1 && userOrgRole === 'group_leader'" @click="showAuditForm(scope.row, scope.row.leaveApplyStatus)">待初审</el-button><!--审核状态为1并且userOrgRole为group_leader-->
            <el-button type="primary" icon="el-icon-edit" size="mini" v-if="scope.row.leaveApplyStatus === 2 && userEmail === 'xiaxj@huoli.com'" @click="showAuditForm(scope.row, scope.row.leaveApplyStatus)">待终审</el-button><!--审核状态为2并且userEmail为夏徐敬-->

            <!--<el-button type="primary" icon="el-icon-edit" size="mini" v-if="scope.row.leaveApplyStatus === 1" @click="showAuditForm(scope.row, 1)">待初审</el-button>&lt;!&ndash;审核状态为1并且userOrgRole为group_leader&ndash;&gt;-->
            <!--<el-button type="primary" icon="el-icon-edit" size="mini" v-if="scope.row.leaveApplyStatus === 2" @click="showAuditForm(scope.row, 2)">待终审</el-button>&lt;!&ndash;审核状态为2并且userEmail为夏徐敬&ndash;&gt;-->
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
    <!-- 新增/编辑弹窗 start -->
    <leave-dialog ref="leaveDialog" @getLeaveApplyList="getLeaveApplyList"></leave-dialog>
    <!-- 新增/编辑弹窗 end -->
    <!-- 查看弹窗 start -->
    <el-dialog :title=dialogTitle class="leave-dialog" :visible.sync="dialogLeaveFormVisible" width="640px" :close-on-click-modal="false" >
      <el-form :model="leaveForm" ref="leaveForm" :rules="rules">
        <el-form-item label="请假人" :label-width="formLabelWidth">
          <el-input v-model="leaveForm.createByName" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="请假类型" :label-width="formLabelWidth">
          <el-input v-model="leaveForm.leaveType" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="请假日期" :label-width="formLabelWidth" class="el-form__leave">
          <el-form-item prop="leaveStartDate" class="el-form__mini">
            <el-input v-model="leaveForm.leaveStartDate" disabled="disabled"></el-input>
          </el-form-item>&nbsp;至&nbsp;
          <el-form-item prop="leaveEndDate" class="el-form__mini">
            <el-input v-model="leaveForm.leaveEndDate" disabled="disabled"></el-input>
          </el-form-item>
        </el-form-item>
        <el-form-item label="请假天数" :label-width="formLabelWidth">
          <el-input v-model="leaveForm.leaveTotalDay" disabled="disabled"><template slot="append">天</template></el-input>
        </el-form-item>
        <el-form-item label="请假事由" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="leaveForm.leaveApplyDesc" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="附件" class="el-file__upload" :label-width="formLabelWidth">
          <el-row v-if="leaveForm.leaveApplyAttachment.length > 0">
            <el-row v-for="(item, index) in leaveForm.leaveApplyAttachment" :key="index">
              <el-row v-if="item.fileJson.isImage">
                <a :href=item.fileJson.fileUrl target="_blank" title="点击查看图片">{{item.fileJson.oldName}}</a>
              </el-row>
              <el-row v-else>
                <a :href=item.fileJson.href title="点击下载附件">{{item.fileJson.oldName}}</a>
              </el-row>
            </el-row>
          </el-row>
          <el-row v-else><span>无</span></el-row>
        </el-form-item>
        <el-form-item label="初审人" :label-width="formLabelWidth">
          <el-input v-model="leaveForm.auditByName" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="初审时间" :label-width="formLabelWidth">
          <el-input v-model="leaveForm.auditTime" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="初审结果" :label-width="formLabelWidth">
          <el-input v-model="leaveForm.firstAuditStatus" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="初审描述" :label-width="formLabelWidth">
          <el-input v-model="leaveForm.auditDesc" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="终审人" :label-width="formLabelWidth">
          <el-input v-model="leaveForm.finalAuditByName" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="终审时间" :label-width="formLabelWidth">
          <el-input v-model="leaveForm.finalAuditTime" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="终审结果" :label-width="formLabelWidth">
          <el-input v-model="leaveForm.finalAuditStatus" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="终审描述" :label-width="formLabelWidth">
          <el-input v-model="leaveForm.finalAuditRemark" disabled="disabled"></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 查看弹窗 end -->
    <!-- 审核弹窗 start -->
    <el-dialog :title=dialogTitle class="audit-dialog" :visible.sync="dialogAuditFormVisible" width="640px" :close-on-click-modal="false" >
      <el-form :model="auditForm" ref="auditForm" :rules="rules">
        <el-form-item label="请假人" :label-width="formLabelWidth">
          <el-input v-model="auditForm.createByName" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="请假类型" :label-width="formLabelWidth">
          <el-input v-model="auditForm.leaveType" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="请假日期" :label-width="formLabelWidth" class="el-form__leave">
          <el-form-item class="el-form__mini">
            <el-input v-model="auditForm.leaveStartDate" disabled="disabled"></el-input>
          </el-form-item>&nbsp;至&nbsp;
          <el-form-item class="el-form__mini">
            <el-input v-model="auditForm.leaveEndDate" disabled="disabled"></el-input>
          </el-form-item>
        </el-form-item>
        <el-form-item label="请假天数" :label-width="formLabelWidth">
          <el-input v-model="auditForm.leaveTotalDay" disabled="disabled"><template slot="append">天</template></el-input>
        </el-form-item>
        <el-form-item label="申请时间" :label-width="formLabelWidth">
          <el-input v-model="auditForm.createTime" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="请假事由" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="auditForm.leaveApplyDesc" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="附件" class="el-file__upload" :label-width="formLabelWidth" v-if="auditForm.id">
          <el-row v-if="auditForm.leaveApplyAttachment.length > 0">
            <el-row v-for="(item, index) in auditForm.leaveApplyAttachment" :key="index">
              <el-row v-if="item.fileJson.isImage">
                <a :href=item.fileJson.fileUrl target="_blank" title="点击查看图片">{{item.fileJson.oldName}}</a>
              </el-row>
              <el-row v-else>
                <a :href=item.fileJson.href title="点击下载附件">{{item.fileJson.oldName}}</a>
              </el-row>
            </el-row>
          </el-row>
          <el-row v-else><span>无</span></el-row>
        </el-form-item>
        <!--auditStatus === 1表示待初审 start-->
        <el-row v-if="auditStatus === 1">
          <el-form-item label="初审结果" prop="firstAuditStatus" :label-width="formLabelWidth">
            <el-radio-group v-model="firstAuditStatus">
              <el-radio :label="3">通过</el-radio><!--3审核通过，4审核驳回-->
              <el-radio :label="4">不通过</el-radio><!--3审核通过，4审核驳回-->
            </el-radio-group>
          </el-form-item>
          <el-form-item label="初审描述" :label-width="formLabelWidth">
            <el-input type="textarea" v-model="auditForm.auditDesc"></el-input>
          </el-form-item>
        </el-row>
        <!--auditStatus === 1表示待初审 end-->
        <!--auditStatus === 2表示待终审 start-->
        <el-row v-else-if="auditStatus === 2">
          <el-form-item label="初审人" :label-width="formLabelWidth">
            <el-input v-model="auditForm.auditByName" disabled="disabled"></el-input>
          </el-form-item>
          <el-form-item label="初审时间" :label-width="formLabelWidth">
            <el-input v-model="auditForm.auditTime" disabled="disabled"></el-input>
          </el-form-item>
          <el-form-item label="初审结果" :label-width="formLabelWidth">
            <el-radio-group v-model="firstAuditStatus" disabled="disabled">
              <el-radio :label="3">通过</el-radio><!--3审核通过，4审核驳回-->
              <el-radio :label="4">不通过</el-radio><!--3审核通过，4审核驳回-->
            </el-radio-group>
          </el-form-item>
          <el-form-item label="初审描述" :label-width="formLabelWidth">
            <el-input type="textarea" v-model="auditForm.auditDesc" disabled="disabled"></el-input>
          </el-form-item>
          <el-form-item label="终审结果" prop="finalAuditStatus" :label-width="formLabelWidth">
            <el-radio-group v-model="finalAuditStatus">
              <el-radio :label="3">通过</el-radio><!--3审核通过，4审核驳回-->
              <el-radio :label="4">不通过</el-radio><!--3审核通过，4审核驳回-->
            </el-radio-group>
          </el-form-item>
          <el-form-item label="终审描述" :label-width="formLabelWidth">
            <el-input type="textarea" v-model="auditForm.finalAuditRemark"></el-input>
          </el-form-item>
        </el-row>
        <!--auditStatus === 2表示待终审 end-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAuditForm('auditForm')">取 消</el-button>
        <el-button type="primary" @click="submitAuditForm('auditForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 审核弹窗 end -->
    <iframe :src="iframeSrc" frameborder="0" style="display: none;"></iframe>
  </el-row>
</template>
<script>
  import { formatDateByTimestamp } from '@/utils'
  import { getUser } from '@/api/users/user-api'
  import { selectLeaveApplyList, auditLeaveApply } from '@/api/shifts/shift-leave-api'
  import orgTree from '../../common/orgTree'
  import leaveDialog from '../../common/shifts/leaveDialog'

  export default {
    components: { orgTree, leaveDialog },
    data() {
      return {
        showBreadcrumb: false,
        queryForm: {
          leaveApplyStatus: '', // 请假申请状态1待初审，2待终审，3审核通过，4审核驳回，5已撤销
          csaUserName: '', // 用户名
          csaOrgId: '', // 组织id
          leaveStartDate: '', // 请假开始时间（必填）
          leaveEndDate: '', // 请假结束时间（必填）
          pageNumber: 1, // 当前页
          pageSize: 20 // 每页行数
        }, // 查询列表表单
        loading: false,
        pageNumber: 1, // 默认查询第1页
        dialogLeaveFormVisible: false, // 是否显示新增请假弹窗
        dialogAuditFormVisible: false, // 是否显示审核请假弹窗
        tableConfigItems: [
          {
            label: '申请人', prop: 'createByName'
          }, {
            label: '请假开始日期', prop: '_leaveStartDate', width: ''
          }, {
            label: '请假结束日期', prop: '_leaveEndDate', width: ''
          }, {
            label: '请假类型', prop: '_leaveType', width: ''
          }, {
            label: '天数', prop: 'leaveTotalDay', width: ''
          }, {
            label: '申请时间', prop: '_createTime', width: '100'
          }, {
            label: '申请原因', prop: 'leaveApplyDesc', width: '100'
          }, {
            label: '审核状态', prop: '_leaveApplyStatus', width: '100'
          }
        ], // table表格配置项
        tableData: [], // table数据列表
        // 新增请假表单
        leaveForm: {
          leaveStartDate: '', // 请假开始时间（必填）
          leaveEndDate: '', // 请假结束时间（必填）
          leaveType: '', // 请假类型1.事假,2病假,3婚假,4.丧假,5.产假,6.年假,7其他（必填）
          leaveApplyDesc: '', // 申请描述
          leaveApplyAttachment: [], // 附件信息（必填）
          createByName: '',
          leaveTotalDay: '',
          auditByName: '',
          auditTime: '',
          firstAuditStatus: '',
          auditDesc: '',
          finalAuditByName: '',
          finalAuditTime: '',
          finalAuditStatus: '',
          finalAuditRemark: ''
        },
        firstAuditStatus: 3, // 初审结果: 3审核通过，4审核驳回 （必填）
        finalAuditStatus: 3, // 终审结果: 3审核通过，4审核驳回 （必填）
        auditForm: {
          // 初审
          createByName: '', // 请假人
          leaveStartDate: '', // 请假开始时间
          leaveEndDate: '', // 请假结束时间
          leaveTotalDay: '', // 请假天数
          leaveType: '', // 请假类型1.事假,2病假,3婚假,4.丧假,5.产假,6.年假,7其他
          leaveApplyDesc: '', // 申请描述
          createTime: '', // 申请时间
          leaveApplyAttachment: [], // 附件信息
          auditDesc: '', // 申请描述
          // 终审
          finalAuditRemark: '' // 描述
        },
        auditStatus: '', // 标记是初审还是终审
        leaveTypeList: [
          { key: 1, label: '年假' },
          { key: 2, label: '事假' },
          { key: 3, label: '产假' },
          { key: 4, label: '婚假' },
          { key: 5, label: '丧假' },
          { key: 6, label: '陪产假' },
          { key: 7, label: '产检假' }
        ],
        fileList: [],
        formLabelWidth: '150px', // 表单标签宽度
        rules: {
          createByName: [
            { required: true, message: '请输入请假人', trigger: 'blur' }
          ],
          leaveType: [
            { required: true, message: '请选择请假类型', trigger: 'change' }
          ],
          leaveStartDate: [
            { required: true, message: '请选择开始日期', trigger: 'change' }
          ],
          leaveEndDate: [
            { required: true, message: '请选择结束日期', trigger: 'change' }
          ],
          leaveApplyDesc: [
            { required: true, message: '请输入请假事由', trigger: 'blur' }
          ],
          leaveApplyAttachment: [
            { required: true, message: '请上传附件', trigger: 'change' }
          ]
        },
        dialogTitle: '',
        leaveApplyStatusList: [ // 审核状态：1待初审，2待终审，3审核通过，4审核驳回，5已撤销
          { value: 1, label: '待初审' },
          { value: 2, label: '待终审' },
          { value: 3, label: '审核通过' },
          { value: 4, label: '审核驳回' },
          { value: 5, label: '已撤销' }
        ],
        userEmail: '',
        csaOrgId: '',
        userOrgRole: '',
        iframeSrc: ''
      }
    },
    created() {
      this.getLeaveApplyList(this.pageNumber) // 查询请假列表
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
       * 查询请假列表
       * */
      getLeaveApplyList(pageNumber) {
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

        if (this.queryForm.leaveApplyStatus) params.leaveApplyStatus = this.queryForm.leaveApplyStatus
        if (this.queryForm.csaUserName) params.csaUserName = this.queryForm.csaUserName
        if (this.queryForm.csaOrgId) params.csaOrgId = this.queryForm.csaOrgId
        if (this.queryForm.leaveStartDate) params.leaveStartDateStr = formatDateByTimestamp(this.queryForm.leaveStartDate, 'yyyy-MM-dd hh:mm:ss').toString()
        if (this.queryForm.leaveEndDate) params.leaveEndDateStr = formatDateByTimestamp(this.queryForm.leaveEndDate, 'yyyy-MM-dd hh:mm:ss').toString()
        params.pageNumber = this.queryForm.pageNumber
        params.pageSize = this.queryForm.pageSize
        return new Promise((resolve, reject) => {
          selectLeaveApplyList(params).then((res) => {
            _this.loading = false
            if (res.rows && res.rows.length > 0) {
              _this.tableData = res.rows.map((item, index) => {
                item._leaveType = _this.leaveTypeList.find(cur => {
                  return cur.key === item.leaveType
                }).label
                item._leaveApplyStatus = _this.leaveApplyStatusList.find(cur => {
                  return cur.value === item.leaveApplyStatus
                }).label
                return Object.assign({}, item, {
                  _leaveStartDate: formatDateByTimestamp(item.leaveStartDate, 'yyyy-MM-dd hh:mm:ss'),
                  _leaveEndDate: formatDateByTimestamp(item.leaveEndDate, 'yyyy-MM-dd hh:mm:ss'),
                  _createTime: formatDateByTimestamp(item.createTime, 'yyyy-MM-dd hh:mm:ss')
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
       * 显示新增请假弹窗
       */
      showLeaveForm() {
        this.$refs.leaveDialog.dialogLeaveFormVisible = true
      },

      /**
       * 查看请假弹窗
       */
      viewLeaveInfo(row) {
        this.dialogLeaveFormVisible = true
        if (row && row.id) {
          // 请假类型1.事假,2病假,3婚假,4.丧假,5.产假,6.年假,7其他（必填）
          const _leaveType = this.leaveTypeList.find(cur => {
            return cur.key === row.leaveType
          }).label
          this.leaveForm = {
            id: row.id,
            createByName: row.createByName, // 请假人
            leaveStartDate: row.leaveStartDate ? formatDateByTimestamp(row.leaveStartDate, 'yyyy-MM-dd hh:mm:ss') : '', // 请假开始时间（必填）
            leaveEndDate: row.leaveEndDate ? formatDateByTimestamp(row.leaveEndDate, 'yyyy-MM-dd hh:mm:ss') : '', // 请假结束时间（必填）
            leaveTotalDay: row.leaveTotalDay, // 请假天数
            leaveApplyDesc: row.leaveApplyDesc, // 申请描述(原因)
            leaveType: _leaveType, // 请假类型1
            auditByName: row.auditByName, // 审核人
            auditTime: row.auditTime ? formatDateByTimestamp(row.auditTime, 'yyyy-MM-dd hh:mm:ss') : '', // 审核时间
            auditDesc: row.auditDesc, // 初审描述
            finalAuditByName: row.finalAuditByName, // 终审人
            finalAuditTime: row.finalAuditTime ? formatDateByTimestamp(row.finalAuditTime, 'yyyy-MM-dd hh:mm:ss') : '', // 终审时间
            finalAuditRemark: row.finalAuditRemark, // 终审描述
            leaveApplyAttachment: row.leaveApplyAttachment ? JSON.parse(row.leaveApplyAttachment) : ''
          }
          // 初审结果
          this.leaveForm.firstAuditStatus = this.leaveApplyStatusList.find(cur => {
            return cur.value === row.leaveApplyStatus
          }).label
          // 终审结果
          if (this.leaveForm.finalAuditByName === '') {
            this.leaveForm.finalAuditStatus = ''
          } else {
            this.leaveForm.finalAuditStatus = this.leaveApplyStatusList.find(cur => {
              return cur.value === row.leaveApplyStatus
            }).label
          }
          this.downloadFiles(this.leaveForm.leaveApplyAttachment)
          this.dialogTitle = '查看请假单'
        }
      },

      /**
       * 下载附件
       * @aAttachmentList 附件列表
       */
      downloadFiles(aAttachmentList) {
        if (aAttachmentList.length > 0) {
          aAttachmentList.map((item) => {
            item.fileJson = JSON.parse(item.fileJson)
            if (item.fileJson.suffix.indexOf('.png') > -1 || item.fileJson.suffix.indexOf('.jpg') > -1 || item.fileJson.suffix.indexOf('.jpeg') > -1) {
              item.fileJson.isImage = true
              item.fileJson.href = ''
            } else {
              item.fileJson.isImage = false
              item.fileJson.href = process.env.BASE_API + '/csa/fileUpload/download?outFilename=' + item.fileJson.oldName + '&fileUrl=' + item.fileJson.fileUrl + '&download=1&timestamp=' + new Date().getTime()
            }
          })
        }
      },

      /**
       * 显示审核请假弹窗
       * @row 行对象
       * type 1初审 2终审
       */
      showAuditForm(row, type) {
        this.dialogAuditFormVisible = true
        this.auditStatus = type
        if (row && row.id) {
          // 请假类型1.事假,2病假,3婚假,4.丧假,5.产假,6.年假,7其他（必填）
          const _leaveType = this.leaveTypeList.find(cur => {
            return cur.key === row.leaveType
          }).label
          this.auditForm = {
            id: row.id,
            createByName: row.createByName, // 请假人
            leaveType: _leaveType, // 请假类型1
            leaveStartDate: row.leaveStartDate ? formatDateByTimestamp(row.leaveStartDate, 'yyyy-MM-dd hh:mm:ss') : '', // 请假开始时间
            leaveEndDate: row.leaveEndDate ? formatDateByTimestamp(row.leaveEndDate, 'yyyy-MM-dd hh:mm:ss') : '', // 请假结束时间
            leaveTotalDay: row.leaveTotalDay, // 请假天数
            leaveApplyDesc: row.leaveApplyDesc, // 申请原因
            createTime: row.createTime ? formatDateByTimestamp(row.createTime, 'yyyy-MM-dd hh:mm:ss') : '', // 申请时间
            leaveApplyAttachment: row.leaveApplyAttachment ? JSON.parse(row.leaveApplyAttachment) : '',
            leaveApplyStatus: row.leaveApplyStatus,
            auditByName: row.auditByName, // 初审人
            auditTime: row.auditTime ? formatDateByTimestamp(row.auditTime, 'yyyy-MM-dd hh:mm:ss') : '', // 初审时间
            auditResult: row.auditResult, // 初审结果
            auditDesc: row.auditDesc, // 初审描述
            finalAuditResult: row.finalAuditResult, // 申请状态: 3审核通过，4审核驳回 （必填）
            finalAuditRemark: row.finalAuditRemark // 终审描述
          }
          if (type === 1) {
            this.dialogTitle = '请假单初审'
            this.auditForm.auditType = this.firstAuditStatus
          } else {
            this.dialogTitle = '请假单终审'
            this.auditForm.auditType = this.finalAuditStatus
          }
          this.downloadFiles(this.auditForm.leaveApplyAttachment)
        }
      },

      /**
       * 提交审核请假表单
       * 校验表单必填项是否通过
       */
      submitAuditForm(form) {
        const _this = this
        this.$refs[form].validate((valid) => {
          if (valid) {
            let params = {}
            if (this.auditStatus === 1) {
              params = {
                id: this.auditForm.id, // id（必填）
                leaveApplyStatus: this.firstAuditStatus, // 申请状态: 3审核通过，4审核驳回 （必填）
                auditType: this.auditStatus, // 审核类型: 1初审 2终审（必填）
                auditDesc: this.auditForm.auditDesc // 初审描述
              }
            } else {
              params = {
                id: this.auditForm.id, // id（必填）
                leaveApplyStatus: this.finalAuditStatus, // 申请状态: 3审核通过，4审核驳回 （必填）
                auditType: this.auditStatus, // 审核类型: 1初审 2终审（必填）
                finalAuditRemark: this.auditForm.finalAuditRemark // 终审描述
              }
            }
            return new Promise((resolve, reject) => {
              auditLeaveApply(params).then(res => {
                _this.dialogAuditFormVisible = false
                _this.getLeaveApplyList(_this.pageNumber)
                _this.$refs[form].resetFields()
                _this.$message({
                  message: res.rspMsg,
                  type: res.rspCode === _this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                  showClose: true
                })
                resolve(res)
              }).catch(error => {
                reject(error)
              })
            })
          }
        })
      },

      /**
       * 重置查询输入项
       */
      resetQueryForm(form) {
        this.$refs[form].resetFields()
        this.queryForm = {
          leaveApplyStatus: '', // 请假申请状态1待初审，2待终审，3审核通过，4审核驳回，5已撤销
          csaUserName: '', // 用户名
          csaOrgId: '', // 组织id
          leaveStartDate: '', // 请假开始时间（必填）
          leaveEndDate: '', // 请假结束时间（必填）
          pageNumber: 1, // 当前页
          pageSize: 20 // 每页行数
        }
        this.getLeaveApplyList(this.pageNumber)
      },

      /**
       * 取消审核请假
       * 关闭弹窗
       * 清空表单输入项
       */
      cancelAuditForm(form) {
        this.dialogAuditFormVisible = false
        this.$refs[form].resetFields()
        this.auditForm.leaveApplyAttachment = []
      },

      // 初始页currentPage、初始每页数据数pagesize和数据data
      handleSizeChange(val) {
        this.queryForm.pagesize = val
        this.getLeaveApplyList(val)
      },
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.getLeaveApplyList(val)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/shifts/shiftLeave";
</style>
