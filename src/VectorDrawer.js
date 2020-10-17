import CanvasTxt from 'canvas-txt'
import Drawer from './Drawer'
import DataUtils from './data_utils'

// const LABEL_MIN_DISTANCE = 100

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
          to = DataUtils.point_at_edge(l.target, l.target.radius, dx, dy, l.target.x < l.source.x, this.drawing_scale),
          source_label = DataUtils.point_at_edge(l.source, l.source.radius + 5, dx, dy, l.source.x < l.target.x, this.drawing_scale),
          target_label = DataUtils.point_at_edge(l.target, l.target.radius + 5, dx, dy, l.target.x < l.source.x, this.drawing_scale)
      this.draw_line(from, to)
      this.draw_label(source_label, l.source_label)
      this.draw_label(target_label, l.target_label)
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

  draw_label = (at, text) => {
    const box_x = 100 * this.drawing_scale
    const box_y = 100 * this.drawing_scale
    CanvasTxt.fontSize = 10 * this.drawing_scale
    CanvasTxt.drawText(this.ctx, text, at.x - 0.5 * box_x, at.y - 0.5 * box_y, box_x, box_y)
  }
}

export default VectorDrawer