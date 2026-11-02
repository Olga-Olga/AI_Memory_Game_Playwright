import { expect, type Page } from '@playwright/test'

export const cards = (page: Page) => page.locator('[data-testid^="card-"]')

export async function startGame(page: Page, size: 5 | 10 | 20) {
  await page.goto('/')
  await page.getByTestId(`difficulty-${size}`).click()
  await page.getByTestId('start-button').click()
  await expect(page.getByTestId('board')).toHaveAttribute('data-size', String(size))
}

/** Flips a card and returns its symbol (only exposed while the card is face up). */
export async function flip(page: Page, id: number): Promise<string> {
  const card = page.getByTestId(`card-${id}`)
  await card.click()
  await expect(card).not.toHaveAttribute('data-state', 'hidden')
  return (await card.getAttribute('data-symbol'))!
}

/**
 * Plays like a player with perfect memory: every revealed symbol is remembered,
 * and a pair is flipped as soon as both halves are known.
 * Stops after `maxPairs` matches (all pairs by default).
 */
export async function solve(page: Page, maxPairs = Infinity) {
  const ids = await cards(page).evaluateAll((els) => els.map((el) => Number(el.getAttribute('data-testid')!.slice(5))))
  const seen = new Map<number, string>()
  const solved = new Set<number>()
  let pairs = 0

  const knownPair = () => {
    const bySymbol = new Map<string, number[]>()
    for (const [id, symbol] of seen) {
      if (!solved.has(id)) bySymbol.set(symbol, [...(bySymbol.get(symbol) ?? []), id])
    }
    return [...bySymbol.values()].find((group) => group.length === 2)
  }

  while (solved.size < ids.length && pairs < maxPairs) {
    let pair = knownPair()
    if (!pair) {
      const a = ids.find((id) => !seen.has(id))!
      seen.set(a, await flip(page, a))
      const partner = [...seen].find(([id, s]) => id !== a && s === seen.get(a) && !solved.has(id))
      pair = [a, partner ? partner[0] : ids.find((id) => !seen.has(id))!]
      seen.set(pair[1], await flip(page, pair[1]))
    } else {
      await flip(page, pair[0])
      await flip(page, pair[1])
    }
    if (seen.get(pair[0]) === seen.get(pair[1])) {
      solved.add(pair[0]).add(pair[1])
      pairs++
    }
  }
}
