import { useEffect, useMemo } from 'react'
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  ListChecks,
  Play,
  RotateCcw,
  Target,
  Trophy,
} from 'lucide-react'
import {
  GUIDED_DRILLS,
  PASSING_QUIZ_SCORE,
  QUIZ_QUESTIONS,
  TRAINING_LESSONS,
  scoreQuiz,
} from './trainingContent.js'
import LessonCarousel from './LessonCarousel.jsx'

const TRAINING_TABS = [
  { id: 'lessons', label: 'Desk Lessons', icon: BookOpen },
  { id: 'tutorial', label: 'Guided Drills', icon: Play },
  { id: 'quiz', label: 'Knowledge Check', icon: ListChecks },
]

function unique(values) {
  return [...new Set(values)]
}

function GuidedTutorial({ completedDrills, liveDrills, onComplete, onPractice }) {
  return (
    <div className="tutorial-workspace">
      <section className="tutorial-lead">
        <div>
          <span className="section-kicker">Floor route / six stops</span>
          <h2>Learn it on the live simulator</h2>
          <p>Each drill opens the real trade floor with the relevant control marked in safety orange. Actions stay simulated, but the order behavior is the same behavior used throughout the game.</p>
        </div>
        <div className="tutorial-count"><strong>{completedDrills.length}/6</strong><span>drills stamped</span></div>
      </section>

      <div className="drill-list">
        {GUIDED_DRILLS.map((drill) => {
          const evidenceMet = drill.evidence ? Boolean(liveDrills[drill.evidence]) : false
          const complete = completedDrills.includes(drill.id) || evidenceMet
          return (
            <article key={drill.id} className={`guided-drill ${complete ? 'complete' : ''}`}>
              <div className="guided-step"><span>DRILL</span><strong>{drill.step}</strong></div>
              <div className="guided-copy">
                <div className="guided-title-row">
                  <div><span className="section-kicker">{drill.target} station</span><h3>{drill.title}</h3></div>
                  <span className={`drill-status ${complete ? 'complete' : ''}`}>{complete ? 'Stamped' : 'Open'}</span>
                </div>
                <p>{drill.summary}</p>
                <ol>{drill.actions.map((action) => <li key={action}>{action}</li>)}</ol>
                <div className="success-check"><Target size={16} aria-hidden="true" /><span><b>Proof:</b> {drill.success}</span></div>
              </div>
              <div className="guided-actions">
                <button type="button" className="practice-button" onClick={() => onPractice(drill)}><Play size={16} />Practice on floor</button>
                <button type="button" className="review-button" disabled={complete} onClick={() => onComplete(drill.id)}>{complete ? <CheckCircle2 size={16} /> : <Check size={16} />}{complete ? 'Complete' : 'Mark reviewed'}</button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function KnowledgeQuiz({ record, setRecord }) {
  const answers = record.quizAnswers ?? {}
  const submitted = Boolean(record.quizSubmitted)
  const answered = Object.keys(answers).length
  const score = scoreQuiz(answers)
  const passed = score >= PASSING_QUIZ_SCORE

  function answerQuestion(questionId, optionId) {
    if (submitted) return
    setRecord((current) => ({ ...current, quizAnswers: { ...current.quizAnswers, [questionId]: optionId } }))
  }

  function submitQuiz() {
    if (answered !== QUIZ_QUESTIONS.length) return
    setRecord((current) => ({ ...current, quizSubmitted: true, quizBest: Math.max(current.quizBest ?? 0, score) }))
  }

  function retryQuiz() {
    setRecord((current) => ({ ...current, quizAnswers: {}, quizSubmitted: false }))
  }

  return (
    <div className="quiz-workspace">
      <section className="quiz-lead">
        <div>
          <span className="section-kicker">Qualification card / Q-10</span>
          <h2>Desk Knowledge Check</h2>
          <p>Ten applied questions on contract math, order behavior, liquidity, chart tools, fundamentals, and options. Explanations appear after grading.</p>
        </div>
        <div className="quiz-best"><Trophy size={20} /><span>Best mark</span><strong>{record.quizBest ?? 0}/10</strong></div>
      </section>

      {submitted && (
        <section className={`quiz-result ${passed ? 'passed' : 'review'}`}>
          <div className="result-stamp"><span>{passed ? 'CLEARED' : 'REVIEW'}</span><strong>{score}/10</strong></div>
          <div><h3>{passed ? 'Desk qualification passed' : 'Review the marked answers'}</h3><p>{passed ? 'You cleared the 80% desk standard. Re-run the drills to keep the mechanics fresh.' : `You need ${PASSING_QUIZ_SCORE}/10 to clear the desk standard. Read each explanation, then retry.`}</p></div>
          <button type="button" onClick={retryQuiz}><RotateCcw size={16} />Retake quiz</button>
        </section>
      )}

      <div className="quiz-question-list">
        {QUIZ_QUESTIONS.map((question, index) => {
          const selected = answers[question.id]
          return (
            <article key={question.id} className="quiz-question">
              <div className="question-number"><span>Q</span><strong>{String(index + 1).padStart(2, '0')}</strong></div>
              <div className="question-body">
                <h3>{question.prompt}</h3>
                <div className="quiz-options">
                  {question.options.map((option) => {
                    const correct = submitted && option.id === question.correct
                    const wrong = submitted && selected === option.id && option.id !== question.correct
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`${selected === option.id ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`}
                        disabled={submitted}
                        aria-pressed={selected === option.id}
                        onClick={() => answerQuestion(question.id, option.id)}
                      >
                        <span>{option.id.toUpperCase()}</span>{option.label}{correct && <CheckCircle2 size={16} aria-label="Correct answer" />}
                      </button>
                    )
                  })}
                </div>
                {submitted && <div className="answer-explanation"><BookOpen size={16} aria-hidden="true" />{question.explanation}</div>}
              </div>
            </article>
          )
        })}
      </div>

      <div className="quiz-submit-bar">
        <div><span>Card status</span><strong>{answered}/{QUIZ_QUESTIONS.length} marked</strong></div>
        {!submitted ? <button type="button" disabled={answered !== QUIZ_QUESTIONS.length} onClick={submitQuiz}>Grade qualification card <ChevronRight size={17} /></button> : <button type="button" onClick={retryQuiz}><RotateCcw size={16} />Clear and retry</button>}
      </div>
    </div>
  )
}

export default function TrainingCenter({ record, setRecord, activeTab, setActiveTab, liveDrills, onPractice }) {
  const evidenceDrills = useMemo(
    () => GUIDED_DRILLS.filter((drill) => drill.evidence && liveDrills[drill.evidence]).map((drill) => drill.id),
    [liveDrills],
  )
  const completedLessons = record.completedLessons ?? []
  const completedDrills = unique([...(record.completedDrills ?? []), ...evidenceDrills])
  const quizPassed = (record.quizBest ?? 0) >= PASSING_QUIZ_SCORE
  const completedUnits = completedLessons.length + completedDrills.length + (quizPassed ? 1 : 0)
  const totalUnits = TRAINING_LESSONS.length + GUIDED_DRILLS.length + 1
  const progress = Math.round((completedUnits / totalUnits) * 100)

  useEffect(() => {
    if (!evidenceDrills.some((id) => !(record.completedDrills ?? []).includes(id))) return
    setRecord((current) => ({ ...current, completedDrills: unique([...(current.completedDrills ?? []), ...evidenceDrills]) }))
  }, [evidenceDrills, record.completedDrills, setRecord])

  function completeLesson(id) {
    setRecord((current) => ({ ...current, completedLessons: unique([...(current.completedLessons ?? []), id]) }))
  }

  function completeDrill(id) {
    setRecord((current) => ({ ...current, completedDrills: unique([...(current.completedDrills ?? []), id]) }))
  }

  return (
    <div className="training-workspace">
      <section className="view-title-band training-title-band">
        <div><span className="section-kicker">Training binder / Henry Hub 101</span><h2>Dispatch School</h2><p>Learn the product, rehearse the controls on the live simulator, then qualify on the desk knowledge check.</p></div>
        <div className="training-progress-card"><GraduationCap size={23} /><div><span>Binder progress</span><strong>{progress}%</strong><small>{completedUnits}/{totalUnits} stamps</small></div><div className="training-progress-track"><i style={{ width: `${progress}%` }} /></div></div>
      </section>

      <nav className="training-tabs" aria-label="Training sections">
        {TRAINING_TABS.map(({ id, label, icon: Icon }) => {
          const meta = id === 'lessons' ? `${completedLessons.length}/${TRAINING_LESSONS.length}` : id === 'tutorial' ? `${completedDrills.length}/${GUIDED_DRILLS.length}` : `${record.quizBest ?? 0}/10`
          return <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}><Icon size={18} /><span>{label}</span><strong>{meta}</strong></button>
        })}
      </nav>

      {activeTab === 'lessons' && <LessonCarousel record={record} setRecord={setRecord} onComplete={completeLesson} />}
      {activeTab === 'tutorial' && <GuidedTutorial completedDrills={completedDrills} liveDrills={liveDrills} onComplete={completeDrill} onPractice={onPractice} />}
      {activeTab === 'quiz' && <KnowledgeQuiz record={record} setRecord={setRecord} />}
    </div>
  )
}
