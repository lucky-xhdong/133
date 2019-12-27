<template>
  <el-row class="typing-satisfaction-container">
    <el-row class="tsc-form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="pc-form">
        <el-form-item label="绩效月份：" prop="assessDate">
          <el-date-picker
            v-model="queryForm.assessDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="组织结构：" prop="orgId">
          <org-tree ref="orgTree" v-model="queryForm.orgId"></org-tree>
        </el-form-item>
        <el-form-item label="姓名：" prop="userName">
          <el-input v-model="queryForm.userName"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="selectList(pageNumber)" :loading="loading">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showAddForm">新增</el-button>
          <el-upload
            class="tsc-typing"
            action=""
            :file-list="fileList"
            :before-upload="beforeUpload"
            :http-request="uploadTypingSpeedExcel">
            <el-button type="primary">上传Excel</el-button>
          </el-upload>
          <el-button type="primary" @click="downloadSatisfactionTemplate">下载模版</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <el-row class="tsc-table-wrapper">
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
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddForm(scope.row)">编辑</el-button>
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
        class="typing-satisfaction-page">
      </el-pagination>
      <!-- END table数据列表 -->
    </el-row>
    <!-- 新增/编辑弹窗 start -->
    <el-dialog :title=dialogTitle class="add-dialog" :visible.sync="dialogAddFormVisible" width="27%">
      <el-form :model="addForm" ref="addForm" :rules="rules">
        <el-form-item label="绩效月份" prop="assessDate" :label-width="formLabelWidth">
          <el-date-picker
            v-model="addForm.assessDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="姓名" prop="csaUserId" :label-width="formLabelWidth" v-if="addForm.id">
          <el-input v-model="addForm.userName" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="csaUserId" :label-width="formLabelWidth" v-else>
          <el-select v-model="addForm.csaUserId" filterable placeholder="请选择姓名" clearable>
            <el-option
              v-for="(item, index) in $store.state.userStore.appliedUserList"
              :key=index
              :label="item.label"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分数" prop="grade" :label-width="formLabelWidth">
          <el-input v-model="addForm.grade"></el-input>
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
    <iframe :src="iframeSrc" frameborder="0" style="display: none;"></iframe>
  </el-row>
