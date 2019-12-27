<template>
  <el-row class="user-relation-container">
    <el-row class="urc-form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="pc-form">
        <el-form-item label="绩效月份：" prop="trainingDate">
          <el-date-picker
            v-model="queryForm.manageDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="带教姓名：" prop="trainingLecturerName">
          <el-select v-model="queryForm.managerUserId" filterable placeholder="请选择姓名" clearable>
            <el-option
              v-for="(item, index) in $store.state.userStore.appliedUserList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="新员工姓名：" prop="trainingLecturerName">
          <el-select v-model="queryForm.beManagerId" filterable placeholder="请选择姓名" clearable>
            <el-option
              v-for="(item, index) in $store.state.userStore.appliedUserList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="管理类型：" prop="relationType">
          <el-select v-model="queryForm.relationType" placeholder="管理类型" clearable>
            <el-option v-for="(item, index) in relationTypeList"
                       v-if="item.value != 0"
                       :key="index"
                       :label=item.label
                       :value=item.value>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="selectUserRelationList(pageNumber)" :loading="loading">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showAddForm">新增</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <el-row class="urc-table-wrapper">
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
          width="200">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddForm(scope.row)" :disabled="scope.row.relationType === 2">编辑</el-button>
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
        class="user-relation-page">
      </el-pagination>
      <!-- END table数据列表 -->
    </el-row>
    <!-- 新增/编辑弹窗 start -->
    <el-dialog :title=dialogTitle class="add-dialog" :visible.sync="dialogAddFormVisible" width="27%">
      <el-form :model="addForm" ref="addForm" :rules="rules">
        <el-form-item label="绩效月份" prop="manageDate" :label-width="formLabelWidth">
          <el-date-picker
            v-model="addForm.manageDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="类别" prop="relationType" :label-width="formLabelWidth">
          <el-select v-model="addForm.relationType" placeholder="类别" clearable>
            <el-option v-for="(item, index) in dialogRelationTypeList"
                       :key="index"
                       :label=item.label
                       :value=item.value>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="带教/质检姓名" prop="managerUserId" :label-width="formLabelWidth">
          <el-select v-model="addForm.managerUserId" filterable placeholder="请选择姓名" clearable>
            <el-option
              v-for="(item, index) in $store.state.userStore.appliedUserList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="被管理人姓名" prop="beManagerId" :label-width="formLabelWidth">
          <el-select v-model="addForm.beManagerId" filterable placeholder="请选择姓名" clearable>
            <el-option
              v-for="(item, index) in $store.state.userStore.appliedUserList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddForm('addForm')">取 消</el-button>
        <el-button type="primary" @click="submitAddForm('addForm')">提 交</el-button>
      </div>
    </el-dialog>
    <!-- 新增/编辑弹窗 end -->
    <!-- 删除弹窗 start -->
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
    <!-- 删除弹窗 end -->
  </el-row>
