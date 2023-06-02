import React, { Component } from 'react'
import './Preferences.css'
import Renderer from '../Renderer'
import { api } from '../../helper'
import { faCheck, faCross } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class Preferences extends Component {
  constructor(props) {
    super(props)

    this.state = {
      userSettingsForms: [
        {
          title: 'Notifications',
          props: {
            elements: [
              {
                id: 'notification.marketing',
                type: 'Checkbox',
                options: ['Receive marketing emails']
              },
              {
                id: 'notification.product_update',
                type: 'Checkbox',
                options: ['Receive product updates']
              }
            ]
          }
        }
      ],
      taskFeedback: {}
    }

    this.handleSubmitChanges = this.handleSubmitChanges.bind(this)
  }

  static componentName = 'preferences'
  static path = '/settings/preferences'
  static menuText = 'Preferences'

  async componentDidMount() {
    const { user_id } = this.props.generalContext.auth

    await api({
      resource: `/api/users/${user_id}/get/settings`,
      method: 'get'
    }).then((res) => {
      // fill the forms with the user's settings
      const { userSettingsForms } = this.state

      if (res.success === false) {
        return
      }

      const userSettings = res.data

      // if there are no notification settings, push the default settings to user settings
      const noNotificationSettings = !userSettings.some(
        (setting) => setting.key.indexOf('notification') > -1
      )

      if (noNotificationSettings) {
        // push the default settings to user settings
        const defaultSettings = [
          {
            key: 'notification.marketing',
            value: true
          },
          { key: 'notification.product_update', value: true }
        ]

        userSettings.push(...defaultSettings)
      }

      const updated = userSettingsForms.map((form) => {
        const elements = form.props.elements

        const elemsUpdatedWithUserSettings = elements.map((elem) => {
          const userSetting = userSettings.find(
            (setting) => setting.key === elem.id
          )
          if (userSetting) {
            if (elem.type === 'Checkbox') {
              if (userSetting.value === 'true') {
                elem.defaultChecked = true
              } else if (userSetting.value === 'false') {
                elem.defaultChecked = false
              } else {
                elem.defaultChecked = userSetting.value
              }
            }

            // TODO: handle other types of elements
          }
          return elem
        })

        form.props.elements = elemsUpdatedWithUserSettings

        return form
      })

      this.setState({ userSettingsForms: updated })
    })
  }

  async handleSubmitChanges(e) {
    e.preventDefault()

    this.setState({ taskFeedback: {} })

    const { user_id } = this.props.generalContext.auth

    const elements = this.state.userSettingsForms.reduce((acc, form) => {
      return acc.concat(form.props.elements)
    }, [])

    const formData = new FormData(e.target)

    const userSettings = elements.map((elem) => {
      if (elem.type === 'Checkbox') {
        return {
          key: elem.id,
          value: formData.get(`q_${elem.id}`) ? true : false
        }
      }

      // TODO: handle other types of elements
      return null
    })

    const request = await api({
      resource: `/api/users/${user_id}/preferences`,
      method: 'post',
      body: { userSettings: userSettings }
    })

    this.setState({
      taskFeedback: request.data
    })
  }

  render() {
    const { userSettingsForms, taskFeedback } = this.state

    return (
      <div className="preferences-wrapper">
        <div className="settings_header">Preferences</div>
        <form onSubmit={this.handleSubmitChanges}>
          {userSettingsForms.map((form, index) => {
            const singleFormBlock = (
              <div key={index} id={form.title} className="formBlock-wrapper">
                <div className="formBlock-header">{form.title}</div>
                <Renderer
                  theme="infernal"
                  className="formBlock-form"
                  form={form}
                />
              </div>
            )
            return singleFormBlock
          })}
          {userSettingsForms.length > 0 ? (
            <Renderer
              theme="infernal"
              form={{
                props: {
                  elements: [
                    {
                      id: 3,
                      type: 'Button',
                      buttonText: 'Save Changes'
                    }
                  ]
                }
              }}
            />
          ) : null}
          <div
            className={
              'task-feedback ' + (taskFeedback.success === false ? 'error' : '')
            }>
            {taskFeedback.message}
            {taskFeedback.message && taskFeedback.success === true ? (
              <FontAwesomeIcon icon={faCheck} />
            ) : taskFeedback.message && taskFeedback.success === false ? (
              <FontAwesomeIcon icon={faCross} />
            ) : null}
          </div>
        </form>
      </div>
    )
  }
}
