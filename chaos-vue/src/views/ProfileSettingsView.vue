<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { FormInstance, FormItemRule, FormRules, UploadProps, UploadUserFile } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { showError, showSuccess } from '@/utils/message'
import { Plus, Upload } from '@element-plus/icons-vue'

const userStore = useUserStore()

// 基础信息：预填当前登录用户
const form = reactive({
  nickname: userStore.userInfo?.nickname ?? '',
  email: userStore.userInfo?.email ?? '',
  phone: '',
  province: '',
  city: '',
  address: '',
  password: '',
  confirmPassword: '',
})

// ---------- 联动：省 → 市 ----------
// 真实项目应来自字典 / 接口；此处用本地数据演示「A 变化 → B 的选项变化 + 重置」
const regionData: Record<string, string[]> = {
  广东省: ['广州市', '深圳市', '珠海市'],
  浙江省: ['杭州市', '宁波市', '温州市'],
  四川省: ['成都市', '绵阳市', '宜宾市'],
}
const provinceOptions = Object.keys(regionData)
const cityOptions = computed(() => regionData[form.province] ?? [])

// 省份变化：清空已选城市（避免残留无效值）
function onProvinceChange() {
  form.city = ''
}

// ---------- 自定义校验规则 ----------
const validatePhone: NonNullable<FormItemRule['validator']> = (_rule, value, callback) => {
  if (!value) return callback() // 选填
  if (!/^1[3-9]\d{9}$/.test(value)) return callback(new Error('手机号格式不正确'))
  callback()
}

const validateConfirm: NonNullable<FormItemRule['validator']> = (_rule, value, callback) => {
  if (value !== form.password) return callback(new Error('两次输入的密码不一致'))
  callback()
}

const rules: FormRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  password: [{ min: 6, max: 20, message: '密码长度 6-20 位', trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirm, trigger: 'blur' }],
}

const formRef = ref<FormInstance>()
const saving = ref(false)

// ---------- 动态表单：字段由配置生成 ----------
interface DynamicField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'select'
  placeholder?: string
  options?: { label: string; value: string }[]
}
const dynamicFields: DynamicField[] = [
  { key: 'website', label: '个人网站', type: 'input', placeholder: 'https://...' },
  {
    key: 'gender',
    label: '性别',
    type: 'select',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
      { label: '保密', value: 'secret' },
    ],
  },
  { key: 'bio', label: '个人简介', type: 'textarea', placeholder: '一句话介绍自己' },
]
const extraForm = reactive<Record<string, string>>({ website: '', gender: '', bio: '' })

// ---------- 文件上传 ----------
// 鉴权头：el-upload 的 action 走原生请求，需手动带 token（与请求封装保持一致）
const uploadHeaders = computed(() => ({ Authorization: `Bearer ${userStore.token}` }))
const uploadUrl = '/api/files/upload'

// 头像：单图上传 + 预览 + 格式/大小限制
const avatarUrl = ref('')

// 附件：多文件上传，成功后收集后端返回的 URL（配合表单提交）
const fileList = ref<UploadUserFile[]>([])
const attachUrls = ref<string[]>([])

// 限制格式与大小：返回 false 阻止上传
const beforeImageUpload: UploadProps['beforeUpload'] = (file) => {
  const okType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
  if (!okType) {
    showError('头像仅支持 JPG / PNG / GIF')
    return false
  }
  if (file.size / 1024 / 1024 > 2) {
    showError('头像大小不能超过 2MB')
    return false
  }
  return true
}

const beforeAttachUpload: UploadProps['beforeUpload'] = (file) => {
  if (file.size / 1024 / 1024 > 10) {
    showError('单个附件不能超过 10MB')
    return false
  }
  return true
}

// 后端返回结构约定：{ code, message, data: { url } }
function pickUrl(res: unknown): string {
  const data = (res as { data?: { url?: string } })?.data
  return data?.url ?? (res as { url?: string })?.url ?? ''
}

function handleAvatarSuccess(res: unknown) {
  avatarUrl.value = pickUrl(res)
  showSuccess('头像上传成功')
}

function handleAttachSuccess(res: unknown) {
  const url = pickUrl(res)
  if (url) attachUrls.value.push(url)
}

function handleUploadError() {
  showError('文件上传失败，请重试')
}

