import { useMemo, useState } from 'react'
import { EVENTS } from '../data/events'
import { CATEGORIES, FOOD_GENRES } from '../data/categories'
import { STALLS } from '../data/stalls'
import { loadExitSurvey, loadSurvey, saveExitSurvey } from '../lib/survey'

const SATISFACTION_OPTIONS = [
  { value: '5', emoji: '😍', label: 'とても満足' },
  { value: '4', emoji: '😊', label: '満足' },
  { value: '3', emoji: '🙂', label: 'どちらともいえない' },
  { value: '2', emoji: '😕', label: 'あまり満足していない' },
  { value: '1', emoji: '😢', label: '満足していない' },
]

const ISSUE_OPTIONS = [
  { value: 'none', label: '特になかった' },
  { value: 'crowded', label: '会場が混雑していた' },
  { value: 'hard_to_find', label: '企画の場所が分かりにくかった' },
  { value: 'long_wait', label: '待ち時間が長かった' },
  { value: 'transport', label: '駐車場・交通が分かりにくかった' },
  { value: 'payment', label: '支払い方法が分かりにくかった' },
  { value: 'few_rest_areas', label: '休憩場所が少なかった' },
  { value: 'not_enough_info', label: '案内・情報が不足していた' },
  { value: 'other', label: 'その他' },
]

const REVISIT_OPTIONS = [
  { value: 'definitely', emoji: '🙌', label: 'ぜひ来たい' },
  { value: 'probably', emoji: '😊', label: 'できれば来たい' },
  { value: 'neutral', emoji: '🤔', label: 'どちらともいえない' },
  { value: 'unlikely', emoji: '😕', label: 'あまり来たいと思わない' },
]

const SITE_OPTIONS = [
  { value: 'very_helpful', emoji: '✨', label: 'とても役に立った' },
  { value: 'helpful', emoji: '👍', label: '役に立った' },
  { value: 'neutral', emoji: '🙂', label: 'どちらともいえない' },
  { value: 'not_helpful', emoji: '😕', label: 'あまり役に立たなかった' },
  { value: 'not_used', emoji: '📵', label: '使っていない' },
]

const SCHOOL_INTEREST_OPTIONS = [
  { value: 'greatly_increased', label: 'とても高まった' },
  { value: 'increased', label: '少し高まった' },
  { value: 'unchanged', label: '変わらなかった' },
  { value: 'decreased', label: 'あまり高まらなかった' },
  { value: 'unsure', label: 'わからない' },
]

const ROLE_OPTIONS = [
  { value: 'parent', label: '保護者' },
  { value: 'student', label: '他校の生徒' },
  { value: 'jhs', label: '中学生' },
  { value: 'other', label: 'その他' },
]

const PROJECT_GROUPS = [
  ...Object.entries(FOOD_GENRES).map(([id, category]) => ({
    id: `food:${id}`,
    label: category.label,
    emoji: category.emoji,
  })),
  ...Object.entries(CATEGORIES)
    .filter(([id]) => id !== 'food')
    .map(([id, category]) => ({ id, label: category.label, emoji: category.emoji })),
  { id: 'event', label: 'ステージ・イベント', emoji: '🎤' },
]

const PROJECTS = [
  ...STALLS.map((stall) => ({
    id: `stall:${stall.id}`,
    label: stall.name,
    sub: stall.org,
    resultLabel: stall.org ? `${stall.name}（${stall.org}）` : stall.name,
    groupId: stall.cat === 'food' ? `food:${stall.foodGenre || 'meal'}` : stall.cat,
  })),
  ...EVENTS.map((event) => ({
    id: `event:${event.id}`,
    label: event.title,
    sub: event.by,
    resultLabel: event.by ? `${event.title}（${event.by}）` : event.title,
    groupId: 'event',
  })),
]

