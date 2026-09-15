<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { showSuccess } from '@/utils/message'

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

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    // 真实项目此处调用「更新资料」接口；此处以本地延时 + 成功提示演示完整保存流程
    await new Promise((resolve) => setTimeout(resolve, 400))
    const payload = { ...form, ...extraForm }
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
</style>
