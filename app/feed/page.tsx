'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  getUserId,
  listMyNotifications,
  setFeedback as apiSetFeedback,
  type Feedback,
  type NotificationItem,
} from '../_lib/api'

interface Notice {
  notification_id: number
  notice_id: number
  title: string
  summary: string
  category: string
  deadline: string | null
  url: string
  feedback: Feedback
}

const CATEGORY_STYLE: Record<string, { badge: string; bar: string; icon: string }> = {
  장학금:    { badge: 'bg-amber-100 text-amber-700 border-amber-200',   bar: 'bg-amber-400',   icon: '🎓' },
  학사:      { badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', bar: 'bg-indigo-400',  icon: '📚' },
  '취업/인턴': { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-400', icon: '💼' },
  시설:      { badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',      bar: 'bg-zinc-400',    icon: '🏫' },
  대학원:    { badge: 'bg-violet-100 text-violet-700 border-violet-200', bar: 'bg-violet-400',  icon: '🔬' },
  공지:      { badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',      bar: 'bg-zinc-300',    icon: '📄' },
}

// source_id를 한글 카테고리로 매핑
function categoryFromSource(sourceId: string): string {
  if (sourceId.includes('cse') || sourceId.includes('cba') || sourceId.includes('snu')) return '학사'
  if (sourceId.includes('saramin') || sourceId.includes('jobkorea') || sourceId.includes('recruit')) return '취업/인턴'
  return '공지'
}

function adapt(item: NotificationItem): Notice {
  return {
    notification_id: item.notification_id,
    notice_id: item.notice_id,
    title: item.title,
    summary: item.summary,
    category: categoryFromSource(item.source_id),
    deadline: null, // 백엔드에 마감일 추출 미구현 — null
    url: item.url,
    feedback: item.feedback,
  }
}

export default function FeedPage() {
  const [items, setItems] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsLogin, setNeedsLogin] = useState(false)

  useEffect(() => {
    const uid = getUserId()
    if (uid == null) {
      setNeedsLogin(true)
      setLoading(false)
      return
    }
    listMyNotifications(uid)
      .then(r => setItems(r.items.map(adapt)))
      .catch(e => setError(e instanceof Error ? e.message : '불러오기 실패'))
      .finally(() => setLoading(false))
  }, [])

  async function handleFeedback(item: Notice, type: 'like' | 'dislike') {
    const newValue: Feedback = item.feedback === type ? null : type
    // optimistic
    setItems(prev =>
      prev.map(n => (n.notification_id === item.notification_id ? { ...n, feedback: newValue } : n)),
    )
    try {
      await apiSetFeedback(item.notification_id, newValue)
    } catch (e) {
      // 롤백
      setItems(prev =>
        prev.map(n => (n.notification_id === item.notification_id ? { ...n, feedback: item.feedback } : n)),
      )
      setError(e instanceof Error ? e.message : '피드백 저장 실패')
    }
  }

  function daysLeft(deadline: string) {
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
    if (diff < 0) return { label: '마감', color: 'text-zinc-400 bg-zinc-100' }
    if (diff === 0) return { label: 'D-Day', color: 'text-red-600 bg-red-100' }
    if (diff <= 3) return { label: `D-${diff}`, color: 'text-red-600 bg-red-100' }
    if (diff <= 7) return { label: `D-${diff}`, color: 'text-orange-600 bg-orange-100' }
    return { label: `D-${diff}`, color: 'text-zinc-500 bg-zinc-100' }
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-400">AI 피드</p>
          <h1 className="text-3xl font-extrabold text-zinc-900">공지 알림</h1>
          <p className="mt-1 text-sm text-zinc-500">관심사 기반으로 선별된 공지예요</p>
        </div>
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
          {items.length}건
        </span>
      </div>

      {needsLogin ? (
        <p className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-center text-sm text-amber-800">
          회원가입과 관심사 등록을 먼저 완료해주세요.
        </p>
      ) : loading ? (
        <p className="text-center text-sm text-zinc-400">불러오는 중...</p>
      ) : error ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center text-sm text-zinc-400">
          아직 받은 알림이 없어요.<br />
          크롤러가 새 공지를 가져오고 매칭하면 여기에 나타나요.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((notice, idx) => {
            const fb = notice.feedback
            const style = CATEGORY_STYLE[notice.category] ?? CATEGORY_STYLE['공지']
            const dl = notice.deadline ? daysLeft(notice.deadline) : null
            return (
              <motion.li
                key={notice.notification_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm shadow-zinc-100 hover:shadow-md hover:shadow-indigo-100/50 transition-shadow"
              >
                <div className={`h-1 w-full ${style.bar}`} />

                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <span className="text-base">{style.icon}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>
                      {notice.category}
                    </span>
                    {dl && (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${dl.color}`}>
                        {dl.label}
                      </span>
                    )}
                    {notice.deadline && (
                      <span className="ml-auto text-xs text-zinc-400">~ {notice.deadline}</span>
                    )}
                  </div>

                  <a
                    href={notice.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-base font-bold leading-snug text-zinc-900 hover:text-indigo-600 transition-colors"
                  >
                    {notice.title}
                  </a>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{notice.summary}</p>

                  <div className="mt-4 flex items-center gap-2 border-t border-zinc-50 pt-4">
                    <span className="text-xs text-zinc-400">도움이 됐나요?</span>
                    <div className="ml-auto flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleFeedback(notice, 'like')}
                        className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all ${
                          fb === 'like'
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                            : 'bg-zinc-50 text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                      >
                        👍 <span className="hidden sm:inline">도움돼요</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleFeedback(notice, 'dislike')}
                        className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all ${
                          fb === 'dislike'
                            ? 'bg-red-500 text-white shadow-sm shadow-red-200'
                            : 'bg-zinc-50 text-zinc-500 hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        👎 <span className="hidden sm:inline">별로예요</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
