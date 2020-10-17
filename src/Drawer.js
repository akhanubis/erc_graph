class Drawer {
  static LINK_COLOR = '#AAAAAA'

  current_ctx
  drawing_scale
  
  constructor(ctx, link_hover_color) {
    this.ctx = ctx
    this.link_hover_color = link_hover_color
  }

  clear_canvas = _ => {
    this.save_and_restore(_ => {
      this.ctx.resetTransform()
      /* fix for bug when resizing main canvas*/
      this.ctx.fillStyle = '#FFFFFF'
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    })
  }

  draw = (drawing_scale, nodes, links, draw_icons = true) => {
    this.start_draw(drawing_scale)
    this.clear_canvas()
    for (const n of nodes) this.draw_node(n)
    for (const l of links) this.draw_link(l, false, false, draw_icons)
  }

  start_draw = drawing_scale => this.drawing_scale = drawing_scale

  save_and_restore = callback => {
    this.ctx.save()
    callback()
    this.ctx.restore()
  }

  node_sprites = _ => ({})

  node_color = _ => {}
}

export default Drawer