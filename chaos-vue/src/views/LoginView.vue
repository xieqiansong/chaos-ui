<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { showError, showSuccess } from '@/utils/message'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function onSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    await userStore.login({ username: form.username, password: form.password })
    showSuccess('登录成功')
    // 回跳登录前想访问的页面，缺省进首页
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err) {
    showError((err as Error).message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <el-card class="login-card" shadow="always">
      <h2 class="login-title">登录</h2>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="64px"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            autocomplete="current-password"
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-button type="primary" native-type="submit" class="login-btn" :loading="loading">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
}
.login-card {
  width: 360px;
}
.login-title {
  text-align: center;
  margin: 0 0 16px;
}
.login-btn {
  width: 100%;
}
</style>
