import React from 'react'

const LoadingLabels = ({ loading }) => (
  <div className="loading-labels-container no-select">{loading ? 'LOADING UNI, BAL, SUSHI LABELS' : ''}</div>
)

export default React.memo(LoadingLabels)