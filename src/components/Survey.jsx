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

const DISCOVERY_OPTIONS = [
  { value: 'family_or_friends', emoji: '👨‍👩‍👧‍👦', label: '家族や友達から' },
  { value: 'poster', emoji: '🪧', label: 'ポスター' },
  { value: 'instagram', emoji: '📸', label: 'Instagram' },
  { value: 'other', emoji: '💡', label: 'その他' },
]

const GRADE_OPTIONS = [
  { value: 'jhs1', emoji: '1️⃣', label: '中学1年生' },
  { value: 'jhs2', emoji: '2️⃣', label: '中学2年生' },
  { value: 'jhs3', emoji: '3️⃣', label: '中学3年生' },
]

const VISIT_COUNT_OPTIONS = [
  { value: 'first', emoji: '🌱', label: '初めて' },
  { value: 'second', emoji: '✌️', label: '2回目' },
  { value: 'three_or_more', emoji: '🎉', label: '3回以上' },
]

const COMPANION_OPTIONS = [
  { value: 'alone', emoji: '🙂', label: 'ひとり' },
  { value: 'family', emoji: '👨‍👩‍👧‍👦', label: '家族' },
  { value: 'friends', emoji: '🧑‍🤝‍🧑', label: '友達' },
  { value: 'school_or_club', emoji: '🎒', label: '学校・部活動の仲間' },
  { value: 'other', emoji: '💡', label: 'その他' },
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
  const [grade, setGrade] = useState(null)
  const [visitCount, setVisitCount] = useState(null)
  const [companion, setCompanion] = useState(null)
  const [discovery, setDiscovery] = useState(null)

  const pickVisiting = (v) => {
    setVisiting(v)
    setRole(null)
    setSchool('')
    setGrade(null)
    setVisitCount(null)
    setCompanion(null)
    if (v === 'online') setStep(6)
    else setStep(1)
  }

  const pickRole = (r) => {
    setRole(r)
    if (r !== 'jhs') {
      setSchool('')
      setGrade(null)
    }
    if (r === 'jhs') setStep(2)
    else setStep(4)
  }

  const goBack = () => {
    if (step === 1) setStep(0)
    if (step === 2) setStep(1)
    if (step === 3) setStep(2)
    if (step === 4) setStep(role === 'jhs' ? 3 : 1)
    if (step === 5) setStep(4)
    if (step === 6) setStep(visiting === 'online' ? 0 : 5)
  }

  const finishWithDiscovery = (value) => {
    setDiscovery(value)
    saveSurvey({
      visiting,
      ...(role ? { role } : {}),
      ...(school ? { school } : {}),
      ...(grade ? { grade } : {}),
      ...(visitCount ? { visitCount } : {}),
      ...(companion ? { companion } : {}),
      discovery: value,
    })
    setStep(7)
  }

  const totalSteps = visiting === 'onsite' ? (role === 'jhs' ? 7 : 5) : 2
  const visibleStep =
    visiting === 'online'
      ? step === 6 ? 1 : 0
      : role === 'jhs'
        ? step
        : ({ 0: 0, 1: 1, 4: 2, 5: 3, 6: 4 }[step] ?? 0)

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto bg-gradient-to-b from-paper to-orange-50 px-6 py-6">
      <div className="my-auto w-full max-w-md">
        {step > 0 && step < 7 && (
          <button
            type="button"
            onClick={goBack}
            className="mb-4 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-2 text-sm font-black text-stone-600 shadow-sm transition-transform active:scale-95"
          >
            <span aria-hidden="true">←</span>
            前に戻る
          </button>
        )}

        {step < 7 && (
          <div className="mb-6 flex items-center justify-center gap-2">
            {Array.from({ length: Math.max(totalSteps, 2) }, (_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i <= visibleStep ? 'w-6 bg-fest' : 'w-2 bg-orange-200'
                }`}
              />
            ))}
          </div>
        )}

        {step === 0 && (
          <div key="q0">
            <h2 className="pop-in mb-1 text-center text-xl font-black text-ink">ようこそ鶴東祭へ!</h2>
            <p className="fade-up mb-6 text-center text-sm text-stone-500">
              統計のため、いくつか教えてください
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
              onClick={() => setStep(3)}
              className="fade-up mt-6 w-full rounded-full bg-gradient-to-r from-fest to-fest2 py-4 text-lg font-black text-white shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-40 disabled:shadow-none"
              style={{ animationDelay: '0.15s' }}
            >
              次へ
            </button>
          </div>
        )}

        {step === 3 && (
          <div key="q3">
            <h2 className="pop-in mb-6 text-center text-xl font-black text-ink">
              現在の学年を教えてください
            </h2>
            <div className="space-y-3">
              {GRADE_OPTIONS.map((o, i) => (
                <OptionCard
                  key={o.value}
                  {...o}
                  delay={0.05 + i * 0.07}
                  selected={grade === o.value}
                  onClick={() => {
                    setGrade(o.value)
                    setStep(4)
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div key="q4">
            <h2 className="pop-in mb-6 text-center text-xl font-black text-ink">
              鶴東祭への来場は何回目ですか？
            </h2>
            <div className="space-y-3">
              {VISIT_COUNT_OPTIONS.map((o, i) => (
                <OptionCard
                  key={o.value}
                  {...o}
                  delay={0.05 + i * 0.07}
                  selected={visitCount === o.value}
                  onClick={() => {
                    setVisitCount(o.value)
                    setStep(5)
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div key="q5">
            <h2 className="pop-in mb-6 text-center text-xl font-black text-ink">
              誰と来ましたか？
            </h2>
            <div className="space-y-3">
              {COMPANION_OPTIONS.map((o, i) => (
                <OptionCard
                  key={o.value}
                  {...o}
                  delay={0.05 + i * 0.07}
                  selected={companion === o.value}
                  onClick={() => {
                    setCompanion(o.value)
                    setStep(6)
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div key="q6">
            <h2 className="pop-in mb-1 text-center text-xl font-black text-ink">
              鶴東祭は何で知りましたか？
            </h2>
            <p className="fade-up mb-6 text-center text-sm text-stone-500">
              当てはまるものを1つ選んでください
            </p>
            <div className="space-y-3">
              {DISCOVERY_OPTIONS.map((o, i) => (
                <OptionCard
                  key={o.value}
                  {...o}
                  delay={0.05 + i * 0.07}
                  selected={discovery === o.value}
                  onClick={() => finishWithDiscovery(o.value)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div key="thanks" className="pop-in text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white text-5xl shadow-lg shadow-orange-100">
              🎊
            </div>
            <h2 className="mt-6 text-2xl font-black text-ink">
              ありがとうございました！
            </h2>
            <p className="mt-2 text-sm font-bold leading-relaxed text-stone-500">
              アンケートへのご協力ありがとうございます。
              <br />
              鶴東祭をお楽しみください！
            </p>
            <button
              type="button"
              onClick={onDone}
              className="mt-8 w-full rounded-full bg-gradient-to-r from-fest to-fest2 py-4 text-lg font-black text-white shadow-lg shadow-orange-200 transition-all active:scale-95"
            >
              サイトを見る
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
