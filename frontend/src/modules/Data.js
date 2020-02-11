import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import Moment from 'react-moment'

import { api } from '../helper'
import AuthContext from '../auth.context'
import Table from './common/Table'

import './Data.css'

class Data extends Component {
  setLoadingState (key, value) {
    this.setState({
      loading: {
        ...this.state.loading,
        [key]: value
      }
    })
  }

  async updateForms () {
    this.setLoadingState('forms', true)

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms`
    })

    const forms = data.map((form) => {
      return {
        ...form,
        props: JSON.parse(form.props) 
      }
    })

    this.setLoadingState('forms', false)
    this.setState({ forms })
  }

  async updateSubmissionsSeamless (formId) {
    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${formId}/submissions`
    })

    this.setState({ submissions: data })
  }

  async updateSubmissions (formId) {
    this.setLoadingState('submissions', true)
    this.setState({
      submissions: [],
      selectedFormId: formId,
      selectedSubmissionId: null,
      entries: []
    })

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${formId}/submissions`
    })

    this.setLoadingState('submissions', false)
    this.setState({ submissions: data })
  }

  componentDidMount () {
    this.updateForms()
  }

  constructor (props) {
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
  }

  handleFormClick (form, e) {
    this.updateSubmissions(form.id)
  }

  toggleSubmission (submission_id) {
    const { selectedSubmissionIds } = this.state 

    if (selectedSubmissionIds.includes(submission_id)) {
      this.setState({
        selectedSubmissionIds: selectedSubmissionIds
          .filter((_submission_id) => (_submission_id !== submission_id))
      })
    } else {
      this.setState({
        selectedSubmissionIds: [...selectedSubmissionIds, submission_id]
      })
    }
  }

  async handleSubmissionClick (submission) {
    const { id } = submission
    const form_id = this.state.selectedFormId

    this.setLoadingState('entries', true)
    this.setState({
      entries: [],
      selectedSubmissionId: id,
    })

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/submissions/${id}/entries`
    })

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

  render () {
    const { forms, formSelectorOpen, loading, selectedFormId } = this.state
    const submissions = (loading.submissions === true)
      ? 'Loading...'
      : this.renderSubmissions()
    const entries = (loading.entries === true)
      ? 'Loading...'
      : this.renderEntries()
    let formSelectorText = 'Please select form'

    if (selectedFormId !== null && forms.length > 0) {
      formSelectorText = forms.filter(
        (form) => (form.id === selectedFormId)
      )[0].title
    }

    const oldContent = (
      <div className='data'>
        <div className='dataForms'>
          {forms}
        </div>
        <div className='submissions'>
          {submissions}
        </div>
        <div className='entries'>
          {entries}
        </div>
      </div>
    )

    return (
      <div className='data'>
        <div className='headerContainer'>
          <div className='header cw grid center'>
            <div className='col-1-16'>
              <Link to='/forms' className='back'>
                <FontAwesomeIcon icon={ faChevronLeft } />
              </Link>
            </div>
            <div className='col-15-16 mainTabs'>
              <a
                href='#/'
                className='selected'
              >
                Responses
              </a>
            </div>
          </div>
        </div>
        <div className='formSelectorContainer center'>
          <div className='formSelector cw center grid'>
            <div className='col-15-16' onClick={ () => {this.setState({formSelectorOpen: !formSelectorOpen })}}>
              {formSelectorText}
              {
                (formSelectorOpen === true)
                  ? forms.map((form, index) => (
                    <li
                      key={ index }
                      onClick={ this.handleFormClick.bind(this, form) }
                    >
                      {form.title}
                    </li>
                  ))
                  : null
              }
            </div>
            <div className='col-1-16 down'>
              <FontAwesomeIcon icon={ faChevronDown } />
            </div>
          </div>
        </div>
        <div className='cw center grid dataContent'>
          <div className='submissionSelector col-5-16'>
            { submissions }
          </div>
          <div className='entriesViewer col-11-16'>
            { entries }
          </div>
        </div>
      </div>
    )
  }

  renderSubmissions () {
    const { submissions, selectedSubmissionId, selectedSubmissionIds } = this.state
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

    return (
      <Table
        onTrClick={this.handleSubmissionClick}
        columns={[
          {
            label: <input
              type='checkbox'
              onChange={(e) => {
                if (e.target.checked === true) {
                  this.setState({
                    selectedSubmissionIds: submissions.map((submission) => submission.id)
                  })
                } else {
                  this.setState({
                    selectedSubmissionIds: []
                  })
                }
              }}
              { ...checkAllProps }
            />,
            content: (submission) => {
              const props = { checked: false }

              if (selectedSubmissionIds.includes(submission.id)) {
                props.checked = true
              }

              return (
                <input
                  type='checkbox'
                  onChange={this.toggleSubmission.bind(this, submission.id)}
                  { ...props }
                />
              )
            },
            className: 'text_center'
          },
          {
            label: 'Response Date',
            content: (submission) => [
              <Moment fromNow ago date={ submission.created_at } key='1' />,
              <span key='2'>{ ' ago' }</span>
            ]
          },
        ]}
        data={ submissions }
      />
    )
  }

  renderEntries () {
    const { entries, forms, selectedFormId } = this.state

    if (entries.length === 0) {
      return null
    }

    const form = forms.filter((form) => (form.id === selectedFormId))[0]
    const getLabel = (question_id) => {
      const question = form
        .props
        .elements
        .filter((element) => (element.id === question_id))[0]

      return question.label
    }

    return <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {this.state.entries.map((entry, index) => (
          <tr key={ index }>
            <td>{getLabel(entry.question_id)}</td>
            <td>{entry.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  }
}

const DataWrapped = (props) => 
  <AuthContext.Consumer>
    {
      (value) => <Data { ...props } auth={ value } />
    }
  </AuthContext.Consumer>

export default DataWrapped
