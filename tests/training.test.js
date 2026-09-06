import test from 'node:test'
import assert from 'node:assert/strict'
import {
  GUIDED_DRILLS,
  PASSING_QUIZ_SCORE,
  QUIZ_QUESTIONS,
  TRAINING_LESSONS,
  scoreQuiz,
} from '../src/trainingContent.js'
import {
  balanceBias,
  contractPnl,
  optionOutcome,
  walkTrainingBook,
} from '../src/trainingVisuals.js'

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

test('interactive contract calculator handles long and short exposure', () => {
  assert.equal(contractPnl(37, 2, 'long'), 740)
  assert.equal(contractPnl(37, 2, 'short'), -740)
  assert.equal(contractPnl(-25, 1, 'short'), 250)
})

test('interactive depth board reports slippage and exhausted liquidity', () => {
  const bestLevel = walkTrainingBook(4)
  const multiLevel = walkTrainingBook(10)
  const oversized = walkTrainingBook(25)

  assert.equal(bestLevel.averagePrice, 3.111)
  assert.equal(bestLevel.slippageTicks, 0)
  assert.equal(multiLevel.filled, 10)
  assert.equal(multiLevel.remaining, 0)
  assert.equal(multiLevel.averagePrice, 3.1119)
  assert.equal(oversized.filled, 21)
  assert.equal(oversized.remaining, 4)
})

test('option and balance boards produce bounded beginner examples', () => {
  assert.equal(optionOutcome('call', 3.1).pnl, -1200)
  assert.ok(Math.abs(optionOutcome('call', 3.3).pnl - 800) < 1e-9)
  assert.ok(Math.abs(optionOutcome('put', 2.9).pnl - 800) < 1e-9)
  assert.equal(balanceBias([{ active: true, impact: 2 }, { active: true, impact: -2 }]).label, 'Mixed balance')
  assert.equal(balanceBias([{ active: true, impact: 2 }, { active: true, impact: 2 }]).label, 'Bullish pressure')
})
