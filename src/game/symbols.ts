import {
  Anchor, Apple, Atom, Axe, Banana, Battery, Beer, Bell, Bike, Bird, Bomb, Bone, Bot, Brain, Bug,
  Cake, Camera, Candy, Car, Carrot, Castle, Cat, Cherry, Cloud, Clover, Club, Coffee, Compass, Cookie,
  Cpu, Crown, Diamond, Dice5, Dna, Dog, Drama, Droplet, Drum, Egg, Eye, Feather, Fish, Flag, Flame,
  FlaskConical, Flower, Footprints, Gamepad2, Gem, Ghost, Gift, Glasses, Grape, Guitar, Hammer, Hand,
  Headphones, Heart, Hexagon, Hourglass, IceCreamCone, Joystick, Key, Leaf, Lightbulb, Lock, Magnet,
  Medal, Microscope, Moon, Mountain, Music, Orbit, Palette, PawPrint, Piano, Pickaxe, Pizza, Plane,
  Puzzle, Rabbit, Radio, Rainbow, Rocket, Satellite, Scissors, Shell, Shield, Ship, Shrimp, Skull,
  Snail, Snowflake, Spade, Squirrel, Star, Sun, Sword, Target, Telescope, Tent, Tornado, TrainFront,
  TreePine, Triangle, Trophy, Turtle, Umbrella, Wand, Watch, Wine, Wrench, Zap,
  type LucideIcon,
} from 'lucide-react'

const ICONS: [string, LucideIcon][] = Object.entries({
  Anchor, Apple, Atom, Axe, Banana, Battery, Beer, Bell, Bike, Bird, Bomb, Bone, Bot, Brain, Bug,
  Cake, Camera, Candy, Car, Carrot, Castle, Cat, Cherry, Cloud, Clover, Club, Coffee, Compass, Cookie,
  Cpu, Crown, Diamond, Dice5, Dna, Dog, Drama, Droplet, Drum, Egg, Eye, Feather, Fish, Flag, Flame,
  FlaskConical, Flower, Footprints, Gamepad2, Gem, Ghost, Gift, Glasses, Grape, Guitar, Hammer, Hand,
  Headphones, Heart, Hexagon, Hourglass, IceCreamCone, Joystick, Key, Leaf, Lightbulb, Lock, Magnet,
  Medal, Microscope, Moon, Mountain, Music, Orbit, Palette, PawPrint, Piano, Pickaxe, Pizza, Plane,
  Puzzle, Rabbit, Radio, Rainbow, Rocket, Satellite, Scissors, Shell, Shield, Ship, Shrimp, Skull,
  Snail, Snowflake, Spade, Squirrel, Star, Sun, Sword, Target, Telescope, Tent, Tornado, TrainFront,
  TreePine, Triangle, Trophy, Turtle, Umbrella, Wand, Watch, Wine, Wrench, Zap,
})

const COLORS: [string, string][] = [
  ['cyan', '#22d3ee'],
  ['magenta', '#e879f9'],
  ['lime', '#a3e635'],
  ['amber', '#fbbf24'],
  ['rose', '#fb7185'],
  ['violet', '#a78bfa'],
  ['emerald', '#34d399'],
  ['orange', '#fb923c'],
]

export interface SymbolDef {
  key: string
  name: string
  color: string
  Icon: LucideIcon
}

export interface CardData {
  id: number
  /** Null for the locked center tile on odd-sized boards. */
  symbol: SymbolDef | null
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Picks `count` unique symbols. Every icon is used once before any icon repeats
 * in a second color, so small boards never contain look-alike cards.
 */
function pickSymbols(count: number): SymbolDef[] {
  const maxUnique = ICONS.length * 2
  if (count > maxUnique) throw new Error(`Need ${count} symbols, only ${maxUnique} available`)

  const order = shuffle(ICONS.map((_, i) => i))
  const firstColor = order.map(() => Math.floor(Math.random() * COLORS.length))
  const result: SymbolDef[] = []
  for (let n = 0; n < count; n++) {
    const slot = n % order.length
    const layer = Math.floor(n / order.length)
    const [name, Icon] = ICONS[order[slot]]
    const [colorName, color] = COLORS[(firstColor[slot] + layer * (COLORS.length / 2)) % COLORS.length]
    result.push({ key: `${name}-${colorName}`, name: `${colorName} ${name}`, color, Icon })
  }
  return result
}

export function buildDeck(size: number): CardData[] {
  const total = size * size
  const symbols = pickSymbols(Math.floor(total / 2))
  const cards: (SymbolDef | null)[] = shuffle([...symbols, ...symbols])
  // Odd boards (5x5) get a locked tile in the exact center.
  if (total % 2 === 1) cards.splice(Math.floor(total / 2), 0, null)
  return cards.map((symbol, id) => ({ id, symbol }))
}