function handleAttachRemove(file: UploadUserFile) {
  // 按 uid 定位并移除对应 URL（后端无删除接口时仅前端移除）
  const idx = fileList.value.findIndex((f) => f.uid === file.uid)
  if (idx >= 0 && attachUrls.value[idx]) attachUrls.value.splice(idx, 1)
}

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    // 真实项目此处调用「更新资料」接口；上传已在各自 on-success 中先拿到 URL，
    // 这里直接随表单一起提交（先传文件拿 URL，再提交表单）
    await new Promise((resolve) => setTimeout(resolve, 400))
    const payload = { ...form, ...extraForm, avatar: avatarUrl.value, attachments: attachUrls.value }
    console.log('保存资料：', payload)
    showSuccess('资料保存成功')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="profile">
    <h2 class="page-title">个人中心</h2>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" class="profile-form">
      <!-- 分组一：基本信息 -->
      <el-card class="group-card" shadow="never" header="基本信息">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" maxlength="50" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="可选" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="选填，用于接收通知" />
        </el-form-item>
      </el-card>

      <!-- 分组二：联系地址（省 → 市 联动） -->
      <el-card class="group-card" shadow="never" header="联系地址">
        <el-form-item label="省份">
          <el-select
            v-model="form.province"
            placeholder="请选择省份"
            style="width: 100%"
            @change="onProvinceChange"
          >
            <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <!-- 未选省份时禁用，且选项随省份变化 -->
          <el-select
            v-model="form.city"
            placeholder="请先选择省份"
            style="width: 100%"
            :disabled="!form.province"
          >
            <el-option v-for="c in cityOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="form.address" type="textarea" :rows="2" placeholder="街道 / 门牌号" />
        </el-form-item>
      </el-card>

      <!-- 分组三：安全设置（自定义校验：确认密码一致 + 长度） -->
      <el-card class="group-card" shadow="never" header="安全设置">
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="留空表示不修改"
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            placeholder="再次输入新密码"
            autocomplete="new-password"
          />
        </el-form-item>
      </el-card>

      <!-- 分组四：扩展资料（动态表单：字段由配置生成） -->
      <el-card class="group-card" shadow="never" header="扩展资料">
        <el-form-item v-for="field in dynamicFields" :key="field.key" :label="field.label">
          <el-select
            v-if="field.type === 'select'"
            v-model="extraForm[field.key]"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="opt in field.options"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <el-input
            v-else-if="field.type === 'input'"
            v-model="extraForm[field.key]"
            :placeholder="field.placeholder"
          />
          <el-input
            v-else
            v-model="extraForm[field.key]"
            type="textarea"
            :rows="2"
            :placeholder="field.placeholder"
          />
        </el-form-item>
      </el-card>

      <!-- 分组五：头像与附件（文件上传：单图预览 / 多文件 / 进度 / 限制） -->
      <el-card class="group-card" shadow="never" header="头像与附件">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            accept="image/*"
            :before-upload="beforeImageUpload"
            :on-success="handleAvatarSuccess"
            :on-error="handleUploadError"
          >
            <img v-if="avatarUrl" :src="avatarUrl" class="avatar" alt="头像" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <span class="upload-tip">支持 JPG / PNG / GIF，≤ 2MB</span>
        </el-form-item>

        <el-form-item label="附件">
          <el-upload
            :action="uploadUrl"
            :headers="uploadHeaders"
            multiple
            :file-list="fileList"
            :before-upload="beforeAttachUpload"
            :on-success="handleAttachSuccess"
            :on-error="handleUploadError"
            :on-remove="handleAttachRemove"
          >
            <el-button type="primary" :icon="Upload">上传附件</el-button>
            <template #tip>
              <div class="upload-tip">支持任意文件，单个 ≤ 10MB（上传进度与状态见列表）</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-card>

      <div class="footer">
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        <el-button :disabled="saving" @click="formRef?.resetFields()">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
}
.profile-form {
  max-width: 640px;
}
.group-card {
  margin-bottom: 16px;
}
.footer {
  display: flex;
  gap: 12px;
}
.avatar-uploader {
  display: inline-flex;
  align-items: center;
}
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: var(--el-transition-border);
}
.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}
.avatar-uploader-icon {
  font-size: 28px;
  color: var(--el-text-color-secondary);
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar {
  width: 96px;
  height: 96px;
  display: block;
  object-fit: cover;
}
.upload-tip {
  margin-left: 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
