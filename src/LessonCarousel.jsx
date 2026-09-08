import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ExternalLink, MapPin } from 'lucide-react'
import { TRAINING_LESSONS } from './trainingContent.js'
import { COURSE_SOURCES, LESSON_STEPS, lessonReady, normalizeLessonProgress } from './lessonCourse.js'
import CourseVisual from './CourseVisual.jsx'
import './LessonCarousel.css'

export default function LessonCarousel({ record, setRecord, onComplete }) {
  const lesson = TRAINING_LESSONS.find((item) => item.id === record.activeLesson) ?? TRAINING_LESSONS[0]
  const lessonIndex = TRAINING_LESSONS.indexOf(lesson)
  const steps = LESSON_STEPS[lesson.id]
  const allProgress = normalizeLessonProgress(record.lessonProgress)
  const progress = allProgress[lesson.id]
  const index = Math.max(0, steps.findIndex((item) => item.id === progress.current))
  const step = steps[index]
  const heading = useRef(null)
  const complete = record.completedLessons.includes(lesson.id)
  const ready = lessonReady(lesson.id, progress)
  const answer = progress.answers[step.id]
  const hasAnswer = Number.isInteger(answer)

  useEffect(() => {
    setRecord((current) => {
      const normalized = normalizeLessonProgress(current.lessonProgress)
      if (normalized[lesson.id].seen.includes(step.id)) return current
      normalized[lesson.id].seen.push(step.id)
      return { ...current, lessonProgress: normalized }
    })
  }, [lesson.id, step.id, setRecord])

  function focusStep() {
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true })
      heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
  }

  function selectLesson(id) {
    setRecord((current) => ({ ...current, activeLesson: id }))
    focusStep()
  }

  function goTo(nextIndex) {
    if (nextIndex < 0 || nextIndex >= steps.length) return
    setRecord((current) => {
      const normalized = normalizeLessonProgress(current.lessonProgress)
      normalized[lesson.id].current = steps[nextIndex].id
      return { ...current, lessonProgress: normalized }
    })
    focusStep()
  }

  function selectAnswer(value) {
    setRecord((current) => {
      const normalized = normalizeLessonProgress(current.lessonProgress)
      normalized[lesson.id].answers[step.id] = value
      return { ...current, lessonProgress: normalized }
    })
  }

  return (
    <div className="lesson-layout course-layout">
      <aside className="lesson-index course-index" aria-label="Training lessons">
        <div className="lesson-index-head"><span className="section-kicker">Start here / no experience needed</span><h3>Course Index</h3></div>
        <div className="lesson-index-list">
          {TRAINING_LESSONS.map((item) => (
            <button key={item.id} type="button" className={item.id === lesson.id ? 'active' : ''} aria-current={item.id === lesson.id ? 'true' : undefined} onClick={() => selectLesson(item.id)}>
              <span className="lesson-number">{item.number}</span>
              <span className="course-index-copy"><strong>{item.title}</strong><small>{allProgress[item.id].seen.length}/{LESSON_STEPS[item.id].length} steps visited</small></span>
              {record.completedLessons.includes(item.id) && <CheckCircle2 size={17} aria-label="Lesson completed" />}
            </button>
          ))}
        </div>
        <p className="course-saved-note"><BookOpen size={15} />Your place and answers are saved on this device.</p>
      </aside>

      <div className="course-main">
        <label className="course-mobile-picker">Lesson<select aria-label="Choose lesson" value={lesson.id} onChange={(event) => selectLesson(event.target.value)}>{TRAINING_LESSONS.map((item) => <option key={item.id} value={item.id}>{item.number} / {item.title}</option>)}</select></label>
        <article className="lesson-sheet course-sheet" aria-roledescription="carousel" aria-label={`${lesson.title} lessons`}>
          <header className="course-header">
            <div className="lesson-sheet-code"><span>LESSON</span><strong>{lesson.number}</strong></div>
            <div><span className="section-kicker">Guided walkthrough</span><h2>{lesson.title}</h2><p>{steps.length} short steps, worked examples, and practice</p></div>
          </header>

          <nav className="course-step-nav" aria-label="Lesson steps" onKeyDown={(event) => {
            if (event.target.tagName !== 'BUTTON') return
            if (event.key === 'ArrowRight') { event.preventDefault(); goTo(index + 1) }
            if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(index - 1) }
          }}>
            <span>Step {index + 1} of {steps.length}</span>
            <div>{steps.map((item, i) => <button key={item.id} type="button" title={item.title} aria-label={`Step ${i + 1}: ${item.title}`} aria-current={i === index ? 'step' : undefined} className={`${i === index ? 'active' : ''} ${progress.seen.includes(item.id) ? 'visited' : ''}`} onClick={() => goTo(i)}>{i + 1}</button>)}</div>
          </nav>

          <section key={step.id} className="course-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${steps.length}: ${step.title}`}>
            <h3 className="course-slide-title" ref={heading} tabIndex={-1}>{step.title}</h3>
            <div className="course-explanation">{step.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            <dl className="course-terms" aria-label="Words to know">{step.terms.map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl>
            <div className="course-example"><span>Worked example</span><p>{step.example}</p></div>
            <div className="course-practice-prompt"><span>Try it</span><p>{step.task}</p></div>
            <CourseVisual key={step.id} kind={step.visual} />
            <div className="course-app-note"><MapPin size={18} aria-hidden="true" /><div><strong>On your trading desk</strong><p>{step.app}</p></div></div>
            {step.check && (
              <fieldset className="course-check">
                <legend>Check your understanding</legend>
                <p>{step.check.question}</p>
                <div className="course-check-options">{step.check.options.map((option, i) => <label key={option} className={answer === i ? 'selected' : ''}><input type="radio" name={`${lesson.id}-${step.id}`} value={i} checked={answer === i} onChange={() => selectAnswer(i)} /><span>{option}</span></label>)}</div>
                {hasAnswer && <div role="status" className={`course-check-feedback ${answer === step.check.correct ? 'correct' : 'retry'}`}><strong>{answer === step.check.correct ? 'That is right.' : 'Try again.'}</strong> {step.check.explanation}</div>}
              </fieldset>
            )}
          </section>

          <footer className="course-navigation">
            <button type="button" className="course-arrow" aria-label="Previous step" title="Previous step" disabled={index === 0} onClick={() => goTo(index - 1)}><ArrowLeft size={20} /></button>
            <div className="course-next-label"><small>{index < steps.length - 1 ? 'Up next' : 'Walkthrough reached'}</small><strong>{index < steps.length - 1 ? steps[index + 1].title : `${progress.seen.length}/${steps.length} steps visited`}</strong></div>
            {index < steps.length - 1 ? <button type="button" className="course-next" onClick={() => goTo(index + 1)}>Next step<ArrowRight size={18} /></button> : <button type="button" className="course-next" disabled={complete || !ready} onClick={() => onComplete(lesson.id)}>{complete ? <CheckCircle2 size={18} /> : <Check size={18} />}{complete ? 'Lesson complete' : 'Complete lesson'}</button>}
          </footer>
          {index === steps.length - 1 && <div className="course-finish">
            {!ready && !complete && <><p>Visit each step and answer this lesson's understanding check correctly to complete it.</p>{steps.map((item, i) => (!progress.seen.includes(item.id) || (item.check && progress.answers[item.id] !== item.check.correct)) && <button key={item.id} type="button" onClick={() => goTo(i)}>Review step {i + 1}: {item.title}<ArrowRight size={16} /></button>)}</>}
            {lessonIndex < TRAINING_LESSONS.length - 1 && <button type="button" onClick={() => selectLesson(TRAINING_LESSONS[lessonIndex + 1].id)}>Continue to {TRAINING_LESSONS[lessonIndex + 1].title}<ArrowRight size={16} /></button>}
          </div>}
        </article>
        <details className="course-sources"><summary>Further reading from CME and EIA</summary>{COURSE_SOURCES.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={13} /></a>)}</details>
      </div>
    </div>
  )
}
