import React from 'react'

const Label = ({ total }) => {
  if (total)
    return `Processing ${ total } transactions`
  return 'Fetching logs'
}

const LoadingPanel = ({ loading, progress, total }) => {
  if (!loading)
    return null

  const percentage = 100 * progress / total

  return (
    <div key="1" className="loading-background">
      <div className="loading-bar-container">
        <div className="loading-bar-label">
          <Label total={total}/>
        </div>
        {total && <div className="loading-bar-bar">
          <div className="loading-bar-bar-inner" style={{ width: `${ percentage }%`}}>
            <div className="loading-bar-bar-inner-label" style={{ opacity: percentage / 20 }}>{Math.round(percentage)}%</div>
          </div>
        </div>}
        <div className="loading-bar-hint">
          use mouse wheel to zoom and pan (hold and move)
        </div>
      </div>
    </div>
  )
}

export default React.memo(LoadingPanel)