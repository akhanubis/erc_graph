import React from 'react'

const Fps = ({ fps }) => {
  const label = `${ fps || 0 } FPS`
  return (
    <div className="fps-container no-select">{label}</div>
  )
}

export default React.memo(Fps)