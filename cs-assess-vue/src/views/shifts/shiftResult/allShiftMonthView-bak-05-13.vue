<template>
  <el-row class="allShiftMonthView">
    <el-row class="form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="sc-form">
        <el-form-item label="排班月份：" prop="shiftDate">
          <el-date-picker
            v-model="queryForm.shiftDate"
            type="month"
            placeholder="请选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="组织结构：" prop="orgId">
          <org-tree ref="orgTree" v-model="queryForm.orgId"></org-tree>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="loading" @click="initCalendar">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
          <el-button type="primary" @click="showRegularDialog" icon="el-icon-edit">规则排班</el-button>
          <el-button type="primary" @click="showOrdinaryDialog" icon="el-icon-edit">普通排班</el-button>
          <el-button type="primary" @click="showFrontSeatDialog" icon="el-icon-edit">前台座席排班</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <!--班务月视图 start-->
    <div class="calendar-wrapper" id="calendar">
      <!-- 年份 月份 -->
      <div class="cw-header">
        <!--<a href="javascript:;" class="arrow arrow-left" @click="pickPrev(currentYear,currentMonth)"><</a>-->
        <span class="txt-date">{{ currentYear }}年{{ currentMonth }}月</span>
        <!--<a href="javascript:;" class="arrow arrow-right" @click="pickNext(currentYear,currentMonth)">></a>-->
      </div>
      <!-- 星期 -->
      <div class="weekday">
        <ul>
          <li><span class="txt">星期一</span></li>
          <li><span class="txt">星期二</span></li>
          <li><span class="txt">星期三</span></li>
          <li><span class="txt">星期四</span></li>
          <li><span class="txt">星期五</span></li>
          <li><span class="txt">星期六</span></li>
          <li><span class="txt">星期日</span></li>
        </ul>
      </div>
      <!-- 日期 -->
      <div class="month" v-loading="loading">
        <ul>
          <!-- v-for循环 每一次循环用<li>标签创建一天 -->
          <li v-for="(day, index) in days" :key="index">
            <!--如果不是本月  改变类名加灰色 start-->
            <div v-if="day.day.getMonth()+1 != currentMonth" class="other-month">
              <p class="txt-day">{{ day.day.getDate() }}</p>
            </div>
            <!--如果不是本月  改变类名加灰色 end-->
            <!--如果是本月  还需要判断是不是这一天 start-->
            <div v-else class="current-month">
              <!--今天 同年同月同日 start-->
              <div class="day-wrapper active" v-if="
                  day.day.getFullYear() == new Date().getFullYear() &&
                  day.day.getMonth() == new Date().getMonth() &&
                  day.day.getDate() == new Date().getDate()">
                <p class="txt-day">{{ day.day.getDate() }}</p>
                <a @click="jumpToDayViewIframe(day.date)" v-if="day.shift && day.shift.length > 0">
                  <el-button type="default" size="mini" class="btn btn-view" icon="el-icon-view">查看</el-button>
                </a>
                <el-button type="primary" size="mini" class="btn btn-edit" v-if="day.shift && day.shift.length > 0" icon="el-icon-edit" @click="showDayShiftForm(day.date)">编辑</el-button>
                <div class="txt-shift-info" v-for="(shift, index) in day.shift" :key="index" v-if="day.shift.length > 0">
                  <el-popover
                    placement="bottom"
                    :title=shift.shiftName
                    width="200"
                    popper-class="el-popover-shift"
                    :open-delay=openDelay
                    trigger="hover">
                    <span v-for="(user, index1) in shift.userNameList" :key="index1" class="txt-user">{{index1 + 1}}.{{user}}</span>
                    <el-button slot="reference">
                      <span class="txt-shift">{{shift.shiftName}}--{{shift.userNameList.length}}人</span>
                    </el-button>
                  </el-popover>
                </div>
              </div>
              <!--今天 同年同月同日 end-->
              <div class="day-wrapper" v-else>
                <p class="txt-day">{{ day.day.getDate() }}</p>
                <a @click="jumpToDayViewIframe(day.date)" v-if="day.shift && day.shift.length > 0">
                  <el-button type="default" size="mini" class="btn btn-view" icon="el-icon-view">查看</el-button>
                </a>
                <el-button type="primary" size="mini" class="btn btn-edit" v-if="day.shift && day.shift.length > 0" icon="el-icon-edit" @click="showDayShiftForm(day.date)">编辑</el-button>
                <div class="txt-shift-info" v-for="(shift, index) in day.shift" :key="index" v-if="day.shift.length > 0">
                  <el-popover
                    placement="bottom"
                    :title=shift.shiftName
                    width="200"
                    popper-class="el-popover-shift"
                    :open-delay=openDelay
                    trigger="hover">
                    <span v-for="(user, index1) in shift.userNameList" :key="index1" class="txt-user">{{index1 + 1}}.{{user}}</span>
                    <el-button slot="reference" v-if="shift.shiftName">
                      <span class="txt-shift">{{shift.shiftName}}--{{shift.userNameList.length}}人</span>
                    </el-button>
                  </el-popover>
                </div>
              </div>
            </div>
            <!--如果是本月  还需要判断是不是这一天 end-->
          </li>
        </ul>
      </div>
    </div>
    <!--班务月视图 end-->
    <!-- 规则排班弹窗 start -->
    <el-dialog title="规则排班" :visible.sync="dialogRegularVisible" width="800px" class="rule-dialog" :before-close="hideRegularDialog" :close-on-click-modal="false">
      <el-form :model="regularForm" ref="regularForm" :rules="rules">
        <el-form-item label="组织结构" prop="csaOrgId" :label-width="formLabelWidth">
          <org-tree ref="orgTreeRegular" v-model="regularForm.csaOrgId" @getUsersUnlimited="getUsersUnlimited(regularForm, 'orgTreeRegular', '')"></org-tree>
        </el-form-item>
        <el-form-item label="选择客服" prop="userIdList" :label-width="formLabelWidth">
          <el-transfer
            filterable
            filter-placeholder="请输入编号或姓名"
            v-model="regularForm.userIdList"
            :titles="['可选择', '已选择']"
            :data="regularForm.userList">
          </el-transfer>
        </el-form-item>
        <el-form-item label="选择排班规则" prop="shiftRuleId" :label-width="formLabelWidth">
          <el-select v-model="regularForm.shiftRuleId">
            <el-option v-for="(item, index) in regularForm.shiftRuleList"
                       :key="index"
                       :label=item.ruleName
                       :value=item.id></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="hideRegularDialog">取 消</el-button>
        <el-button type="primary"><a @click="jumpToRegularIframe">排班规则管理</a></el-button>
        <el-button type="primary" @click="schedulingWithRegular('regularForm')">提 交</el-button>
      </div>
    </el-dialog>
    <!-- 规则排班弹窗 end -->
    <!-- 普通排班弹窗 start -->
    <el-dialog title="普通排班" :visible.sync="dialogOrdinaryVisible"  width="1175px" class="rule-dialog" :before-close="hideOrdinaryDialog" :close-on-click-modal="false">
      <el-form :model="ordinaryForm" ref="ordinaryForm" :rules="rules">
        <el-row class="rd-left">
          <el-form-item label="排班月份" prop="scheduleDate" :label-width="formLabelWidth">
            <el-date-picker
              v-model="ordinaryForm.scheduleDate"
              type="month"
              @change="showDateByMonth(ordinaryForm.scheduleDate)"
              :picker-options="pickerEnd"
              value-format="timestamp"
              placeholder="请选择月份">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="组织结构" prop="csaOrgId" :label-width="formLabelWidth">
            <org-tree ref="orgTreeOrdinary" v-model="ordinaryForm.csaOrgId" @getUsersUnlimited="getUsersUnlimited(ordinaryForm, 'orgTreeOrdinary', '')"></org-tree>
          </el-form-item>
          <el-form-item label="选择客服" prop="userIdList" :label-width="formLabelWidth">
            <el-transfer
              filterable
              filter-placeholder="请输入编号或姓名"
              v-model="ordinaryForm.userIdList"
              :titles="['可选择', '已选择']"
              :data="ordinaryForm.userList">
            </el-transfer>
          </el-form-item>
        </el-row>
        <el-row class="rd-right">

          <el-row class="rd-table-wrapper">
            <!-- table数据列表 -->
            <el-table
              :data="allDaysOfCurrentMonth"
              v-loading="loading"
              borders
              :height="415">
              <el-table-column label="日期" prop="date"></el-table-column>
              <el-table-column
                label="可选班次">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.shiftId">
                    <el-option v-for="(item, index) in $store.state.shiftStore.shiftList"
                               :key="index"
                               :label=item.shiftName
                               :value=item.id></el-option>
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
            <!-- END table数据列表 -->
          </el-row>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="hideOrdinaryDialog">取 消</el-button>
        <el-button type="primary" @click="schedulingWithOrdinary('ordinaryForm')">提 交</el-button>
      </div>
    </el-dialog>
    <!-- 普通排班弹窗 end -->
    <!-- 编辑日排班 start -->
    <el-dialog :title="dayShiftTitle" :visible.sync="dialogDayShiftVisible" width="1175px" class="day-shift-dialog" :before-close="hideDayShiftDialog" :close-on-click-modal="false">
      <el-row class="dialog-inner">
        <el-form :model="addForm" ref="addForm" :rules="rules">
          <el-row class="day-shift-dialog_left" data-before="修改班次" v-loading="loading">
            <el-row v-for="(shift, index) in oldShiftInfo" :key="index" class="shift-list">
              <el-form-item label="班次名称" prop="shiftName" v-if="shift.csaShift.shiftName" :label-width="formLabelMinWidth">
                <el-input v-model="shift.csaShift.shiftName" disabled="disabled"></el-input>
              </el-form-item>
              <!--暂时先去掉 start-->
              <el-form-item label="组织结构" prop="csaOrgId" :label-width="formLabelMinWidth">
                <!--<org-tree :ref="'orgTreeOld' + index" v-model="shift.csaOrgId" @getUsersUnlimited="getUsersUnlimited('', 'orgTreeOld', oldShiftInfo)"></org-tree>-->
                <org-tree :ref="'orgTreeOld' + index" v-model="shift.csaOrgId" @getUsersUnlimited="getUsersUnlimited('', 'orgTreeOld', shift, index)"></org-tree>
              </el-form-item>
              <!--暂时先去掉 end-->
              <el-form-item label="排班人员" :label-width="formLabelMinWidth">
                <el-transfer
                  ref="userList"
                  filterable
                  filter-placeholder="请输入客服名称"
                  v-model="shift.userIdList"
                  :titles="['可选择', '已选择']"
                  :rules="{required: true, message: rules.usersList, trigger: 'blur'}"
                  :data="shift.userList">
                </el-transfer>
              </el-form-item>
            </el-row>
          </el-row>
          <el-row class="day-shift-dialog_right">
            <el-row class="btn-group">
              <el-button type="primary" class="btn btn-add" @click="addMoreShiftInfo">新增班次</el-button>
            </el-row>
            <el-row :key="index" class="shift-list"  v-for="(item, index) in newShiftInfo">
              <el-form-item label="班次名称" prop="shiftName" :label-width="formLabelMinWidth">
                <el-select v-model="item.shiftName">
                  <el-option v-for="(item1, index1) in $store.state.shiftStore.shiftList"
                             :key="index1"
                             :label="item1.shiftName"
                             :value=item1.shiftName></el-option>
                </el-select>
              </el-form-item>
              <!--暂时先去掉 start-->
              <!--<el-form-item label="组织结构" prop="csaOrgId" :label-width="formLabelMinWidth">-->
                <!--<org-tree :ref="'orgTreeNew' + index" v-model="item.csaOrgId" @getUsersUnlimited="getUsersUnlimited('', 'orgTreeNew', newShiftInfo)"></org-tree>-->
              <!--</el-form-item>-->
              <!--暂时先去掉 end-->
              <el-form-item label="排班人员" :label-width="formLabelMinWidth">
                <el-transfer
                  filterable
                  filter-placeholder="请输入客服名称"
                  v-model="item.userIdList"
                  :titles="['可选择', '已选择']"
                  :rules="{required: true, message: rules.usersList, trigger: 'blur'}"
                  :data="allUserLists">
                </el-transfer>
              </el-form-item>
              <el-row class="btn-group-add">
                <el-button type="danger" class="btn btn-delete" @click="deleteMoreShiftInfo(index)">删除班次</el-button>
              </el-row>
            </el-row>
          </el-row>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="hideDayShiftDialog">取 消</el-button>
        <el-button type="primary" @click="submitAddForm('addForm')">提 交</el-button>
      </div>
    </el-dialog>
    <!-- 编辑日排班 end -->
    <!-- 前台座席排班 start -->
    <el-dialog title="前台座席排班" :visible.sync="dialogFrontSeatVisible" width="600px" class="front-seat-dialog" :close-on-click-modal="false">
      <el-row class="dialog-inner">
        <el-form :inline="true" :model="excelForm" ref="queryForm" class="form-wrapper">
          <el-form-item label="排班月份：" prop="shiftDate">
            <el-date-picker
              v-model="excelForm.shiftDate"
              type="month"
              placeholder="排班月份">
            </el-date-picker>
            <el-upload
              class="excel-upload"
              action=""
              :file-list="fileList"
              :before-upload="beforeUpload"
              :http-request="uploadShiftResultExcel">
              <el-button type="primary">上传Excel</el-button>
            </el-upload>
            <el-button type="primary" class="btn-download" @click="downloadShiftResultTemplate">下载模版</el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="hideFrontSeatDialog">取 消</el-button>
        <el-button type="primary" @click="hideFrontSeatDialog">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 前台座席排班 end -->
    <iframe :src="iframeSrc" frameborder="0" style="display: none;"></iframe>
  </el-row>
