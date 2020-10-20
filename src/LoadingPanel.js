import React from 'react'

const LoadingPanel = ({ loading }) => {
  if (!loading)
    return null
  return (
    <div key="1" className="loading-background">
      <div className="loading-bar-container">
        <div className="loading-bar-label">
          Processing logs...
        </div>
        <div className="loading-bar-hint">
          <a href="https://www.linkedin.com/in/pablobianciotto/" target="_blank">
            © pablo bianciotto
          </a>
        </div>
      </div>
    </div>
  )
}

export default React.memo(LoadingPanel)