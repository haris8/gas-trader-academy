import test from 'node:test'
import assert from 'node:assert/strict'
import { LESSON_STEPS, lessonReady, normalizeLessonProgress } from '../src/lessonCourse.js'
import { reduceOnlyExample, replayOrder } from '../src/courseModels.js'
import { TRAINING_LESSONS } from '../src/trainingContent.js'

test('all course pages have stable identities, beginner content, practice, and valid checks', () => {
  assert.deepEqual(Object.keys(LESSON_STEPS), TRAINING_LESSONS.map((lesson) => lesson.id))
  assert.equal(Object.values(LESSON_STEPS).flat().length, 39)
  for (const pages of Object.values(LESSON_STEPS)) {
    assert.equal(new Set(pages.map((page) => page.id)).size, pages.length)
    assert.ok(pages.some((page) => page.check))
    for (const page of pages) {
      for (const field of ['id', 'title', 'visual', 'example', 'task', 'app']) assert.ok(page[field].length > 0)
      assert.equal(page.paragraphs.length, 2)
      assert.ok(page.terms.length > 0)
      if (page.check) {
        assert.ok(page.check.options[page.check.correct])
        assert.ok(page.check.explanation.length > 0)
      }
    }
  }
})

test('old or invalid saved progress can resume without phantom completed pages', () => {
  const empty = normalizeLessonProgress(undefined)
  assert.equal(empty.contract.current, 'agreement')
  assert.deepEqual(empty.contract.seen, [])
  const saved = normalizeLessonProgress({ contract: { current: 'removed-page', seen: ['agreement', 'agreement', 'removed-page'], answers: { risk: 900 } } })
  assert.deepEqual(saved.contract, { current: 'agreement', seen: ['agreement'], answers: {} })
  assert.equal(lessonReady('contract', saved.contract), false)
})

test('completion requires every page and a correct understanding check', () => {
  for (const [id, pages] of Object.entries(LESSON_STEPS)) {
    const progress = { seen: pages.map((page) => page.id), answers: {} }
    assert.equal(lessonReady(id, progress), false)
    for (const page of pages.filter((item) => item.check)) progress.answers[page.id] = page.check.correct
    assert.equal(lessonReady(id, progress), true)
    progress.seen.pop()
    assert.equal(lessonReady(id, progress), false)
  }
})

test('a market order fills before later quotes and a limit waits for an eligible ask', () => {
  assert.equal(replayOrder('market', 0).fillPrice, 3.111)
  assert.equal(replayOrder('market', 3).fillPrice, 3.111)
  assert.equal(replayOrder('limit', 1).fillPrice, null)
  assert.equal(replayOrder('limit', 2).fillPrice, 3.099)
})

test('a gap fills the stop-market but leaves the stop-limit exposed until recovery', () => {
  assert.equal(replayOrder('stop', 1).triggered, false)
  assert.equal(replayOrder('stop', 2).fillPrice, 3.05)
  const gap = replayOrder('stop-limit', 2)
  assert.equal(gap.triggered, true)
  assert.equal(gap.fillPrice, null)
  assert.equal(replayOrder('stop-limit', 3).fillPrice, 3.061)
})

test('reduce-only caps the educational exit at the existing position', () => {
  assert.deepEqual(reduceOnlyExample(3, true), { executed: 1, position: 0 })
  assert.deepEqual(reduceOnlyExample(3, false), { executed: 3, position: -2 })
})
