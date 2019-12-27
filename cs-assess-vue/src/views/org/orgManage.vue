<template>
  <div class="app-container">
    <el-container>
      <el-aside width="300px">
        <el-tree :data="orgTreeList"
                 ref="tree"
                 node-key="id"
                 icon-class="el-icon-setting"
                 highlight-current
                 v-loading="loading"
                 :props="defaultProps"
                 element-loading-text="加载中"
                 element-loading-spinner="el-icon-loading"
                 style="height: 100%"
                 @node-click="handleNodeClick">
        </el-tree>
      </el-aside>

      <el-main>
        <el-form ref="editForm" :model="editForm" style="width: 30%" label-width="80px" label-position="left" :rules="rules">
          <el-form-item label="班组名称" prop="orgName">
            <el-input v-model="editForm.orgName"></el-input>
          </el-form-item>

          <el-form-item label="班组描述" prop="orgDesc">
            <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="editForm.orgDesc"></el-input>
          </el-form-item>

          <el-form-item label="状态" prop="delete">
            <el-radio-group v-model="editForm.delete">
              <el-radio label="0" key="0">有效</el-radio>
              <el-radio label="1" key="1">无效</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="负责人">
            <el-tag v-for="leader in editForm.leaders" :key="leader.trueName">{{ leader.trueName }}</el-tag>
          </el-form-item>

          <el-form-item label="更新人">
            <span>{{editForm.updateByName}}</span>
          </el-form-item>

          <el-form-item label="更新时间">
            <span>{{editForm.updateTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
          </el-form-item>

          <el-form-item>
            <!--<el-button type="primary" :disabled="submitDisabled" :loading="submitLoading" @click="onSubmit">提交</el-button>-->
            <!--<el-button @click="cleanFrom">取消</el-button>-->
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import { getAllUpmsOrgList, getOrgInfoById, saveOrgInfo } from '@/api/org/org-api'

  export default {
    name: 'orgManage',

    data() {
      return {
        orgTreeList: [],
        loading: true,
        submitDisabled: true,
        submitLoading: false,
        defaultProps: {
          label: 'name',
          children: 'nodes'
        },
        // 编辑表单
        editForm: {
          id: '',
          orgName: '',
          orgDesc: '',
          delete: '',
          leaders: [],
          updateByName: '',
          updateTime: ''
        },
        rules: {
          orgName: [
            { required: true, message: '请输入组织名称', trigger: 'blur' },
            { min: 1, max: 50, message: '最多输入25个字符', trigger: 'blur' }
          ]
        }
      }
    },

    methods: {
      // 获取组织树结构
      getOrgTreeList() {
        new Promise((resolve, reject) => {
          getAllUpmsOrgList().then(response => {
            this.loading = false
            this.orgTreeList = response.data
            resolve(response)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 获取组织信息
      getOrgInfo(id) {
        new Promise((resolve, reject) => {
          getOrgInfoById(id).then(response => {
            const data = response.data
            this.editForm = {
              id: data.id,
              orgName: data.orgName,
              orgDesc: data.orgDesc,
              delete: data.delete.toString(),
              leaders: data.leaders,
              updateByName: data.updateByName,
              updateTime: data.updateTime
            }
            this.submitDisabled = false
            resolve(response)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 节点点击事件
      handleNodeClick(data) {
        // 如果text为数字则为csa组织结构
        if (!isNaN(data.text)) {
          this.getOrgInfo({ 'orgId': data.id })
        }
      },
      onSubmit() {
        this.$refs['editForm'].validate((valid) => {
          if (valid) {
            this.submitLoading = true
            const csaOrg = {
              id: this.editForm.id,
              orgName: this.editForm.orgName,
              orgDesc: this.editForm.orgDesc,
              delete: this.editForm.delete
            }
            new Promise((resolve, reject) => {
              saveOrgInfo(csaOrg).then(response => {
                this.submitLoading = false
                this.$message({
                  message: response.rspMsg,
                  type: response.rspCode === this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                  showClose: true
                })
                this.getOrgInfo({ orgId: csaOrg.id })
                resolve(response)
              }).catch(error => {
                this.submitLoading = false
                reject(error)
              })
            })
          }
        })
      },
      cleanFrom() {
        this.submitDisabled = true
        this.editForm = {
          id: '',
          orgName: '',
          orgDesc: '',
          delete: '',
          leaders: [],
          updateByName: '',
          updateTime: ''
        }
      }
    },

    created() {
      this.getOrgTreeList()
    }
  }
</script>

<style scoped>
  .el-tag {
    margin-right: 10px;
  }
</style>
