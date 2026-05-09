'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ApiError, getEmail, login, saveSession } from '../_lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 가입 직후 LS에 남은 이메일을 미리 채워둠
    const remembered = getEmail()
    if (remembered) setEmail(remembered)
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const r = await login(email.trim())
      saveSession(r.user_id, r.email)
      router.push('/feed')
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setError('등록되지 않은 이메일입니다. 회원가입을 먼저 진행해 주세요.')
      } else {
        setError(e instanceof Error ? e.message : '로그인 실패')
      }
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-white/80 shadow-xl shadow-indigo-100/50 backdrop-blur-sm">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-500 px-8 pt-8 pb-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-200">
            로그인
          </p>
          <p className="text-xl font-bold text-white">
            가입한 이메일로 다시 시작하기
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              이메일
            </label>
            <input
              ref={inputRef}
              type="email"
              required
              placeholder="example@khu.ac.kr"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null) }}
              className="w-full border-b-2 border-indigo-100 bg-transparent pb-2 text-2xl font-medium text-zinc-900 placeholder:text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors duration-200"
            />
          </div>

          <motion.button
            type="submit"
            disabled={!email.trim() || loading}
            whileTap={{ scale: 0.97 }}
            className="self-start rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-8 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? '확인 중...' : '로그인 →'}
          </motion.button>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium text-red-500"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <p className="border-t border-zinc-100 pt-4 text-xs text-zinc-400">
            아직 가입 안 하셨나요?{' '}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:underline">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