</template>
<script>
  import orgTree from '../../common/orgTree'
  import { formatDateByTimestamp } from '@/utils'
  import { getUsersUnlimited } from '@/api/users/user-api'
  import { selectShiftRuleListUnlimited } from '@/api/shifts/shift-rule-api'
  import { getMonthShiftView, getDayShiftView4Edit, insertShiftResultBatch } from '@/api/shifts/shift-result-api'
  import { schedulingWithRegular, schedulingWithOrdinary } from '@/api/shifts/schedule-api'
  import { uploadShiftResultExcel } from '@/api/shifts/excel-upload-api'
  // 格式化日期 返回类似 2016-01-02 格式的字符串
  const formatDate = function(year, month, day) {
    const y = year
    let m = month
    if (m < 10) m = '0' + m
    let d = day
    if (d < 10) d = '0' + d
    return y + '-' + m + '-' + d
  }
  export default {
    components: { orgTree },
    data() {
      return {
        queryForm: {
          shiftDate: '', // 某月第一天(必填)
          orgId: '' // 组织id（非必填）
        }, // 查询列表表单
        excelForm: {
          shiftDate: '' // 某月第一天(必填)
        }, // 查询列表表单
        filterMethod(query, item) {
          return item.trueName.indexOf(query) > -1
        },
        loading: false,
        pageNumber: 1, // 默认查询第1页
        dialogAddFormVisible: false, // 是否显示新增班次弹窗
        dialogDeleteVisible: false, // 是否显示删除弹窗
        dialogDayShiftVisible: false, // 是否显示编辑日排班弹窗
        dayShiftTitle: '',
        errorTip: '',
        showErrorTip: false,
        dialogRegularVisible: false, // 是否显示规则排班弹窗
        dialogOrdinaryVisible: false, // 是否显示普通排班弹窗
        dialogFrontSeatVisible: false, // 是否显示前台座席排班弹窗
        formLabelWidth: '110px', // 表单标签宽度
        formLabelMinWidth: '80px', // 表单标签宽度
        openDelay: 500,
        regularForm: {
          csaOrgId: '', // 组织结构
          shiftRuleId: '', // 排班规则id
          userList: [], //
          shiftRuleList: [] //
        },
        ordinaryForm: {
          csaOrgId: '',
          scheduleDate: '',
          userList: []
        },
        addForm: {
          shiftInfo: [],
          newShiftInfo: []
        },
        oldShiftInfo: [],
        newShiftInfo: [],
        userInfoList: [],
        shiftResultList: [],
        fileList: [],
        iframeSrc: '',
        dayShiftCsaOrgId: '',
        allUserLists: [],
        rules: {
          userIdList: [
            { required: true, message: '请根据组织结构选择客服', trigger: 'change' }
          ],
          shiftRuleId: [
            { required: true, message: '请选择排班规则', trigger: 'change' }
          ],
          usersList: [
            { required: true, message: '请选择客服', trigger: 'change' }
          ]
        },
        pickerEnd: {
          disabledDate: (time) => {
            if (this.ordinaryForm.scheduleDate !== '') {
              const nextMonth = (new Date(this.ordinaryForm.scheduleDate).getMonth() + 1)
              const curDate = new Date()
              const curMonth = curDate.getMonth() + 1
              // 如果输入框展示的月份是下个月 当前月份可选 如果展示的是当前月 当前月的上一月不可选
              if (nextMonth === curMonth) {
                return (time.getMonth() + 1) < nextMonth
              } else {
                return (time.getMonth() + 2) < nextMonth
              }
            }
          }
        },
        currentDay: 1,
        currentMonth: 1,
        currentYear: 1970,
        currentWeek: 0,
        allDaysOfCurrentMonth: [], // 当前月份的所有日期
        days: []
      }
    },
    created() { // 在vue初始化时调用
      this.initCalendar()
    },
    watch: {
      oldShiftInfo: {
        handler: function(val, oldVal) {
          this.oldShiftInfo = val
        },
        // 深度观察
        deep: true
      }
    },
    methods: {
      /**
       * 初始化日历
       */
      initCalendar() {
        // 日历渲染
        let date = ''
        if (this.queryForm.shiftDate === '') this.queryForm.shiftDate = new Date()
        const now = new Date(this.queryForm.shiftDate)
        date = new Date(formatDate(now.getFullYear(), now.getMonth() + 1, 1))
        this.currentDay = date.getDate()
        this.currentYear = date.getFullYear()
        this.currentMonth = date.getMonth() + 1
        this.currentWeek = date.getDay() // 1...6,0
        if (this.currentWeek === 0) {
          this.currentWeek = 7
        }
        const sDate = formatDate(this.currentYear, this.currentMonth, this.currentDay)
        this.days.length = 0
        // 今天是周日，放在第一行第7个位置，前面6个
        // 初始化本周
        for (let i = this.currentWeek - 1; i >= 0; i--) {
          const d = new Date(sDate)
          d.setDate(d.getDate() - i)

          const oDay = {}
          oDay.day = d
          oDay.date = formatDateByTimestamp(d * 1, 'yyyy-MM-dd')

          this.days.push(oDay) // 将日期放入data 中的days数组 供页面渲染使用
        }
        // 初始化其他周
        for (let i = 1; i <= 35 - this.currentWeek; i++) {
          const d = new Date(sDate)
          d.setDate(d.getDate() + i)

          const oDay = {}
          oDay.day = d
          oDay.date = formatDateByTimestamp(d * 1, 'yyyy-MM-dd')

          this.days.push(oDay)
        }
        this.getMonthShiftInfo(now)
      },

      // 调用后端接口获取排班数据
      getMonthShiftInfo(now) {
        this.loading = true
        const _this = this
        // 如果是当前月取第一天
        if (this.queryForm.shiftDate.toString() === new Date().toString()) {
          this.queryForm.shiftDate = formatDate(now.getFullYear(), now.getMonth() + 1, 1)
        } else {
          this.queryForm.shiftDate = formatDateByTimestamp(new Date(this.queryForm.shiftDate))
        }
        if (this.$refs.orgTree) {
          const aOrgTree = this.$refs.orgTree.selectedOptions
          this.queryForm.orgId = ''
          if (aOrgTree && aOrgTree.length > 0) {
            this.queryForm.orgId = aOrgTree[aOrgTree.length - 1]
          }
        }
        return new Promise((resolve, reject) => {
          getMonthShiftView(_this.queryForm).then(res => {
            _this.loading = false
            for (let i = 0; i < _this.days.length; i++) {
              for (const k in res.data) {
                if (formatDateByTimestamp(new Date(_this.days[i].day)) === k) {
                  _this.days[i].shift = res.data[k]
                }
              }
            }
            resolve(res)
          }).catch(error => {
            _this.loading = false
            reject(error)
          })
        })
      },

      /**
       * 重置查询输入项
       */
      resetQueryForm(form) {
        this.$refs[form].resetFields()
        this.queryForm.shiftDate = '1'
        this.queryForm.orgId = '-1'
        this.initCalendar()
      },

      /**
       * 显示规则排班弹窗
       */
      showRegularDialog() {
        this.dialogRegularVisible = true
        this.selectShiftRuleListUnlimited()
      },

      /**
       * 显示普通排班弹窗
       */
      showOrdinaryDialog() {
        this.dialogOrdinaryVisible = true
        const date = new Date() // 获取当前日期
        const year = date.getFullYear() // 获取当前年份
        const month = date.getMonth() + 2 // 获取下个月份
        this.ordinaryForm.scheduleDate = new Date(year, month, 0) * 1
        this.showDateByMonth(this.ordinaryForm.scheduleDate)
        this.$store.dispatch('SelectShiftListUnlimited')
      },

      // 查询排班规则
      selectShiftRuleListUnlimited() {
        const params = {
          delete: 0 // 状态有效
        }
        const _this = this
        return new Promise((resolve, reject) => {
          selectShiftRuleListUnlimited(params).then(res => {
            _this.regularForm.shiftRuleList = res.data
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },

      /**
       * 根据月份显示日期
       */
      showDateByMonth(date) {
        if (!date) return false
        this.allDaysOfCurrentMonth = []
        const fullYear = new Date(date).getFullYear()
        const month = (new Date(date).getMonth() + 1).toString().padStart(2, '0')
        const lastDayOfMonth = new Date(fullYear, month, 0).getDate()
        for (var i = 1; i <= lastDayOfMonth; i++) {
          const index = i
          i = i.toString().padStart(2, '0')
          this.allDaysOfCurrentMonth.push({
            date: fullYear + '-' + month + '-' + i,
            id: index,
            shiftId: ''
          })
        }
      },

      /**
       * 提交规则排班表单
       */
      schedulingWithRegular(form) {
        const _this = this
        this.$refs[form].validate((valid) => {
          if (valid) {
            const params = {
              shiftRuleId: _this.regularForm.shiftRuleId
            }
            // 去掉数组子对象的引号
            params.userIdList = _this.regularForm.userIdList.map(function(item, index, array) {
              return item - 0
            })
            return new Promise((resolve, reject) => {
              schedulingWithRegular(params).then(res => {
                _this.dialogRegularVisible = false
                _this.$refs.orgTreeRegular.selectedOptions = []
                _this.regularForm.csaOrgId = ''
                _this.regularForm.userList = []
                _this.$message({
                  message: res.rspMsg,
                  type: res.rspCode === _this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                  showClose: true
                })
                _this.$refs[form].resetFields()
                resolve(res)
              }).catch(error => {
                reject(error)
              })
            })
          }
        })
      },

      // 查看日排班详情
      jumpToDayViewIframe(date) {
        location.href = '#/allShiftDayView?date=' + date
      },

      // 排班规则管理跳转
      jumpToRegularIframe() {
        const date = +new Date()
        location.href = '#/shiftRule?date=' + date
      },

      /**
       * 提交普通排班表单
       */
      schedulingWithOrdinary(form) {
        const _this = this
        this.$refs[form].validate((valid) => {
          if (valid) {
            const params = {} // 传递给后台的参数
            let _shiftId = '' // 选择的班次
            const aShiftDays = [] // 存放排了多少天班
            // 传递用户id
            // 去掉数组子对象的引号
            params.userIdList = _this.ordinaryForm.userIdList.map(function(item, index, array) {
              return item - 0
            })
            params.shiftMap = {} // 传递排班id，数据格式{'2019-04-12': 1}
            for (var i = 0; i < _this.allDaysOfCurrentMonth.length; i++) {
              _shiftId = _this.allDaysOfCurrentMonth[i].shiftId
              const date = _this.allDaysOfCurrentMonth[i].date
              params.shiftMap[date] = _shiftId
              if (_shiftId !== '') {
                aShiftDays.push(_shiftId)
              }
            }
            _this.$confirm('排班人数' + params.userIdList.length + '人，排班天数' + aShiftDays.length + '天, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              return new Promise((resolve, reject) => {
                schedulingWithOrdinary(params).then(res => {
                  _this.dialogOrdinaryVisible = false
                  _this.$refs.orgTree.selectedOptions = []
                  _this.ordinaryForm.csaOrgId = ''
                  _this.ordinaryForm.userList = []
                  _this.$message({
                    message: res.rspMsg,
                    type: res.rspCode === _this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                    showClose: true
                  })
                  _this.$refs[form].resetFields()
                  resolve(res)
                }).catch(error => {
                  reject(error)
                })
              })
            }).catch(() => {
              _this.dialogOrdinaryVisible = false
              _this.$refs.orgTree.selectedOptions = []
              _this.ordinaryForm.csaOrgId = ''
              _this.ordinaryForm.userList = []
              _this.$message({
                type: 'info',
                message: '已取消'
              })
            })
          }
        })
      },

      // 显示日排班
      showDayShiftForm(date) {
        this.dialogDayShiftVisible = true
        const params = {}
        const _this = this
        if (date) {
          params.shiftDate = date
        }
        this.dayShiftTitle = '编辑 ' + date + ' 排班'
        this.addForm.shiftDate = date
        const p1 = this.getAllUsersUnlimited()
        const p2 = new Promise((resolve, reject) => {
          getDayShiftView4Edit(params).then(res => {
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
        this.loading = true
        Promise.all([p1, p2]).then((dataArray) => {
          console.log(dataArray[0].data)
          console.log(dataArray[1].data)
          _this.loading = false
          const hash = {}
          _this.allUserLists = dataArray[0].data.reduce((item, next) => {
            hash[next.key] ? '' : hash[next.key] = true && item.push(next)
            return item
          }, [])
          // p2的数据(班次信息)
          dataArray[1].data.forEach(item => {
            item.userList = _this.allUserLists
            item.userIdList = item.userIdList.map(item1 => {
              return item1.toString()
            })
          })
          _this.oldShiftInfo = dataArray[1].data
        })
      },

      // 获取所有客服列表
      getAllUsersUnlimited() {
        return new Promise((resolve, reject) => {
          getUsersUnlimited({ csaOrgId: '', status: 0 }).then(res => {
            res.data.forEach((item) => {
              item.disabled = false
            })
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },

      /**
       * 查询客服列表
       * @form: 如果不填为addForm 编辑日排班
       * @form: regularForm 规则排班
       * @form: ordinaryForm 普通排班
       * @orgTree: 组织结构
       * @shiftInfo: 编辑日排班所对应的班次信息
       * @shiftInfo = oldShiftInfo为原来的班次信息可修改
       * @shiftInfo = newShiftInfo为新添加的班次
       */
      getUsersUnlimited(form, orgTree, shift, index) {
        let csaOrgId = ''
        const userListFromShiftInfo = shift.userList
        const userIdListFromShiftInfo = shift.userIdList
        if (form) {
          if (this.$refs[orgTree]) {
            const aOrgTree = this.$refs[orgTree].selectedOptions
            form.csaOrgId = ''
            if (aOrgTree && aOrgTree.length > 0) {
              form.csaOrgId = aOrgTree[aOrgTree.length - 1]
            }
          }
          const params = {
            csaOrgId: form.csaOrgId, // 组织id
            status: 0 // 状态有效
          }
          if (params.csaOrgId && params.csaOrgId !== '') {
            return new Promise((resolve, reject) => {
              getUsersUnlimited(params).then(res => {
                form.userList = res.data
                resolve(res)
              }).catch(error => {
                reject(error)
              })
            })
          }
        } else {
          if (this.$refs[orgTree + index]) {
            const aOrgTree = this.$refs[orgTree + index][0].selectedOptions
            if (aOrgTree && aOrgTree.length > 0) {
              csaOrgId = aOrgTree[aOrgTree.length - 1]
            }
          }
          console.log(csaOrgId)
          if (csaOrgId && csaOrgId !== '') {
            return new Promise((resolve, reject) => {
              // 组装穿梭框数据
              getUsersUnlimited({ csaOrgId: csaOrgId, status: 0 }).then(res => {
                const userData = res.data
                userListFromShiftInfo.forEach((item1, index1) => {
                  item1.disabled = true
                  userData.forEach((item2, index2) => {
                    if (item1.key === item2.key) {
                      this.$set(userListFromShiftInfo[index1], 'disabled', false)
                    }
                  })
                  // 还要排除已选择的
                  userIdListFromShiftInfo.forEach((item3, index3) => {
                    if (item1.key === item3) {
                      this.$set(userListFromShiftInfo[index1], 'disabled', false)
                    }
                  })
                })
                resolve(res)
              }).catch(error => {
                reject(error)
              })
            })
          }
        }
      },

      /**
       * 提交日排班编辑表单
       */
      submitAddForm(form) {
        const _this = this
        let shiftResultList = []
        // 修改班次信息
        this.oldShiftInfo.forEach(item => {
          if (item.userIdList && item.userIdList.length > 0) {
            item.userIdList.forEach(item1 => {
              shiftResultList.push({
                csaUserId: parseInt(item1),
                shiftDate: _this.addForm.shiftDate,
                shiftId: item.csaShift.id
              })
            })
          }
        })
        // 新增班次信息
        if (this.newShiftInfo.length > 0) {
          this.newShiftInfo.forEach(item => {
            let _shiftId = ''
            const _shiftList = _this.$store.state.shiftStore.shiftList // 班次信息
            // 获取班次id
            if (_shiftList && _shiftList.length > 0) {
              _shiftList.forEach(item1 => {
                if (item.shiftName === item1.shiftName) {
                  _shiftId = item1.id
                }
              })
            }
            // 获取用户id
            if (item.userIdList && item.userIdList.length > 0) {
              item.userIdList.forEach(item1 => {
                shiftResultList.push({
                  csaUserId: parseInt(item1),
                  shiftDate: this.addForm.shiftDate,
                  shiftId: _shiftId
                })
              })
            }
          })
        }
        this.$refs[form].validate((valid) => {
          if (valid) {
            return new Promise((resolve, reject) => {
              insertShiftResultBatch(shiftResultList).then(res => {
                shiftResultList = [] // 提交成功之后将参数数组清空
                _this.dialogDayShiftVisible = false
                _this.initCalendar() // 重新渲染日历
                _this.newShiftInfo = [] // 清空新增班次数组
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
          }
        })
      },

      // 新增班次
      addMoreShiftInfo() {
        this.newShiftInfo.push(
          {
            shiftName: '',
            orgId: '',
            userList: []
          }
        )
        this.$store.dispatch('SelectShiftListUnlimited')
      },

      // 删除新增的班次
      deleteMoreShiftInfo(index) {
        this.newShiftInfo.splice(index, 1)
      },

      // 隐藏日排班
      hideDayShiftDialog() {
        this.dialogDayShiftVisible = false
        this.oldShiftInfo = []
        this.newShiftInfo = []
        this.addForm.shiftDate = ''
      },

      // 显示前台座席排班
      showFrontSeatDialog() {
        this.dialogFrontSeatVisible = true
        if (this.excelForm.shiftDate === '') this.excelForm.shiftDate = new Date()
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
      uploadShiftResultExcel(e) {
        const fileObj = e.file
        // FormData 对象
        const form = new FormData()
        const _this = this
        let timer = null
        this.excelForm.shiftDate = formatDateByTimestamp(new Date(this.queryForm.shiftDate), 'yyyy-MM')
        // 文件对象
        form.append('excelFile', fileObj)
        form.append('shiftDate', this.excelForm.shiftDate)
        clearTimeout(timer)
        return new Promise((resolve, reject) => {
          uploadShiftResultExcel(form).then(res => {
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
      downloadShiftResultTemplate() {
        if (!this.excelForm.shiftDate) {
          this.$message({
            message: '请选择排班月份！',
            type: 'error',
            showClose: true
          })
          return false
        }
        const params = {
          shiftDate: formatDateByTimestamp(new Date(this.excelForm.shiftDate) * 1, 'yyyy-MM')
        }
        const url = process.env.BASE_API + '/csaExcel/excelDownload/downloadShiftResultTemplate?shiftDate=' + params.shiftDate + '&timestamp=' + new Date().getTime()
        // 创建隐藏的可下载链接
        this.iframeSrc = url
      },

      // 隐藏前台座席排班
      hideFrontSeatDialog() {
        this.dialogFrontSeatVisible = false
      },

      // 关闭规则弹窗
      hideRegularDialog() {
        this.dialogRegularVisible = false
        this.$refs.orgTreeRegular.selectedOptions = []
        this.regularForm.csaOrgId = ''
        this.regularForm.userList = []
        this.regularForm.shiftRuleId = ''
        this.regularForm.shiftRuleList = []
      },

      // 关闭普通弹窗
      hideOrdinaryDialog() {
        this.dialogOrdinaryVisible = false
        this.$refs.orgTreeOrdinary.selectedOptions = []
        this.ordinaryForm.csaOrgId = ''
        this.ordinaryForm.userList = []
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../styles/shifts/shiftResult";
</style>
