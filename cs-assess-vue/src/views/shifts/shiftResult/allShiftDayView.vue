<template>
  <el-row class="allShiftDayView">
    <el-row class="breadcrumb-wrapper" data-before="当前位置：" v-show="showBreadcrumb">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
        <el-breadcrumb-item><a href="javascript: history.go(-1);">整体班务月视图</a></el-breadcrumb-item>
        <el-breadcrumb-item><b>整体班务日视图</b></el-breadcrumb-item>
      </el-breadcrumb>
      <a href="javascript: history.go(-1);" class="btn-back">返回>></a>
    </el-row>
    <el-row class="form-wrapper">
      <!-- form表单 查询条件 start -->
      <el-form :inline="true" :model="queryForm" ref="queryForm" class="sc-form">
        <el-form-item label="排班日期：" prop="shiftDate">
          <el-date-picker
            v-model="queryForm.shiftDate"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="组织结构：" prop="orgId">
          <org-tree ref="orgTree" v-model="queryForm.orgId"></org-tree>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="loading" @click="init">查询</el-button>
          <el-button type="info" icon="el-icon-delete" @click="resetQueryForm('queryForm')">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- form表单 查询条件 end -->
    </el-row>
    <!--班务日视图 start-->
    <el-row class="table-wrapper">
      <!-- table数据列表 -->
      <!--渲染左侧客服姓名 start-->
      <div class="table-wrapper__left">
        <table class="user-table">
          <thead>
            <tr>
              <th>
                <div class="cell">客服姓名</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in oDayShiftView.users" :key="index">
              <td>
                <div class="cell">{{user.name}}</div>
              </td>
            </tr>
          </tbody>
        </table>
        <label class="label-total" v-if="oDayShiftView.counts.length > 0">总计/人</label>
      </div>
      <!--渲染左侧客服姓名 end-->
      <!--渲染右侧班次信息 start-->
      <div class="table-wrapper__right" v-loading="loading">
        <table class="bg-shift-table">
          <thead>
          <tr>
            <th><div class="cell" v-for="(hour, index) in oDayShiftView.counts" :key="index"></div></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(user, index) in oDayShiftView.users" :key="index">
            <div class="cell" v-for="(hour, index) in oDayShiftView.counts" :key="index"></div>
          </tr>
          </tbody>
        </table>
        <table class="shift-table" id="shiftTable" ref="shiftTable">
          <thead>
          <tr>
            <th v-for="(hour, index) in oDayShiftView.hours" :key="index">
              <div class="cell">{{hour.label}}</div>
            </th>
          </tr>
          </thead>
          <tbody v-if="oDayShiftView.shifts.length > 0">
          <tr v-for="(shift, index) in oDayShiftView.shifts" :key="index">
            <td v-for="(item, index1) in shift.list" :key="index1">
              <div class="cell">{{item.time}}</div>
            </td>
            <div class="shift-progress-wrapper" v-if="shift.shiftWorkType === 1">
              <div class="shift-progress" v-if="shift.isOverDay === 0">
                <div class="shift-progress-normal" :style='{ left: shift.normalLeft, width: shift.normalWidth }'>上班时长</div>
              </div>
              <div class="shift-progress" v-else-if="shift.isOverDay === 1">
                <div class="shift-progress-overday" :style='{ left: shift.overdayLeft, width: shift.overdayWidth }'>上班时长</div>
              </div>
            </div>
            <div class="shift-progress-wrapper" v-else>
              <div class="shift-progress">
                <div class="shift-progress-start" :style='{ left: shift.normalLeft, width: shift.normalWidth }'>上班时长</div>
                <div class="shift-progress-end" :style='{ left: shift.secondLeft, width: shift.secondWidth }'>上班时长</div>
              </div>
            </div>
          </tr>
          </tbody>
          <tbody v-else>
          <tr>
            <td :colspan=oDayShiftView.hours.length><p class="no-data">暂无数据</p></td>
          </tr>
          </tbody>
        </table>
        <table class="total-table" v-if="oDayShiftView.counts.length > 0">
          <tbody>
          <tr>
            <td :colspan=oDayShiftView.counts.length><div class="cell" v-for="(total, index) in oDayShiftView.counts" :key="index" :data-key=total.date>{{total.count}}</div></td>
          </tr>
          </tbody>
        </table>
      </div>
      <!--渲染右侧班次信息 end-->
      <!-- END table数据列表 -->
    </el-row>
    <!--班务日视图 end-->
  </el-row>
