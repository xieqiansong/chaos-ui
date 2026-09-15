import { createHmac, timingSafeEqual } from 'crypto'

/**
 * 极简 HS256 JWT 实现（学习仓库用，无 @nestjs/jwt 依赖）。
 * 结构与标准 JWT 一致：`header.payload.signature`（base64url）。
 * 生产环境建议使用 @nestjs/jwt + 非对称算法（RS256）并做吊销/续期。
 */

const secret = process.env.JWT_SECRET || 'chaos-dev-secret'

export interface JwtPayload {
  /** subject：用户 id */
  sub: number
  username: string
  iat?: number
  exp?: number
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64')
}

export function signJwt(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  expiresInSec = 60 * 60 * 24,
): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = { ...payload, iat: now, exp: now + expiresInSec }
  const h = base64url(JSON.stringify(header))
  const p = base64url(JSON.stringify(body))
  const signature = base64url(createHmac('sha256', secret).update(`${h}.${p}`).digest())
  return `${h}.${p}.${signature}`
}

export function verifyJwt(token: string): JwtPayload {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid token')
  const [h, p, sig] = parts
  const expected = base64url(createHmac('sha256', secret).update(`${h}.${p}`).digest())
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('Invalid token signature')
  }
  const payload = JSON.parse(base64urlDecode(p).toString()) as JwtPayload
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired')
  }
  return payload
}
