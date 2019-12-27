<template>
  <!-- 请假 start-->
  <el-dialog :title=dialogTitle class="leave-dialog" :visible.sync="dialogLeaveFormVisible" width="640px"
             :close-on-click-modal="false">
    <el-form :model="leaveForm" ref="leaveForm" :rules="rules">
      <el-form-item label="请假类型" prop="leaveType" :label-width="formLabelWidth">
        <el-select v-model="leaveForm.leaveType" filterable placeholder="请选择请假类型" clearable>
          <el-option
            v-for="(item, index) in leaveTypeList"
            :key=index
            :label="item.label"
            :value="item.key">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="请假日期" :label-width="formLabelWidth" class="el-form__leave required">
        <el-form-item prop="leaveStartDate" class="el-form__mini">
          <el-date-picker
            v-model="leaveForm.leaveStartDate"
            type="date"
            placeholder="开始日期"
            :picker-options="pickerStart"
            value-format="timestamp">
          </el-date-picker>
          <span class="txt-time">{{leaveStartTime}}</span>
        </el-form-item>&nbsp;至&nbsp;
        <el-form-item prop="leaveEndDate" class="el-form__mini">
          <el-date-picker
            v-model="leaveForm.leaveEndDate"
            type="date"
            placeholder="结束日期"
            :picker-options="pickerEnd"
            value-format="timestamp">
          </el-date-picker>
          <span class="txt-time">{{leaveEndTime}}</span>
        </el-form-item>&nbsp;
      </el-form-item>
      <el-form-item label="请假天数" :label-width="formLabelWidth">
        <el-input v-model="leaveDays" disabled="disabled"><template slot="append">天</template></el-input>
      </el-form-item>
      <el-form-item label="请假事由" prop="leaveApplyDesc" :label-width="formLabelWidth">
        <el-input type="textarea" v-model="leaveForm.leaveApplyDesc" placeholder="请输入请假事由"></el-input>
      </el-form-item>
      <el-form-item label="附件" prop="leaveApplyAttachment" class="el-file__upload" :label-width="formLabelWidth"
                    v-if="leaveForm.id">
        <el-row v-if="leaveForm.leaveApplyAttachment.length > 0">
          <el-row v-for="(item, index) in leaveForm.leaveApplyAttachment" :key="index">
            <el-row v-if="item.fileJson.isImage">
              <a :href=item.fileJson.fileUrl target="_blank">{{item.fileJson.oldName}}</a>
            </el-row>
            <el-row v-else>
              <a :href=item.fileJson.href>{{item.fileJson.oldName}}</a>
            </el-row>
          </el-row>
        </el-row>
        <el-row v-else><span>无</span></el-row>
      </el-form-item>
      <el-form-item label="附件" prop="leaveApplyAttachment" class="el-file__upload" :label-width="formLabelWidth" v-else>
        <el-upload
          class="upload-attachment"
          action=""
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          :on-change="handleChange"
          multiple
          :limit="3"
          :on-exceed="handleExceed"
          :file-list="fileList"
          :auto-upload="false">
          <el-button size="small" type="primary">选择附件</el-button>
        </el-upload>
        <el-button class="btn-upload" size="small" type="primary" :disabled="fileList.length === 0"
                   @click="uploadFiles">上传附件
        </el-button>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancelLeaveForm('leaveForm')">取 消</el-button>
      <el-button type="primary" @click="submitLeaveForm('leaveForm')">确 定</el-button>
    </div>
  </el-dialog>
  <!-- 请假 end-->
</template>

