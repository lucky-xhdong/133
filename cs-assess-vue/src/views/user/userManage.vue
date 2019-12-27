<template>
  <div class="app-container">

    <!-- 查询条件 start -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryForm" ref="queryForm">
        <el-form-item label="组织结构">
          <org-tree ref="orgTree"></org-tree>
        </el-form-item>

        <el-form-item label="客服姓名">
          <el-input @keyup.enter.native="handleFilter" class="filter-item" placeholder="请输入客服姓名" clearable
                    v-model="queryForm.trueName">
          </el-input>
        </el-form-item>

        <el-form-item label="状态">
          <el-select @keyup.enter.native="handleFilter" clearable class="filter-item" v-model="queryForm.status">
            <el-option label="有效" value="0"></el-option>
            <el-option label="无效" value="1"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter"
                     :loading="listLoading">搜索
          </el-button>
          <el-button class="filter-item" type="info" icon="el-icon-error" @click="handleResetFilter"
                     :loading="listLoading">重置
          </el-button>
          <el-button class="filter-item" icon="el-icon-info" type="warning" @click="openChangeOrgDialog">更改组别</el-button>
          <el-button class="filter-item" @click="handleImportDialog" type="primary" icon="el-icon-upload">导入</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 查询条件 end -->

    <!-- 列表 start -->
    <el-table :data="list.rows" v-loading="listLoading" border highlight-current-row
              style="width: 100%;"  @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column align="center" label="客服工号">
        <template slot-scope="scope">
          <span>{{scope.row.agentNo}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="真实姓名">
        <template slot-scope="scope">
          <span>{{scope.row.trueName}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="当前组">
        <template slot-scope="scope">
          <span>{{scope.row.csaOrgName}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="手机号码">
        <template slot-scope="scope">
          <span>{{scope.row.phoneNum}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="邮箱">
        <template slot-scope="scope">
          <span>{{scope.row.email}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="班组角色">
        <template slot-scope="scope">
          <span>{{scope.row.userOrgRole | orgRoleFilter}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="生日">
        <template slot-scope="scope">
          <span>{{scope.row.birthday}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="入职时间">
        <template slot-scope="scope">
          <span>{{scope.row.entryTime | parseTime('{y}-{m}-{d}')}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="离职时间">
        <template slot-scope="scope">
          <span>{{scope.row.separationTime | parseTime('{y}-{m}-{d}')}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="客服等级">
        <template slot-scope="scope">
          <span>{{scope.row.levelId | levelFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="91语音系统账号">
        <template slot-scope="scope">
          <span>{{scope.row.asterUsername}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="更新时间">
        <template slot-scope="scope">
          <span>{{scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="更新人">
        <template slot-scope="scope">
          <span>{{scope.row.updateByName}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ status[scope.row.status] }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 列表 end -->

    <!-- 分页 start -->
    <div class="pagination-container">
      <el-pagination background
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryForm.pageNumber"
                     :page-sizes="[10,20,30,50]"
                     :page-size="queryForm.pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="list.total">
      </el-pagination>
    </div>
    <!-- 分页 end -->

    <!-- 编辑窗口 start -->
    <el-dialog ref="editDialog" title="编辑" :visible.sync="editFormVisible" :before-close="closeDialog" :close-on-click-modal="false">
      <el-form :model="editForm" ref="editForm" label-position="left" label-width="112px" style="width: 50%">
        <el-form-item label="工号" prop="agentNo">
          <el-input v-model="editForm.agentNo"></el-input>
        </el-form-item>

        <el-form-item label="真实姓名" prop="trueName">
          <el-input v-model="editForm.trueName" disabled></el-input>
        </el-form-item>

        <el-form-item label="手机号码" prop="phoneNum">
          <el-input v-model="editForm.phoneNum" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" disabled></el-input>
        </el-form-item>

        <el-form-item label="生日" prop="birthday">
          <el-date-picker v-model="editForm.birthday" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
        </el-form-item>

        <el-form-item label="组织角色" prop="userOrgRole">
          <el-select v-model="editForm.userOrgRole" placeholder="请选择" clearable>
            <el-option v-for="item in orgRoles" :key="item.key" :label="item.value" :value="item.key"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="入职时间" prop="entryTime">
          <el-date-picker v-model="editForm.entryTime" type="date" value-format="timestamp" placeholder="选择日期"></el-date-picker>
        </el-form-item>

        <el-form-item label="职级岗位" prop="levelId">
          <el-select v-model="editForm.levelId" placeholder="请选择" clearable>
            <el-option v-for="(item, index) in levelList"
                       :key="index"
                       :label="item.label"
                       :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="人事状态" prop="staffLevel">
          <el-select v-model="editForm.staffLevel" placeholder="请选择" clearable>
            <el-option v-for="(item, index) in staffLevelList"
                       :key="index"
                       :label="item.label"
                       :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="91语音系统账号" prop="asterUsername">
          <el-input v-model="editForm.asterUsername"></el-input>
        </el-form-item>

        <el-form-item label="91语音系统密码" prop="asterPassword">
          <el-input v-model="editForm.asterPassword"></el-input>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status" @change="separationTimeVisible = editForm.status === '1'">
            <el-radio label="0" key="0">有效</el-radio>
            <el-radio label="1" key="1">无效</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="离职时间" prop="separationTime" v-show="separationTimeVisible">
          <el-date-picker
            v-model="editForm.separationTime"
            type="date"
            value-format="timestamp"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editFormSubmit" :loading="editSubmitLoading">提交</el-button>
        <el-button @click="$refs['editDialog'].handleClose()">取消</el-button>
      </div>
    </el-dialog>
    <!-- 编辑窗口 end -->

    <el-dialog title="导入用户" :visible.sync="importUserFromVisible" :before-close="closeImportUserDialog" :close-on-click-modal="false" width="400px">
      <el-form :model="importForm" ref="importForm" :rules="rules" label-position="left" label-width="110px">
        <el-input v-model="importForm.userNames" type="textarea" :rows="3" placeholder="请输入需要导入的用户邮箱，以英文逗号分隔"></el-input>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="importUserSubmit" :loading="editSubmitLoading">提交</el-button>
        <el-button @click="closeImportUserDialog">取消</el-button>
      </div>
    </el-dialog>

    <change-org-dialog ref="changeOrgDialog" @refreshUserList="getList"></change-org-dialog>
  </div>
</template>

<script>
  import { queryUserList, save, importUser } from '@/api/users/user-api'
  import { UNITE_STATUS_MAP, USER_ORG_ROLE_MAP, USER_ORG_ROLES, USER_LEVELS } from '@/utils/dict'
  import orgTree from '../common/orgTree'
  import changeOrgDialog from './changeOrgDialog'

  export default {
    name: 'userManage',
    components: { orgTree, changeOrgDialog },
    data() {
      return {
        list: {}, // 列表
        listLoading: false, // 列表加载
        status: UNITE_STATUS_MAP, // 状态字典
        multipleSelection: [], // 复选框选中的行
        orgRoles: USER_ORG_ROLES, // 用户角色
        staffLevelList: [
          { value: 0, label: '试用' },
          { value: 1, label: '正式' }
        ],
        // 查询表单
        queryForm: {
          upmsOrgId: '',
          csaOrgId: '',
          status: '0',
          pageNumber: 1,
          pageSize: 20
        },
        editForm: {
          id: undefined,
          agentNo: '',
          trueName: '',
          status: '',
          phoneNum: '',
          email: '',
          userOrgRole: '',
          birthday: '',
          entryTime: '',
          separationTime: '',
          levelId: '',
          asterUsername: '',
          asterPassword: '',
          csaOrgId: '',
          userOrgRoleOld: '',
          staffLevel: ''
        },
        levelList: USER_LEVELS,
        importForm: {
          userNames: ''
        },
        editFormVisible: false, // 编辑表单 - 是否显示
        editSubmitLoading: false, // 编辑表单 - 提交按钮加载
        separationTimeVisible: false, // 编辑表单 - 离职时间是否展示
        importUserFromVisible: false, // 导入用户表单是否展示
        rules: {
          trueName: [
            { required: true, message: '请输入真实姓名', trigger: 'blur' },
            { min: 1, max: 50, message: '最多输入25个字符', trigger: 'blur' }
          ],
          phoneNum: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { min: 1, max: 20, message: '最多输入20个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { min: 1, max: 20, message: '最多输入100个字符', trigger: 'blur' }
          ],
          userNames: [
            { required: true, message: '用户邮箱不能为空', trigger: 'blur' },
            { min: 1, max: 50, message: '最多输入5000个字符', trigger: 'blur' }
          ]
        }
      }
    },

    methods: {
      // 列表查询
      getList() {
        this.listLoading = true
        new Promise((resolve, reject) => {
          // 设置组织结构查询条件
          if (this.$refs.orgTree) {
            const selectedOptionsArr = this.$refs.orgTree.selectedOptions
            this.queryForm.upmsOrgId = ''
            this.queryForm.csaOrgId = ''
            if (selectedOptionsArr && selectedOptionsArr.length > 0) {
              if (selectedOptionsArr.length === 1) {
                this.queryForm.upmsOrgId = selectedOptionsArr[0]
              } else {
                this.queryForm.csaOrgId = selectedOptionsArr[selectedOptionsArr.length - 1]
              }
            }
          }

          queryUserList(this.queryForm).then(response => {
            this.list = response
            this.listLoading = false
            resolve(response)
          }).catch(error => {
            this.listLoading = false
            reject(error)
          })
        })
      },
      // 搜索
      handleFilter() {
        this.queryForm.page = 1
        this.getList()
      },
      // 清空查询条件
      handleResetFilter() {
        this.$refs.orgTree.selectedOptions = []
        this.queryForm = {
          pageNumber: 1,
          pageSize: 20,
          trueName: '',
          status: '0'
        }
        this.getList()
      },
      // 每页条数改变
      handleSizeChange(val) {
        this.queryForm.pageSize = val
        this.getList()
      },
      // 页面改变
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.getList()
      },
      // 修改
      handleUpdate(row) {
        this.editForm = {
          id: row.id,
          agentNo: row.agentNo,
          trueName: row.trueName,
          status: row.status + '',
          phoneNum: row.phoneNum,
          email: row.email,
          userOrgRole: row.userOrgRole,
          birthday: row.birthday,
          entryTime: row.entryTime,
          separationTime: row.separationTime,
          levelId: row.levelId,
          asterUsername: row.asterUsername,
          asterPassword: row.asterPassword,
          csaOrgId: this.queryForm.csaOrgId,
          userOrgRoleOld: row.userOrgRole,
          staffLevel: row.staffLevel
        }
        this.separationTimeVisible = this.editForm.status === '1'
        this.editFormVisible = true
        this.$nextTick(() => {
          this.$refs['editForm'].clearValidate()
        })
      },
      // 编辑表单提交
      editFormSubmit() {
        this.$refs['editForm'].validate((valid) => {
          if (valid) {
            // 校验是否更改组织角色
            if (this.editForm.userOrgRole !== this.editForm.userOrgRoleOld && this.editForm.csaOrgId === '') {
              this.$message({
                message: '如需更改用户组织角色，请按组织结构筛选用户再编辑!',
                type: 'error',
                showClose: true
              })
              return
            }

            this.editSubmitLoading = true
            new Promise((resolve, reject) => {
              save(this.editForm).then(response => {
                this.editSubmitLoading = false
                this.$message({
                  message: response.rspMsg,
                  type: response.rspCode === this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                  showClose: true
                })
                this.editFormVisible = false
                this.getList()
                resolve(response)
              }).catch(error => {
                this.editSubmitLoading = false
                reject(error)
              })
            })
          }
        })
      },
      // 关闭弹窗清空数据
      closeDialog(done) {
        done()
        this.$refs['editForm'].resetFields()
        this.editFormVisible = false
        this.editForm = {
          id: undefined,
          agentNo: '',
          trueName: '',
          status: '',
          phoneNum: '',
          userOrgRole: '',
          email: '',
          birthday: '',
          entryTime: '',
          separationTime: '',
          levelId: '',
          csaOrgId: '',
          userOrgRoleOld: '',
          staffLevel: ''
        }
        this.separationTimeVisible = false
      },
      // 关闭导入用户弹窗
      closeImportUserDialog() {
        this.$refs['importForm'].resetFields()
        this.importForm = {
          userNames: ''
        }
        this.importUserFromVisible = false
      },
      // 获取选中的多选框
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      // 打开更换组别弹窗
      openChangeOrgDialog() {
        if (this.multipleSelection.length === 0) {
          this.$message({ message: '请勾选需要更改的用户', type: 'error', showClose: true })
          return
        }
        this.$refs.changeOrgDialog.init(this.multipleSelection)
      },
      // 导入用户表单提交
      importUserSubmit() {
        this.$refs['importForm'].validate((valid) => {
          if (valid) {
            this.editSubmitLoading = true
            return new Promise((resolve, reject) => {
              importUser(this.importForm).then(response => {
                this.editSubmitLoading = false
                this.$message({
                  message: response.rspMsg,
                  type: response.rspCode === this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                  showClose: true
                })
                this.importUserFromVisible = false
                this.getList()
                resolve(response)
              }).catch(error => {
                this.editSubmitLoading = false
                reject(error)
              })
            })
          }
        })
      },
      // 打开导入弹出框
      handleImportDialog() {
        this.importForm = {
          userNames: ''
        }
        this.importUserFromVisible = true
        this.$nextTick(() => {
          this.$refs['importForm'].clearValidate()
        })
      }
    },

    filters: {
      statusFilter(status) {
        const statusMap = {
          0: 'success',
          1: 'info'
        }
        return statusMap[status]
      },
      levelFilter(levelId) {
        return USER_LEVELS[levelId].label
      },
      orgRoleFilter(roleCode) {
        return USER_ORG_ROLE_MAP[roleCode]
      }
    },
    created() {
      // 列表查询
      this.getList()
    }
  }
</script>