</template>
<script>
  import { formatDateByTimestamp } from '@/utils'
  import { selectUserRelationList, saveUserRelation, updateUserRelation } from '@/api/kpi/user-relation-api'
  import orgTree from '../../common/orgTree'

  export default {
    components: { orgTree },
    data() {
      return {
        queryForm: {
          manageDate: '', // 绩效月份
          managerUserId: '', // 管理人员id
          beManagerId: '', // 被管理人员id
          relationType: '', // 管理类型：1培训，2质检，3带教（当类型为质检时，be_manager_id为组id）
          pageNumber: 1, // 当前页
          pageSize: 10 // 每页行数
        }, // 查询列表表单
        loading: false,
        pageNumber: 1, // 默认查询第1页
        dialogAddFormVisible: false, // 是否显示新增培训弹窗
        dialogAuditFormVisible: false, // 是否显示审核培训弹窗
        dialogDeleteVisible: false, // 是否显示删除弹窗
        // 绩效月份 姓名 培训讲师 上传人 培训开始时间 培训时长 录入时间 审核时间 审核人 审核状态
        tableConfigItems: [
          {
            label: '绩效月份', prop: 'manageDate', width: ''
          }, {
            label: '带教姓名', prop: 'managerUserName', width: ''
          }, {
            label: '被管理人', prop: 'beManagerName', width: ''
          }, {
            label: '管理类型', prop: '_relationType', width: ''
          }, {
            label: '创建人', prop: 'createByName', width: ''
          }, {
            label: '创建时间', prop: '_createTime', width: ''
          }
        ], // table表格配置项
        tableData: [], // table数据列表
        addForm: {
          manageDate: '', // 绩效月份
          managerUserId: '', // 管理人员id
          beManagerId: '', // 被管理人员id
          relationType: '' // 管理类型：1培训，2质检，3带教（当类型为质检时，be_manager_id为组id）
        }, // 新增培训表单
        formLabelWidth: '132px', // 表单标签宽度
        rules: {
          manageDate: [
            { required: true, message: '请选择绩效月份', trigger: 'change' }
          ],
          relationType: [
            { required: true, message: '请选择类别', trigger: 'change' }
          ],
          managerUserId: [
            { required: true, message: '请选择带教人', trigger: 'change' }
          ],
          beManagerId: [
            { required: true, message: '请选择被管理人', trigger: 'change' }
          ]
        },
        relationTypeList: [ // 管理类型：1培训，2质检，3带教（当类型为质检时，be_manager_id为组id）
          { value: 1, label: '培训' },
          { value: 2, label: '质检' },
          { value: 3, label: '带教' }
        ],
        dialogRelationTypeList: [ // 管理类型：1培训，2质检，3带教（当类型为质检时，be_manager_id为组id）
          { value: 1, label: '培训' },
          { value: 3, label: '带教' }
        ],
        dialogTitle: '',
        appliedUserId: '', // 新增弹窗姓名
        iDeleteItemId: '' // 删除数据id
      }
    },
    created() {
      this.selectUserRelationList(this.pageNumber)
      this.$store.dispatch('GetUserId2NameMap')
    },
    methods: {
      /**
       * 查询培训列表
       * */
      selectUserRelationList(pageNumber) {
        const _this = this
        this.loading = true
        this.queryForm.pageNumber = pageNumber || this.pageNumber
        if (!this.queryForm.manageDate) {
          this.queryForm.manageDate = ''
        }
        if (this.queryForm.manageDate !== '') {
          this.queryForm.manageDate = formatDateByTimestamp(new Date(this.queryForm.manageDate) * 1, 'yyyy-MM')
        }
        return new Promise((resolve, reject) => {
          selectUserRelationList(_this.queryForm).then((res) => {
            _this.loading = false
            if (res.rows && res.rows.length > 0) {
              _this.tableData = res.rows.map((item, index) => {
                // todo: 处理上传时间，审核时间，申请状态，培训类型
                return Object.assign({}, item, {
                  _createTime: formatDateByTimestamp(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss'),
                  _relationType: _this.relationTypeList.find(cur => {
                    return cur.value === item.relationType
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
       * 显示新增培训弹窗
       */
      showAddForm(row) {
        this.dialogAddFormVisible = true
        if (row && row.id) {
          this.addForm = {
            id: row.id,
            manageDate: row.manageDate,
            managerUserId: row.managerUserName,
            beManagerId: row.beManagerName,
            relationType: row.relationType
          }
          this.dialogTitle = '修改'
        } else {
          this.addForm = {
            manageDate: '', // 绩效月份
            managerUserId: '', // 管理人员id
            beManagerId: '', // 被管理人员id
            relationType: '' // 管理类型：1培训，2质检，3带教（当类型为质检时，be_manager_id为组id）
          }
          this.dialogTitle = '新增'
        }
        this.$store.dispatch('GetUserId2NameMap')
        this.$refs['queryForm'].resetFields()
      },

      /**
       * 提交新增/编辑培训表单
       * 校验表单必填项是否通过
       */
      submitAddForm(form) {
        const _this = this
        this.$refs[form].validate((valid) => {
          if (valid) {
            const params = {
              manageDate: formatDateByTimestamp(_this.addForm.manageDate, 'yyyy-MM'), // 培训月份
              managerUserId: _this.addForm.managerUserId, // 管理人员id
              beManagerId: _this.addForm.beManagerId, // 被管理人员id
              relationType: _this.addForm.relationType // 管理类型
            }
            if (_this.addForm.id) {
              params.id = _this.addForm.id // 申请人id
              params.isDelete = 0 // 是否删除：0否，1是
            }
            return new Promise((resolve, reject) => {
              // 有id表示更新
              if (_this.addForm.id) {
                updateUserRelation(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.$refs[form].resetFields()
                  _this.selectUserRelationList(_this.pageNumber)
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
                saveUserRelation(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.$refs[form].resetFields()
                  _this.selectUserRelationList(_this.pageNumber)
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
        //     this.selectUserRelationList()
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
        this.queryForm = {
          orgId: '',
          applyDate: '',
          pageNumber: 1,
          pageSize: 20
        }
        this.selectUserRelationList(this.pageNumber)
      },

      /**
       * 取消新增培训
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
        this.addForm = {
          managerUserId: row.managerUserId,
          beManagerId: row.beManagerId,
          relationType: row.relationType
        }
      },

      /**
       * 删除数据弹窗
       */
      deleteItem() {
        const _this = this
        const params = {
          id: this.iDeleteItemId,
          isDelete: 1
        }

        return new Promise((resolve, reject) => {
          updateUserRelation(params).then(res => {
            _this.dialogDeleteVisible = false
            _this.selectUserRelationList(_this.pageNumber)
            resolve(res)
            _this.$message({
              message: res.rspMsg,
              type: res.rspCode === _this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
              showClose: true
            })
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

      // 初始页currentPage、初始每页数据数pagesize和数据data
      handleSizeChange(val) {
        this.queryForm.pagesize = val
        this.selectUserRelationList(val)
      },
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.selectUserRelationList(val)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/kpi/user-relation";
</style>