<script>
  import { formatDateByTimestamp } from '@/utils'
  import { upload } from '@/api/common/file-upload-api'
  import { saveLeaveApply } from '@/api/shifts/shift-leave-api'

  export default {
    data() {
      return {
        formLabelWidth: '120px', // 表单标签宽度
        dialogLeaveFormVisible: false,
        leaveForm: {
          leaveStartDate: '', // 请假开始时间（必填）
          leaveEndDate: '', // 请假结束时间（必填）
          leaveType: '', // 请假类型1.事假,2病假,3婚假,4.丧假,5.产假,6.年假,7其他（必填）
          leaveApplyDesc: '', // 申请描述
          leaveApplyAttachment: [] // 附件信息（必填）
        },
        leaveStartTime: '00:00:00',
        leaveEndTime: '23:59:59',
        fileList: [],
        leaveTypeList: [
          { key: 1, label: '年假' },
          { key: 2, label: '事假' },
          { key: 3, label: '产假' },
          { key: 4, label: '婚假' },
          { key: 5, label: '丧假' },
          { key: 6, label: '陪产假' },
          { key: 7, label: '产检假' }
        ],
        dialogTitle: '新增请假',
        rules: {
          leaveType: [
            { required: true, message: '请选择请假类型', trigger: 'change' }
          ],
          leaveStartDate: [
            { required: true, message: '请选择开始日期', trigger: 'change' }
          ],
          leaveEndDate: [
            { required: true, message: '请选择结束日期', trigger: 'change' }
          ],
          leaveApplyDesc: [
            { required: true, message: '请输入请假事由', trigger: 'blur' }
          ],
          leaveApplyAttachment: [
            { required: true, message: '请上传附件', trigger: 'change' }
          ]
        },
        pickerStart: {
          // 开始日期不能大于结束日期
          disabledDate: (time) => {
            if (this.leaveForm.leaveEndDate !== '') {
              const date = new Date(this.leaveForm.leaveEndDate).getTime()
              return time.getTime() > date
            }
          }
        },
        pickerEnd: {
          disabledDate: (time) => {
            if (this.leaveForm.leaveStartDate !== '') {
              const date = new Date(this.leaveForm.leaveStartDate).getTime() - 1
              return time.getTime() < date
            }
          }
        }
      }
    },
    computed: {
      /**
       * 请假天数是结束日期减去开始日期的差值取天数
       * */
      leaveDays() {
        let start = ''
        let end = ''
        let day = 0
        let hour = 0
        let restSeconds = 0
        if (this.leaveForm.leaveStartDate) {
          start = +new Date(formatDateByTimestamp(this.leaveForm.leaveStartDate) + ' ' + this.leaveStartTime)
        }
        if (this.leaveForm.leaveEndDate) {
          end = +new Date(formatDateByTimestamp(this.leaveForm.leaveEndDate) + ' ' + this.leaveEndTime)
        }
        if (end && start) {
          if (end > start) {
            const diff = end - start // 时间差的毫秒数
            // 计算出相差天数
            day = Math.floor(diff / (24 * 60 * 60 * 1000))

            // 计算出小时数
            restSeconds = diff % (24 * 60 * 60 * 1000) // 计算天数后剩余的毫秒数
            hour = Math.floor(restSeconds / (60 * 60 * 1000))
            if (hour === 23) {
              day++
              return day
            }
          }
        }
      }
    },
    methods: {

      // 预览
      handlePreview(file) {
      },

      // 文件上传个数限制
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
      },

      // 删除文件提示
      beforeRemove(file, fileList) {
        const _this = this
        return this.$confirm(`确定移除 ${file.name}？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          _this.fileList = fileList
        }).catch(() => {
          _this.$message({
            type: 'info',
            message: '已取消'
          })
        })
      },

      // 删除附件
      handleRemove(file, fileList) {
      },

      // 选择文件
      handleChange(file, fileList) {
        this.fileList = fileList
      },

      // 上传附件
      uploadFiles() {
        const aSourceFile = [] // 文件信息
        const aRandomIndex = [] // 文件索引
        // 创建FormData 对象
        const form = new FormData()
        const _this = this
        this.fileList.forEach((item, index) => {
          aSourceFile.push(item.raw)
          aRandomIndex.push(index)
        })

        // 上传多个文件对象
        aSourceFile.forEach(function(file) {
          form.append('sourceFile', file, file.name)
        })
        form.append('randomId', aRandomIndex)
        return new Promise((resolve, reject) => {
          upload(form).then(res => {
            if (res.data) {
              res.data.forEach(item => {
                _this.leaveForm.leaveApplyAttachment.push(item)
              })
            }
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
       * 提交新增/编辑请假表单
       * 校验表单必填项是否通过
       */
      submitLeaveForm(form) {
        const _this = this
        const params = {}
        this.$refs[form].validate((valid) => {
          if (valid) {
            if (this.leaveForm.leaveStartDate) {
              params.leaveStartDate = +new Date(formatDateByTimestamp(this.leaveForm.leaveStartDate) + ' ' + this.leaveStartTime) // 请假开始时间（必填）
            }
            if (this.leaveForm.leaveEndDate) {
              params.leaveEndDate = +new Date(formatDateByTimestamp(this.leaveForm.leaveEndDate) + ' ' + this.leaveEndTime) // 请假结束时间（必填）
            }
            params.leaveType = this.leaveForm.leaveType // 请假类型1.事假,2病假,3婚假,4.丧假,5.产假,6.年假,7其他（必填）
            params.leaveApplyDesc = this.leaveForm.leaveApplyDesc // 申请描述
            params.leaveApplyAttachment = JSON.stringify(this.leaveForm.leaveApplyAttachment) // 附件信息（必填）

            return new Promise((resolve, reject) => {
              saveLeaveApply(params).then(res => {
                _this.dialogLeaveFormVisible = false
                _this.$message({
                  message: res.rspMsg,
                  type: res.rspCode === _this._const.RSP_CODE_SUCCESS ? 'success' : 'error',
                  showClose: true
                })
                if (this.$router.history.current.path.indexOf('groupShiftMonthView') > -1) {
                  const date = +new Date()
                  location.href = '#/shiftLeave?date=' + date
                }
                _this.$emit('getLeaveApplyList')
                resolve(res)
              }).catch(error => {
                reject(error)
              })
            })
          }
        })
      },

      // 取消请假
      cancelLeaveForm(form) {
        this.dialogLeaveFormVisible = false
        this.$refs[form].resetFields()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../styles/common/leaveDialog";
</style>
