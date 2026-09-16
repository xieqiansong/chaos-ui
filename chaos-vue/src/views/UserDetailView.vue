<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { User } from '@/types/user'
import { getUser } from '@/api/user'
import { formatDateTime } from '@/utils/format'
import DictTag from '@/components/DictTag.vue'

const route = useRoute()
const router = useRouter()

const id = computed(() => Number(route.params.id))
const loading = ref(false)
const error = ref<string | null>(null)
const user = ref<User | null>(null)

// 扩展资料（动态表单字段 + 附件 URL），需类型收窄
const extra = computed(() => (user.value?.extra ?? {}) as Record<string, unknown>)
const attachments = computed<string[]>(() =>
  Array.isArray(extra.value.attachments) ? (extra.value.attachments as string[]) : [],
)

const genderMap: Record<string, string> = { male: '男', female: '女', secret: '保密' }
const genderText = computed(() => genderMap[String(extra.value.gender ?? '')] ?? '-')

async function load() {
  if (!id.value || Number.isNaN(id.value)) {
    error.value = '缺少有效的用户 ID'
    return
  }
  loading.value = true
  error.value = null
  try {
    user.value = await getUser(id.value)
  } catch {
    error.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/users')
}

onMounted(load)
</script>

<template>
  <div class="user-detail">
    <div class="header">
      <h2 class="page-title">用户详情</h2>
      <el-button @click="goBack">返回</el-button>
    </div>

    <div v-loading="loading" class="content">
      <!-- 错误态 -->
      <el-result
        v-if="error && !loading"
        icon="error"
        title="加载失败"
        :sub-title="error"
      >
        <template #extra>
          <el-button type="primary" @click="load">重试</el-button>
          <el-button @click="goBack">返回列表</el-button>
        </template>
      </el-result>

      <template v-else-if="user">
        <!-- 基本信息 -->
        <el-card shadow="never" header="基本信息" class="section">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">{{ user.id }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ user.nickname }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ user.email || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 状态与时间 -->
        <el-card shadow="never" header="状态与时间" class="section">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="状态">
              <DictTag dict="user-status" :value="user.enabled ? 1 : 0" />
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(user.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="2">
              {{ formatDateTime(user.updatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 联系与扩展资料 -->
        <el-card shadow="never" header="联系与扩展资料" class="section">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="头像">
              <el-avatar v-if="user.avatar" :src="user.avatar" :size="48" />
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="手机号">{{ user.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="省份 / 城市">
              {{ user.province || '-' }} / {{ user.city || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="详细地址">{{ user.address || '-' }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ genderText }}</el-descriptions-item>
            <el-descriptions-item label="个人网站">{{ (extra.website as string) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="个人简介" :span="2">{{ (extra.bio as string) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="附件" :span="2">
              <div v-if="attachments.length" class="attach-list">
                <el-link
                  v-for="(url, i) in attachments"
                  :key="i"
                  :href="url"
                  target="_blank"
                  type="primary"
                  class="attach-item"
                >附件 {{ i + 1 }}</el-link>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </template>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.page-title {
  margin: 0;
  font-size: 20px;
}
.content {
  min-height: 240px;
}
.section {
  margin-bottom: 16px;
}
.attach-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
