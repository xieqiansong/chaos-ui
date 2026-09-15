import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

/**
 * 密码哈希工具（学习仓库用，无第三方依赖）。
 * - 采用 Node 内置 scrypt，存储格式 `salt:hash`（均为 hex）。
 * - 生产环境应替换为 bcrypt/argon2 等专业方案，并配合迁移。
 */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string | undefined): boolean {
  if (!stored) return false
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const hashBuf = Buffer.from(hash, 'hex')
  const testBuf = scryptSync(password, salt, 64)
  return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf)
}
