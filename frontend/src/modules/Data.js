import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import Moment from 'react-moment'

import { api } from '../helper'
import AuthContext from '../auth.context'
import Table from './common/Table'

import './Data.css'

const getStartOfToday = () => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  return start.getTime()
}

const getNumberOfSubmissionsToday = (submissions) => {
  const startOfToday = getStartOfToday()

  return submissions
    .map((submission) => new Date(submission.created_at).getTime())
    .filter((ts) => ts > startOfToday).length
}

function download(filename, text) {
  var element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/plaincharset=utf-8,' + encodeURIComponent(text)
  )
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

class Data extends Component {
  setLoadingState(key, value) {
    this.setState({
      loading: {
        ...this.state.loading,
        [key]: value
      }
    })
  }

  async updateForms() {
    this.setLoadingState('forms', true)

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms`
    })

    const forms = (data || []).map((form) => {
      return {
        ...form,
        props: JSON.parse(form.props)
      }
    })

    this.setLoadingState('forms', false)
    this.setState({ forms })
  }

  async updateSubmissionsSeamless(form_id) {
    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/submissions?orderBy=created_at&desc=true`
    })

    this.setState({ submissions: data })
  }

  async updateSubmissions(form_id) {
    this.setLoadingState('submissions', true)
    this.setState({
      submissions: [],
      selectedFormId: form_id,
      selectedSubmissionId: null,
      entries: []
    })

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/submissions?orderBy=created_at&desc=true`
    })

    this.setLoadingState('submissions', false)
    this.setState({ submissions: data })
  }

  componentDidMount() {
    this.updateForms()
  }

  constructor(props) {
    super(props)
    this.state = {
      formSelectorOpen: false,
      forms: [],
      selectedFormId: null,
      selectedSubmission: null,
      selectedSubmissionIds: [],
      submissions: [],
      entries: [],
      loading: {
        forms: false,
        submissions: false,
        entries: false
      }
    }

    this.handleFormClick = this.handleFormClick.bind(this)
    this.handleSubmissionClick = this.handleSubmissionClick.bind(this)
    this.handleCSVExportClick = this.handleCSVExportClick.bind(this)
    this.IsJsonString = this.IsJsonString.bind(this)
  }

  handleFormClick(form) {
    this.setState({ formSelectorOpen: false })
    this.updateSubmissions(form.id)
  }

  toggleSubmission(submission_id) {
    const { selectedSubmissionIds } = this.state

    if (selectedSubmissionIds.includes(submission_id)) {
      this.setState({
        selectedSubmissionIds: selectedSubmissionIds.filter(
          (_submission_id) => _submission_id !== submission_id
        )
      })
    } else {
      this.setState({
        selectedSubmissionIds: [...selectedSubmissionIds, submission_id]
      })
    }
  }

  IsJsonString(str) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  async handleSubmissionClick(submission) {
    const { id } = submission
    const form_id = this.state.selectedFormId

    this.setLoadingState('entries', true)
    this.setState({
      entries: [],
      selectedSubmissionId: id
    })

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/submissions/${id}/entries`
    })

    const formWithOtherOptions = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/`
    })

    for (let dataContent of data) {
      for (let element of JSON.parse(formWithOtherOptions.data.props)
        .elements) {
        if (
          element.id === dataContent.question_id &&
          (element.type === 'Checkbox' || element.type === 'Radio')
        ) {
          const tempContent = dataContent.value
          dataContent.value = []
          if (this.IsJsonString(tempContent) === false) {
            for (let elementContent of element.options) {
              if (tempContent === elementContent) {
                dataContent.value.push({
                  content: elementContent,
                  value: 'checked',
                  type: element.type,
                  toggle: element.toggle
                })
              } else {
                dataContent.value.push({
                  content: elementContent,
                  value: '',
                  type: element.type,
                  toggle: element.toggle
                })
              }
            }
          } else {
            for (let elementContent of element.options) {
              if (JSON.parse(tempContent).includes(elementContent) === true) {
                dataContent.value.push({
                  content: elementContent,
                  value: 'checked',
                  type: element.type,
                  toggle: element.toggle
                })
              } else {
                dataContent.value.push({
                  content: elementContent,
                  value: '',
                  type: element.type,
                  toggle: element.toggle
                })
              }
            }
          }
        }
      }
    }

    this.setLoadingState('entries', false)
    this.setState({ entries: data })

    // Do not update and refetch submissions as it is already read!
    if (submission.read === 1) {
      return
    }

    await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/submissions/${id}`,
      method: 'put',
      body: JSON.stringify({
        ...submission,
        read: 1
      })
    })

    this.updateSubmissionsSeamless(form_id)
  }

  async handleCSVExportClick() {
    const form_id = this.state.selectedFormId
    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/CSVExport`,
      method: 'post',
      body: {
        submissionIds: this.state.selectedSubmissionIds
      }
    })

    download(data.filename, data.content)
    this.setState({ selectedSubmissionIds: [] })
  }

  render() {
    const { forms, formSelectorOpen, loading, selectedFormId } = this.state
    const submissions =
      loading.submissions === true ? 'Loading...' : this.renderSubmissions()
    const entries =
      loading.entries === true ? 'Loading...' : this.renderEntries()
    let formSelectorText = 'Please select form'

    if (selectedFormId !== null && forms.length > 0) {
      formSelectorText = forms.filter((form) => form.id === selectedFormId)[0]
        .title
    }

    return (
      <div className="data">
        <div className="headerContainer">
          <div className="header cw grid center">
            <div className="col-1-16">
              <Link to="/forms" className="back">
                <FontAwesomeIcon icon={faChevronLeft} />
              </Link>
            </div>
            <div className="col-15-16 mainTabs">
              <a href="#/" className="selected">
                Responses
              </a>
            </div>
          </div>
        </div>
        <div className="formSelectorContainer center">
          <div className="formSelector cw center grid">
            <div
              className="col-15-16"
              onClick={() => {
                this.setState({ formSelectorOpen: !formSelectorOpen })
              }}>
              {formSelectorText}
            </div>
            <div className="col-1-16 down">
              <FontAwesomeIcon icon={faChevronDown} />
            </div>
          </div>
          {formSelectorOpen === true ? (
            <div className="formSelectorOptions cw center grid">
              <div className="col-16-16">
                <ul>
                  {forms.map((form, index) => (
                    <li
                      key={index}
                      onClick={this.handleFormClick.bind(this, form)}>
                      {form.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
        <div className="cw center grid dataContent">
          <div className="submissionSelector col-5-16">
            {this.state.submissions.length === 0 ? (
              <div className="noData">No data</div>
            ) : (
              submissions
            )}
          </div>
          <div className="entriesViewer col-11-16">{entries}</div>
        </div>
      </div>
    )
  }

  renderSubmissions() {
    const {
      submissions,
      selectedSubmissionId,
      selectedSubmissionIds
    } = this.state
    let checkAllProps = { checked: true }

    for (const { id } of submissions) {
      if (selectedSubmissionIds.includes(id) === false) {
        checkAllProps.checked = false
        break
      }
    }

    if (submissions.length === 0) {
      return null
    }

    const csvExportClassNames = ['csvExportButton']
    let csvExportButtonText = 'Export CSV'

    if (selectedSubmissionIds.length === 0) {
      csvExportClassNames.push('disabled')
    } else {
      csvExportButtonText = `Export CSV (${selectedSubmissionIds.length})`
    }

    return [
      <div className="submissionActions grid" key="actions">
        <div className="col-10-16">
          {submissions.length} total submission(s). <br />
          {getNumberOfSubmissionsToday(submissions)} submission(s) today.
        </div>
        <div className="col-6-16 buttonContainer">
          <button
            className={csvExportClassNames.join(' ')}
            onClick={this.handleCSVExportClick}>
            {csvExportButtonText}
          </button>
        </div>
      </div>,
      <Table
        key="table"
        onTrClick={this.handleSubmissionClick}
        getTrClassName={(submission) =>
          submission.id === selectedSubmissionId ? 'selected' : undefined
        }
        columns={[
          {
            label: (
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked === true) {
                    this.setState({
                      selectedSubmissionIds: submissions.map(
                        (submission) => submission.id
                      )
                    })
                  } else {
                    this.setState({
                      selectedSubmissionIds: []
                    })
                  }
                }}
                {...checkAllProps}
              />
            ),
            content: (submission) => {
              const props = { checked: false }

              if (selectedSubmissionIds.includes(submission.id)) {
                props.checked = true
              }

              return (
                <input
                  type="checkbox"
                  onChange={this.toggleSubmission.bind(this, submission.id)}
                  {...props}
                />
              )
            },
            className: 'text_center'
          },
          {
            label: 'Response Date',
            content: (submission) => [
              <Moment fromNow ago date={submission.created_at} key="1" />,
              <span key="2">{' ago'}</span>
            ]
          },
          {
            label: '',
            content: () => [
              <span className="table_caret_right" key="1">
                {'>'}
              </span>
            ]
          }
        ]}
        data={submissions}
      />
    ]
  }

  renderEntryElements(entry) {
    const { forms, selectedFormId } = this.state
    const form = forms.filter((form) => form.id === selectedFormId)[0]
    let value = ''

    console.log(entry)

    let questionType = ''
    try {
      questionType = form.props.elements.filter(
        (element) => element.id === entry.question_id
      )[0].type
    } catch (e) {
      console.log(e)
    }

    if (questionType === 'Checkbox' || questionType === 'Radio') {
      value = entry.value.map((input, index) => {
        return (
          <div className="input" key={index}>
            <input
              type={input.type.toLowerCase()}
              id={'q_required_' + index}
              className={input.toggle === true ? 'toggle-checkbox' : ''}
              defaultChecked={input.value}
              disabled
              readOnly
            />
            {input.toggle === true ? <span className="slider"></span> : null}
            <label
              className={
                input.type.toLowerCase() +
                '-label ' +
                (input.toggle === true ? 'toggle-label' : '')
              }
              htmlFor={'q_required_' + index}>
              {input.content}
            </label>
          </div>
        )
      })
    } else if (questionType === 'FileUpload') {
      if (entry.value !== '') {
        try {
          if (
            Object.prototype.toString.call(JSON.parse(entry.value)) ===
              '[object Object]' ||
            '[object Array]'
          ) {
            const parsedValue = JSON.parse(entry.value)
            const uriEncodedName = encodeURI(parsedValue.fileName)
            const downloadLink = `/download/${entry.form_id}/${entry.submission_id}/${entry.question_id}/${uriEncodedName}`
            value = <Link to={downloadLink}>{parsedValue.fileName}</Link>
          } else {
            value = entry.value
          }
        } catch (e) {
          console.log(e)
        }
      }
    } else if (questionType === 'Name') {
      if (entry.value !== '') {
        try {
          value = Object.entries(JSON.parse(entry.value))
            .map(([v, t]) => `${t}`)
            .join(' ')
          if (value.trim() === '') value = '-'
        } catch (e) {
          console.log(e)
        }
      }
    } else {
      value = entry.value
    }

    return value
  }

  renderEntries() {
    const { entries, forms, selectedFormId } = this.state

    if (entries.length === 0) {
      return null
    }

    const form = forms.filter((form) => form.id === selectedFormId)[0]
    const getLabel = (question_id) => {
      const matchingQuestion = form.props.elements.filter(
        (element) => element.id === question_id
      )

      if (matchingQuestion.length > 0) {
        return matchingQuestion[0].label
      } else {
        return 'Deleted Question'
      }
    }

    return entries.map((entry, index) => {
      let value = this.renderEntryElements(entry)
      return (
        <div key={index} className="entry">
          <div className="label">{getLabel(entry.question_id)}</div>
          <div className="value">{value}</div>
        </div>
      )
    })
  }
}

const DataWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Data {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default DataWrapped
