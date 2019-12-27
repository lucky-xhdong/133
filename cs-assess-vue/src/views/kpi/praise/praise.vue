<template>
  <el-row class="praise-container">
    <el-row class="pc-form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="pc-form">
        <el-form-item label="绩效月份：" prop="applyDate">
          <el-date-picker
            v-model="queryForm.applyDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="组织结构：" prop="orgId">
          <org-tree ref="orgTree" v-model="queryForm.orgId"></org-tree>
        </el-form-item>
        <el-form-item label="姓名：" prop="appliedUserName">
          <el-input v-model="queryForm.userName" placeholder="姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="审核状态：" prop="praiseStatus">
          <el-select v-model="queryForm.praiseStatus" placeholder="审核状态" clearable>
            <el-option v-for="(item, index) in praiseStatusList"
                       :key="index"
                       :label=item.label
                       :value=item.value>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="表扬类型：" prop="praiseType">
          <el-select v-model="queryForm.praiseType" placeholder="表扬类型" clearable>
            <el-option v-for="(item, index) in praiseTypeList"
                       v-if="item.value != 0"
                       :key="index"
                       :label=item.label
                       :value=item.value>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="selectPraiseApplyList(pageNumber)" :loading="loading">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showAddForm">新增</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <el-row class="pc-table-wrapper">
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
          width="400">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddForm(scope.row, 'view')">查看</el-button>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddForm(scope.row)" :disabled="scope.row.praiseStatus === 2">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteDialog(scope.row)" :disabled="scope.row.praiseStatus === 2">删除</el-button>
            <!--50表示质检组-->
            <span v-if="csaOrgId === 50 || userEmail === 'yanqq@133.cn'">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAuditForm(scope.row)" :disabled="scope.row.praiseStatus === 2">审核</el-button>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryForm.pageNumber"
        :page-size="queryForm.pageSize"
        :total="queryForm.total"
        class="praise-page">
      </el-pagination>
      <!-- END table数据列表 -->
    </el-row>
    <!-- 新增/编辑表扬弹窗 start -->
    <el-dialog :title=dialogTitle class="add-dialog" :visible.sync="dialogAddFormVisible" width="25%" :close-on-click-modal="false">
      <el-form :model="addForm" ref="addForm" :rules="rules">
        <el-form-item label="姓名" prop="appliedUserName" :label-width="formLabelWidth" v-if="addForm.id">
          <el-input v-model="addForm.appliedUserName" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="appliedUserId" :label-width="formLabelWidth" v-else>
          <el-select v-model="addForm.appliedUserId" filterable placeholder="请选择姓名" clearable>
            <el-option
              v-for="(item, index) in $store.state.userStore.appliedUserList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="通话ID/会话ID" prop="callSessionId" :label-width="formLabelWidth">
          <el-input v-model="addForm.callSessionId" clearable></el-input>
          <el-button type="default" class="btn-search-wrapper" @click="getCallSessionId">
            <i class="el-icon el-icon-search"></i>
          </el-button>
        </el-form-item>
        <el-form-item label="订单号" prop="orderId" :label-width="formLabelWidth">
          <el-input v-model="addForm.orderId" clearable></el-input>
        </el-form-item>
        <el-form-item label="订单时间" prop="orderTime" :label-width="formLabelWidth">
          <el-date-picker
            v-model="addForm.orderTime"
            value-format="timestamp"
            type="datetime"
            placeholder="请选择订单日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="用户ID" prop="userPhoneId" :label-width="formLabelWidth">
          <el-input v-model="addForm.userPhoneId" clearable></el-input>
        </el-form-item>
        <el-form-item label="进线号码" prop="incomingPhoneNum" :label-width="formLabelWidth">
          <el-input v-model="addForm.incomingPhoneNum" clearable></el-input>
        </el-form-item>
        <el-form-item label="聊天记录/语音记录" prop="chatVoiceRecord" :label-width="formLabelWidth">
          <el-input v-model="addForm.chatVoiceRecord" clearable></el-input>
        </el-form-item>
        <el-form-item label="表扬描述" prop="praiseRemark" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="addForm.praiseRemark" clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-show="!addForm.bShowButton">
        <el-button @click="cancelAddForm('addForm')">取 消</el-button>
        <el-button type="primary" @click="submitAddForm('addForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 新增/编辑表扬弹窗 end -->
    <!-- 审核表扬弹窗 start -->
    <el-dialog title="审核表扬" class="audit-dialog" :visible.sync="dialogAuditFormVisible" width="25%" :close-on-click-modal="false">
      <el-form :model="auditForm" ref="auditForm" :rules="rules">
        <el-form-item label="绩效月份：" prop="applyDate" :label-width="formLabelWidth">
          <el-date-picker
            v-model="auditForm.applyDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="姓名" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="auditForm.appliedUserName"></el-input>
        </el-form-item>
        <el-form-item label="通话ID/会话ID" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="auditForm.callSessionId"></el-input>
        </el-form-item>
        <el-form-item label="订单号" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="auditForm.orderId"></el-input>
        </el-form-item>
        <el-form-item label="订单时间" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="auditForm.orderTime"></el-input>
        </el-form-item>
        <el-form-item label="用户ID" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="auditForm.userPhoneId"></el-input>
        </el-form-item>
        <el-form-item label="进线号码" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="auditForm.incomingPhoneNum"></el-input>
        </el-form-item>
        <el-form-item label="聊天记录/语音记录" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="auditForm.chatVoiceRecord"></el-input>
        </el-form-item>
        <el-form-item label="表扬描述" :label-width="formLabelWidth">
          <el-input disabled="disabled" type="textarea" v-model="auditForm.praiseRemark"></el-input>
        </el-form-item>
        <el-form-item label="审核状态：" prop="praiseStatus" :label-width="formLabelWidth">
          <el-select v-model="auditForm.praiseStatus" placeholder="请选择审核状态">
            <el-option v-for="(item, index) in dialogPraiseStatusList"
                       :key="index"
                       :label=item.label
                       :value=item.value>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="表扬类型：" prop="praiseType"
                      v-show="auditForm.praiseStatus === 2 || auditForm.praiseStatus === 0"
                      :rules="auditForm.praiseStatus === 2 ? {required: true, message: '请选择表扬类型', trigger: 'change'} : {}"
                      :label-width="formLabelWidth">
          <el-select v-model="auditForm.praiseType" placeholder="请选择表扬类型">
            <el-option v-for="(item, index) in praiseTypeList"
                       v-if="item.value != 0"
                       :key="index"
                       :label=item.label
                       :value=item.value>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核描述" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="auditForm.auditRemark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAuditForm('auditForm')">取 消</el-button>
        <el-button type="primary" @click="submitAuditForm('auditForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 审核表扬弹窗 end -->
    <!-- 删除表扬弹窗 start -->
    <el-dialog
      title="提示"
      :visible.sync="dialogDeleteVisible"
      width="20%"
      :before-close="handleClose">
      <span>你确定要删除这条数据么？</span>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogDeleteVisible = false" size="mini">取 消</el-button>
    <el-button type="primary" @click="deleteItem" size="mini">确 定</el-button>
  </span>
    </el-dialog>
    <!-- 删除表扬弹窗 end -->
  </el-row>
