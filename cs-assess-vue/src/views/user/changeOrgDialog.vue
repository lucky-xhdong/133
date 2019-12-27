<template>
  <!-- 更换组别编辑窗口 start -->
  <el-dialog ref="changeOrgDialog" title="更改组别" :visible.sync="changeOrgFormVisible" :before-close="closeDialog" :close-on-click-modal="false">
    <el-form :model="changeOrgForm" ref="changeOrgForm" label-position="left" label-width="112px" style="width: 50%">
      <el-form-item label="工号" prop="agentNo">
        <el-tag class="el-tag" v-for="agentNo in changeOrgForm.agentNos" :key="agentNo">{{agentNo}}</el-tag>
      </el-form-item>

      <el-form-item label="真实姓名" prop="trueName">
        <el-tag v-for="trueName in changeOrgForm.trueNames" :key="trueName">{{trueName}}</el-tag>
      </el-form-item>

      <el-form-item label="目标组" prop="targetOrg">
        <org-tree ref="orgTree"></org-tree>
      </el-form-item>

      <el-form-item label="调整类型" prop="orgChangeType">
        <el-select v-model="changeOrgForm.selectedOrgChangeType" placeholder="请选择" clearable>
          <el-option v-for="(item, index) in orgChangeTypeList"
                     :key="index"
                     :label="item.label"
                     :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="组织角色" prop="userOrgRole">
        <el-select v-model="changeOrgForm.selectedOrgRole" placeholder="请选择" clearable>
          <el-option v-for="item in orgRoles" :key="item.key" :label="item.value" :value="item.key"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="计划生效时间" prop="planTime">
        <el-date-picker
          v-model="changeOrgForm.planTime"
          type="datetime"
          value-format="timestamp"
          placeholder="选择时间">
        </el-date-picker>
        <el-alert title="不选择时间则立即生效" type="info" style="width: 220px" :closable="false"></el-alert>
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="danger" @click="removeUser2Org">移除用户关系</el-button>
      <el-button type="primary" @click="changeOrgFormSubmit" :loading="changeSubmitLoading">提交</el-button>
      <el-button @click="$refs['changeOrgDialog'].handleClose()">取消</el-button>
    </div>
  </el-dialog>
  <!-- 更换组别编辑窗口 end -->
</template>

<script>
  import orgTree from '../common/orgTree'
  import { saveUsers2Org, removeUser2Org } from '@/api/users/user-api'
  import { USER_ORG_ROLES } from '@/utils/dict'

  export default {
    name: 'changeOrgDialog',
    components: { orgTree },
    data() {
      return {
        changeOrgFormVisible: false,
        changeSubmitLoading: false,
        orgRoles: USER_ORG_ROLES, // 用户角色

        // 表单
        changeOrgForm: {
          ids: [],
          agentNos: [],
          trueNames: [],
          csaOrgIds: '',
          csaOldOrgIds: [],
          selectedOrgRole: '',
          planTime: '',
          selectedOrgChangeType: ''
        },
        // 调整类型选项
        orgChangeTypeList: [
          { value: 0, label: '新员工进组' },
          { value: 1, label: '转岗' },
          { value: 2, label: '淘汰' },
          { value: 3, label: '换组' }
        ]
      }
    },

    methods: {
      init(rows) {
        this.changeOrgFormVisible = true
        if (rows) {
          rows.forEach(row => {
            this.changeOrgForm.ids.push(row.id)
            this.changeOrgForm.trueNames.push(row.trueName)
            this.changeOrgForm.agentNos.push(row.agentNo)
            this.changeOrgForm.csaOldOrgIds.push(row.csaOrgId)
          })
        }
      },
      // 关闭弹窗清空数据
      closeDialog(done) {
        done()
        this.$refs.orgTree.selectedOptions = []
        this.$refs['changeOrgForm'].resetFields()
        this.changeOrgFormVisible = false
        this.changeSubmitLoading = false

        this.changeOrgForm = {
          ids: [],
          agentNos: [],
          trueNames: [],
          csaOrgIds: [],
          csaOldOrgIds: [],
          selectedOrgRole: '',
          planTime: '',
          selectedOrgChangeType: ''
        }
      },
      changeOrgFormSubmit() {
        const selectedOptionsArr = this.$refs.orgTree.selectedOptions
        if (selectedOptionsArr.length === 0) {
          this.$message({
            message: '请选择目标组',
            type: 'error',
            showClose: true
          })
          return
        }
        const csaOrgRole = this.changeOrgForm.selectedOrgRole
        if (csaOrgRole === '') {
          this.$message({
            message: '请选择组织角色',
            type: 'error',
            showClose: true
          })
          return
        }
        // 组装数据
        this.changeSubmitLoading = true
        const org2userList = []
        const csaOrgId = selectedOptionsArr[selectedOptionsArr.length - 1]
        this.changeOrgForm.ids.forEach((id, index) => {
          org2userList.push({
            csaUserId: id,
            csaOrgId: csaOrgId,
            userOrgRole: csaOrgRole,
            csaOldOrgId: this.changeOrgForm.csaOldOrgIds[index]
          })
        })
        const orgChangeType = this.changeOrgForm.selectedOrgChangeType
        const data = {
          org2userList: org2userList,
          planTime: this.changeOrgForm.planTime,
          orgChangeType: orgChangeType
        }
        // 请求
        new Promise((resolve, reject) => {
          saveUsers2Org(data).then(response => {
            this.$message({
              message: response.rspMsg,
              type: response.rspCode === this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
              showClose: true
            })
            this.$refs['changeOrgDialog'].handleClose()
            this.$emit('refreshUserList')
            resolve(response)
          }).catch(error => {
            this.changeSubmitLoading = false
            reject(error)
          })
        })
      },
      removeUser2Org() {
        this.$confirm('此操作将移除当前用户组织关系, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.changeOrgForm.csaOldOrgIds && this.changeOrgForm.csaOldOrgIds.length > 1) {
            this.$message({
              type: 'warning',
              message: '用户关系不支持批量移除，请选择单个用户!'
            })
          } else {
            const params = {
              csaOrgId: this.changeOrgForm.csaOldOrgIds[0],
              csaUserId: this.changeOrgForm.ids[0]
            }
            new Promise((resolve, reject) => {
              removeUser2Org(params).then(response => {
                this.$message({
                  message: response.rspMsg,
                  type: response.rspCode === this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                  showClose: true
                })
                this.$refs['changeOrgDialog'].handleClose()
                this.$emit('refreshUserList')
                resolve(response)
              }).catch(error => {
                reject(error)
              })
            })
          }
        }).catch(() => {
        })
      }
    }
  }
</script>

<style scoped>
  .el-tag {
    margin-right: 10px;
  }
</style>
