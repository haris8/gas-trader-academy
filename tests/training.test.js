import test from 'node:test'
import assert from 'node:assert/strict'
import {
  GUIDED_DRILLS,
  PASSING_QUIZ_SCORE,
  QUIZ_QUESTIONS,
  TRAINING_LESSONS,
  scoreQuiz,
} from '../src/trainingContent.js'

test('training content uses stable, unique identifiers', () => {
  const allIds = [
    ...TRAINING_LESSONS.map((lesson) => lesson.id),
    ...GUIDED_DRILLS.map((drill) => drill.id),
    ...QUIZ_QUESTIONS.map((question) => question.id),
  ]

  assert.equal(new Set(allIds).size, allIds.length)
  assert.equal(TRAINING_LESSONS.length, 6)
  assert.equal(GUIDED_DRILLS.length, 6)
})

test('every quiz question has one valid answer and an explanation', () => {
  for (const question of QUIZ_QUESTIONS) {
    assert.ok(question.options.length >= 3)
    assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length)
    assert.equal(question.options.filter((option) => option.id === question.correct).length, 1)
    assert.ok(question.explanation.length > 0)
  }
})

test('quiz scoring handles complete, wrong, and unanswered attempts', () => {
  const correctAnswers = Object.fromEntries(
    QUIZ_QUESTIONS.map((question) => [question.id, question.correct]),
  )
  const wrongAnswers = Object.fromEntries(
    QUIZ_QUESTIONS.map((question) => [question.id, question.options.find((option) => option.id !== question.correct).id]),
  )

  assert.equal(scoreQuiz(correctAnswers), QUIZ_QUESTIONS.length)
  assert.equal(scoreQuiz(wrongAnswers), 0)
  assert.equal(scoreQuiz({}), 0)
  assert.ok(PASSING_QUIZ_SCORE > QUIZ_QUESTIONS.length / 2)
  assert.ok(PASSING_QUIZ_SCORE <= QUIZ_QUESTIONS.length)
})
