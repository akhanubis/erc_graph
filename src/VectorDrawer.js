import Drawer from './Drawer'
import DataUtils from './data_utils'

class VectorDrawer extends Drawer {
  node_color = n => {
    if (n.type === 'erc20')
      return '#6FC6E8'
    if (n.type === 'sender')
      return 'red'
    if (n.type === 'receiver')
      return 'blue'
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
    const arrow_head_length = 4 + 3 * l.width
    if (l.loop)
      this.draw_loop(l.source, arrow_head_length * this.drawing_scale)
    else {
      let dx = l.target.x - l.source.x,
          dy = l.target.y - l.source.y,
          from = DataUtils.point_at_edge(l.source, l.source.radius, dx, dy, l.source.x < l.target.x, this.drawing_scale),
          to_line = DataUtils.point_at_edge(l.target, l.target.radius + arrow_head_length - 2, dx, dy, l.target.x < l.source.x, this.drawing_scale),
          to_arrow = DataUtils.point_at_edge(l.target, l.target.radius, dx, dy, l.target.x < l.source.x, this.drawing_scale)
      this.draw_line(from, to_line)
      this.draw_arrow_head(from, to_arrow, arrow_head_length * this.drawing_scale)
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

  draw_loop = (center, arrow_head_length) => {
    this.ctx.beginPath()
    let { start, end, control_point_1, control_point_2 } = DataUtils.self_link_curve(center, this.drawing_scale)
    this.ctx.moveTo(start.x, start.y)
    this.ctx.bezierCurveTo(control_point_1.x, control_point_1.y, control_point_2.x, control_point_2.y, end.x, end.y)
    this.ctx.stroke()
    this.draw_arrow_head(control_point_2, end, arrow_head_length)
  }

  draw_arrow_head = (start, end, head_length) => {
    this.ctx.beginPath()
    const angle = Math.atan2(end.y - start.y, end.x - start.x)
    this.ctx.moveTo(end.x, end.y)
    this.ctx.lineTo(end.x - head_length * Math.cos(angle + Math.PI / 7), end.y - head_length * Math.sin(angle + Math.PI / 7))
    this.ctx.lineTo(end.x - head_length * Math.cos(angle - Math.PI / 7), end.y - head_length * Math.sin(angle - Math.PI / 7))
    this.ctx.lineTo(end.x, end.y)
    this.ctx.fill()
  }
}

export default VectorDrawer