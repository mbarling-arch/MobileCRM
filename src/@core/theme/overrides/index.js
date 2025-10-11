// Import all component overrides
import card from './card'
import button from './button'
import paper from './paper'
import input from './input'

const overrides = (skin) => {
  return {
    ...card(skin),
    ...button,
    ...paper,
    ...input
  }
}

export default overrides


