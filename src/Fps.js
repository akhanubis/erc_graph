import React from 'react'

const Fps = ({ fps, alpha, running }) => {
  const label = `${ fps || 0 } FPS - ${ running ? `RUNNING (${ alpha.toFixed(2) })` : 'IDLE'}`
  return (
    <div className="fps-container no-select">{label}</div>
  )
}

export default React.memo(Fps)