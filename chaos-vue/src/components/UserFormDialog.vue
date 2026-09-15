<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { createUser, getUser, updateUser } from '@/api/user'
import type { CreateUserPayload, UpdateUserPayload } from '@/types/user'

const props = defineProps<{
  modelValue: boolean
  /** null = 新增；number = 编辑（对应用户 id） */
  userId: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isEdit = computed(() => props.userId !== null)

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive<CreateUserPayload>({
  username: '',
  nickname: '',
  enabled: true,
  email: '',
})

const rules: FormRules<CreateUserPayload> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '长度 3-50 个字符', trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度 1-50 个字符', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
}

// 打开弹窗：编辑模式回填数据；新增模式清空
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    formRef.value?.clearValidate()
    if (isEdit.value && props.userId !== null) {
      const data = await getUser(props.userId)
      form.username = data.username
      form.nickname = data.nickname
      form.enabled = data.enabled
      form.email = data.email ?? ''
    } else {
      form.username = ''
      form.nickname = ''
      form.enabled = true
      form.email = ''
    }
  },
)

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    // 邮箱为空时不提交该字段，避免触发后端 @IsEmail 校验
    const email = form.email.trim() === '' ? undefined : form.email.trim()
    if (isEdit.value && props.userId !== null) {
      const payload: UpdateUserPayload = { nickname: form.nickname.trim(), enabled: form.enabled, email }
      await updateUser(props.userId, payload)
      ElMessage.success('更新成功')
    } else {
      const payload: CreateUserPayload = {
        username: form.username.trim(),
        nickname: form.nickname.trim(),
        enabled: form.enabled,
        email,
      }
      await createUser(payload)
      ElMessage.success('新增成功')
    }
    visible.value = false
    emit('saved')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="480px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          :disabled="isEdit"
          placeholder="3-50 个字符"
          maxlength="50"
        />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" placeholder="1-50 个字符" maxlength="50" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="可选" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="form.enabled" active-text="启用" inactive-text="禁用" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
