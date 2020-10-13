const DataUtils = (() => {
  const point_at_edge = (center, radius, distance_x, distance_y, source_left_from_target, drawing_scale) => {
    const atan = Math.atan(distance_y / distance_x),
          offset_x = Math.cos(atan) * radius * drawing_scale,
          offset_y = Math.sin(atan) * radius * drawing_scale
    return {
      x: center.x + offset_x * (source_left_from_target ? 1 : -1),
      y: center.y + offset_y * (source_left_from_target ? 1 : -1)
    }
  }

  /* if target == source => 45 degrees for self link */
  const self_link_curve = (center, drawing_scale) => {
    const source = point_at_edge(center, center.radius, 1, 1, false, drawing_scale),
          target_x = source.x + 2 * (center.x - source.x) /* destination mirrored in x axis */
    return {
      start: source,
      control_point_1: {
        x: source.x - 10 * drawing_scale,
        y: source.y - 30 * drawing_scale
      },
      control_point_2: {
        x: target_x + 10 * drawing_scale,
        y: source.y - 30 * drawing_scale
      },
      end: {
        x: target_x,
        y: source.y
      }
    }
  }

  /* unused */
  const link_curve = (d, drawing_scale) => {
    if (d.target == d.source)
      return self_link_curve(d)

    const dx = (d.target.x - d.source.x),
          dy = (d.target.y - d.source.y),
          dr = Math.sqrt(dx * dx + dy * dy)
    const source = point_at_edge(d.source, d.source.radius, dx, dy, d.source.x < d.target.x, drawing_scale),
          target = point_at_edge(d.target, d.target.radius, dx, dy, d.target.x < d.source.x, drawing_scale)
    return `M${ source.x } ${ source.y } A ${ dr } ${ dr } 0 0,1 ${ target.x } ${ target.y }`
  }

  const point_circle_collision = (point, circle, drawing_scale) => {
    const dx = point.x - circle.x,
          dy = point.y - circle.y,
          scaled_radius = circle.radius * drawing_scale
    /* early out, check point vs circle bounding box */
    if (Math.abs(dx) > scaled_radius || Math.abs(dy) > scaled_radius)
      return false
    return dx * dx + dy * dy <= scaled_radius * scaled_radius
  }

  /* "good enough" approximation by bounding box*/
  const point_bezier_collision = (point, circle, drawing_scale) => {
    const bb_min_x = circle.x - circle.radius * drawing_scale,
          bb_min_y = circle.y - (circle.radius + 25) * drawing_scale,
          bb_max_x = circle.x + circle.radius * drawing_scale,
          bb_max_y = circle.y - (circle.radius - 2) * drawing_scale
    return !(point.x < bb_min_x || point.x > bb_max_x || point.y < bb_min_y || point.y > bb_max_y)
  }

  const point_segment_collision = (point, start, end, tolerance, drawing_scale) => {
    /* early out, check point vs segment bounding box */
    if ((point.x < start.x && point.x < end.x) || (point.x > start.x && point.x > end.x) || (point.y < start.y && point.y < end.y) || (point.y > start.y && point.y > end.y))
      return false

    /* build a parametric ray from segment as in 0 = mx - y + b */
    const m = (start.y - end.y) / (start.x - end.x),
          b = start.y - m * start.x
    /* tolerance = mx + b - y where tolerance is the max distance allowed from the point to the ray */
    return Math.abs(m * point.x + b - point.y) / Math.sqrt(m * m + 1) < tolerance * drawing_scale
  }

  const point_link_collision = (point, link, drawing_scale) => link.loop ? point_bezier_collision(point, link.source, drawing_scale) : point_segment_collision(point, link.source, link.target, 5, drawing_scale)

  return {
    point_at_edge: point_at_edge,
    self_link_curve: self_link_curve,
    link_curve: link_curve,
    point_circle_collision: point_circle_collision,
    point_segment_collision: point_segment_collision,
    point_bezier_collision: point_bezier_collision,
    point_link_collision: point_link_collision
  }
})()

export default DataUtils