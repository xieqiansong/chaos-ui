<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { User, UserQuery } from '@/types/user'
import type { PageResult } from '@/types/pagination'
import { batchDeleteUsers, deleteUser, fetchUsers } from '@/api/user'
import { formatDateTime } from '@/utils/format'
import UserFormDialog from '@/components/UserFormDialog.vue'
import DictTag from '@/components/DictTag.vue'
import { useDictStore } from '@/stores/dict'
import { useUserStore } from '@/stores/user'
import { confirm, showError, showSuccess } from '@/utils/message'
import request from '@/utils/request'
import * as XLSX from 'xlsx'
import { Download, Setting, Upload } from '@element-plus/icons-vue'

const dictStore = useDictStore()
const userStore = useUserStore()
const router = useRouter()

const loading = ref(false)
const list = ref<User[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 请求失败时的错误提示；非空时表格区展示「重试」状态
const error = ref<string | null>(null)
// 删除中状态：用于按钮 loading 防重复点击（整批 / 单行）
const deleting = ref(false)
const deletingId = ref<number | null>(null)

// 列显示 / 隐藏控制：可被勾选显隐的可选列
const optionalColumns = [
  { key: 'nickname', label: '昵称' },
  { key: 'email', label: '邮箱' },
  { key: 'createdAt', label: '创建时间' },
]
const visibleColumns = ref(['nickname', 'email', 'createdAt'])

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
  error.value = null
  try {
    // 预拉取字典，保证表格 DictTag 与筛选下拉在渲染时已有数据
    await dictStore.load('user-status')
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
  } catch (e) {
    // 全局拦截器已弹 toast；此处仅记录错误信息，供视图内「重试」状态使用
    error.value = e instanceof Error ? e.message : '加载失败，请稍后重试'
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

// 跳转详情页（带 id）
function openDetail(id: number) {
  router.push(`/users/${id}`)
}

async function handleDelete(row: User) {
  try {
    await confirm(`确定删除用户「${row.username}」吗？`)
  } catch {
    return
  }
  // 标记该行为删除中，禁用其删除按钮，防重复点击
  deletingId.value = row.id
  try {
    await deleteUser(row.id)
    showSuccess('删除成功')
    // 若删完当前页只剩这一条且不是第一页，回退一页
    if (list.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await load()
  } finally {
    deletingId.value = null
  }
}

// 批量删除：收集选中行，调用批量接口
const tableRef = ref()
const selectedRows = ref<User[]>([])

function handleSelectionChange(rows: User[]) {
  selectedRows.value = rows
}

async function handleBatchDelete() {
  const ids = selectedRows.value.map((r) => r.id)
  if (!ids.length) return
  try {
    await confirm(`确定删除选中的 ${ids.length} 个用户吗？`)
  } catch {
    return
  }
  deleting.value = true
  try {
    const { deleted } = await batchDeleteUsers(ids)
    showSuccess(`已删除 ${deleted} 条`)
    // 若删空了当前页且不是第一页，回退一页
    if (list.value.length === ids.length && page.value > 1) {
      page.value -= 1
    }
    tableRef.value?.clearSelection()
    await load()
  } finally {
    deleting.value = false
  }
}

// ---------- 导出 / 导入（#13） ----------
// 通用：触发浏览器下载一个 Blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 1) 前端导出：用 xlsx 直接把当前列表拼成 Excel 并下载（不走后端）
const exportingClient = ref(false)
function exportClient() {
  exportingClient.value = true
  try {
    const rows = list.value.map((u) => ({
      用户ID: u.id,
      用户名: u.username,
      昵称: u.nickname,
      邮箱: u.email ?? '',
      状态: u.enabled ? '启用' : '禁用',
      创建时间: formatDateTime(u.createdAt),
      更新时间: formatDateTime(u.updatedAt),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '用户')
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
    downloadBlob(
      new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `用户数据_${new Date().toISOString().slice(0, 10)}.xlsx`,
    )
  } finally {
    exportingClient.value = false
  }
}

// 2) 后端导出：请求返回 blob，前端直接下载（演示「后端导出 + blob 下载」）
const exportingServer = ref(false)
async function exportServer() {
  exportingServer.value = true
  try {
    const res = await request.get('/users/export', { responseType: 'blob' })
    const blob = res.data as Blob
    const cd = (res.headers['content-disposition'] as string) || ''
    const nameMatch = cd.match(/filename="?([^"]+)"?/)
    const filename = nameMatch?.[1] || `用户数据_${new Date().toISOString().slice(0, 10)}.xlsx`
    downloadBlob(blob, filename)
  } catch {
    // 拦截器已提示
  } finally {
    exportingServer.value = false
  }
}

// 3) 导入：上传 xlsx，后端解析落库（el-upload 直接 POST 到后端，需带 token）
const importUrl = '/api/users/import'
const importHeaders = computed(() => ({ Authorization: `Bearer ${userStore.token}` }))

function beforeImportUpload(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'xlsx' && ext !== 'xls') {
    showError('仅支持 .xlsx / .xls 文件')
    return false
  }
  if (file.size / 1024 / 1024 > 5) {
    showError('文件不能超过 5MB')
    return false
  }
  return true
}

function handleImportSuccess(
  res: { data?: { imported?: number; skipped?: number } },
) {
  const d = res?.data
  showSuccess(`导入完成：新增 ${d?.imported ?? 0}，跳过 ${d?.skipped ?? 0}`)
  load()
}

function handleImportError() {
  showError('导入失败，请检查文件格式')
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
            :disabled="loading"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="全部" clearable style="width: 120px" :disabled="loading">
            <el-option
              v-for="opt in dictStore.get('user-status')"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
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
            :disabled="loading"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" :disabled="loading" @click="handleSearch">搜索</el-button>
          <el-button :disabled="loading" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 + 分页 -->
    <el-card class="table-card" shadow="never">
      <div class="toolbar">
        <el-button type="primary" @click="openAdd">新增用户</el-button>
        <el-button
          type="danger"
          :loading="deleting"
          :disabled="deleting || selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          批量删除（{{ selectedRows.length }}）
        </el-button>
        <!-- 导出 / 导入（#13） -->
        <el-button :icon="Download" :loading="exportingClient" @click="exportClient">
          导出 Excel（前端）
        </el-button>
        <el-button :icon="Download" :loading="exportingServer" @click="exportServer">
          导出（后端）
        </el-button>
        <el-upload
          :action="importUrl"
          :headers="importHeaders"
          accept=".xlsx,.xls"
          :show-file-list="false"
          :before-upload="beforeImportUpload"
          :on-success="handleImportSuccess"
          :on-error="handleImportError"
        >
          <el-button :icon="Upload">导入</el-button>
        </el-upload>
        <!-- 列显示 / 隐藏控制 -->
        <el-popover title="列设置" placement="bottom" :width="160" trigger="click">
          <template #reference>
            <el-button :icon="Setting">列设置</el-button>
          </template>
          <el-checkbox-group v-model="visibleColumns">
            <el-checkbox v-for="c in optionalColumns" :key="c.key" :value="c.key" :label="c.label" />
          </el-checkbox-group>
        </el-popover>
      </div>

      <!-- 加载 / 空 / 错误 三态：v-loading 覆盖整个表格区 -->
      <div v-loading="loading" class="table-wrap">
        <!-- 错误态：展示错误信息 + 重试按钮 -->
        <el-result
          v-if="error && !loading"
          icon="error"
          title="加载失败"
          :sub-title="error"
          class="state-block"
        >
          <template #extra>
            <el-button type="primary" @click="load">重试</el-button>
          </template>
        </el-result>

        <!-- 数据态 -->
        <el-table
          v-else-if="list.length > 0"
          ref="tableRef"
          :data="list"
          row-key="id"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <!-- 行展开：展示用户明细（el-descriptions） -->
          <el-table-column type="expand" width="50">
            <template #default="{ row }">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="用户ID">{{ row.id }}</el-descriptions-item>
                <el-descriptions-item label="用户名">{{ row.username }}</el-descriptions-item>
                <el-descriptions-item label="昵称">{{ row.nickname }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ row.email || '-' }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <DictTag dict="user-status" :value="row.enabled ? 1 : 0" />
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatDateTime(row.createdAt) }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ formatDateTime(row.updatedAt) }}</el-descriptions-item>
              </el-descriptions>
            </template>
          </el-table-column>

          <el-table-column type="selection" width="55" />
          <!-- 排序：客户端排序（sortable） -->
          <el-table-column prop="id" label="ID" width="80" sortable />
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column
            v-if="visibleColumns.includes('nickname')"
            prop="nickname"
            label="昵称"
            min-width="120"
          />
          <el-table-column
            v-if="visibleColumns.includes('email')"
            prop="email"
            label="邮箱"
            min-width="180"
            show-overflow-tooltip
          />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <DictTag dict="user-status" :value="row.enabled ? 1 : 0" />
            </template>
          </el-table-column>
          <el-table-column
            v-if="visibleColumns.includes('createdAt')"
            label="创建时间"
            width="180"
            sortable
          >
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openDetail(row.id)">详情</el-button>
              <el-button link type="primary" size="small" @click="openEdit(row.id)">编辑</el-button>
              <el-button
                link
                type="danger"
                size="small"
                :loading="deletingId === row.id"
                :disabled="deletingId === row.id"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空态 -->
        <el-empty v-else description="暂无用户数据" class="state-block" />
      </div>

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
.table-wrap {
  min-height: 240px;
}
.state-block {
  margin: 40px 0;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
