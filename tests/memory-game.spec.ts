import { expect, test } from '@playwright/test'
import { cards, flip, solve, startGame } from './helpers'

test.describe('Neon Recall — memory game', () => {
  // Start muted: creating an AudioContext in a headless browser blocks the page for seconds.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('neon-recall:muted', '1'))
  })

  test('1. Menu offers 5x5, 10x10 and 20x20 boards with the right card counts', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('radio')).toHaveCount(3)
    await expect(page.getByTestId('difficulty-5')).toHaveAttribute('aria-checked', 'true')

    for (const [size, cardCount, coreTiles] of [
      [5, 24, 1], // odd board: 24 cards + locked center tile
      [10, 100, 0],
      [20, 400, 0],
    ] as const) {
      await startGame(page, size)
      await expect(cards(page)).toHaveCount(cardCount)
      await expect(page.getByTestId('core-tile')).toHaveCount(coreTiles)
      await expect(page.getByTestId('stat-pairs')).toHaveText(`0/${cardCount / 2}`)
      await page.getByTestId('exit-button').click()
      await expect(page.getByTestId('start-button')).toBeVisible()
    }
  })

  test('2. Two different cards count as one move and flip back face down', async ({ page }) => {
    await startGame(page, 5)
    await expect(page.getByTestId('stat-time')).toHaveText('00:00')

    // Flip neighbouring cards in pairs until we hit two different symbols (a lucky match just moves on).
    let a = 0
    let moves = 0
    while (true) {
      const symbolA = await flip(page, a)
      const symbolB = await flip(page, a + 1)
      moves++
      await expect(page.getByTestId('stat-moves')).toHaveText(String(moves))
      if (symbolA !== symbolB) break
      a += 2
    }

    await expect(page.getByTestId(`card-${a}`)).toHaveAttribute('data-state', 'hidden')
    await expect(page.getByTestId(`card-${a + 1}`)).toHaveAttribute('data-state', 'hidden')
    // The clock starts on the first flip.
    await expect(page.getByTestId('stat-time')).not.toHaveText('00:00', { timeout: 3000 })
  })

  test('3. A matching pair stays open and awards points', async ({ page }) => {
    await startGame(page, 5)
    await solve(page, 1)

    await expect(page.locator('[data-state="matched"]')).toHaveCount(2)
    await expect(page.getByTestId('stat-pairs')).toHaveText('1/12')
    await expect(page.getByTestId('stat-score')).toHaveText('100')
    await expect(page.locator('[data-state="matched"]').first()).toBeDisabled()
  })

  test('4. Pause hides the board and freezes the timer', async ({ page }) => {
    await startGame(page, 10)
    await flip(page, 0)
    await expect(page.getByTestId('stat-time')).toHaveText('00:01', { timeout: 3000 })

    await page.getByTestId('pause-button').click()
    await expect(page.getByTestId('pause-overlay')).toBeVisible()
    const frozen = await page.getByTestId('stat-time').textContent()
    await page.waitForTimeout(2000)
    await expect(page.getByTestId('stat-time')).toHaveText(frozen!)

    // Escape resumes the game as well.
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('pause-overlay')).toBeHidden()
    await expect(page.getByTestId('stat-time')).not.toHaveText(frozen!, { timeout: 3000 })
  })

  test('5. Clearing a 5x5 board shows victory, saves the best score and allows a replay', async ({ page }) => {
    await startGame(page, 5)
    await solve(page)

    const modal = page.getByTestId('result-modal')
    await expect(modal).toBeVisible()
    await expect(modal.getByText('VICTORY')).toBeVisible()
    await expect(page.getByTestId('new-best')).toBeVisible()
    const finalScore = await page.getByTestId('final-score').textContent()
    expect(Number(finalScore!.replace(/\D/g, ''))).toBeGreaterThanOrEqual(1200) // 12 pairs × 100 + combo/time bonuses

    // Play again resets the board.
    await page.getByTestId('play-again-button').click()
    await expect(modal).toBeHidden()
    await expect(page.getByTestId('stat-pairs')).toHaveText('0/12')
    await expect(page.getByTestId('stat-moves')).toHaveText('0')

    // The record shows up in the menu.
    await page.getByTestId('exit-button').click()
    await expect(page.getByTestId('best-5')).toContainText(finalScore!)
  })
})
