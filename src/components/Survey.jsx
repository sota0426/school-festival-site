import { useState } from 'react'
import { MIDDLE_SCHOOLS } from '../data/schools'
import { saveSurvey } from '../lib/survey'

const VISIT_OPTIONS = [
  { value: 'onsite', emoji: '🏫', label: '文化祭に来場している', sub: '会場でこのサイトを見ています' },
  { value: 'online', emoji: '📱', label: 'サイトを見ているだけ', sub: '来場前のチェック・おうちから' },
]

const ROLE_OPTIONS = [
  { value: 'parent', emoji: '👨‍👩‍👧', label: '保護者' },
  { value: 'student', emoji: '🎒', label: '他校の生徒' },
  { value: 'jhs', emoji: '📚', label: '中学生' },
  { value: 'other', emoji: '🙂', label: 'その他' },
]

function OptionCard({ emoji, label, sub, selected, onClick, delay = 0 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fade-up flex w-full items-center gap-4 rounded-2xl border-2 bg-white px-5 py-4 text-left shadow-sm transition-all active:scale-[0.97] ${
        selected ? 'border-fest bg-orange-50' : 'border-transparent'
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="text-3xl">{emoji}</span>
      <span>
        <span className="block font-bold text-ink">{label}</span>
        {sub && <span className="block text-xs text-stone-500">{sub}</span>}
      </span>
    </button>
  )
}

export default function Survey({ onDone }) {
  const [step, setStep] = useState(0)
  const [visiting, setVisiting] = useState(null)
  const [role, setRole] = useState(null)
  const [school, setSchool] = useState('')

  const finish = (answer) => {
    saveSurvey(answer)
    onDone()
  }

  const pickVisiting = (v) => {
    setVisiting(v)
    if (v === 'online') finish({ visiting: v })
    else setStep(1)
  }

  const pickRole = (r) => {
    setRole(r)
    if (r === 'jhs') setStep(2)
    else finish({ visiting, role: r })
  }

  const totalSteps = visiting === 'onsite' ? (role === 'jhs' ? 3 : 2) : 1

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-paper to-orange-50 px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          {Array.from({ length: Math.max(totalSteps, 2) }, (_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i <= step ? 'w-6 bg-fest' : 'w-2 bg-orange-200'
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div key="q0">
            <h2 className="pop-in mb-1 text-center text-xl font-black text-ink">ようこそ鶴東祭へ!</h2>
            <p className="fade-up mb-6 text-center text-sm text-stone-500">
              統計のため1つだけ教えてください
            </p>
            <div className="space-y-3">
              {VISIT_OPTIONS.map((o, i) => (
                <OptionCard
                  key={o.value}
                  {...o}
                  delay={0.1 + i * 0.08}
                  selected={visiting === o.value}
                  onClick={() => pickVisiting(o.value)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div key="q1">
            <h2 className="pop-in mb-6 text-center text-xl font-black text-ink">
              あなたについて教えてください
            </h2>
            <div className="space-y-3">
              {ROLE_OPTIONS.map((o, i) => (
                <OptionCard
                  key={o.value}
                  {...o}
                  delay={0.05 + i * 0.07}
                  selected={role === o.value}
                  onClick={() => pickRole(o.value)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div key="q2">
            <h2 className="pop-in mb-6 text-center text-xl font-black text-ink">
              出身中学を教えてください
            </h2>
            <select
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="fade-up w-full rounded-2xl border-2 border-orange-200 bg-white px-4 py-4 text-base font-bold text-ink outline-none focus:border-fest"
            >
              <option value="" disabled>
                中学校を選択…
              </option>
              {MIDDLE_SCHOOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!school}
              onClick={() => finish({ visiting, role, school })}
              className="fade-up mt-6 w-full rounded-full bg-gradient-to-r from-fest to-fest2 py-4 text-lg font-black text-white shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-40 disabled:shadow-none"
              style={{ animationDelay: '0.15s' }}
            >
              回答してはじめる
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