</template>
<script>
  import { formatDateByTimestamp } from '@/utils'
  import { getUser } from '@/api/users/user-api'
  import { selectPraiseApplyList, savePraiseApply, updatePraiseApply, auditPraiseApply } from '@/api/kpi/praise-api'
  import orgTree from '../../common/orgTree'

  export default {
    components: { orgTree },
    data() {
      return {
        queryForm: {
          applyDate: '', // 绩效月份
          orgId: '', // 组织结构
          userName: '', // 姓名
          praiseStatus: 1, // 审核状态
          praiseType: '', // 表扬类型
          pageNumber: 1, // 页码
          pageSize: 20, // 每页行数
          total: 0// 总页数
        }, // 查询列表表单
        pageNumber: 1, // 默认查询第1页
        loading: false,
        defaultMonth: formatDateByTimestamp(new Date() * 1, 'yyyy-MM'),
        dialogAddFormVisible: false, // 是否显示新增表扬弹窗
        dialogAuditFormVisible: false, // 是否显示审核表扬弹窗
        dialogDeleteVisible: false, // 是否显示删除弹窗
        tableConfigItems: [
          {
            label: '绩效月份', prop: 'applyDate', width: ''
          }, {
            label: '姓名', prop: 'appliedUserName', width: ''
          }, {
            label: '上传时间', prop: '_createTime', width: ''
          }, {
            label: '表扬明细', prop: 'praiseRemark', width: '300px'
          }, {
            label: '更新时间', prop: '_updateTime', width: ''
          }, {
            label: '创建人', prop: 'createByName', width: ''
          }, {
            label: '审核人', prop: 'auditByName', width: ''
          }, {
            label: '审核状态', prop: '_praiseStatus', width: ''
          }, {
            label: '表扬类型', prop: '_praiseType', width: ''
          }
        ], // table表格配置项
        tableData: [], // table数据列表
        addForm: {
          appliedUserId: '',
          appliedUserName: '', // 姓名
          callSessionId: '', // 通话ID/会话ID
          orderId: '', // 订单号
          orderTime: '', // 订单时间
          userPhoneId: '', // 用户ID
          incomingPhoneNum: '', // 进线号码
          chatVoiceRecord: '', // 聊天记录/语音记录
          praiseRemark: '' // 表扬描述
        }, // 新增表扬表单
        auditForm: {
          id: '',
          applyDate: '', // 绩效月份
          praiseStatus: '', // 审核状态
          praiseType: '', // 表扬类型
          auditRemark: '' // 审核描述
        }, // 审核表扬表单
        formLabelWidth: '132px', // 表单标签宽度
        praiseStatusList: [ // 审核状态：1待审核，2审核通过，3审核不通过，4拒回
          { value: 1, label: '待审核' },
          { value: 2, label: '审核通过' },
          { value: 3, label: '审核不通过' },
          { value: 4, label: '拒回' }
        ],
        dialogPraiseStatusList: [ // 审核状态：1审核通过，2审核不通过，3拒回
          { value: 2, label: '审核通过' },
          { value: 3, label: '审核不通过' },
          { value: 4, label: '拒回' }
        ],
        praiseTypeList: [ // 表扬类型：1普通表扬，2来电表扬，3外部表扬
          { value: 1, label: '普通表扬' },
          { value: 2, label: '来电表扬' },
          { value: 3, label: '外部表扬' },
          { value: 0, label: '--' }
        ],
        rules: {
          appliedUserId: [
            { required: true, message: '请选择姓名', trigger: 'change' }
          ],
          applyDate: [
            { required: true, message: '请选择绩效月份', trigger: 'change' }
          ],
          praiseStatus: [
            { required: true, message: '请选择审核状态', trigger: 'change' }
          ]
        },
        dialogTitle: '',
        appliedUserList: [],
        appliedUserId: '', // 新增弹窗姓名
        csaOrgId: '', // 组织id
        userEmail: '', // 用户的email
        iDeleteItemId: '' // 删除数据id
      }
    },
    created() {
      this.selectPraiseApplyList(this.pageNumber)
      this.getUser()
    },
    methods: {
      getUser() {
        return new Promise((resolve, reject) => {
          getUser().then((res) => {
            this.userEmail = res.data.email
            this.csaOrgId = res.data.csaOrgId
            resolve(res)
          }).catch((error) => {
            reject(error)
          })
        })
      },
      /**
       * 查询表扬列表
       * */
      selectPraiseApplyList(pageNumber) {
        const _this = this
        this.loading = true
        this.queryForm.pageNumber = pageNumber || this.pageNumber
        if (!this.queryForm.applyDate) {
          this.queryForm.applyDate = ''
        }
        if (this.queryForm.applyDate !== '') {
          this.queryForm.applyDate = formatDateByTimestamp(new Date(this.queryForm.applyDate) * 1, 'yyyy-MM')
        }
        if (this.$refs.orgTree) {
          const aOrgTree = this.$refs.orgTree.selectedOptions
          this.queryForm.orgId = ''
          if (aOrgTree && aOrgTree.length > 0) {
            this.queryForm.orgId = aOrgTree[aOrgTree.length - 1]
          }
        }
        return new Promise((resolve, reject) => {
          selectPraiseApplyList(this.queryForm).then((res) => {
            _this.loading = false
            if (res.rows && res.rows.length > 0) {
              _this.tableData = res.rows.map((item, index) => {
                // todo: 处理上传时间，审核时间，申请状态，表扬类型
                return Object.assign({}, item, {
                  _createTime: formatDateByTimestamp(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss'),
                  _updateTime: formatDateByTimestamp(new Date(item.updateTime), 'yyyy-MM-dd hh:mm:ss'),
                  _praiseStatus: _this.praiseStatusList.find(cur => {
                    return cur.value === item.praiseStatus
                  }).label,
                  _praiseType: _this.praiseTypeList.find(cur => {
                    return cur.value === item.praiseType
                  }).label
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
       * 显示新增表扬弹窗
       * @handle: 为查看操作添加
       */
      showAddForm(row, handle) {
        this.dialogAddFormVisible = true
        this.$store.dispatch('GetUserId2NameMap')
        if (row && row.id) {
          this.addForm = {
            id: row.id,
            appliedUserId: row.appliedUserName,
            appliedUserName: row.appliedUserName, // 姓名
            callSessionId: row.callSessionId, // 通话ID/会话ID
            orderId: row.orderId, // 订单号
            orderTime: row.orderTime, // 订单时间
            userPhoneId: row.userPhoneId, // 用户ID
            incomingPhoneNum: row.incomingPhoneNum, // 进线号码
            chatVoiceRecord: row.chatVoiceRecord, // 聊天记录/语音记录
            praiseRemark: row.praiseRemark // 表扬描述
          }
          if (handle && handle === 'view') {
            this.addForm.bShowButton = true
            this.dialogTitle = '查看表扬'
          } else {
            this.addForm.bShowButton = false
            this.dialogTitle = '修改表扬'
          }
          this.$refs['addForm'] && this.$refs['addForm'].resetFields()
        } else {
          this.addForm = {
            id: '',
            appliedUserId: '',
            appliedUserName: '', // 姓名
            callSessionId: '', // 通话ID/会话ID
            orderId: '', // 订单号
            orderTime: '', // 订单时间
            userPhoneId: '', // 用户ID
            incomingPhoneNum: '', // 进线号码
            chatVoiceRecord: '', // 聊天记录/语音记录
            praiseRemark: '' // 表扬描述
          }
          this.dialogTitle = '新增表扬'
        }
        this.$refs.orgTree.selectedOptions = []
      },

      /**
       * 提交新增/编辑表扬表单
       * 校验表单必填项是否通过
       */
      submitAddForm(form) {
        const _this = this
        this.$refs[form].validate((valid) => {
          if (valid) {
            const params = {
              callSessionId: _this.addForm.callSessionId, // 通话ID/会话ID
              orderId: _this.addForm.orderId, // 订单号
              orderTime: _this.addForm.orderTime, // 订单时间
              userPhoneId: _this.addForm.userPhoneId, // 用户id
              incomingPhoneNum: _this.addForm.incomingPhoneNum, // 进线号码
              chatVoiceRecord: _this.addForm.chatVoiceRecord, // 聊天记录
              praiseRemark: _this.addForm.praiseRemark // 表扬描述
            }
            if (_this.addForm.id) {
              params.id = _this.addForm.id // 申请人id
              params.isDelete = 0 // 是否删除：0否，1是
            } else {
              params.appliedUserId = _this.addForm.appliedUserId // 被申请人id
            }
            return new Promise((resolve, reject) => {
              // 有id表示更新
              if (_this.addForm.id) {
                updatePraiseApply(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.selectPraiseApplyList(_this.pageNumber)
                  resolve(res)
                  this.$message({
                    message: res.rspMsg,
                    type: res.rspCode === _this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                    showClose: true
                  })
                }).catch(error => {
                  reject(error)
                })
              } else {
                savePraiseApply(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.selectPraiseApplyList(_this.pageNumber)
                  _this.$message({
                    message: res.rspMsg,
                    type: res.rspCode === _this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                    showClose: true
                  })
                  resolve(res)
                }).catch(error => {
                  reject(error)
                })
              }
            })
          }
        })
      },

      /**
       * 获取会话id
       */
      getCallSessionId() {
        // const _this = this
        // const params = {
        //   callSessionId: this.addForm.callSessionId
        // }
        // return new Promise((resolve, reject) => {
        //   updatePraiseApply(params).then(res => {
        //     _this.dialogAddFormVisible = false
        //     _this.form = {
        //       orderId: res.orderId, // 订单号
        //       orderTime: res.orderTime, // 订单时间
        //       userPhoneId: res.userPhoneId, // 用户id
        //       incomingPhoneNum: res.incomingPhoneNum, // 进线号码
        //       chatVoiceRecord: res.chatVoiceRecord // 聊天记录
        //     }
        //     this.selectPraiseApplyList()
        //     resolve(res)
        //   }).catch(error => {
        //     reject(error)
        //   })
        // })
      },

      /**
       * 重置查询输入项
       */
      resetQueryForm(form) {
        this.$refs[form].resetFields()
        this.$refs.orgTree.selectedOptions = []
        this.queryForm = {
          orgId: '',
          applyDate: '',
          pageNumber: 1,
          pageSize: 10
        }
        this.selectPraiseApplyList(this.pageNumber)
      },

      /**
       * 取消新增表扬
       * 关闭弹窗
       * 清空表单输入项
       */
      cancelAddForm(form) {
        this.dialogAddFormVisible = false
        this.addForm.bShowButton = true
        this.$refs[form].resetFields()
      },

      /**
       * 显示审核表扬弹窗
       * id：当前选中行id
       */
      showAuditForm(row) {
        this.auditForm = {
          id: row.id, // 记录当前选中数据的id，给提交审核表扬时使用
          appliedUserName: row.appliedUserName,
          callSessionId: row.callSessionId,
          orderId: row.orderId,
          orderTime: formatDateByTimestamp(row.orderTime, 'yyyy-MM-dd hh:mm:ss'),
          userPhoneId: row.userPhoneId,
          incomingPhoneNum: row.incomingPhoneNum,
          chatVoiceRecord: row.chatVoiceRecord,
          praiseRemark: row.praiseRemark
        }
        // 列表返回状态是审核不通过，并且登录用户是颜琴琴去掉弹窗审核下拉框的  审核不通过  选项
        if (row.praiseRemark === 2 && this.userEmail === 'yanqq@133.cn') {
          this.dialogPraiseStatusList = [ // 审核状态：1审核通过，2审核不通过，3拒回
            { value: 2, label: '审核通过' },
            { value: 4, label: '拒回' }
          ]
        }
        this.dialogAuditFormVisible = true
        this.$refs.orgTree.selectedOptions = []
        this.$refs['queryForm'].resetFields()
      },

      /**
       * 提交审核表扬表单
       * 校验表单必填项是否通过
       */
      submitAuditForm(form) {
        const _this = this
        this.$refs[form].validate((valid) => {
          if (valid) {
            const params = {
              id: _this.auditForm.id, // 当前选中数据id
              applyDate: formatDateByTimestamp(new Date(_this.auditForm.applyDate) * 1, 'yyyy-MM'), // 绩效月份
              praiseType: _this.auditForm.praiseType, // 表扬类型
              praiseStatus: _this.auditForm.praiseStatus // 申请状态
            }
            return new Promise((resolve, reject) => {
              auditPraiseApply(params).then(res => {
                _this.dialogAuditFormVisible = false
                _this.selectPraiseApplyList(_this.pageNumber)
                _this.$refs[form].resetFields()
                this.$message({
                  message: res.rspMsg,
                  type: res.rspCode === this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
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
       * 展示删除弹窗
       */
      showDeleteDialog(row) {
        this.dialogDeleteVisible = true
        this.iDeleteItemId = row.id // 记录要删除项id，做删除操作时使用
      },

      /**
       * 删除数据弹窗
       */
      deleteItem() {
        const _this = this
        const params = {
          id: this.iDeleteItemId,
          isDelete: 1 // 是否删除：0否，1是
        }
        return new Promise((resolve, reject) => {
          updatePraiseApply(params).then(res => {
            _this.dialogDeleteVisible = false
            _this.selectPraiseApplyList(_this.pageNumber)
            this.$message({
              message: res.rspMsg,
              type: res.rspCode === this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
              showClose: true
            })
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },

      /**
       * 关闭弹窗
       */
      handleClose(id) {

      },

      /**
       * 取消审核表扬
       * 关闭弹窗
       * 清空表单输入项
       */
      cancelAuditForm(form) {
        this.dialogAuditFormVisible = false
        this.$refs[form] && this.$refs[form].resetFields()
      },
      handleSizeChange(val) {
        this.queryForm.pageSize = val
        this.selectPraiseApplyList(val)
      },
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.selectPraiseApplyList(val)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/kpi/praise";
</style>
