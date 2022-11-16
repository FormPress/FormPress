import React, { Component } from 'react'
import './Usages.css'

export default class Usages extends Component {
  static componentName = 'usages'
  static path = '/settings/usages'
  static menuText = 'Usages'

  componentDidMount() {
    const { generalContext } = this.props

    generalContext.user.getUsages()
  }

  formatBytes(bytes, decimals = 2) {
    if (!+bytes) return { numerical: 0, fullString: '0 KB' }

    const k = 1000
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return {
      numerical: parseFloat((bytes / Math.pow(k, i)).toFixed(dm)),
      size: sizes[i],
      fullString: `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${
        sizes[i]
      }`
    }
  }

  render() {
    const labelMap = {
      formUsage: 'Forms',
      submissionUsage: 'Submissions',
      uploadUsage: 'Storage'
    }

    const planMap = {
      1: 'Admin',
      2: 'Free',
      3: 'Silver',
      4: 'Gold',
      5: 'Diamond',
      6: 'Daily',
      7: 'Test',
      10: 'BFSilver',
      11: 'BFGold',
      12: 'BFDiamond'
    }

    const limitMap = {
      formUsage: 'formLimit',
      submissionUsage: 'submissionLimit',
      uploadUsage: 'uploadLimit'
    }

    const { usages } = this.props.generalContext.user
    const { auth } = this.props.generalContext
    const isAdmin = auth.user_role === 1

    return (
      <div className="usages-wrapper">
        <div className="settings_header">Usages</div>
        <div className="usages-header">
          <div className="currentPlan">
            Current plan:{' '}
            <span className={'plan-badge ' + planMap[auth.user_role]}>
              {planMap[auth.user_role]}
            </span>
          </div>
          <div className="needMore">
            Need more? <a href="/pricing">Upgrade your plan!</a>
          </div>
        </div>
        <div className={`usages-list ${isAdmin ? 'admin' : null}`}>
          {typeof usages === 'object'
            ? Object.entries(usages).map((u, index) => {
                const usageName = u[0]
                let usageData = { value: u[1] || 0, display: u[1] }

                const limitMin = { display: 0, value: 0 }
                const limitMax = {
                  display: auth.permission[limitMap[usageName]],
                  value: auth.permission[limitMap[usageName]]
                }

                if (usageName === 'uploadUsage') {
                  const usageFormattedBytes = this.formatBytes(usageData.value)
                  usageData.value = usageFormattedBytes.numerical
                  usageData.display = usageFormattedBytes.fullString

                  const limitMaxFormattedBytes = this.formatBytes(
                    limitMax.value * 1e6
                  )
                  limitMax.value = limitMaxFormattedBytes.numerical
                  limitMax.display = limitMaxFormattedBytes.fullString
                }

                let percentage = (100 * usageData.value) / limitMax.value

                if (isAdmin) {
                  percentage = 50
                }
                return (
                  <div className="usage-container" key={index}>
                    <div className="usage-label">{labelMap[usageName]}</div>
                    <div className={`user-limit-bar ${isAdmin ? 'admin' : ''}`}>
                      <div
                        className={
                          'user-progress ' +
                          (percentage === 100
                            ? 'full'
                            : percentage >= 80
                            ? 'alert'
                            : '')
                        }
                        style={{ width: percentage + '%' }}></div>
                      <span
                        className="progress-knob"
                        data-percentage={usageData.display}></span>
                    </div>
                    <div className="limit-legend">
                      <span className="limit-min">{limitMin.display}</span>
                      <span className="limit-max">
                        {isAdmin ? '∞' : limitMax.display}
                      </span>
                    </div>
                  </div>
                )
              })
            : 'Loading...'}
        </div>
      </div>
    )
  }
}
