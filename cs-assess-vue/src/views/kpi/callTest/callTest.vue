<template>
  <el-row class="call-test-container">
    <el-row class="ctc-form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="pc-form">
        <el-form-item label="绩效月份：" prop="trainingDate">
          <el-date-picker
            v-model="queryForm.testDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="姓名：" prop="trainingLecturerName">
          <el-select v-model="queryForm.testUserId" filterable placeholder="请选择姓名" clearable>
            <el-option
              v-for="(item, index) in $store.state.userStore.appliedUserList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="测试状态：" prop="relationType">
          <el-select v-model="queryForm.testStatus" placeholder="测试状态" clearable>
            <el-option v-for="(item, index) in testStatusList"
                       :key="index"
                       :label=item.label
                       :value=item.key>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="selectCallTestList(pageNumber)" :loading="loading">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showAddForm">新增</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <el-row class="ctc-table-wrapper">
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
          width="100">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showViewForm(scope.row)">查看</el-button>
            <!--<el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddForm(scope.row)">编辑</el-button>-->
            <!--<el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteDialog(scope.row)">删除</el-button>-->
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
        class="call-test-page">
      </el-pagination>
      <!-- END table数据列表 -->
    </el-row>
    <!-- 新增/编辑弹窗 start -->
    <el-dialog :title=dialogTitle class="add-dialog" :visible.sync="dialogAddFormVisible" width="27%" :close-on-click-modal="false">
      <el-form :model="addForm" ref="addForm" :rules="addForm.rules">
        <el-form-item label="考核人员" prop="testUserId" :rules="addForm.rules.testUserId" :label-width="formLabelWidth">
          <el-select v-model="addForm.testUserId" filterable placeholder="请选择考核人" clearable>
            <el-option
              v-for="(item, index) in $store.state.userStore.appliedUserList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="考核月份" prop="testDate" :rules="addForm.rules.testDate" :label-width="formLabelWidth">
          <el-date-picker
            v-model="addForm.testDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="考核次数" prop="testIndex" :rules="addForm.rules.testIndex" :label-width="formLabelWidth">
          <el-select v-model="addForm.testIndex" placeholder="考核次数" clearable>
            <el-option v-for="(item, index) in testIndexList"
                       :key="index"
                       :label=item
                       :value=item>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="考核状态" prop="testStatus" :rules="addForm.rules.testStatus" :label-width="formLabelWidth">
          <el-select v-model="addForm.testStatus" placeholder="请选择考核状态" clearable>
            <el-option
              v-for="(item, index) in testStatusList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="testRemark" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="addForm.testRemark"></el-input>
        </el-form-item>

        <el-row class="el-form-questions">
          <el-form-item :prop='"callTestPapers." + (index) + ".questionTitle"'
                        :label='(index+1) + "."'
                        v-for="(item, index) in addForm.callTestPapers"
                        :key="index"
                        :rules="{required: true, message: addForm.rules.questionTitle, trigger: 'blur'}"
                        :label-width="formLabelWidth">
            <el-input type="textarea" v-model="item.questionTitle"></el-input>
            <el-radio-group v-model="item.answerResult">
              <el-radio :label="1">达标</el-radio>
              <el-radio :label="2">不达标</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddForm('addForm')">取 消</el-button>
        <el-button type="primary" @click="submitAddForm('addForm')">提 交</el-button>
      </div>
    </el-dialog>
    <!-- 新增/编辑弹窗 end -->
    <!-- 查看弹窗 end -->
    <el-dialog :title=dialogTitle class="add-dialog" :visible.sync="dialogViewVisible" width="27%">
      <el-form :model="addForm" ref="addForm">
        <el-form-item label="考核人员" prop="testUserId" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="addForm.testUserName"></el-input>
        </el-form-item>
        <el-form-item label="考核月份" prop="testDate" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="addForm.testDate"></el-input>
        </el-form-item>
        <el-form-item label="考核次数" prop="testIndex" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="addForm.testIndex"></el-input>
        </el-form-item>
        <el-form-item label="考核状态" prop="testStatus" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="addForm.testStatus"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="testRemark" :label-width="formLabelWidth">
          <el-input disabled="disabled" v-model="addForm.testRemark"></el-input>
        </el-form-item>
        <el-row class="el-form-questions">
          <el-form-item :label='"考核标题" + (index + 1)' prop="testRemark" v-for="(item, index) in addForm.callTestPapers" :key="index" :label-width="formLabelWidth">
            <el-input disabled="disabled" v-model="item.questionTitle"></el-input>
            <el-radio-group v-model="item.answerResult" disabled="disabled">
              <el-radio :label="1">达标</el-radio>
              <el-radio :label="2">不达标</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleClose">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 查看弹窗 end -->
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
  import { selectCallTestList, saveCallTest, updateUserRelation } from '@/api/kpi/call-test-api'
  import orgTree from '../../common/orgTree'

  export default {
    components: { orgTree },
    data() {
      return {
        queryForm: {
          testDate: '', // 考核月份
          testUserId: '', // 测试用户ID
          testStatus: '', // 测试状态
          pageNumber: 1, // 当前页
          pageSize: 10 // 每页行数
        }, // 查询列表表单
        loading: false,
        pageNumber: 1, // 默认查询第1页
        dialogAddFormVisible: false, // 是否显示新增拨测弹窗
        dialogDeleteVisible: false, // 是否显示删除弹窗
        dialogViewVisible: false, // 是否显示查看弹窗
        tableConfigItems: [
          {
            label: '绩效月份', prop: 'testDate', width: ''
          }, {
            label: '姓名', prop: 'testUserName', width: ''
          }, {
            label: '备注', prop: 'testRemark', width: ''
          }, {
            label: '状态', prop: '_testStatus', width: ''
          }, {
            label: '次数', prop: 'testIndex', width: ''
          }, {
            label: '创建人', prop: 'createByName', width: ''
          }, {
            label: '创建时间', prop: '_createTime', width: ''
          }
        ], // table表格配置项
        tableData: [], // table数据列表
        addForm: {
          testDate: '', // 考核月份
          testUserId: '', // 测试用户id（必填）
          testIndex: '', // 第几次测试（必填）
          testStatus: '', // 测试结果（必填）
          testRemark: '', // 测试备注（必填）
          callTestPapers: [{
            questionTitle: '',
            answerResult: 1
          }, {
            questionTitle: '',
            answerResult: 1
          }, {
            questionTitle: '',
            answerResult: 1
          }, {
            questionTitle: '',
            answerResult: 1
          }, {
            questionTitle: '',
            answerResult: 1
          }], // 题目 结果（必填）
          rules: {
            testDate: [
              { required: true, message: '请选择考核月份', trigger: 'change' }
            ],
            testUserId: [
              { required: true, message: '请选择考核用户', trigger: 'change' }
            ],
            testIndex: [
              { required: true, message: '请选择考核次数', trigger: 'change' }
            ],
            testStatus: [
              { required: true, message: '请选择考核状态', trigger: 'change' }
            ],
            questionTitle: [
              { required: true, message: '请输入题目', trigger: 'blur' }
            ]
          }
        }, // 新增拨测表单
        questionTitle1: '',
        questionTitle2: '',
        questionTitle3: '',
        questionTitle4: '',
        questionTitle5: '',
        formLabelWidth: '132px', // 表单标签宽度
        testIndexList: [1, 2, 3],
        testStatusList: [ // 测试状态:1通过，2未通过
          { key: 1, label: '通过' },
          { key: 2, label: '未通过' }
        ],
        dialogTitle: '',
        appliedUserId: '', // 新增弹窗姓名
        iDeleteItemId: '' // 删除数据id
      }
    },
    created() {
      this.selectCallTestList(this.pageNumber)
      this.$store.dispatch('GetUserId2NameMap')
    },
    methods: {
      /**
       * 查询拨测列表
       * */
      selectCallTestList(pageNumber) {
        const _this = this
        this.loading = true
        this.queryForm.pageNumber = pageNumber || this.pageNumber
        if (!this.queryForm.testDate) {
          this.queryForm.testDate = ''
        }
        if (this.queryForm.testDate !== '') {
          this.queryForm.testDate = formatDateByTimestamp(new Date(this.queryForm.testDate) * 1, 'yyyy-MM')
        }
        return new Promise((resolve, reject) => {
          selectCallTestList(_this.queryForm).then((res) => {
            _this.loading = false
            if (res.rows && res.rows.length > 0) {
              _this.tableData = res.rows.map((item, index) => {
                // todo: 处理上传时间，审核时间，申请状态，拨测类型
                return Object.assign({}, item, {
                  _createTime: formatDateByTimestamp(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss'),
                  _testStatus: _this.testStatusList.find(cur => {
                    return cur.key === item.testStatus
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
       * 显示新增拨测弹窗
       */
      showAddForm(row) {
        this.dialogAddFormVisible = true
        if (row && row.id) {
          this.addForm.testDate = row.testDate
          this.addForm.testUserId = row.testUserId
          this.addForm.testIndex = row.testIndex
          this.addForm.testStatus = row.testStatus
          this.addForm.testRemark = row.testRemark
          this.addForm.callTestPapers = row.csaCallTestPaperVOS
          this.dialogTitle = '查看详情'
        } else {
          this.addForm.testDate = ''
          this.addForm.testUserName = ''
          this.addForm.testIndex = ''
          this.addForm.testStatus = ''
          this.addForm.testRemark = ''
          this.addForm.callTestPapers = [{
            questionTitle: '',
            answerResult: 1
          }, {
            questionTitle: '',
            answerResult: 1
          }, {
            questionTitle: '',
            answerResult: 1
          }, {
            questionTitle: '',
            answerResult: 1
          }, {
            questionTitle: '',
            answerResult: 1
          }]
          this.dialogTitle = '新增'
        }
        this.$store.dispatch('GetUserId2NameMap')
        this.$refs['queryForm'].resetFields()
      },
      /**
       * 显示查看拨测弹窗
       */
      showViewForm(row) {
        this.dialogViewVisible = true
        if (row && row.id) {
          this.addForm.testDate = row.testDate
          this.addForm.testUserName = row.testUserName
          this.addForm.testIndex = row.testIndex
          this.addForm.testStatus = row.testStatus
          this.addForm.testRemark = row.testRemark
          this.addForm.callTestPapers = row.csaCallTestPaperVOS
          this.dialogTitle = '查看详情'
        }
        this.$store.dispatch('GetUserId2NameMap')
        this.$refs['queryForm'].resetFields()
      },

      /**
       * 提交新增/编辑拨测表单
       * 校验表单必填项是否通过
       */
      submitAddForm(form) {
        const _this = this
        this.$refs[form].validate((valid) => {
          if (valid) {
            const params = {
              testDate: formatDateByTimestamp(_this.addForm.testDate, 'yyyy-MM'), // 考核月份
              testUserId: _this.addForm.testUserId, // 测试用户id
              testIndex: _this.addForm.testIndex, // 第几次测试
              testStatus: _this.addForm.testStatus, // 测试结果
              testRemark: _this.addForm.testRemark, // 测试备注
              callTestPapers: _this.addForm.callTestPapers // 题目 结果
            }
            if (_this.addForm.id) {
              params.id = _this.addForm.id // 申请人id
              params.isDelete = 0 // 是否删除：0否，1是
            } else {
              // params.appliedUserId = _this.addForm.appliedUserId // 被申请人id
            }
            return new Promise((resolve, reject) => {
              // 有id表示更新
              if (_this.addForm.id) {
                updateUserRelation(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.$refs[form].resetFields()
                  _this.selectCallTestList(_this.pageNumber)
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
                saveCallTest(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.$refs[form].resetFields()
                  _this.selectCallTestList(_this.pageNumber)
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
        //     this.selectCallTestList()
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
        this.selectCallTestList(this.pageNumber)
      },

      /**
       * 取消新增拨测
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
          testUserId: row.testUserId,
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
            _this.selectCallTestList(_this.pageNumber)
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
        this.dialogViewVisible = false
      },
      handleSizeChange(val) {
        this.queryForm.pagesize = val
        this.selectCallTestList(val)
      },
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.selectCallTestList(val)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/kpi/call-test";
</style>
