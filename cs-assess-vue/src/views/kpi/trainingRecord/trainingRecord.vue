<template>
  <el-row class="training-record-container">
    <el-row class="trc-form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="pc-form">
        <el-form-item label="绩效月份：" prop="trainingDate">
          <el-date-picker
            v-model="queryForm.trainingDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="培训讲师：" prop="trainingLecturerName">
          <el-select v-model="queryForm.trainingLecturer" filterable placeholder="请选择培训讲师" clearable>
            <el-option
              v-for="(item, index) in $store.state.userStore.appliedUserList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态：" prop="trainingAuditStatus">
          <el-select v-model="queryForm.trainingAuditStatus" placeholder="审核状态" clearable>
            <el-option v-for="(item, index) in trainingAuditStatusList"
                       v-if="item.value !== 0"
                       :key="index"
                       :label=item.label
                       :value=item.value>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="selectTrainingRecordList(pageNumber)" :loading="loading">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showAddForm">新增</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <el-row class="trc-table-wrapper">
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
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddForm(scope.row)" :disabled="scope.row.trainingAuditStatus === 2">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteDialog(scope.row)" :disabled="scope.row.trainingAuditStatus === 2">删除</el-button>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAuditForm(scope.row)" :disabled="scope.row.trainingAuditStatus === 2">审核</el-button>
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
        class="training-record-page">
      </el-pagination>
      <!-- END table数据列表 -->
    </el-row>
    <!-- 新增/编辑培训弹窗 start -->
    <el-dialog :title=dialogTitle class="add-dialog" :visible.sync="dialogAddFormVisible" width="40%">
      <el-form :model="addForm" ref="addForm" :rules="rules">
        <el-form-item label="绩效月份" prop="trainingDate" :label-width="formLabelWidth">
          <el-date-picker
            v-model="addForm.trainingDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="参训人" prop="trainedUserIds" :label-width="formLabelWidth">
          <el-transfer
            filterable
            :filter-method="addForm.filterMethod"
            filter-placeholder="请输入编号或姓名"
            v-model="addForm.trainedUserIds"
            :titles="['可选择', '已选择']"
            :data="$store.state.userStore.appliedUserList">
          </el-transfer>
        </el-form-item>
        <el-form-item label="培训讲师" prop="trainingLecturer" :label-width="formLabelWidth">
          <el-select v-model="addForm.trainingLecturer" filterable placeholder="请选择发起人" clearable>
            <el-option
              v-for="(item, index) in $store.state.userStore.appliedUserList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="培训时间" prop="trainingBeginTime" :label-width="formLabelWidth">
          <el-date-picker
            v-model="addForm.trainingBeginTime"
            value-format="timestamp"
            type="datetime"
            placeholder="请选择订单日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="培训时长" prop="trainingDuration" :label-width="formLabelWidth">
          <el-input v-model="addForm.trainingDuration">
            <template slot="append">分</template>
          </el-input>
        </el-form-item>
        <el-form-item label="培训主题" prop="trainingTheme" :label-width="formLabelWidth">
          <el-input v-model="addForm.trainingTheme" clearable></el-input>
        </el-form-item>
        <el-form-item label="培训内容" prop="trainingContent" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="addForm.trainingContent" clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddForm('addForm')">取 消</el-button>
        <el-button type="primary" @click="submitAddForm('addForm')">提 交</el-button>
      </div>
    </el-dialog>
    <!-- 新增/编辑培训弹窗 end -->
    <!-- 审核培训弹窗 start -->
    <el-dialog title="审核培训" class="audit-dialog" :visible.sync="dialogAuditFormVisible" width="40%">
      <el-form :model="auditForm" ref="auditForm" :rules="rules">
        <el-form-item label="绩效月份" prop="applyDate" :label-width="formLabelWidth">
          <el-date-picker
            v-model="auditForm.trainingDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="参训人" :label-width="formLabelWidth">
          <el-transfer
            filterable
            :filter-method="auditForm.filterMethod"
            filter-placeholder="请输入编号或姓名"
            v-model="auditForm.trainedUserIds"
            :titles="['可选择', '已选择']"
            :data="$store.state.userStore.appliedUserList">
          </el-transfer>
        </el-form-item>
        <el-form-item label="发起人" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="auditForm.trainingLecturerName"></el-input>
        </el-form-item>
        <el-form-item label="培训时间" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="auditForm.trainingBeginTime"></el-input>
        </el-form-item>
        <el-form-item label="培训主题" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="auditForm.trainingTheme"></el-input>
        </el-form-item>
        <el-form-item label="培训内容" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="auditForm.trainingContent"></el-input>
        </el-form-item>
        <el-form-item label="审核状态" prop="trainingAuditStatus" :label-width="formLabelWidth">
          <el-select v-model="auditForm.trainingAuditStatus" placeholder="请选择审核状态">
            <el-option v-for="(item, index) in dialogTrainingAuditStatusList"
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
    <!-- 审核培训弹窗 end -->
    <!-- 删除培训弹窗 start -->
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
    <!-- 删除培训弹窗 end -->
  </el-row>
