<template>
  <el-row class="assess-model-container">
    <el-row class="urc-form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="pc-form">
        <el-form-item label="绩效月份：" prop="beginDate">
          <el-date-picker
            v-model="queryForm.beginDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="模板名称" prop="modelid" :label-width="formLabelWidth">
          <el-select v-model="queryForm.modelid" placeholder="请选择模板名称" clearable>
            <el-option v-for="(item, index) in modelList"
                       :key="index"
                       :label=item.modelName
                       :value=item.id>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="queryAssessModelDetailList(pageNumber)" :loading="loading">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
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
          width="100">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddForm(scope.row)">编辑</el-button>
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
        class="assess-model-page">
      </el-pagination>
      <!-- END table数据列表 -->
    </el-row>
    <!-- 新增/编辑弹窗 start -->
    <el-dialog :title=dialogTitle class="add-dialog" :visible.sync="dialogAddFormVisible" width="27%">
      <el-form :model="addForm" ref="addForm" :rules="rules">
        <el-form-item label="绩效月份" prop="beginDate" :label-width="formLabelWidth">
          <el-date-picker
            v-model="addForm.beginDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="考核指标" prop="item_cn" :label-width="formLabelWidth">
          <el-input v-model="addForm.item_cn" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="当月目标" prop="calcStandard" :label-width="formLabelWidth">
          <el-input v-model="addForm.calcStandard"></el-input>
        </el-form-item>
        <el-form-item label="基准分" prop="basisScore" :label-width="formLabelWidth">
          <el-input v-model="addForm.basisScore" ></el-input>
        </el-form-item>
        <el-form-item label="考核规则" prop="calcRule" :label-width="formLabelWidth">
          <el-input v-model="addForm.calcRule" disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="加分上限" prop="upperLimit" :label-width="formLabelWidth">
          <el-input v-model="addForm.upperLimit" ></el-input>
        </el-form-item>
        <el-form-item label="减分下限" prop="lowerLimit" :label-width="formLabelWidth">
          <el-input v-model="addForm.lowerLimit" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddForm('addForm')">取 消</el-button>
        <el-button type="primary" @click="submitAddForm('addForm')">提 交</el-button>
      </div>
    </el-dialog>
    <!-- 新增/编辑弹窗 end -->
  </el-row>
