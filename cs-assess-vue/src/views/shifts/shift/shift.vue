<template>
  <el-row class="shift-container">
    <el-row class="sc-form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="sc-form">
        <el-form-item label="班次名称" prop="shiftName">
          <el-input v-model="queryForm.shiftName"></el-input>
        </el-form-item>
        <el-form-item label="班次状态" prop="delete">
          <el-radio-group v-model="queryForm.delete">
            <el-radio :label="0">有效</el-radio>
            <el-radio :label="1">无效</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="selectShiftList(pageNumber)" :loading="loading">查询</el-button>
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
        class="shift-page">
      </el-pagination>
      <!-- END table数据列表 -->
    </el-row>
    <!-- 新增/编辑弹窗 start -->
    <el-dialog :title=dialogTitle class="add-dialog" :visible.sync="dialogAddFormVisible" width="690px" :close-on-click-modal="false">
      <el-form :model="addForm" ref="addForm" :rules="rules">
        <el-form-item label="班次名称" prop="shiftName" :label-width="formLabelWidth">
          <el-input v-model="addForm.shiftName"></el-input>
        </el-form-item>
        <el-form-item label="上班时间" :label-width="formLabelWidth">
          <el-time-select
            placeholder="上班时间"
            v-model="shiftStartTime"
            :picker-options="{
              start: '00:00',
              step: '00:15',
              end: '23:59'
            }"
            >
          </el-time-select>
        </el-form-item>
        <el-form-item label="下班时间" :label-width="formLabelWidth">
          <el-time-select
            placeholder="下班时间"
            v-model="shiftEndTime"
            :picker-options="{
              start: '00:00',
              step: '00:15',
              end: '23:59'
            }">
          </el-time-select>
        </el-form-item>
        <el-form-item label="休息时长(小时)" prop="restDurationHour" :label-width="formLabelWidth">
          <el-input-number v-model="addForm.restDurationHour" :min="0" :max="10"></el-input-number>
        </el-form-item>
        <el-form-item label="折算工作日" prop="shiftConvertDay" :label-width="formLabelWidth">
          <el-input-number v-model="addForm.shiftConvertDay" :min="1" :max="10"></el-input-number>
        </el-form-item>
        <el-form-item label="班次类型" prop="shiftWorkType" :label-width="formLabelWidth">
          <el-select v-model="addForm.shiftWorkType">
            <el-option v-for="(item, index) in shiftWorkTypeList"
                       :key="index"
                       :label=item.label
                       :value=item.value></el-option>
          </el-select>
        </el-form-item>
        <!--班次类型为多段才展示第二段上班时间 start-->
        <el-form-item label="第二段上班时间" :label-width="formLabelWidth" v-if="addForm.shiftWorkType === 2">
          <el-time-select
            placeholder="第二段上班时间"
            v-model="secondStartTime"
            :picker-options="{
              start: '00:00',
              step: '00:15',
              end: '23:59'
            }">
          </el-time-select>
        </el-form-item>
        <el-form-item label="第二段下班时间" :label-width="formLabelWidth" v-if="addForm.shiftWorkType === 2">
          <el-time-select
            placeholder="第二段下班时间"
            v-model="secondEndTime"
            :picker-options="{
              start: '00:00',
              step: '00:15',
              end: '23:59'
            }">
          </el-time-select>
        </el-form-item>
        <!--班次类型为多段才展示第二段上班时间 end-->
        <el-form-item label="补贴类型" prop="shiftSubsidyType" :label-width="formLabelWidth">
          <el-select v-model="addForm.shiftSubsidyType">
            <el-option v-for="(item, index) in shiftSubsidyTypeList"
                       :key="index"
                       :label=item.value
                       :value=item.key></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否跨天" prop="isOverDay" :label-width="formLabelWidth">
          <el-radio-group v-model="addForm.isOverDay">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="delete" :label-width="formLabelWidth">
          <el-radio-group v-model="addForm.delete">
            <el-radio :label="0">有效</el-radio>
            <el-radio :label="1">无效</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="shiftDesc" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="addForm.shiftDesc" ></el-input>
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
  import { selectShiftList, saveShift } from '@/api/shifts/shift-api'
  import orgTree from '../../common/orgTree'
  const timeFilter = function(time) {
    const hour = parseInt(time.split(':')[0]) || '00' // 小时
    const min = parseInt(time.split(':')[1]) || '00' // 分钟
    const second = parseInt(time.split(':')[2]) || '00' // 分钟
    const hourTimestamp = (hour - 8) * 60 * 60 * 1000
    const minTimestamp = min * 60 * 1000
    const secondTimestamp = second * 1000
    return hourTimestamp + minTimestamp + secondTimestamp
  }

  export default {
    components: { orgTree },
    data() {
      return {
        queryForm: {
          shiftName: '', // 班次名称
          delete: 0, // 是否有效：0有效，1无效
          pageNumber: 1, // 当前页
          pageSize: 20 // 每页行数
        }, // 查询列表表单
        loading: false,
        pageNumber: 1, // 默认查询第1页
        dialogAddFormVisible: false, // 是否显示新增班次弹窗
        dialogDeleteVisible: false, // 是否显示删除弹窗
        tableConfigItems: [
          {
            label: '班次名称', prop: 'shiftName', width: ''
          }, {
            label: '上班时间', prop: '_shiftStartTime', width: ''
          }, {
            label: '下班时间', prop: '_shiftEndTime', width: ''
          }, {
            label: '休息时长', prop: 'restDurationHour', width: ''
          }, {
            label: '描述', prop: 'shiftDesc', width: '100'
          }
        ], // table表格配置项
        tableData: [], // table数据列表
        addForm: {
          shiftName: '', // 班次名称（必填）
          restDurationHour: '', // 休息时长（小时）（必填）
          shiftWorkType: '', // 班次类型：1正常 2多段（必填）
          shiftSubsidyType: '', // 班次补贴类型：1客服白班，2审核白班，3小夜班，4大夜班（必填）
          isOverDay: 0, // 是否跨天：0否 1是（必填）
          delete: 0, // 状态：0无效 1有效（必填）
          shiftConvertDay: '', // 折算工作日（小数）（必填）
          shiftDesc: '' // 班次描述
        }, // 新增班次表单
        shiftStartTime: '',
        shiftEndTime: '',
        secondStartTime: '',
        secondEndTime: '',
        formLabelWidth: '150px', // 表单标签宽度
        modelList: [], // 班次列表
        rules: {
          shiftName: [
            { required: true, message: '请输入班次名称', trigger: 'blur' }
          ],
          shiftStartTime: [
            { required: true, message: '请选择上班时间', trigger: 'change' }
          ],
          shiftEndTime: [
            { required: true, message: '请选择下班时间', trigger: 'change' }
          ],
          restDurationHour: [
            { required: true, message: '请输入休息时长', trigger: 'blur' }
          ],
          shiftConvertDay: [
            { required: true, message: '请输入折算工作日', trigger: 'blur' }
          ],
          shiftWorkType: [
            { required: true, message: '请选择班次类型', trigger: 'change' }
          ],
          secondStartTime: [
            { required: true, message: '请选择第二段上班时间', trigger: 'change' }
          ],
          secondEndTime: [
            { required: true, message: '请选择第二段下班时间', trigger: 'change' }
          ],
          shiftSubsidyType: [
            { required: true, message: '请选择补贴类型', trigger: 'change' }
          ]
        },
        dialogTitle: '新增班次',
        shiftWorkTypeList: [
          { value: 1, label: '正常' },
          { value: 2, label: '多段' }
        ],
        shiftSubsidyTypeList: [
          { key: 1, value: '客服白班' },
          { key: 2, value: '审核白班' },
          { key: 3, value: '小夜班' },
          { key: 4, value: '大夜班' }
        ],
        pickerStart: {
          disabledDate: (time) => {
          }
        }
      }
    },
    created() {
      this.selectShiftList(this.pageNumber) // 查询班次列表
    },
    methods: {
      /**
       * 查询班次列表
       * */
      selectShiftList(pageNumber) {
        const _this = this
        this.loading = true
        this.queryForm.pageNumber = pageNumber || this.pageNumber
        return new Promise((resolve, reject) => {
          selectShiftList(_this.queryForm).then((res) => {
            _this.loading = false
            if (res.rows && res.rows.length > 0) {
              _this.tableData = res.rows.map((item, index) => {
                // todo: 处理绩效月份，录入时间
                return Object.assign({}, item, {
                  _shiftStartTime: item.shiftStartTime === 0 ? '08:00' : formatDateByTimestamp(new Date(item.shiftStartTime), 'hh:mm'),
                  _shiftEndTime: item.shiftEndTime === 0 ? '08:00' : formatDateByTimestamp(new Date(item.shiftEndTime), 'hh:mm')
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
       * 显示新增班次弹窗
       */
      showAddForm(row) {
        this.dialogAddFormVisible = true
        if (row && row.id) {
          this.addForm.id = row.id
          this.addForm.shiftName = row.shiftName
          this.shiftStartTime = row.shiftStartTime === 0 ? '08:00' : formatDateByTimestamp(row.shiftStartTime, 'hh:mm')
          this.shiftEndTime = row.shiftEndTime === 0 ? '08:00' : formatDateByTimestamp(row.shiftEndTime, 'hh:mm')
          this.addForm.restDurationHour = row.restDurationHour
          this.addForm.shiftWorkType = row.shiftWorkType
          this.secondStartTime = row.secondStartTime === 0 ? '08:00' : formatDateByTimestamp(row.secondStartTime, 'hh:mm')
          this.secondEndTime = row.secondEndTime === 0 ? '08:00' : formatDateByTimestamp(row.secondEndTime, 'hh:mm')
          this.addForm.shiftSubsidyType = row.shiftSubsidyType
          this.addForm.isOverDay = row.isOverDay
          this.addForm.delete = row.delete
          this.addForm.shiftConvertDay = row.shiftConvertDay
          this.addForm.shiftDesc = row.shiftDesc
          this.dialogTitle = '修改班次'
        } else {
          this.addForm.id = ''
          this.addForm.shiftName = ''
          this.shiftStartTime = ''
          this.shiftEndTime = ''
          this.addForm.restDurationHour = ''
          this.addForm.shiftWorkType = ''
          this.secondStartTime = ''
          this.secondEndTime = ''
          this.addForm.shiftSubsidyType = ''
          this.addForm.isOverDay = 0
          this.addForm.delete = 0
          this.addForm.shiftConvertDay = ''
          this.addForm.shiftDesc = ''
          this.dialogTitle = '新增班次'
        }
      },

      /**
       * 提交新增/编辑班次表单
       * 校验表单必填项是否通过
       */
      submitAddForm(form) {
        const _this = this
        if (this.addForm.shiftWorkType === 2) { // 多段班次
          if (!this.secondStartTime || !this.secondEndTime) {
            this.$message({
              message: '第二段上班时间或下班时间不能为空！',
              type: 'error',
              showClose: true
            })
            return false
          }
          if (!this.shiftStartTime || !this.shiftEndTime) {
            this.$message({
              message: '上班时间或下班时间不能为空！',
              type: 'error',
              showClose: true
            })
            return false
          }
        } else { // 正常班次
          if (!this.shiftStartTime || !this.shiftEndTime) {
            this.$message({
              message: '上班时间或下班时间不能为空！',
              type: 'error',
              showClose: true
            })
            return false
          }
        }
        this.$refs[form].validate((valid) => {
          if (valid) {
            const params = {
              shiftName: _this.addForm.shiftName, // 班次名称（必填）
              shiftStartTime: timeFilter(_this.shiftStartTime), // 上班时间HH:mm:ss（必填）
              shiftEndTime: timeFilter(_this.shiftEndTime), // 下班时间HH:mm:ss（必填）
              restDurationHour: _this.addForm.restDurationHour, // 休息时长（小时）（必填）
              shiftWorkType: _this.addForm.shiftWorkType, // 班次类型：1正常 2多段（必填）
              secondStartTime: timeFilter(_this.secondStartTime), // 第二段上班时间（多段班次）
              secondEndTime: timeFilter(_this.secondEndTime), // 第二段下班时间（多段班次）
              shiftSubsidyType: _this.addForm.shiftSubsidyType, // 班次补贴类型：1客服白班，2审核白班，3小夜班，4大夜班（必填）
              isOverDay: _this.addForm.isOverDay, // 是否跨天：0否 1是（必填）
              delete: _this.addForm.delete, // 状态：0无效 1有效（必填）
              shiftConvertDay: _this.addForm.shiftConvertDay, // 折算工作日（小数）（必填）
              shiftDesc: _this.addForm.shiftDesc // 班次描述
            }
            if (_this.addForm.id) {
              params.id = _this.addForm.id // 申请人id
            }
            return new Promise((resolve, reject) => {
              // 有id表示更新
              if (_this.addForm.id) {
                saveShift(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.$refs[form].resetFields()
                  _this.addForm.shiftStartTime = ''
                  _this.addForm.shiftEndTime = ''
                  _this.selectShiftList(_this.pageNumber)
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
                saveShift(params).then(res => {
                  _this.dialogAddFormVisible = false
                  _this.$refs[form].resetFields()
                  _this.addForm.shiftStartTime = ''
                  _this.addForm.shiftEndTime = ''
                  _this.selectShiftList(_this.pageNumber)
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
          shiftName: '', // 班次名称
          delete: 0, // 是否有效：0有效，1无效
          pageNumber: 1,
          pageSize: 20
        }
        this.selectShiftList(this.pageNumber)
      },

      /**
       * 取消新增班次
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
        this.selectShiftList(val)
      },
      handleCurrentChange(val) {
        this.queryForm.pageNumber = val
        this.selectShiftList(val)
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/shifts/shift";
</style>
