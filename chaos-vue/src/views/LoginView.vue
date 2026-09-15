<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  username: '',
  password: '',
})

function onSubmit() {
  // 占位：真实场景应调用登录接口换取 token
  localStorage.setItem('token', 'demo-token')
  window.location.href = '/'
}
</script>

<template>
  <div class="login">
    <el-card class="login-card" shadow="always">
      <h2 class="login-title">登录</h2>
      <el-form :model="form" label-width="64px" @submit.prevent="onSubmit">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-button type="primary" native-type="submit" class="login-btn">登录</el-button>
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
