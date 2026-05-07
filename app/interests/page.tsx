'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { label: '학사/수업', icon: '📚', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', tags: ['수강신청', '성적', '졸업요건', '복학', '휴학', '전과', '부전공', '학점교류'] },
  { label: '장학금', icon: '🎓', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', tags: ['성적우수장학금', '국가장학금', '근로장학금', '외부장학금', '긴급장학금'] },
  { label: '취업/진로', icon: '💼', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', tags: ['인턴십', '취업특강', '공모전', '현장실습', '채용설명회', '자격증'] },
  { label: '대학원/연구', icon: '🔬', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', tags: ['대학원진학', '연구실', '학부연구생', '논문'] },
  { label: '교환학생/국제', icon: '✈️', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', tags: ['교환학생', '어학연수', '국제교류'] },
  { label: '생활/시설', icon: '🏫', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', tags: ['도서관', '기숙사', '식당', '셔틀버스'] },
  { label: '행사/문화', icon: '🎊', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', tags: ['축제', '동아리', '체육대회', '학교행사'] },
]

const ease = [0.22, 1, 0.36, 1] as const

export default function InterestsPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customInput, setCustomInput] = useState('')
  const [customTags, setCustomTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function toggleTag(tag: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  function addCustomTag() {
    const trimmed = customInput.trim()
    if (!trimmed || customTags.includes(trimmed) || selected.has(trimmed)) return
    setCustomTags(prev => [...prev, trimmed])
    setSelected(prev => new Set([...prev, trimmed]))
    setCustomInput('')
  }

  function removeCustomTag(tag: string) {
    setCustomTags(prev => prev.filter(t => t !== tag))
    setSelected(prev => {
      const next = new Set(prev)
      next.delete(tag)
      return next
    })
  }

  async function handleSubmit() {
    if (selected.size === 0 || loading) return
    setLoading(true)
    localStorage.setItem('interests', JSON.stringify(Array.from(selected)))
    await new Promise(r => setTimeout(r, 500))
    router.push('/settings')
  }

  return (
    <div className="mx-auto max-w-lg pb-36">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="mb-8"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5">
          <span className="text-sm">🎯</span>
          <span className="text-xs font-semibold text-indigo-600">관심사 설정</span>
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900">
          어떤 공지에<br />관심 있으세요?
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          선택한 분야의 공지를 AI가 요약해 알려드려요
        </p>

        {/* Selected count chip */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-200"
            >
              ✓ {selected.size}개 선택됨
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Categories */}
      <div className="flex flex-col gap-5">
        {CATEGORIES.map((category, catIdx) => (
          <motion.section
            key={category.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: catIdx * 0.05, ease }}
            className={`rounded-2xl border ${category.border} ${category.bg} p-4`}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-base">{category.icon}</span>
              <h3 className={`text-sm font-bold ${category.color}`}>{category.label}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.tags.map((tag, tagIdx) => {
                const isSelected = selected.has(tag)
                return (
                  <motion.button
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: catIdx * 0.05 + tagIdx * 0.02, duration: 0.22, ease: 'easeOut' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'border-white bg-white text-zinc-600 hover:border-indigo-200 hover:text-indigo-600 shadow-sm'
                    }`}
                  >
                    {isSelected && <span className="mr-0.5 text-xs">✓ </span>}
                    {tag}
                  </motion.button>
                )
              })}
            </div>
          </motion.section>
        ))}

        {/* Custom tag input */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: CATEGORIES.length * 0.05, ease }}
          className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-base">✏️</span>
            <h3 className="text-sm font-bold text-zinc-700">직접 입력</h3>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="원하는 키워드를 입력하세요"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomTag()}
              maxLength={20}
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-200 transition-all"
            />
            <button
              onClick={addCustomTag}
              disabled={!customInput.trim()}
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-30 hover:bg-zinc-700 transition-colors"
            >
              추가
            </button>
          </div>

          <AnimatePresence>
            {customTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex flex-wrap gap-2 overflow-hidden"
              >
                {customTags.map(tag => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-1.5 rounded-full border border-indigo-400 bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm shadow-indigo-200"
                  >
                    ✓ {tag}
                    <button
                      onClick={() => removeCustomTag(tag)}
                      className="ml-0.5 text-indigo-200 hover:text-white transition-colors"
                      aria-label={`${tag} 삭제`}
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* Sticky submit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="fixed bottom-0 left-0 right-0 border-t border-indigo-50 bg-white/80 p-4 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-lg">
          <motion.button
            onClick={handleSubmit}
            disabled={selected.size === 0 || loading}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 py-4 text-base font-bold text-white shadow-lg shadow-indigo-200 disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {loading ? '저장 중...' : selected.size > 0 ? `완료 — ${selected.size}개 선택` : '관심사를 선택해 주세요'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