</template>
<script>
  import { formatDateByTimestamp } from '@/utils'
  import { getDayShiftView, getDayShiftViewCount } from '@/api/shifts/shift-result-api'
  import orgTree from '../../common/orgTree'

  export default {
    components: { orgTree },
    data() {
      return {
        showBreadcrumb: false,
        queryForm: {
          shiftDate: this.$router.history.current.query.date || '', // 日期
          orgId: ''
        }, // 查询列表表单
        loading: false,
        pageNumber: 1, // 默认查询第1页
        oDayShiftView: {
          hours: [],
          users: [],
          shifts: [],
          counts: []
        }, // table数据列表
        totalHour: 24, // 每一天的总小时数
        total: [{
          prop: '总计/人'
        }]
      }
    },
    created() { // 在vue初始化时调用
      this.init()
      // 根据路由参数判断有值显示面包屑导航，没有则不显示
      if (this.$router.history.current.query.date) {
        this.showBreadcrumb = true
      } else {
        this.showBreadcrumb = false
      }
    },
    methods: {
      init() {
        this.initTable()
        this.getDayShiftInfoCount()
      },
      // 整体班务日视图
      initTable() {
        this.oDayShiftView.hours = []
        this.oDayShiftView.counts = []
        for (let i = 0; i < this.totalHour; i++) {
          this.oDayShiftView.hours.push({
            label: i + '时',
            key: i,
            time: i + ':00' + ':00'
          })
          for (let j = 0; j < this.oDayShiftView.hours.length; j++) {
            this.oDayShiftView.hours[i].degree = [
              '1970-01-01 ' + i.toString().padStart(2, '0') + ':00',
              '1970-01-01 ' + i.toString().padStart(2, '0') + ':15',
              '1970-01-01 ' + i.toString().padStart(2, '0') + ':30',
              '1970-01-01 ' + i.toString().padStart(2, '0') + ':45'
            ]
          }
          for (let k = 0; k < this.oDayShiftView.hours[i].degree.length; k++) {
            this.oDayShiftView.counts.push({
              date: this.oDayShiftView.hours[i].degree[k],
              count: ''
            })
          }
        }
        this.getDayShiftInfo()
      },
      /**
       * 解析数据
       * @data 后端接口返回数据
       * @aHours 小时数
       * @aUsers 存放用户数据
       * @aShifts 存放班次信息
       */
      parseData(data, aHours, aUsers, aShifts) {
        const gridWidth = 60
        for (let i = 0; i < data.length; i++) {
          aUsers.push({ name: data[i].userName }) // 存放客服名
          aShifts[i] = {}
          aShifts[i].list = [] // 存放班次列表信息
          const shiftWorkType = data[i].csaShiftVO.shiftWorkType // 班次类型：1正常 2多段
          const isOverDay = data[i].csaShiftVO.isOverDay // 是否跨天
          let normalStartTime = '' // 正常班次开始时间
          let normalEndTime = '' // 正常班次结束时间
          let normalStartHH = '' // 正常班次开始时间小时数
          let normalEndHH = '' // 正常班次结束时间小时数
          let normalStartMM = '' // 正常班次开始时间分钟数
          let normalEndMM = '' // 正常班次结束时间分钟数

          let overdayStartTime = '' // 跨天开始时间
          let overdayEndTime = '' // 跨天结束时间
          let overdayStartHH = '' // 跨天开始时间小时数
          let overdayEndHH = '' // 跨天结束时间小时数
          let overdayStartMM = '' // 跨天开始时间分钟数
          let overdayEndMM = '' // 跨天结束时间分钟数

          let secondStartTime = '' // 天地班第二段开始时间
          let secondEndTime = '' // 天地班第二段开始时间
          let secondStartHH = '' // 天地班第二段开始时间小时数
          let secondEndHH = '' // 天地班第二段结束时间小时数
          let secondStartMM = '' // 天地班第二段开始时间分钟数
          let secondEndMM = '' // 天地班第二段结束时间分钟数

          // 判断班次类型 1正常 2多段
          if (shiftWorkType) {
            switch (shiftWorkType) {
              case 1:
                aShifts[i].shiftWorkType = 1
                // 是否跨天 1跨天 0不跨天
                if (isOverDay === 1) {
                  aShifts[i].isOverDay = 1
                  const lastDay = data[i].shiftDate ? new Date(data[i].shiftDate) * 1 : '' // 前一天
                  const currentDay = this.queryForm.shiftDate ? new Date(this.queryForm.shiftDate) * 1 : ''// 当天
                  // 如果是从头一天跨到今天 那么取前一天结束时间 开始时间为00:00:00
                  if (currentDay > lastDay) {
                    overdayStartTime = '00:00:00'
                    overdayEndTime = formatDateByTimestamp(data[i].csaShiftVO.shiftEndTime, 'hh:mm:ss')
                    overdayStartHH = parseInt(overdayStartTime.substr(0, 2)) // 开始时间小时
                    overdayEndHH = parseInt(overdayEndTime.substr(0, 2)) // 结束时间小时
                    overdayStartMM = parseInt(overdayStartTime.substr(3, 2)) // 开始时间分钟
                    overdayEndMM = parseInt(overdayEndTime.substr(3, 2)) // 结束时间分钟

                    // 开始时间和结束时间相连 宽度计算：(结束时间小时数-开始时间小时数+1)*格子宽度
                    // 距离左侧left为0
                    aShifts[i].overdayWidth = (overdayEndHH - overdayStartHH) * gridWidth + overdayEndMM + 'px'
                    aShifts[i].overdayLeft = overdayStartMM + 'px'
                  } else { // 如果是今天跨到下一天就取今天的开始时间 结束时间为23:59:59
                    overdayStartTime = formatDateByTimestamp(data[i].csaShiftVO.shiftStartTime, 'hh:mm:ss')
                    overdayEndTime = '23:59:59'
                    overdayStartHH = parseInt(overdayStartTime.substr(0, 2)) // 开始时间小时
                    overdayEndHH = parseInt(overdayEndTime.substr(0, 2)) // 结束时间小时
                    overdayStartMM = parseInt(overdayStartTime.substr(3, 2)) // 开始时间分钟
                    overdayEndMM = parseInt(overdayEndTime.substr(3, 2)) // 结束时间分钟
                    // 开始时间和结束时间相连 宽度计算：(结束时间小时数-开始时间小时数+1)*格子宽度
                    // 距离左侧left为开始时间小时数*格子宽度+分钟数
                    aShifts[i].overdayWidth = (overdayEndHH - overdayStartHH) * gridWidth + overdayEndMM + 'px'
                    aShifts[i].overdayLeft = overdayStartHH * gridWidth + overdayStartMM + 'px'
                  }
                } else if (isOverDay === 0) {
                  aShifts[i].isOverDay = 0
                  // 正常班次
                  normalStartTime = formatDateByTimestamp(data[i].csaShiftVO.shiftStartTime, 'hh:mm:ss') // 接口数据正常班次开始时间
                  normalEndTime = formatDateByTimestamp(data[i].csaShiftVO.shiftEndTime, 'hh:mm:ss') // 接口数据正常班次结束时间
                  // 取开始/结束时间的小时/分钟数
                  normalStartHH = parseInt(normalStartTime.substr(0, 2)) // 开始时间小时
                  normalEndHH = parseInt(normalEndTime.substr(0, 2)) // 结束时间小时
                  normalStartMM = parseInt(normalStartTime.substr(3, 2)) // 开始时间分钟
                  normalEndMM = parseInt(normalEndTime.substr(3, 2)) // 结束时间分钟
                  // 如果分钟数为0，表示是整点，left值为整点小时数*60(每个格子的宽度)
                  // 否则left值为整点小时数*60(每个格子的宽度)+分钟数
                  aShifts[i].normalWidth = (normalEndHH - normalStartHH) * gridWidth + normalEndMM + 'px'
                  aShifts[i].normalLeft = (normalStartHH * gridWidth) + normalStartMM + 'px'
                }
                for (let j = 0; j < aHours.length; j++) {
                  if (aHours[j].key === normalStartHH) { // 正常班次
                    aShifts[i].list.push({
                      time: normalStartTime
                    })
                  } else if (aHours[j].key === normalEndHH) {
                    aShifts[i].list.push({
                      time: normalEndTime
                    })
                  } else if (aHours[j].key === overdayStartHH) { // 跨天班次
                    aShifts[i].list.push({
                      time: overdayStartTime
                    })
                  } else if (aHours[j].key === overdayEndHH) {
                    aShifts[i].list.push({
                      time: overdayEndTime
                    })
                  } else {
                    aShifts[i].list.push({
                      time: ''
                    })
                  }
                }
                break
              case 2:
                aShifts[i].shiftWorkType = 2
                // 取开始/结束时间的小时/分钟数
                // 正常班次
                normalStartTime = formatDateByTimestamp(data[i].csaShiftVO.shiftStartTime, 'hh:mm:ss') // 接口数据正常班次开始时间
                normalEndTime = formatDateByTimestamp(data[i].csaShiftVO.shiftEndTime, 'hh:mm:ss') // 接口数据正常班次结束时间
                // 取开始/结束时间的小时/分钟数
                normalStartHH = parseInt(normalStartTime.substr(0, 2)) // 开始时间小时
                normalEndHH = parseInt(normalEndTime.substr(0, 2)) // 结束时间小时
                normalStartMM = parseInt(normalStartTime.substr(3, 2)) // 开始时间分钟
                normalEndMM = parseInt(normalEndTime.substr(3, 2)) // 结束时间分钟
                // 如果分钟数为0，表示是整点，left值为整点小时数*60(每个格子的宽度)
                // 否则left值为整点小时数*60(每个格子的宽度)+分钟数
                aShifts[i].normalWidth = (normalEndHH - normalStartHH) * gridWidth + normalEndMM + 'px'
                aShifts[i].normalLeft = (normalStartHH * gridWidth) + normalStartMM + 'px'

                // 天地班第二段开始/结束时间
                secondStartTime = formatDateByTimestamp(data[i].csaShiftVO.secondStartTime, 'hh:mm:ss') // 接口数据正常班次开始时间
                secondEndTime = formatDateByTimestamp(data[i].csaShiftVO.secondEndTime, 'hh:mm:ss') // 接口数据正常班次结束时间
                // 取开始/结束时间的小时/分钟数
                secondStartHH = parseInt(secondStartTime.substr(0, 2)) // 开始时间小时
                secondEndHH = parseInt(secondEndTime.substr(0, 2)) // 结束时间小时
                secondStartMM = parseInt(secondStartTime.substr(3, 2)) // 开始时间分钟
                secondEndMM = parseInt(secondEndTime.substr(3, 2)) // 结束时间分钟
                aShifts[i].secondWidth = (secondEndHH - secondStartHH) * gridWidth + secondEndMM + 'px'
                aShifts[i].secondLeft = (secondStartHH * gridWidth) + secondStartMM + 'px'

                for (let j = 0; j < aHours.length; j++) {
                  if (aHours[j].key === normalStartHH) { // 正常班次
                    aShifts[i].list.push({
                      time: normalStartTime
                    })
                  } else if (aHours[j].key === normalEndHH) {
                    aShifts[i].list.push({
                      time: normalEndTime
                    })
                  } else if (aHours[j].key === secondStartHH) {
                    aShifts[i].list.push({
                      time: secondStartTime
                    })
                  } else if (aHours[j].key === secondEndHH) {
                    aShifts[i].list.push({
                      time: secondEndTime
                    })
                  } else {
                    aShifts[i].list.push({
                      time: ''
                    })
                  }
                }
                break
            }
          }
        }
      },
      getDayShiftInfo() {
        const _this = this
        if (this.$refs.orgTree) {
          const aOrgTree = this.$refs.orgTree.selectedOptions
          this.queryForm.orgId = ''
          if (aOrgTree && aOrgTree.length > 0) {
            this.queryForm.orgId = aOrgTree[aOrgTree.length - 1]
          }
        }
        if (this.queryForm.shiftDate === '') this.queryForm.shiftDate = new Date()
        this.queryForm.shiftDate = formatDateByTimestamp(new Date(this.queryForm.shiftDate), 'yyyy-MM-dd')

        this.loading = true
        return new Promise((resolve, reject) => {
          getDayShiftView(_this.queryForm).then(res => {
            _this.loading = false
            _this.oDayShiftView.users = []
            _this.oDayShiftView.shifts = []
            _this.parseData(res.data, _this.oDayShiftView.hours, _this.oDayShiftView.users, _this.oDayShiftView.shifts)
            resolve(res)
          }).catch(error => {
            _this.loading = false
            reject(error)
          })
        })
      },
      // 计算每15分钟上班人数
      getDayShiftInfoCount() {
        const _this = this
        if (this.$refs.orgTree) {
          const aOrgTree = this.$refs.orgTree.selectedOptions
          this.queryForm.orgId = ''
          if (aOrgTree && aOrgTree.length > 0) {
            this.queryForm.orgId = aOrgTree[aOrgTree.length - 1]
          }
        }
        if (_this.queryForm.shiftDate === '') _this.queryForm.shiftDate = new Date()
        _this.queryForm.shiftDate = formatDateByTimestamp(new Date(this.queryForm.shiftDate), 'yyyy-MM-dd')
        return new Promise((resolve, reject) => {
          getDayShiftViewCount(_this.queryForm).then(res => {
            _this.loading = false
            for (let i = 0; i < this.oDayShiftView.counts.length; i++) {
              for (const k in res.data) {
                if (k === this.oDayShiftView.counts[i].date) {
                  if (res.data[k]) {
                    this.oDayShiftView.counts[i].count = res.data[k]
                  } else {
                    this.oDayShiftView.counts[i].count = 0
                  }
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
        this.queryForm = {
          orgId: '',
          shiftDate: '',
          pageNumber: 1,
          pageSize: 20
        }
        this.getDayShiftView()
      }
    }
  }
</script>
<style lang="scss">
  @import "../../../styles/shifts/shiftResult";
</style>
