import TOKEN_ICONS from './token_icons_list'
import ThinkingIcon from './assets/thinking.png'

const TOKEN_IMAGES = {}
for (const address in TOKEN_ICONS) {
  TOKEN_IMAGES[address] = new Image()
  TOKEN_IMAGES[address].src = TOKEN_ICONS[address]
}
TOKEN_IMAGES.thinking = new Image()
TOKEN_IMAGES.thinking.src = ThinkingIcon

export default TOKEN_IMAGES