</template>
<script>
  import { formatDateByTimestamp } from '@/utils'
  import { selectAllModelList, queryAssessModelDetailList, updateAssessModelDetail } from '@/api/kpi/assess-model-api'
  import orgTree from '../../common/orgTree'

  export default {
    components: { orgTree },
    data() {
      return {
        queryForm: {
          id: '',
          beginDate: '', // 绩效月份
          modelid: '', // 模板id
          pageNumber: 1, // 当前页
          total: 0, // 当前页
          pageSize: 20 // 每页行数
        }, // 查询列表表单
        loading: false,
        pageNumber: 1, // 默认查询第1页
        dialogAddFormVisible: false, // 是否显示新增模板弹窗
        dialogAuditFormVisible: false, // 是否显示审核模板弹窗
        dialogDeleteVisible: false, // 是否显示删除弹窗
        tableConfigItems: [
          {
            label: '绩效月份', prop: 'beginDate', width: ''
          }, {
            label: '考核模板', prop: 'modelName', width: '100'
          }, {
            label: '考核指标', prop: 'item_cn', width: ''
          }, {
            label: '当月目标', prop: 'calcStandard', width: ''
          }, {
            label: '基准分', prop: 'basisScore', width: ''
          }, {
            label: '加分上限', prop: 'upperLimit', width: ''
          }, {
            label: '减分下限', prop: 'lowerLimit', width: ''
          }, {
            label: '创建时间', prop: '_createTime', width: ''
          }
        ], // table表格配置项
        tableData: [], // table数据列表
        addForm: {
          id: '', // 模板规则项id
          beginDate: '', // 考核月份
          item_cn: '', // 考核指标
          calcStandard: '', // 考核项基础目标
          basisScore: '', // 考核项基础得分
          upperLimit: '', // 考核项最高分
          lowerLimit: '' // 考核项最低分
        }, // 新增模板表单
        formLabelWidth: '132px', // 表单标签宽度
        modelList: [], // 模板列表
        rules: {
          beginDate: [
            { required: true, message: '请选择绩效月份', trigger: 'change' }
          ],
          calcStandard: [
            { required: true, message: '请输入当月目标', trigger: 'blur' }
          ],
          basisScore: [
            { required: true, message: '请输入基准分', trigger: 'blur' }
          ],
          upperLimit: [
            { required: true, message: '请输入加分上限', trigger: 'blur' }
          ],
          lowerLimit: [
            { required: true, message: '请输入减分下限', trigger: 'blur' }
          ]
        },
        dialogTitle: '',
        appliedUserId: '', // 新增弹窗姓名
        iDeleteItemId: '' // 删除数据id
      }
    },
    created() {
      this.selectAllModelList() // 获取模板
      this.queryAssessModelDetailList(this.pageNumber) // 查询模板列表
    },
    methods: {
      /**
       * 查询模板列表
       * */
      selectAllModelList() {
        const _this = this
        return new Promise((resolve, reject) => {
          selectAllModelList().then((res) => {
            _this.modelList = res.data
            resolve(res)
          }).catch((error) => {
            reject(error)
          })
        })
      },
      /**
       * 查询模板列表
       * */
      queryAssessModelDetailList(pageNumber) {
        const _this = this
        this.loading = true
        this.queryForm.pageNumber = pageNumber || this.pageNumber
        if (!this.queryForm.beginDate) {
          this.queryForm.beginDate = ''
        }
        if (this.queryForm.beginDate !== '') {
          this.queryForm.beginDate = formatDateByTimestamp(new Date(this.queryForm.beginDate) * 1, 'yyyy-MM')
        }
        return new Promise((resolve, reject) => {
          queryAssessModelDetailList(_this.queryForm).then((res) => {
            _this.loading = false
            if (res.rows && res.rows.length > 0) {
              _this.tableData = res.rows.map((item, index) => {
                // todo: 处理绩效月份，录入时间
                return Object.assign({}, item, {
                  _createTime: formatDateByTimestamp(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss')
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
       * 显示新增模板弹窗
       */
      showAddForm(row) {
        this.dialogAddFormVisible = true
        if (row && row.id) {
          this.addForm = {
            id: row.id,
            beginDate: row.beginDate,
            item_cn: row.item_cn,
            calcRule: row.calcRule,
            calcStandard: row.calcStandard === 0 ? '0' : row.calcStandard,
            basisScore: row.basisScore === 0 ? '0' : row.basisScore,
            upperLimit: row.upperLimit === 0 ? '0' : row.upperLimit,
            lowerLimit: row.lowerLimit === 0 ? '0' : row.lowerLimit
          }
          this.dialogTitle = '修改'
        }
      },

      /**
       * 提交新增/编辑模板表单
       * 校验表单必填项是否通过
       */
      submitAddForm(form) {
        const _this = this
        this.$refs[form].validate((valid) => {
          if (valid) {
            const params = {
              beginDate: formatDateByTimestamp(_this.addForm.beginDate, 'yyyy-MM'),
              item_cn: _this.addForm.item_cn,
              calcStandard: _this.addForm.calcStandard,
              calcRule: _this.addForm.calcRule,
              basisScore: _this.addForm.basisScore,
              upperLimit: _this.addForm.upperLimit,
              lowerLimit: _this.addForm.lowerLimit
            }
            if (_this.addForm.id) {
              params.id = _this.addForm.id // 申请人id
            }
            return new Promise((resolve, reject) => {
              // 有id表示更新
              if (_this.addForm.id) {
                updateAssessModelDetail(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.queryAssessModelDetailList(_this.pageNumber)
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
       * 重置查询输入项
       */
      resetQueryForm(form) {
        this.$refs[form].resetFields()
        this.queryForm = {
          modelid: '',
          applyDate: '',
          pageNumber: 1,
          pageSize: 20
        }
        this.queryAssessModelDetailList(this.pageNumber)
      },

      /**
       * 取消新增模板
       * 关闭弹窗
       * 清空表单输入项
       */
      cancelAddForm(form) {
        this.dialogAddFormVisible = false
        this.$refs[form].resetFields()
      },

      /**
       * 关闭弹窗
       */
      handleClose(id) {

      },

      // 初始页currentPage、初始每页数据数pagesize和数据data
      handleSizeChange(val) {
        this.queryForm.pagesize = val
        this.queryAssessModelDetailList(val)
      },
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.queryAssessModelDetailList(val)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/kpi/assess-model";
</style>
