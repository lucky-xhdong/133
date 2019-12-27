<template>
  <div class="app-container">
    <!-- 查询条件 start -->
    <div class="filter-container">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="考核月份" prop="assessDate">
          <el-date-picker
            v-model="queryForm.beginDate"
            type="month"
            placeholder="请选择月份"
            value-format="yyyy-MM">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="组织结构">
          <org-tree ref="orgTree"></org-tree>
        </el-form-item>

        <el-form-item label="考核模版">
          <el-select v-model="queryForm.modelId" placeholder="请选择" clearable filterable>
            <el-option v-for="item in modelOptions" :key="item.id" :value="item.id" :label="item.modelName">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="客服姓名">
          <el-input @keyup.enter.native="handleFilter" class="filter-item" placeholder="请输入客服姓名" clearable
                    v-model="queryForm.trueName">
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getDataList"
                     :loading="listLoading">搜索
          </el-button>
          <el-button class="filter-item" type="info" icon="el-icon-error" @click="handleResetFilter"
                     :loading="listLoading">重置
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button class="filter-item" type="primary" icon="el-icon-download" @click="exportExcel"
                     :loading="exportLoading" v-if="userEmail === 'luoyx@133.cn' || userEmail === 'wanjh@133.cn' || userEmail === 'humr@huoli.com' || userEmail === 'liyang01@133.cn'">客服绩效考核表导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="dataList" style="width: 100%" :max-height="tableHeight" stripe highlight-current-row border>
      <el-table-column align="center" label="客服工号" fixed width="120">
        <template slot-scope="scope">
          <span>{{scope.row.userInfo.agentNo}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="姓名" fixed width="120">
        <template slot-scope="scope">
          <span>{{scope.row.userInfo.trueName}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" v-for="detail in modelItemList" :key="detail.item" :label="detail.item_cn"
                       width="140">
        <el-table-column align="center" label="得分">
          <template slot-scope="scope">
            <span>{{ scope.row[detail.item] ? scope.row[detail.item].score : 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="明细">
          <template slot-scope="scope">
            <span>{{ scope.row[detail.item] ? scope.row[detail.item].originDataVaule : 0 }}</span>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column align="center" label="总分" fixed="right" width="60">
        <template slot-scope="scope">
          <span>{{ scope.row.jxzf ? scope.row.jxzf.score : 0}}</span>
        </template>
      </el-table-column>
    </el-table>
    <iframe :src="src" style="display: none;"></iframe>
  </div>
</template>

<script>
  import _ from 'lodash'
  import { getUser } from '@/api/users/user-api'
  import { getResultDataList, getAllModelList, getModelItem } from '@/api/kpi/score-result-api'
  import orgTree from '../../common/orgTree'
  import { parseTime } from '@/utils'

  export default {
    name: 'scoreResult',
    components: { orgTree },

    data() {
      return {
        dataList: [],
        listLoading: false,
        exportLoading: false,
        queryForm: {
          beginDate: '',
          orgId: 0,
          modelId: '',
          trueName: ''
        },
        modelOptions: [],
        modelItemList: [],
        tableHeight: document.body.clientHeight - 120,
        src: '',
        userEmail: ''
      }
    },
    methods: {
      // 获取用户信息
      getUser() {
        return new Promise((resolve, reject) => {
          getUser().then((res) => {
            this.userEmail = res.data.email
            resolve(res)
          }).catch((error) => {
            reject(error)
          })
        })
      },
      // 查询结果列表
      getDataList() {
        if (!this.queryForm.beginDate) {
          this.$message({
            message: '请选择考核月份',
            type: 'error',
            showClose: true
          })
          return
        }

        // 设置组织结构查询条件
        if (this.$refs.orgTree) {
          const selectedOptionsArr = this.$refs.orgTree.selectedOptions
          this.queryForm.orgId = ''
          if (selectedOptionsArr && selectedOptionsArr.length > 1) {
            this.queryForm.orgId = selectedOptionsArr[selectedOptionsArr.length - 1]
          }
        }
        if (this.queryForm.modelId === '' && this.queryForm.orgId === '') {
          this.$message({
            message: '组织结构或考核模版不能为空',
            type: 'error',
            showClose: true
          })
          return
        }

        this.listLoading = true
        new Promise((resolve, reject) => {
          getResultDataList(this.queryForm).then(response => {
            this.dataList = response.data
            // 获取模版项
            new Promise((resolve, reject) => {
              getModelItem().then(response => {
                this.modelItemList = response.data
                resolve(response)
              }).catch(error => {
                reject(error)
              })
            })
            this.listLoading = false
            resolve(response)
          }).catch(error => {
            this.listLoading = false
            reject(error)
          })
        })
      },
      // 获取模版名称列表
      getModelList() {
        new Promise((resolve, reject) => {
          getAllModelList().then(response => {
            this.modelOptions = response.data
            resolve(response)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 下载报表
      exportExcel() {
        if (!this.queryForm.beginDate) {
          this.$message({
            message: '请选择考核月份',
            type: 'error',
            showClose: true
          })
          return
        }
        this.exportLoading = true
        this.src = process.env.BASE_API + '/csaExcel/excelDownload/downloadAssessExcel?assessDate=' + this.queryForm.beginDate + '&timestamp=' + new Date().getTime()
        const temp = this
        // 防止重复点击
        setTimeout(function() {
          temp.exportLoading = false
        }, 10000)
      },
      // 清空查询条件
      handleResetFilter() {
        this.$refs.orgTree.selectedOptions = []
        this.queryForm = {
          beginDate: '',
          orgId: 0,
          modelId: '',
          trueName: ''
        }
      },
      // 自适应高度
      resize() {
        const that = this
        // _.debounce 是一个通过 lodash 限制操作频率的函数。
        window.onresize = _.debounce(() => {
          that.tableHeight = document.body.clientHeight - 120
        }, 400)
      }
    },
    created() {
      this.getUser()
      this.getModelList()
      this.queryForm.beginDate = parseTime(new Date(), '{y}-{m}')
    },
    mounted() {
      // 自适应高度
      this.resize()
    }
  }
</script>

<style scoped>

</style>