</template>
<script>
  import { formatDateByTimestamp } from '@/utils'
  import { selectTrainingRecordList, saveTrainingRecord, updateTrainingRecord, auditTrainingRecord } from '@/api/kpi/training-record-api'
  import orgTree from '../../common/orgTree'

  export default {
    components: { orgTree },
    data() {
      return {
        queryForm: {
          trainingDate: '', // 绩效月份
          trainingLecturer: '', // 姓名
          trainingAuditStatus: '', // 审核状态
          pageNumber: 1, // 页码
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
            label: '绩效月份', prop: 'trainingDate', width: ''
          }, {
            label: '参训人', prop: 'trainedUserNames', width: ''
          }, {
            label: '培训讲师', prop: 'trainingLecturerName', width: ''
          }, {
            label: '培训开始时间', prop: '_trainingBeginTime', width: ''
          }, {
            label: '培训时长', prop: 'trainingDuration', width: ''
          }, {
            label: '创建人', prop: 'createByName', width: ''
          }, {
            label: '创建时间', prop: '_createTime', width: ''
          }, {
            label: '更新人', prop: 'auditByName', width: ''
          }, {
            label: '更新时间', prop: '_updateTime', width: ''
          }, {
            label: '审核状态', prop: '_trainingAuditStatus', width: '' // 1待审核，2审核通过，3审核未通过
          }
        ], // table表格配置项
        tableData: [], // table数据列表
        addForm: {
          trainingDate: '', // 培训月份（必填）
          trainedUserIds: [], // 参训人id（必填）
          trainingLecturer: '', // 培训讲师（必填）
          trainingBeginTime: '', // 培训开始时间（必填）
          trainingDuration: '', // 培训持续时间（必填）
          trainingTheme: '', // 培训主题（必填）
          trainingContent: '', // 培训内容（必填）
          filterMethod(query, item) {
            return item.label.indexOf(query) > -1
          }
        }, // 新增培训表单
        auditForm: {
          id: '',
          trainingDate: '', // 培训月份（必填）
          trainedUserIds: [], // 参训人id（必填）
          trainingLecturer: '', // 培训讲师（必填）
          trainingBeginTime: '', // 培训开始时间（必填）
          trainingDuration: '', // 培训持续时间（必填）
          trainingTheme: '', // 培训主题（必填）
          trainingContent: '', // 培训内容（必填）
          trainingAuditStatus: '' // 培训审核状态：1待审核，2审核通过，3审核未通过
        }, // 审核表扬表单
        formLabelWidth: '132px', // 表单标签宽度
        rules: {
          trainingDate: [
            { required: true, message: '请选择培训月份', trigger: 'change' }
          ],
          trainedUserIds: [
            { required: true, message: '请选择参训人', trigger: 'blur' }
          ],
          trainingLecturer: [
            { required: true, message: '请输入培训讲师', trigger: 'change' }
          ],
          trainingBeginTime: [
            { required: true, message: '请选择培训开始时间', trigger: 'change' }
          ],
          trainingDuration: [
            { required: true, message: '请选择培训持续时间', trigger: 'blur' }
          ],
          trainingTheme: [
            { required: true, message: '请输入培训主题', trigger: 'blur' }
          ],
          trainingContent: [
            { required: true, message: '请输入培训内容', trigger: 'blur' }
          ]
        },
        trainingAuditStatusList: [ // 审核状态：1待审核，2审核通过，3审核未通过
          { value: 1, label: '待审核' },
          { value: 2, label: '审核通过' },
          { value: 3, label: '审核未通过' },
          { value: 0, label: '--' }
        ],
        dialogTrainingAuditStatusList: [ // 审核状态：1待审核，2审核通过，3审核未通过
          { value: 2, label: '审核通过' },
          { value: 3, label: '审核不通过' }
        ],
        _trainingLecturer: '',
        trainingAuditStatus: '',
        dialogTitle: '',
        appliedUserId: '', // 新增弹窗姓名
        iDeleteItemId: '' // 删除数据id
      }
    },
    created() {
      this.selectTrainingRecordList(this.pageNumber)
      this.$store.dispatch('GetUserId2NameMap')
    },
    methods: {
      /**
       * 查询培训列表
       * */
      selectTrainingRecordList(pageNumber) {
        const _this = this
        this.loading = true
        this.queryForm.pageNumber = pageNumber || this.pageNumber
        if (!this.queryForm.trainingDate) {
          this.queryForm.trainingDate = ''
        }
        if (this.queryForm.trainingDate !== '') {
          this.queryForm.trainingDate = formatDateByTimestamp(new Date(this.queryForm.trainingDate) * 1, 'yyyy-MM')
        }
        return new Promise((resolve, reject) => {
          selectTrainingRecordList(_this.queryForm).then((res) => {
            _this.loading = false
            if (res.rows && res.rows.length > 0) {
              _this.tableData = res.rows.map((item, index) => {
                // todo: 处理上传时间，审核时间，申请状态，培训类型
                return Object.assign({}, item, {
                  _createTime: formatDateByTimestamp(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss'),
                  _updateTime: formatDateByTimestamp(new Date(item.updateTime), 'yyyy-MM-dd hh:mm:ss'),
                  _trainingBeginTime: formatDateByTimestamp(new Date(item.trainingBeginTime), 'yyyy-MM-dd hh:mm:ss'),
                  _trainingAuditStatus: _this.trainingAuditStatusList.find(cur => {
                    return cur.value === item.trainingAuditStatus
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
            trainingDate: row.trainingDate,
            trainedUserIds: row.trainedUserIds.split('/'),
            trainingLecturer: row.trainingLecturerName,
            trainingBeginTime: row.trainingBeginTime,
            trainingDuration: row.trainingDuration,
            trainingTheme: row.trainingTheme,
            trainingContent: row.trainingContent,
            trainingAuditStatus: row.trainingContent
          }
          this._trainingLecturer = row.trainingLecturer
          this.dialogTitle = '修改培训'
        } else {
          this.addForm = {
            trainingDate: '',
            trainedUserIds: [],
            trainingLecturer: '',
            trainingBeginTime: '',
            trainingDuration: '',
            trainingTheme: '',
            trainingContent: '',
            trainingAuditStatus: ''
          }
          this.dialogTitle = '新增培训'
        }
        this.$refs['queryForm'].resetFields()
        this.$store.dispatch('GetUserId2NameMap')
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
              trainingDate: formatDateByTimestamp(_this.addForm.trainingDate, 'yyyy-MM'), // 培训月份
              trainedUserIds: _this.addForm.trainedUserIds.join('/'), // 参训人id
              trainingLecturer: _this._trainingLecturer, // 培训讲师
              trainingBeginTime: _this.addForm.trainingBeginTime, // 培训开始时间
              trainingDuration: _this.addForm.trainingDuration, // 培训持续时间
              trainingTheme: _this.addForm.trainingTheme, // 培训主题
              trainingContent: _this.addForm.trainingContent // 培训内容
            }
            if (_this.addForm.id) {
              params.id = _this.addForm.id // 申请人id
              params.isDelete = 0 // 是否删除：0否，1是
            } else {
              params.trainingLecturer = _this.addForm.trainingLecturer
            }
            return new Promise((resolve, reject) => {
              // 有id表示更新
              if (_this.addForm.id) {
                updateTrainingRecord(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.$refs[form].resetFields()
                  _this.selectTrainingRecordList(_this.pageNumber)
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
                saveTrainingRecord(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.$refs[form].resetFields()
                  _this.selectTrainingRecordList(_this.pageNumber)
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
        //     this.selectTrainingRecordList()
        //     resolve(res)
        //   }).catch(error => {
        //     reject(error)
        //   })
        // })
      },

      /**
       * 显示审核表扬弹窗
       * id：当前选中行id
       */
      showAuditForm(row) {
        let _trainingAuditStatus = ''
        switch (row.trainingAuditStatus) {
          case 0:
            _trainingAuditStatus = '无状态'
            break
          case 1:
            _trainingAuditStatus = '待审核'
            break
          case 3:
            _trainingAuditStatus = '审核不通过'
            break
        }
        this.auditForm = {
          id: row.id, // 记录当前选中数据的id，给提交审核表扬时使用
          trainingDate: row.trainingDate,
          trainedUserIds: row.trainedUserIds.split('/'),
          trainingLecturer: row.trainingLecturer,
          trainingLecturerName: row.trainingLecturerName,
          trainingBeginTime: row.trainingBeginTime,
          trainingDuration: row.trainingDuration,
          trainingTheme: row.trainingTheme,
          trainingContent: row.trainingContent,
          trainingAuditStatus: _trainingAuditStatus
        }
        this.dialogAuditFormVisible = true
        this.$refs['queryForm'].resetFields()
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
              trainingDate: formatDateByTimestamp(new Date(_this.auditForm.trainingDate) * 1, 'yyyy-MM'), // 培训月份
              trainingAuditStatus: _this.auditForm.trainingAuditStatus // 培训审核状态
            }
            return new Promise((resolve, reject) => {
              auditTrainingRecord(params).then(res => {
                _this.dialogAuditFormVisible = false
                this.$message({
                  message: res.rspMsg,
                  type: res.rspCode === this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                  showClose: true
                })
                _this.selectTrainingRecordList(_this.pageNumber)
                _this.$refs[form].resetFields()
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
          orgId: '',
          applyDate: '',
          pageNumber: 1,
          pageSize: 20
        }
        this.selectTrainingRecordList(this.pageNumber)
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
          updateTrainingRecord(params).then(res => {
            _this.dialogDeleteVisible = false
            _this.selectTrainingRecordList(_this.pageNumber)
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
      },

      /**
       * 关闭弹窗
       */
      handleClose(id) {

      },
      handleSizeChange(val) {
        this.queryForm.pagesize = val
        this.selectTrainingRecordList(val)
      },
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.selectTrainingRecordList(val)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/kpi/training-record";
</style>
