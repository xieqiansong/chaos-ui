<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { User, UserQuery } from '@/types/user'
import type { PageResult } from '@/types/pagination'
import { deleteUser, fetchUsers } from '@/api/user'
import { formatDateTime } from '@/utils/format'
import UserFormDialog from '@/components/UserFormDialog.vue'

const loading = ref(false)
const list = ref<User[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

const form = reactive<UserQuery>({
  username: '',
  status: null,
  startDate: '',
  endDate: '',
})

// 日期范围选择器绑定值，变化时回填到 form
const dateRange = ref<[string, string] | null>(null)
watch(dateRange, (val) => {
  form.startDate = val?.[0] ?? ''
  form.endDate = val?.[1] ?? ''
})

async function load() {
  loading.value = true
  try {
    const res: PageResult<User> = await fetchUsers({
      page: page.value,
      size: size.value,
      username: form.username || undefined,
      status: form.status,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    })
    list.value = res.items
    total.value = res.total
  } finally {
    loading.value = false
  }
}

// 搜索：重置到第 1 页再请求
function handleSearch() {
  page.value = 1
  load()
}

// 重置：清空条件、回到第 1 页
function handleReset() {
  form.username = ''
  form.status = null
  form.startDate = ''
  form.endDate = ''
  dateRange.value = null
  page.value = 1
  load()
}

function handlePageChange(p: number) {
  page.value = p
  load()
}

function handleSizeChange(s: number) {
  size.value = s
  page.value = 1
  load()
}

function enabledText(enabled: boolean) {
  return enabled ? '启用' : '禁用'
}

// 新增 / 编辑弹窗
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)

function openAdd() {
  editingId.value = null
  dialogVisible.value = true
}

function openEdit(id: number) {
  editingId.value = id
  dialogVisible.value = true
}

async function handleDelete(row: User) {
  try {
    await ElMessageBox.confirm(`确定删除用户「${row.username}」吗？`, '提示', {
      type: 'warning',
    })
  } catch {
    return
  }
  await deleteUser(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<template>
  <div class="user-list">
    <h2 class="page-title">用户管理</h2>

    <!-- 搜索区 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="form">
        <el-form-item label="用户名">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 + 分页 -->
    <el-card class="table-card" shadow="never">
      <div class="toolbar">
        <el-button type="primary" @click="openAdd">新增用户</el-button>
      </div>
      <el-table v-loading="loading" :data="list" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">{{ enabledText(row.enabled) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row.id)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          :current-page="page"
          :page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <UserFormDialog v-model="dialogVisible" :user-id="editingId" @saved="load" />
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
}
.search-card {
  margin-bottom: 16px;
}
.toolbar {
  margin-bottom: 16px;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