</template>
<script>
  import { formatDateByTimestamp } from '@/utils'
  import { selectList, save, update, uploadTypingSpeedExcel } from '@/api/kpi/typing-satisfaction-api'
  import orgTree from '../../common/orgTree'

  export default {
    components: { orgTree },
    data() {
      return {
        queryForm: {
          assessDate: '', // 考核月份
          orgId: '', // 组织结构ID
          userName: '', // 用户名
          type: 2, // 成绩类别：1打字速度，2组长满意度（必填）
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
            label: '绩效月份', prop: 'assessDate', width: ''
          }, {
            label: '姓名', prop: 'userName', width: ''
          }, {
            label: '分数', prop: 'grade', width: ''
          }, {
            label: '创建人', prop: 'createByName', width: ''
          }, {
            label: '创建时间', prop: '_createTime', width: ''
          }, {
            label: '更新人', prop: 'updateByName', width: ''
          }, {
            label: '更新时间', prop: '_updateTime', width: ''
          }
        ], // table表格配置项
        tableData: [], // table数据列表
        addForm: {
          assessDate: '',
          csaUserId: '',
          grade: '',
          type: 2 // 成绩类别：1打字速度，2组长满意度（必填）
        }, // 新增培训表单
        formLabelWidth: '132px', // 表单标签宽度
        rules: {
          assessDate: [
            { required: true, message: '请选择绩效月份', trigger: 'change' }
          ],
          relationType: [
            { required: true, message: '请选择类别', trigger: 'change' }
          ],
          csaUserId: [
            { required: true, message: '请输入姓名', trigger: 'blur' }
          ],
          grade: [
            { required: true, message: '请输入分数', trigger: 'blur' }
          ]
        },
        _csaUserId: '',
        dialogTitle: '',
        appliedUserId: '', // 新增弹窗姓名
        iDeleteItemId: '', // 删除数据id
        fileList: [],
        fileName: '',
        iframeSrc: ''
      }
    },
    created() {
      this.selectList(this.pageNumber)
      this.$store.dispatch('GetUserId2NameMap')
    },
    methods: {
      /**
       * 查询培训列表
       * */
      selectList(pageNumber) {
        const _this = this
        this.loading = true
        this.queryForm.pageNumber = pageNumber || this.pageNumber
        if (!this.queryForm.assessDate) {
          this.queryForm.assessDate = ''
        }
        if (this.queryForm.assessDate !== '') {
          this.queryForm.assessDate = formatDateByTimestamp(new Date(this.queryForm.assessDate) * 1, 'yyyy-MM')
        }
        if (this.$refs.orgTree) {
          const aOrgTree = this.$refs.orgTree.selectedOptions
          this.queryForm.orgId = ''
          if (aOrgTree && aOrgTree.length > 0) {
            this.queryForm.orgId = aOrgTree[aOrgTree.length - 1]
          }
        }
        return new Promise((resolve, reject) => {
          selectList(_this.queryForm).then((res) => {
            _this.loading = false
            if (res.rows && res.rows.length > 0) {
              _this.tableData = res.rows.map((item, index) => {
                // todo: 处理上传时间，审核时间，申请状态，培训类型
                return Object.assign({}, item, {
                  _createTime: formatDateByTimestamp(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss'),
                  _updateTime: formatDateByTimestamp(new Date(item.updateTime), 'yyyy-MM-dd hh:mm:ss')
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
            assessDate: row.assessDate,
            csaUserId: row.userName,
            userName: row.userName,
            grade: row.grade,
            type: 2
          }
          this._csaUserId = row.csaUserId
          this.dialogTitle = '修改'
        } else {
          this.dialogTitle = '新增'
          this.addForm = {
            id: '',
            assessDate: '',
            csaUserId: '',
            userName: '',
            grade: '',
            type: 2
          }
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
              assessDate: formatDateByTimestamp(_this.addForm.assessDate, 'yyyy-MM'), // 培训月份
              csaUserId: _this._csaUserId, // 管理人员id
              grade: _this.addForm.grade, // 被管理人员id
              type: 2 // 管理类型
            }
            if (_this.addForm.id) {
              params.id = _this.addForm.id // 申请人id
              params.isDelete = 0 // 是否删除：0否，1是
            } else {
              params.csaUserId = _this.addForm.csaUserId
            }
            return new Promise((resolve, reject) => {
              // 有id表示更新
              if (_this.addForm.id) {
                update(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.$refs[form].resetFields()
                  _this.selectList(_this.pageNumber)
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
                save(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.$refs[form].resetFields()
                  _this.selectList(_this.pageNumber)
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
        //     this.selectList()
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
          assessDate: '', // 考核月份
          orgId: '', // 组织结构ID
          userName: '', // 用户名
          type: 2, // 成绩类别：1打字速度，2组长满意度（必填）
          pageNumber: 1, // 当前页
          pageSize: 10 // 每页行数
        }
        this.selectList(this.pageNumber)
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
          assessDate: row.assessDate,
          csaUserId: row.csaUserId,
          grade: row.grade
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
          update(params).then(res => {
            _this.dialogDeleteVisible = false
            _this.selectList(_this.pageNumber)
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
        this.selectList(val)
      },

      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.selectList(val)
      },

      /**
       * 上传前校验
       */
      beforeUpload(file) {
        const extension = file.name.split('.')[1] === 'xls' // 获取后缀名
        const extension2 = file.name.split('.')[1] === 'xlsx'
        const isLt5M = file.size / 1024 / 1024 < 5
        if (!extension && !extension2) {
          this.$message.warning('上传模板只能是 xls、xlsx格式!')
          return
        }
        if (!isLt5M) {
          this.$message.warning('上传模板大小不能超过 5MB!')
          return
        }
      },

      /**
       * 上传excel
       */
      uploadTypingSpeedExcel(e) {
        const fileObj = e.file
        // FormData 对象
        const form = new FormData()
        const _this = this
        let timer = null
        // 文件对象
        form.append('excelFile', fileObj)
        clearTimeout(timer)
        return new Promise((resolve, reject) => {
          uploadTypingSpeedExcel(form).then(res => {
            _this.$message({
              message: res.data,
              type: res.rspCode === _this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
              showClose: true
            })
            timer = setTimeout(() => {
              _this.fileList = []
            }, 2000)
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },

      /**
       * 下载数据
       */
      downloadSatisfactionTemplate() {
        if (!this.queryForm.assessDate) {
          this.$message({
            message: '请选择绩效月份！',
            type: 'error',
            showClose: true
          })
          return false
        }
        const params = {
          assessDate: formatDateByTimestamp(new Date(this.queryForm.assessDate) * 1, 'yyyy-MM')
        }
        const url = process.env.BASE_API + '/csaExcel/excelDownload/downloadSatisfactionTemplate?assessDate=' + params.assessDate + '&timestamp=' + new Date().getTime()
        // 创建隐藏的可下载链接
        this.iframeSrc = url
        this.queryForm.assessDate = '' // 下载时将选择条件清空，防止重复点击
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/kpi/typing-satisfaction";
</style>
