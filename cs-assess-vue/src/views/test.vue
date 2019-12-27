<template>
  <el-row class="container">
    <el-time-select
      v-model="value1"
      :picker-options="{
        start: '08:30',
        step: '00:15',
        end: '18:30'
      }"
      placeholder="选择时间">
    </el-time-select>
    <el-button @click="showForm">打开</el-button>

    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="30%">
      <el-form :model="addForm" ref="addForm">
        <el-time-select
          v-model="value1"
          :picker-options="{
            start: '08:30',
            step: '00:15',
            end: '18:30'
          }"
          placeholder="选择时间">
        </el-time-select>
        <el-transfer
          ref="userList"
          filterable
          filter-placeholder="请输入客服名称"
          v-model="value"
          :titles="['可选择', '已选择']"
          :data="userInfo.left">
        </el-transfer>
        <el-transfer v-model="value" :data="data"></el-transfer>
      </el-form>
    </el-dialog>
    <div>
      <div>
        <el-select class="el-select" v-model="form.label" placeholder="全部" clearable filterable>
          <el-option
            v-for="item in addList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <span @click="add">新增</span>
      </div>
      <div v-for="(item, index) in form" :key="index">
        <el-select class="el-select" v-model="item.label" placeholder="全部" clearable filterable>
          <el-option
            v-for="item in addList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <span class="delete" @click="deleteItem(index)">删除</span>
      </div>
      <button @click="submit">提交</button>
    </div>
  </el-row>
</template>

<script>
  export default {
    data() {
      return {
        data: [
          {
            'key': 395,
            'label': '62441叶继鹤'
          },
          {
            'key': 396,
            'label': '62402陈静'
          },
          {
            'key': 398,
            'label': '62468游娟'
          },
          {
            'key': 400,
            'label': '62462李甜'
          },
          {
            'key': 401,
            'label': '62466屈彤'
          },
          {
            'key': 404,
            'label': '62475朱婷婷'
          },
          {
            'key': 405,
            'label': '62456殷璇'
          },
          {
            'key': 406,
            'label': '62470邵梦雅'
          },
          {
            'key': 407,
            'label': '62448黄霞'
          },
          {
            'key': 408,
            'label': '62480欧阳凡'
          },
          {
            'key': 410,
            'label': '62417蔡瑶'
          },
          {
            'key': 413,
            'label': '62483罗丹丽'
          },
          {
            'key': 244,
            'label': '62867杜迁'
          }
        ],
        value: [395, 396],
        value2: '',
        value1: '',
        dialogVisible: false,
        form: [],
        addForm: {
          options: [],
          value5: []
        },
        addList: [
          {
            value: '老板',
            label: '老板'
          }, {
            value: '经理',
            label: '经理'
          }, {
            value: '主管',
            label: '主管'
          }
        ],
        userInfo: {
          left: [
            {
              'key': 395,
              'label': '62441叶继鹤'
            },
            {
              'key': 396,
              'label': '62402陈静'
            },
            {
              'key': 398,
              'label': '62468游娟'
            },
            {
              'key': 400,
              'label': '62462李甜'
            },
            {
              'key': 401,
              'label': '62466屈彤'
            },
            {
              'key': 404,
              'label': '62475朱婷婷'
            },
            {
              'key': 405,
              'label': '62456殷璇'
            },
            {
              'key': 406,
              'label': '62470邵梦雅'
            },
            {
              'key': 407,
              'label': '62448黄霞'
            },
            {
              'key': 408,
              'label': '62480欧阳凡'
            },
            {
              'key': 410,
              'label': '62417蔡瑶'
            },
            {
              'key': 413,
              'label': '62483罗丹丽'
            },
            {
              'key': 244,
              'label': '62867杜迁'
            }
          ],
          right: [395, 396]
        }
      }
    },
    created() {
      console.log(this.data)
    },
    methods: {
      add() {
        this.form.push({})
      },
      deleteItem(index) {
        this.form.splice(index, 1)
      },
      showForm() {
        this.dialogVisible = true
      },
      submit() {
      }
    }
  }
</script>

<style scoped>

</style>
