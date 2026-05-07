'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Feedback = 'like' | 'dislike' | null

interface Notice {
  id: number
  title: string
  summary: string
  category: string
  deadline: string | null
  url: string
}

const MOCK_NOTICES: Notice[] = [
  {
    id: 1,
    title: '2025-1학기 성적우수 장학금 신청 안내',
    summary: '직전 학기 성적 3.5 이상인 학생을 대상으로 성적우수 장학금을 신청받습니다. 신청 기간은 5월 12일~16일이며, 포털에서 온라인 신청하시면 됩니다.',
    category: '장학금',
    deadline: '2025-05-16',
    url: '#',
  },
  {
    id: 2,
    title: '[졸업] 2025년 8월 졸업예정자 졸업요건 확인 안내',
    summary: '8월 졸업예정자는 졸업요건(학점, 영어, 봉사활동 등)을 반드시 확인하고 미충족 항목이 있으면 학사지원팀에 문의하세요. 확인 기한: 6월 30일.',
    category: '학사',
    deadline: '2025-06-30',
    url: '#',
  },
  {
    id: 3,
    title: '컴퓨터공학과 하계 인턴십 연계 기업 모집',
    summary: '학과 연계 하계 인턴십 참여 기업을 모집합니다. 참여 학생은 학점 인정이 가능하며, 지원서 제출은 5월 20일까지입니다.',
    category: '취업/인턴',
    deadline: '2025-05-20',
    url: '#',
  },
  {
    id: 4,
    title: '도서관 하계 운영시간 변경 안내',
    summary: '6월 30일부터 8월 22일까지 도서관 운영시간이 평일 09:00~20:00으로 단축됩니다. 주말 운영은 중단됩니다.',
    category: '시설',
    deadline: null,
    url: '#',
  },
  {
    id: 5,
    title: '2025년 대학원 후기 모집 일정 공고',
    summary: '2025학년도 후기(2월) 대학원 신입생 모집 일정을 공고합니다. 원서 접수: 7월 1일~10일, 합격자 발표: 8월 초 예정.',
    category: '대학원',
    deadline: '2025-07-10',
    url: '#',
  },
]

const CATEGORY_STYLE: Record<string, { badge: string; bar: string; icon: string }> = {
  장학금:    { badge: 'bg-amber-100 text-amber-700 border-amber-200',   bar: 'bg-amber-400',   icon: '🎓' },
  학사:      { badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', bar: 'bg-indigo-400',  icon: '📚' },
  '취업/인턴': { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-400', icon: '💼' },
  시설:      { badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',      bar: 'bg-zinc-400',    icon: '🏫' },
  대학원:    { badge: 'bg-violet-100 text-violet-700 border-violet-200', bar: 'bg-violet-400',  icon: '🔬' },
}

export default function FeedPage() {
  const [feedbacks, setFeedbacks] = useState<Record<number, Feedback>>({})

  function handleFeedback(id: number, type: Feedback) {
    setFeedbacks(prev => ({ ...prev, [id]: prev[id] === type ? null : type }))
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
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-400">AI 피드</p>
          <h1 className="text-3xl font-extrabold text-zinc-900">공지 알림</h1>
          <p className="mt-1 text-sm text-zinc-500">관심사 기반으로 선별된 공지예요</p>
        </div>
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
          {MOCK_NOTICES.length}건
        </span>
      </div>

      <ul className="flex flex-col gap-4">
        {MOCK_NOTICES.map((notice, idx) => {
          const fb = feedbacks[notice.id]
          const style = CATEGORY_STYLE[notice.category] ?? { badge: 'bg-zinc-100 text-zinc-600 border-zinc-200', bar: 'bg-zinc-300', icon: '📄' }
          const dl = notice.deadline ? daysLeft(notice.deadline) : null

          return (
            <motion.li
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm shadow-zinc-100 hover:shadow-md hover:shadow-indigo-100/50 transition-shadow"
            >
              {/* Top color bar */}
              <div className={`h-1 w-full ${style.bar}`} />

              <div className="p-5">
                {/* Meta row */}
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

                {/* Title */}
                <a
                  href={notice.url}
                  className="block text-base font-bold leading-snug text-zinc-900 hover:text-indigo-600 transition-colors"
                >
                  {notice.title}
                </a>

                {/* Summary */}
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{notice.summary}</p>

                {/* Feedback */}
                <div className="mt-4 flex items-center gap-2 border-t border-zinc-50 pt-4">
                  <span className="text-xs text-zinc-400">도움이 됐나요?</span>
                  <div className="ml-auto flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFeedback(notice.id, 'like')}
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
                      onClick={() => handleFeedback(notice.id, 'dislike')}
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
    </div>
  )
}
