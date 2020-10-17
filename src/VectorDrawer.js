import Drawer from './Drawer'
import DataUtils from './data_utils'

function importAll(r) {
  const images = {}
  for (let item of r.keys())
    images[item.replace('./', '').split('.')[0].toLowerCase()] = r(item)
  return images
}
const TOKEN_ICONS = importAll(require.context('./assets/tokens', false, /\.(png|jpe?g|svg)$/))
const TOKEN_IMAGES = {}
for (const symbol in TOKEN_ICONS) {
  TOKEN_IMAGES[symbol] = new Image()
  TOKEN_IMAGES[symbol].src = TOKEN_ICONS[symbol]
}

const ICON_DIAMETER = 32

class VectorDrawer extends Drawer {
  node_color = n => {
    return '#CCCCCC'
  }

  draw_node = (n, hovered = false, clicked = false) => {
    this.ctx.beginPath()
    this.ctx.lineWidth = (hovered || clicked ? 3 : 1) * this.drawing_scale
    this.ctx.strokeStyle = n.outline_color
    this.ctx.fillStyle = n.color
    this.draw_circle(n)
    this.ctx.fill()
    this.ctx.stroke()
  }

  draw_link = (l, hovered = false, clicked = false) => {
    this.ctx.lineWidth = l.width * this.drawing_scale
    const c = hovered || clicked ? this.link_hover_color : Drawer.LINK_COLOR
    this.ctx.strokeStyle = c
    this.ctx.fillStyle = c
    if (l.loop)
      this.draw_loop(l.source)
    else {
      let dx = l.target.x - l.source.x,
          dy = l.target.y - l.source.y,
          from = DataUtils.point_at_edge(l.source, l.source.radius, dx, dy, l.source.x < l.target.x, this.drawing_scale),
          to = DataUtils.point_at_edge(l.target, l.target.radius, dx, dy, l.target.x < l.source.x, this.drawing_scale)
      this.draw_line(from, to)
      this.draw_icons(from, to, l.icons)
    }
  }

  draw_circle = center => {
    this.ctx.moveTo(center.x + center.radius * this.drawing_scale, center.y)
    this.ctx.arc(center.x, center.y, center.radius * this.drawing_scale, 0, 2 * Math.PI)
  }

  draw_line = (start, end) => {
    this.ctx.beginPath()
    this.ctx.moveTo(start.x, start.y)
    this.ctx.lineTo(end.x, end.y)
    this.ctx.stroke()
  }

  draw_loop = center => {
    this.ctx.beginPath()
    let { start, end, control_point_1, control_point_2 } = DataUtils.self_link_curve(center, this.drawing_scale)
    this.ctx.moveTo(start.x, start.y)
    this.ctx.bezierCurveTo(control_point_1.x, control_point_1.y, control_point_2.x, control_point_2.y, end.x, end.y)
    this.ctx.stroke()
  }

  draw_icons = (from, to, icons) => {
    const diameter = ICON_DIAMETER * this.drawing_scale

    const link_length = DataUtils.segment_length(from, to)
    const initial_offset = 0.5 * diameter + Math.max(0, 0.5 * (link_length - diameter * icons.length))
    const per_icon_offset = icons.length > 1 && icons.length * diameter > link_length ? (link_length - diameter) / (icons.length - 1) : diameter

    const angle = Math.atan((to.y - from.y) / (to.x - from.x))

    const from_left_to = to.x > from.x ? 1 : -1
    const initial_offset_2d = {
      x: Math.cos(angle) * initial_offset * from_left_to,
      y: Math.sin(angle) * initial_offset * from_left_to
    }
    const per_icon_offset_2d = {
      x: Math.cos(angle) * per_icon_offset * from_left_to,
      y: Math.sin(angle) * per_icon_offset * from_left_to
    }

    icons.forEach((icon, i) => {
      this.ctx.drawImage(
        TOKEN_IMAGES[icon] || TOKEN_IMAGES.thinking,
        from.x - 0.5 * diameter + initial_offset_2d.x + per_icon_offset_2d.x * i,
        from.y - 0.5 * diameter + initial_offset_2d.y + per_icon_offset_2d.y * i,
        diameter,
        diameter
      )
    })
  }
}

export default VectorDrawer