function ChoiceCard({ emoji, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold shadow-sm transition-all active:scale-[0.98] ${
        selected ? 'border-fest bg-orange-50 text-ink' : 'border-transparent bg-white text-ink'
      }`}
    >
      {emoji && <span className="text-2xl" aria-hidden="true">{emoji}</span>}
      <span>{label}</span>
    </button>
  )
}

export default function ExitSurvey({ onDone }) {
  const entryAnswer = useMemo(() => loadSurvey(), [])
  const existingExitAnswer = useMemo(() => loadExitSurvey(), [])
  const [step, setStep] = useState(existingExitAnswer ? 9 : entryAnswer?.role ? 1 : 0)
  const [role, setRole] = useState(entryAnswer?.role || null)
  const [projectSearch, setProjectSearch] = useState('')
  const [favoriteProjects, setFavoriteProjects] = useState([])
  const [satisfaction, setSatisfaction] = useState(null)
  const [issues, setIssues] = useState([])
  const [revisitIntent, setRevisitIntent] = useState(null)
  const [siteUsefulness, setSiteUsefulness] = useState(null)
  const [schoolInterest, setSchoolInterest] = useState(null)
  const [improvement, setImprovement] = useState('')

  const isJuniorHighStudent = role === 'jhs'
  const questionCount = isJuniorHighStudent ? 7 : 6
  const questionStep = step === 0 ? 0 : Math.min(step, questionCount)

  const groupedProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase()
    return PROJECT_GROUPS.map((group) => ({
      ...group,
      projects: PROJECTS.filter(
        (project) =>
          project.groupId === group.id &&
          (!query || `${project.label} ${project.sub} ${group.label}`.toLowerCase().includes(query)),
      ),
    })).filter((group) => group.projects.length > 0)
  }, [projectSearch])

  const toggleProject = (project) => {
    setFavoriteProjects((current) => {
      if (current.some((item) => item.id === project.id)) {
        return current.filter((item) => item.id !== project.id)
      }
      if (current.length >= 3) return current
      return [...current, project]
    })
  }

  const toggleIssue = (value) => {
    setIssues((current) => {
      if (value === 'none') return current.includes('none') ? [] : ['none']
      const withoutNone = current.filter((item) => item !== 'none')
      return withoutNone.includes(value)
        ? withoutNone.filter((item) => item !== value)
        : [...withoutNone, value]
    })
  }

  const submit = () => {
    const saved = saveExitSurvey({
      role,
      school: entryAnswer?.school || '',
      grade: entryAnswer?.grade || '',
      favoriteProjects,
      satisfaction,
      issues,
      revisitIntent,
      siteUsefulness,
      ...(isJuniorHighStudent ? { schoolInterest } : {}),
      improvement: improvement.trim(),
    })
    setStep(saved ? 8 : 9)
  }

  const goBack = () => {
    if (step === 1 && entryAnswer?.role) return
    if (step === 7 && !isJuniorHighStudent) setStep(5)
    else setStep((current) => Math.max(entryAnswer?.role ? 1 : 0, current - 1))
  }

  const finish = () => {
    window.history.replaceState({}, '', import.meta.env.BASE_URL)
    onDone()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-b from-paper to-orange-50 px-5 py-6">
      <div className="mx-auto my-auto w-full max-w-lg">
        {step < 8 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              {step > (entryAnswer?.role ? 1 : 0) ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full bg-white px-3 py-2 text-sm font-black text-stone-600 shadow-sm"
                >
                  ← 前に戻る
                </button>
              ) : <span />}
              <span className="text-xs font-black text-stone-400">
                {Math.max(questionStep, 1)} / {questionCount}
              </span>
            </div>
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fest to-fest2 transition-all"
                style={{ width: `${Math.max(questionStep, 1) / questionCount * 100}%` }}
              />
            </div>
          </>
        )}

        {step === 0 && (
          <Question title="あなたについて教えてください" description="当てはまるものを選んでください">
            {ROLE_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                {...option}
                selected={role === option.value}
                onClick={() => {
                  setRole(option.value)
                  setStep(1)
                }}
              />
            ))}
          </Question>
        )}

        {step === 1 && (
          <Question title="どの企画が面白かったですか？" description={`最大3つまで選べます（${favoriteProjects.length}/3）`}>
            <input
              type="search"
              value={projectSearch}
              onChange={(event) => setProjectSearch(event.target.value)}
              placeholder="企画名や団体名で検索…"
              className="mb-3 w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 font-bold text-ink outline-none focus:border-fest"
            />
            <div className="max-h-[48vh] space-y-5 overflow-y-auto rounded-2xl pr-1">
              {groupedProjects.map((group) => (
                <section key={group.id}>
                  <h2 className="sticky top-0 z-10 mb-2 rounded-xl bg-orange-100/95 px-3 py-2 text-sm font-black text-ink backdrop-blur">
                    <span className="mr-2" aria-hidden="true">{group.emoji}</span>
                    {group.label}
                  </h2>
                  <div className="space-y-2">
                    {group.projects.map((project) => {
                      const selected = favoriteProjects.some((item) => item.id === project.id)
                      return (
                        <button
                          type="button"
                          key={project.id}
                          onClick={() => toggleProject(project)}
                          className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left ${
                            selected ? 'border-fest bg-orange-50' : 'border-transparent bg-white'
                          }`}
                        >
                          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 text-xs font-black ${
                            selected ? 'border-fest bg-fest text-white' : 'border-orange-100'
                          }`}>
                            {selected ? '✓' : ''}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-black text-ink">{project.label}</span>
                            {project.sub && (
                              <span className="block text-[11px] font-bold text-stone-400">{project.sub}</span>
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
            <div className="h-20" aria-hidden="true" />
            <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-orange-50 via-orange-50/95 to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5">
              <button
                type="button"
                disabled={favoriteProjects.length === 0}
                onClick={() => setStep(2)}
                className="mx-auto block w-full max-w-lg rounded-full bg-gradient-to-r from-fest to-fest2 py-3.5 text-base font-black text-white shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-40 disabled:shadow-none"
              >
                次へ
              </button>
            </div>
          </Question>
        )}

        {step === 2 && (
          <Question title="鶴東祭の満足度を教えてください">
            {SATISFACTION_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                {...option}
                selected={satisfaction === option.value}
                onClick={() => {
                  setSatisfaction(option.value)
                  setStep(3)
                }}
              />
            ))}
          </Question>
        )}

        {step === 3 && (
          <Question title="会場内で困ったことはありましたか？" description="複数選択できます">
            {ISSUE_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                {...option}
                selected={issues.includes(option.value)}
                onClick={() => toggleIssue(option.value)}
              />
            ))}
            <NextButton disabled={issues.length === 0} onClick={() => setStep(4)} />
          </Question>
        )}

        {step === 4 && (
          <Question title="来年も鶴東祭に来たいですか？">
            {REVISIT_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                {...option}
                selected={revisitIntent === option.value}
                onClick={() => {
                  setRevisitIntent(option.value)
                  setStep(5)
                }}
              />
            ))}
          </Question>
        )}

        {step === 5 && (
          <Question title="この公式サイトは役に立ちましたか？">
            {SITE_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                {...option}
                selected={siteUsefulness === option.value}
                onClick={() => {
                  setSiteUsefulness(option.value)
                  setStep(isJuniorHighStudent ? 6 : 7)
                }}
              />
            ))}
          </Question>
        )}

        {step === 6 && isJuniorHighStudent && (
          <Question
            title="文化祭を体験して、鶴岡東高校への興味や関心は高まりましたか？"
            description="今の気持ちに最も近いものを選んでください"
          >
            {SCHOOL_INTEREST_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                {...option}
                selected={schoolInterest === option.value}
                onClick={() => {
                  setSchoolInterest(option.value)
                  setStep(7)
                }}
              />
            ))}
          </Question>
        )}

        {step === 7 && (
          <Question
            title="来年に向けて改善点があれば教えてください"
            description="任意回答です"
          >
            <textarea
              value={improvement}
              onChange={(event) => setImprovement(event.target.value.slice(0, 500))}
              rows={6}
              placeholder="会場、企画、案内など、気づいたことをご記入ください"
              className="w-full resize-none rounded-2xl border-2 border-orange-100 bg-white p-4 font-bold text-ink outline-none focus:border-fest"
            />
            <p className="mt-1 text-right text-xs font-bold text-stone-400">{improvement.length}/500</p>
            <button
              type="button"
              onClick={submit}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-fest to-fest2 py-4 text-lg font-black text-white shadow-lg shadow-orange-200 active:scale-95"
            >
              アンケートを送信
            </button>
          </Question>
        )}

        {step === 8 && (
          <div className="text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white text-5xl shadow-lg shadow-orange-100">🎊</div>
            <h1 className="mt-6 text-2xl font-black text-ink">ありがとうございました！</h1>
            <p className="mt-2 text-sm font-bold text-stone-500">
              いただいたご意見を、来年の鶴東祭に活かします。
            </p>
            <button
              type="button"
              onClick={finish}
              className="mt-8 w-full rounded-full bg-gradient-to-r from-fest to-fest2 py-4 text-lg font-black text-white shadow-lg shadow-orange-200 active:scale-95"
            >
              サイトへ戻る
            </button>
          </div>
        )}

        {step === 9 && (
          <div className="text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white text-5xl shadow-lg shadow-orange-100">✅</div>
            <h1 className="mt-6 text-2xl font-black text-ink">回答済みです</h1>
            <p className="mt-2 text-sm font-bold leading-relaxed text-stone-500">
              帰り際アンケートへのご協力
              <br />
              ありがとうございました。
            </p>
            <button
              type="button"
              onClick={finish}
              className="mt-8 w-full rounded-full bg-gradient-to-r from-fest to-fest2 py-4 text-lg font-black text-white shadow-lg shadow-orange-200 active:scale-95"
            >
              サイトへ戻る
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Question({ title, description, children }) {
  return (
    <section>
      <p className="mb-1 text-center text-[10px] font-black tracking-[0.18em] text-fest">EXIT SURVEY</p>
      <h1 className="text-center text-xl font-black leading-relaxed text-ink">{title}</h1>
      {description && <p className="mb-5 mt-1 text-center text-sm font-bold text-stone-500">{description}</p>}
      <div className={`space-y-2 ${description ? '' : 'mt-5'}`}>{children}</div>
    </section>
  )
}

function NextButton({ disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-4 w-full rounded-full bg-gradient-to-r from-fest to-fest2 py-3.5 text-base font-black text-white shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-40 disabled:shadow-none"
    >
      次へ
    </button>
  )
}
