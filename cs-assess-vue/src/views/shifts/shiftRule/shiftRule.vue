<template>
  <el-row class="shiftRule-container">
    <el-row class="breadcrumb-wrapper" data-before="当前位置：" v-show="showBreadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
        <el-breadcrumb-item><a href="javascript: history.go(-1);">整体班务月视图</a></el-breadcrumb-item>
        <el-breadcrumb-item><b>排班规则管理</b></el-breadcrumb-item>
      </el-breadcrumb>
      <a href="javascript: history.go(-1);" class="btn-back">返回>></a>
    </el-row>
    <el-row class="sc-form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="sc-form">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="queryForm.ruleName" placeholder="规则名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="排班规则状态" prop="delete">
          <el-radio-group v-model="queryForm.delete">
            <el-radio :label="0">有效</el-radio>
            <el-radio :label="1">无效</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getShiftRuleList(pageNumber)" :loading="loading">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showAddForm">新增</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <el-row class="sc-table-wrapper">
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
        class="shiftRule-page">
      </el-pagination>
      <!-- END table数据列表 -->
    </el-row>
    <!-- 新增/编辑弹窗 start -->
    <el-dialog :title=dialogTitle class="add-dialog" :visible.sync="dialogAddFormVisible" width="690px" :close-on-click-modal="false">
      <el-form :model="addForm" ref="addForm" :rules="rules">
        <el-form-item label="选择班次" prop="shiftId" :label-width="formLabelWidth">
          <el-select v-model="addForm.shiftId">
            <el-option v-for="(item, index) in $store.state.shiftStore.shiftList"
                       :key="index"
                       :label=item.shiftName
                       :value=item.id></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规则名称" prop="ruleName" :label-width="formLabelWidth">
          <el-input v-model="addForm.ruleName"></el-input>
        </el-form-item>
        <el-form-item label="排班周期开始日期" prop="ruleCycleStart" :label-width="formLabelWidth">
          <el-date-picker
            v-model="addForm.ruleCycleStart"
            type="date"
            @change="showCycleDate"
            value-format="timestamp"
            placeholder="请选择排班周期开始日期">
          </el-date-picker>
          <span class="time-slot">{{ruleCycleStartTime}}</span>
        </el-form-item>
        <el-form-item label="排班周期结束日期" prop="ruleCycleEnd" :label-width="formLabelWidth">
          <el-date-picker
            v-model="addForm.ruleCycleEnd"
            type="date"
            @change="showCycleDate"
            :picker-options="pickerEnd"
            value-format="timestamp"
            placeholder="请选择排班周期结束日期">
          </el-date-picker>
          <span class="time-slot">{{ruleCycleEndTime}}</span>
        </el-form-item>
        <el-form-item label="排班周期长度(天)" prop="ruleCycleDays" :label-width="formLabelWidth" v-if="addForm.id">
          <el-input-number v-model="addForm.ruleCycleDays" :min="1" :max=maxCycle @change="setWorkDayByCycleDate"></el-input-number>
        </el-form-item>
        <el-form-item label="排班周期长度(天)" prop="ruleCycleDays" :label-width="formLabelWidth" v-else v-show="isShowCycleDate">
          <el-input-number v-model="addForm.ruleCycleDays" :min="1" :max=maxCycle @change="setWorkDayByCycleDate"></el-input-number>
        </el-form-item>
        <!--编辑 start-->
        <el-form-item label="选择上班的那几天" prop="workDayIndex" :label-width="formLabelWidth" v-if="addForm.id">
          <el-select v-model="addForm.workDayIndex" multiple placeholder="请选择">
            <el-option
              v-if="workDayList && workDayList.length > 0"
              v-for="(item, index) in workDayList"
              :key=index
              :label=item.label
              :value=index>
            </el-option>
          </el-select>
        </el-form-item>
        <!--编辑 end-->
        <!--新增 start-->
        <el-form-item label="选择上班的那几天" prop="workDayIndex" :label-width="formLabelWidth" v-else v-show="isShowCycleDate">
          <el-select v-model="addForm.workDayIndex" multiple placeholder="请选择">
            <el-option
              v-if="workDayList && workDayList.length > 0"
              v-for="(item, index) in workDayList"
              :key=index
              :label=item.label
              :value="index">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="delete" :label-width="formLabelWidth">
          <el-radio-group v-model="isDelete">
            <el-radio :label="0">有效</el-radio>
            <el-radio :label="1">无效</el-radio>
          </el-radio-group>
        </el-form-item>
        <!--新增 end-->
        <el-form-item label="描述" prop="ruleDesc" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="addForm.ruleDesc" ></el-input>
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
  import { getShiftRuleList, saveShiftRule } from '@/api/shifts/shift-rule-api'
  import orgTree from '../../common/orgTree'

  export default {
    components: { orgTree },
    data() {
      return {
        showBreadcrumb: false,
        queryForm: {
          ruleName: '', // 班次名称
          delete: 0, // 是否有效：0有效，1无效
          pageNumber: 1, // 当前页
          pageSize: 20 // 每页行数
        }, // 查询列表表单
        loading: false,
        pageNumber: 1, // 默认查询第1页
        dialogAddFormVisible: false, // 是否显示新增班次弹窗
        dialogDeleteVisible: false, // 是否显示删除弹窗
        errorTip: '',
        showErrorTip: false,
        tableConfigItems: [
          {
            label: '规则名称', prop: 'ruleName', width: ''
          }, {
            label: '班次名称', prop: 'shiftName', width: ''
          }, {
            label: '排班周期开始日期', prop: '_ruleCycleStart', width: ''
          }, {
            label: '排班周期结束日期', prop: '_ruleCycleEnd', width: ''
          }, {
            label: '排班周期长度', prop: 'ruleCycleDays', width: ''
          }, {
            label: '规则描述', prop: 'ruleDesc', width: ''
          }, {
            label: '更新人', prop: 'updateByName', width: ''
          }, {
            label: '更新时间', prop: '_updateTime', width: ''
          }
        ], // table表格配置项
        tableData: [], // table数据列表
        addForm: {
          shiftId: '', // 班次id（必填）
          ruleName: '', // 规则名称（必填）
          ruleDesc: '', // 规则描述（必填）
          ruleCycleStart: '', // 排班周期开始日期（必填）
          ruleCycleEnd: '', // 排班周期结束日期（必填）
          ruleCycleDays: '', // 排班周期长度（必填）
          workDayIndex: [] // 排班规则细节（必填）
        }, // 新增班次表单
        ruleCycleStartTime: '00:00:00', // 排班开始时间
        ruleCycleEndTime: '23:59:59', // 排班结束时间
        isDelete: 0, // 是否有效
        workDayList: [], // 上班的那几天
        formLabelWidth: '150px', // 表单标签宽度
        modelList: [], // 班次列表
        rules: {
          shiftId: [
            { required: true, message: '请选择班次', trigger: 'change' }
          ],
          ruleName: [
            { required: true, message: '请输入规则名称', trigger: 'blur' }
          ],
          ruleCycleStart: [
            { required: true, message: '请选择排班周期开始日期', trigger: 'change' }
          ],
          ruleCycleEnd: [
            { required: true, message: '请选择排班周期结束日期', trigger: 'change' }
          ],
          ruleCycleDays: [
            { required: true, message: '请输入排班周期长度', trigger: 'blur' }
          ],
          workDayIndex: [
            { required: true, message: '请选择上班日期', trigger: 'change' }
          ],
          ruleDesc: [
            { required: true, message: '请输入规则描述', trigger: 'blur' }
          ]
        },
        dialogTitle: '新增排班规则',
        shiftRuleWorkTypeList: [
          { value: 1, label: '正常' },
          { value: 2, label: '多段' }
        ],
        shiftRuleSubsidyTypeList: [
          { key: 1, value: '客服白班' },
          { key: 2, value: '审核白班' },
          { key: 3, value: '小夜班' },
          { key: 4, value: '大夜班' }
        ],
        pickerStart: {
          // 开始日期不能大于结束日期
          disabledDate: (time) => {
            if (this.addForm.ruleCycleEnd !== '') {
              const date = new Date(this.addForm.ruleCycleEnd).getTime()
              return time.getTime() > date
            } else {
              return time.getTime() < Date.now()
            }
          }
        },
        pickerEnd: {
          disabledDate: (time) => {
            if (this.addForm.ruleCycleStart !== '') {
              const date = new Date(this.addForm.ruleCycleStart).getTime()
              return time.getTime() < date
            } else {
              return time.getTime() > Date.now()
            }
          }
        },
        isShowCycleDate: false
      }
    },
    created() {
      this.getShiftRuleList(this.pageNumber) // 查询班次列表
      // 根据路由参数判断有值显示面包屑导航，没有则不显示
      if (this.$router.history.current.query.date) {
        this.showBreadcrumb = true
      } else {
        this.showBreadcrumb = false
      }
    },
    computed: {
      /**
       * 最大周期是结束日期减去开始日期的差值取天数
       * */
      maxCycle() {
        const start = new Date(this.addForm.ruleCycleStart)
        const end = new Date(this.addForm.ruleCycleEnd)
        const diff = end.getTime() - start.getTime()
        return parseInt(diff / (1000 * 60 * 60 * 24)) + 1
      }
    },
    methods: {
      /**
       * 查询班次列表
       * */
      getShiftRuleList(pageNumber) {
        const _this = this
        this.loading = true
        this.queryForm.pageNumber = pageNumber || this.pageNumber
        return new Promise((resolve, reject) => {
          getShiftRuleList(_this.queryForm).then((res) => {
            _this.loading = false
            if (res.rows && res.rows.length > 0) {
              _this.tableData = res.rows.map((item, index) => {
                // todo: 处理上班时间，下班时间
                return Object.assign({}, item, {
                  _ruleCycleStart: formatDateByTimestamp(item.ruleCycleStart),
                  _ruleCycleEnd: formatDateByTimestamp(item.ruleCycleEnd),
                  _updateTime: formatDateByTimestamp(item.updateTime, 'yyyy-MM-dd hh:mm:ss')
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
       * 显示排班周期和上班的那几天
       * 开始日期和结束日期都选择才展示排班周期长度和要上班的那几天
       * 根据排班周期开始日期和结束日期及排班周期去设置要上班的那几天
       * */
      showCycleDate() {
        if (this.addForm.ruleCycleStart && this.addForm.ruleCycleEnd) {
          this.isShowCycleDate = true
          this.setWorkDayByCycleDate()
        }
      },

      /**
       * 设置要上班的那几天
       * 条件：排班周期开始日期，排班周期结束日期，排班周期长度
       * 功能点：
       *    1.获取开始日期
       *    2.根据开始日期和排班周期长度设置要上班的那几天的日期
       *      2.1如果排班周期为1，要上班的那几天默认为选择的开始日期
       *      2.2如果排班周期不为1，要上班的那几天为开始日期加上排班周期长度
       * */
      setWorkDayByCycleDate() {
        const begin = this.addForm.ruleCycleStart // 开始日期
        const end = new Date(formatDateByTimestamp(begin)) // 结束日期
        this.workDayList = [] // 每次添加前先把数组清空 避免重复添加
        const aBegin = formatDateByTimestamp(begin).split('-') // 将开始日期转换为数组
        const aEnd = formatDateByTimestamp(end.setDate((end.getDate() - 1) + this.addForm.ruleCycleDays)).split('-') // 将结束日期转换为数组
        // 设置日期
        const dateBegin = new Date()
        dateBegin.setUTCFullYear(aBegin[0], aBegin[1] - 1, aBegin[2])
        const dateEnd = new Date()
        dateEnd.setUTCFullYear(aEnd[0], aEnd[1] - 1, aEnd[2])
        const unixDateBegin = dateBegin.getTime() - 24 * 60 * 60 * 1000
        const unixDateEnd = dateEnd.getTime() - 24 * 60 * 60 * 1000

        // 设置星期
        const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        let sDate = '' // 存在转换后的日期+星期
        // 如果周期为1，上班时间为开始日期，不为1，则上班时间为开始日期+排班周期
        if (this.addForm.ruleCycleDays && this.addForm.ruleCycleDays === 1) {
          sDate = formatDateByTimestamp(begin) + ' ' + weekday[new Date(begin).getDay()]
          this.workDayList.push({
            label: sDate,
            value: 0
          })
        } else {
          for (let k = unixDateBegin; k <= unixDateEnd;) {
            k = k + 24 * 60 * 60 * 1000
            sDate = formatDateByTimestamp(new Date(parseInt(k))) + ' ' + weekday[new Date(parseInt(k)).getDay()]
            if (!this.workDayList.includes(sDate)) {
              this.workDayList.push({
                label: sDate
              })
              this.workDayList.map((item, index) => {
                item.value = index
              })
            }
          }
        }
        return this.workDayList
      },

      /**
       * 显示新增班次弹窗
       */
      showAddForm(row) {
        this.$store.dispatch('SelectShiftListUnlimited')
        this.dialogAddFormVisible = true
        if (row && row.id) {
          this.addForm.id = row.id // 班次id
          this.addForm.shiftId = row.shiftId
          this.addForm.ruleName = row.ruleName // 规则名称
          this.addForm.ruleDesc = row.ruleDesc // 规则描述
          this.addForm.ruleCycleStart = row.ruleCycleStart // 排班周期开始日期
          this.addForm.ruleCycleEnd = row.ruleCycleEnd // 排班周期结束日期
          this.addForm.ruleCycleDays = row.ruleCycleDays // 排班周期长度
          this.addForm.workDayIndex = row.workDayList.map(function(item, index, array) {
            return item - 0
          })
          this.isDelete = row.delete // 是否有效
          this.dialogTitle = '修改排班规则'
          // 编辑时根据拿到的开始日期和排班周期设置上班的那几天
          this.setWorkDayByCycleDate()
        } else {
          this.isDelete = 0
          this.addForm = {
            shiftId: '', // 班次id（必填）
            ruleName: '', // 规则名称（必填）
            ruleDesc: '', // 规则描述（必填）
            ruleCycleStart: '', // 排班周期开始日期（必填）
            ruleCycleEnd: '', // 排班周期结束日期（必填）
            ruleCycleDays: '', // 排班周期长度（必填）
            workDayIndex: [] // 排班规则细节（必填）
          }
          this.dialogTitle = '新增排班规则'
        }
      },

      /**
       * 提交新增/编辑班次表单
       * 校验表单必填项是否通过
       */
      submitAddForm(form) {
        const _this = this
        this.$refs[form].validate((valid) => {
          if (valid) {
            const params = {
              shiftId: _this.addForm.shiftId, // 班次名称（必填）
              ruleName: _this.addForm.ruleName, // 规则名称（必填）
              ruleDesc: _this.addForm.ruleDesc, // 规则描述（必填）
              ruleCycleDays: _this.addForm.ruleCycleDays, // 排班周期长度（必填）
              delete: _this.isDelete // 0有效 1无效
            }
            if (_this.addForm.ruleCycleStart) {
              params.ruleCycleStart = +new Date(formatDateByTimestamp(_this.addForm.ruleCycleStart) + ' ' + this.ruleCycleStartTime) // 排班周期开始日期（必填）
            }
            if (_this.addForm.ruleCycleEnd) {
              params.ruleCycleEnd = +new Date(formatDateByTimestamp(_this.addForm.ruleCycleEnd) + ' ' + this.ruleCycleEndTime) // 排班周期开始日期（必填）
            }

            if (_this.addForm.id) {
              params.id = _this.addForm.id
            }
            params.workDayIndex = _this.addForm.workDayIndex.sort((a, b) => a - b)
            return new Promise((resolve, reject) => {
              // 有id表示更新
              if (_this.addForm.id) {
                saveShiftRule(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.getShiftRuleList(_this.pageNumber)
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
                saveShiftRule(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.getShiftRuleList(_this.pageNumber)
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
          ruleName: '', // 班次名称
          delete: 0, // 是否有效：0有效，1无效
          pageNumber: 1,
          pageSize: 20
        }
        this.getShiftRuleList(this.pageNumber)
      },

      /**
       * 取消新增班次
       * 关闭弹窗
       * 清空表单输入项
       */
      cancelAddForm(form) {
        this.$refs[form].resetFields()
        this.dialogAddFormVisible = false
        this.isShowCycleDate = false
        this.addForm.shiftId = ''
        this.addForm.ruleName = ''
        this.addForm.ruleDesc = ''
        this.addForm.ruleCycleStart = ''
        this.addForm.ruleCycleEnd = ''
        this.addForm.ruleCycleDays = ''
        this.addForm.workDayIndex = []
        this.workDayList = []
      },

      /**
       * 关闭弹窗
       */
      handleClose(id) {

      },

      // 初始页currentPage、初始每页数据数pagesize和数据data
      handleSizeChange(val) {
        this.queryForm.pagesize = val
        this.getShiftRuleList(val)
      },
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.getShiftRuleList(val)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/shifts/shiftRule";
</style>
