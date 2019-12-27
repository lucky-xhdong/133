<template>
  <el-row class="mistake-container">
    <el-row class="mc-form-wrapper">
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
        <el-form-item label="姓名：" prop="userName">
          <el-input v-model="queryForm.userName" placeholder="姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="差错状态：" prop="mistakeStatus">
          <el-select v-model="queryForm.mistakeStatus" placeholder="差错状态" clearable>
            <el-option v-for="(item, index) in mistakeStatusList"
                       :key="index"
                       :label=item.label
                       :value=item.value>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="差错类型：" prop="mistakeType">
          <el-select v-model="queryForm.mistakeType" placeholder="差错类型" clearable>
            <el-option v-for="(item, index) in mistakeTypeList"
                       v-if="item.value != 0"
                       :key="index"
                       :label=item.label
                       :value=item.value>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="selectMistakeList(pageNumber)" :loading="loading">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
          <el-button type="primary" icon="el-icon-plus"  v-if="csaOrgId === 50 || userEmail === 'yanqq@133.cn'" @click="showAddForm">新增</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <el-row class="mc-table-wrapper">
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
          width="200" v-if="csaOrgId === 50 || userEmail === 'yanqq@133.cn'">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddForm(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteDialog(scope.row)">删除</el-button>
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
        class="mistake-page">
      </el-pagination>
      <!-- END table数据列表 -->
    </el-row>
    <!-- 新增/编辑差错弹窗 start -->
    <el-dialog :title=dialogTitle class="add-dialog" :visible.sync="dialogAddFormVisible" width="25%">
      <el-form :model="addForm" ref="addForm" :rules="rules">
        <el-form-item label="姓名" :label-width="formLabelWidth" v-if="addForm.id">
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
        <el-form-item label="绩效月份" prop="applyDate" :label-width="formLabelWidth">
          <el-date-picker
            v-model="addForm.applyDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="通话ID/会话ID" prop="callSessionId" :label-width="formLabelWidth">
          <el-input v-model="addForm.callSessionId" clearable></el-input>
          <!--<el-button type="default" class="btn-search-wrapper" @click="getCallSessionId">-->
            <!--<i class="el-icon el-icon-search"></i>-->
          <!--</el-button>-->
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
        <el-form-item label="差错类型" prop="mistakeType" :label-width="formLabelWidth">
          <el-select v-model="addForm.mistakeType" placeholder="差错类型" clearable>
            <el-option v-for="(item, index) in mistakeTypeList"
                       v-if="item.value != 0"
                       :key="index"
                       :label=item.label
                       :value=item.value>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="差错描述" prop="mistakeRemark" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="addForm.mistakeRemark" clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="submitAddForm('addForm', 'save')">保 存</el-button>
        <el-button type="primary" @click="submitAddForm('addForm', 'submit')">提 交</el-button>
      </div>
    </el-dialog>
    <!-- 新增/编辑差错弹窗 end -->
    <!-- 删除差错弹窗 start -->
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
    <!-- 删除差错弹窗 end -->
  </el-row>
</template>
<script>
  import { formatDateByTimestamp } from '@/utils'
  import { getUser } from '@/api/users/user-api'
  import { selectMistakeList, saveMistake, updateMistake } from '@/api/kpi/mistake-api'
  import orgTree from '../../common/orgTree'

  export default {
    components: { orgTree },
    data() {
      return {
        queryForm: {
          applyDate: '', // 绩效月份
          orgId: '', // 组织结构
          userName: '', // 姓名
          mistakeStatus: '', // 审核状态
          mistakeType: '', // 差错类型
          pageNumber: 1, // 页码
          pageSize: 20 // 每页行数
        }, // 查询列表表单
        pageNumber: 1, // 默认查询第1页
        loading: false,
        defaultMonth: formatDateByTimestamp(new Date() * 1, 'yyyy-MM'),
        dialogAddFormVisible: false, // 是否显示新增差错弹窗
        dialogDeleteVisible: false, // 是否显示删除弹窗
        tableConfigItems: [
          {
            label: '质检时间', prop: 'applyDate', width: ''
          }, {
            label: '用户名', prop: 'appliedUserName', width: ''
          }, {
            label: '订单号', prop: 'orderId', width: ''
          }, {
            label: '差错类型', prop: '_mistakeType', width: ''
          }, {
            label: '描述', prop: 'mistakeRemark', width: '300px'
          }, {
            label: '状态', prop: '_mistakeStatus', width: ''
          }, {
            label: '创建人', prop: 'createByName', width: ''
          }, {
            label: '创建时间', prop: '_createTime', width: ''
          }
        ], // table表格配置项
        tableData: [], // table数据列表
        addForm: {
          appliedUserId: '',
          applyDate: '', // 绩效月份
          appliedUserName: '', // 姓名
          callSessionId: '', // 通话ID/会话ID
          orderId: '', // 订单号
          orderTime: '', // 订单时间
          userPhoneId: '', // 用户ID
          incomingPhoneNum: '', // 进线号码
          chatVoiceRecord: '', // 聊天记录/语音记录
          mistakeType: '', // 差错类型
          mistakeRemark: '' // 差错描述
        }, // 新增差错表单
        formLabelWidth: '132px', // 表单标签宽度
        mistakeStatusList: [ // 申请状态：1草稿，2正常
          { value: 1, label: '草稿' },
          { value: 2, label: '正常' }
        ],
        mistakeTypeList: [ // 差错类型：1差错，2一般差错，3有效投诉，4一般重大投诉，5服务态度投诉，6承诺未达投诉，7一般外部投诉，8重大外部投诉
          { value: 1, label: '差错' },
          { value: 2, label: '一般差错' },
          { value: 3, label: '有效投诉' },
          { value: 4, label: '一般重大投诉' },
          { value: 5, label: '服务态度投诉' },
          { value: 6, label: '承诺未达投诉' },
          { value: 7, label: '一般外部投诉' },
          { value: 8, label: '重大外部投诉' }
        ],
        rules: {
          appliedUserId: [
            { required: true, message: '请选择姓名', trigger: 'change' }
          ],
          applyDate: [
            { required: true, message: '请选择绩效月份', trigger: 'change' }
          ],
          mistakeType: [
            { required: true, message: '请选择差错类型', trigger: 'change' }
          ],
          mistakeRemark: [
            { required: true, message: '请输入差错描述', trigger: 'blur' }
          ],
          mistakeStatus: [
            { required: true, message: '请选择审核状态', trigger: 'change' }
          ]
        },
        dialogTitle: '',
        appliedUserList: [],
        csaOrgId: '', // 组织id
        userEmail: '', // 用户的email
        appliedUserId: '', // 新增弹窗姓名
        iDeleteItemId: '' // 删除数据id
      }
    },
    created() {
      this.selectMistakeList(this.pageNumber)
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
       * 查询差错列表
       * */
      selectMistakeList(pageNumber) {
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
          selectMistakeList(_this.queryForm).then((res) => {
            _this.loading = false
            if (res.rows && res.rows.length > 0) {
              _this.tableData = res.rows.map((item, index) => {
                // todo: 处理上传时间，审核时间，申请状态，差错类型
                return Object.assign({}, item, {
                  _createTime: formatDateByTimestamp(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss'),
                  _updateTime: formatDateByTimestamp(new Date(item.updateTime), 'yyyy-MM-dd hh:mm:ss'),
                  _mistakeStatus: _this.mistakeStatusList.find(cur => {
                    return cur.value === item.mistakeStatus
                  }).label,
                  _mistakeType: _this.mistakeTypeList.find(cur => {
                    return cur.value === item.mistakeType
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
       * 显示新增差错弹窗
       */
      showAddForm(row) {
        this.dialogAddFormVisible = true
        this.$store.dispatch('GetUserId2NameMap')
        if (row && row.id) {
          this.addForm = {
            id: row.id,
            appliedUserId: row.appliedUserName,
            appliedUserName: row.appliedUserName, // 姓名
            applyDate: row.applyDate, // 姓名
            callSessionId: row.callSessionId, // 通话ID/会话ID
            orderId: row.orderId, // 订单号
            orderTime: row.orderTime, // 订单时间
            userPhoneId: row.userPhoneId, // 用户ID
            incomingPhoneNum: row.incomingPhoneNum, // 进线号码
            chatVoiceRecord: row.chatVoiceRecord, // 聊天记录/语音记录
            mistakeType: row.mistakeType, // 差错类型
            mistakeRemark: row.mistakeRemark // 差错描述
          }
          this.dialogTitle = '修改差错'
        } else {
          this.addForm = {
            id: '',
            appliedUserId: '',
            appliedUserName: '', // 姓名
            applyDate: '', // 姓名
            callSessionId: '', // 通话ID/会话ID
            orderId: '', // 订单号
            orderTime: '', // 订单时间
            userPhoneId: '', // 用户ID
            incomingPhoneNum: '', // 进线号码
            chatVoiceRecord: '', // 聊天记录/语音记录
            mistakeType: '', // 差错类型
            mistakeRemark: '' // 差错描述
          }
          this.dialogTitle = '新增差错'
        }
        this.$refs.orgTree.selectedOptions = []
      },

      /**
       * 提交新增/编辑差错表单
       * 校验表单必填项是否通过
       */
      submitAddForm(form, status) {
        const _this = this
        this.$refs[form].validate((valid) => {
          if (valid) {
            const params = {
              applyDate: formatDateByTimestamp(_this.addForm.applyDate, 'yyyy-MM'), // 绩效月份
              mistakeType: _this.addForm.mistakeType, // 差错类型
              callSessionId: _this.addForm.callSessionId, // 通话ID/会话ID
              orderId: _this.addForm.orderId, // 订单号
              orderTime: _this.addForm.orderTime, // 订单时间
              userPhoneId: _this.addForm.userPhoneId, // 用户id
              incomingPhoneNum: _this.addForm.incomingPhoneNum, // 进线号码
              chatVoiceRecord: _this.addForm.chatVoiceRecord, // 聊天记录
              mistakeRemark: _this.addForm.mistakeRemark // 差错描述
            }
            if (_this.addForm.id) {
              params.id = _this.addForm.id // 申请人id
              params.isDelete = 0 // 是否删除：0否，1是
            } else {
              params.appliedUserId = _this.addForm.appliedUserId // 被申请人id
            }
            if (status && status === 'save') {
              params.mistakeStatus = 1
            } else {
              params.mistakeStatus = 2
            }
            // debugger
            return new Promise((resolve, reject) => {
              // 有id表示更新
              if (_this.addForm.id) {
                updateMistake(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.selectMistakeList(_this.pageNumber)
                  _this.$message({
                    message: res.rspMsg,
                    type: res.rspCode === _this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                    showClose: true
                  })
                  resolve(res)
                }).catch(error => {
                  reject(error)
                })
              } else {
                saveMistake(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.selectMistakeList(_this.pageNumber)
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
        //   updatemistakeApply(params).then(res => {
        //     _this.dialogAddFormVisible = false
        //     _this.form = {
        //       orderId: res.orderId, // 订单号
        //       orderTime: res.orderTime, // 订单时间
        //       userPhoneId: res.userPhoneId, // 用户id
        //       incomingPhoneNum: res.incomingPhoneNum, // 进线号码
        //       chatVoiceRecord: res.chatVoiceRecord // 聊天记录
        //     }
        //     this.selectMistakeList()
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
          pageSize: 20
        }
        this.selectMistakeList(this.pageNumber)
      },

      /**
       * 取消新增差错
       * 关闭弹窗
       * 清空表单输入项
       */
      cancelAddForm(form) {
        this.dialogAddFormVisible = false
        this.$refs[form].resetFields()
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
          id: this.iDeleteItemId, // 申请id
          isDelete: 1 // 是否删除：0否，1是
        }
        return new Promise((resolve, reject) => {
          updateMistake(params).then(res => {
            _this.dialogDeleteVisible = false
            _this.selectMistakeList(_this.pageNumber)
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
      handleSizeChange(val) {
        this.queryForm.pagesize = val
        this.selectMistakeList(val)
      },
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.selectMistakeList(val)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/kpi/mistake";
</style>
