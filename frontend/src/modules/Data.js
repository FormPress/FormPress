import React, { Component } from 'react';
import { api } from '../helper'
import './Data.css'

const user_id = 1

export default class Data extends Component {
  setLoadingState (key, value) {
    this.setState({
      loading: {
        ...this.state.loading,
        [key]: value
      }
    })
  }

  async componentDidMount () {
    this.setLoadingState('forms', true)

    const { data } = await api({
      resource: `/api/users/${user_id}/forms`
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

  constructor (props) {
    super(props)
    this.state = {
      forms: [],
      selectedFormId: null,
      selectedSubmission: null,
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

  async handleFormClick (form, e) {
    const { id } = form

    this.setLoadingState('submissions', true)
    this.setState({
      submissions: [],
      selectedFormId: id,
    })

    const { data } = await api({
      resource: `/api/users/${user_id}/forms/${id}/submissions`
    })

    this.setLoadingState('submissions', false)
    this.setState({ submissions: data })
  }

  async handleSubmissionClick (submission, e) {
    const { id } = submission
    const form_id = this.state.selectedFormId

    this.setLoadingState('entries', true)
    this.setState({
      entries: [],
      selectedSubmissionId: id,
    })

    const { data } = await api({
      resource: `/api/users/${user_id}/forms/${form_id}/submissions/${id}/entries`
    })

    this.setLoadingState('entries', false)
    this.setState({ entries: data })

    await api({
      resource: `/api/users/${user_id}/forms/${form_id}/submissions/${id}`,
      method: 'put',
      body: JSON.stringify({
        ...submission,
        read: 1
      })
    })
  }

  render () {
    const { loading, selectedFormId } = this.state
    const forms = (loading.forms === true)
      ? 'Loading...'
      : <ul>
        {this.state.forms.map((form, index) => (
          <li
            key={ index }
            className={ (form.id === selectedFormId) ? 'selected' : '' }
            onClick={this.handleFormClick.bind(this, form)}
          >
            {form.title}
          </li>
        ))}
      </ul>
    const submissions = (loading.submissions === true)
      ? 'Loading...'
      : this.renderSubmissions()
    const entries = (loading.entries === true)
      ? 'Loading...'
      : this.renderEntries()

    return (
      <div className='data'>
        <div className='forms'>
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
  }

  renderSubmissions () {
    const { submissions, selectedSubmissionId } = this.state

    if (submissions.length === 0) {
      return null
    }

    return <table>
      <thead>
        <tr>
          <th>id</th>
          <th>Created At</th>
          <th>Updated At</th>
          <th>Read</th>
        </tr>
      </thead>
      <tbody>
        { this.state.submissions.map((submission, index) => (
          <tr
            key={ index }
            className={ (submission.id === selectedSubmissionId) ? 'selected' : '' }
            onClick={ this.handleSubmissionClick.bind(this, submission) }
          >
            <td>{submission.id}</td>
            <td>{submission.created_at}</td>
            <td>{submission.updated_at}</td>
            <td>{
              (submission.read === 1)
                ? 'Yes'
                : 'No'
            }</td>
          </tr>
        )) }
      </tbody>
    </table>
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
