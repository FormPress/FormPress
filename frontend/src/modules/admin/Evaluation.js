import React, { Component } from 'react'
import { api } from '../../helper'

import './Evaluation.css'
import Renderer from '../Renderer'

export default class Evaluation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedOption: 'notapproved',
      page: 'evaluate',
      tab: 'details',
      forms: [],
      selectedForm: '',
      cursor: Infinity,
      reachedEnd: false,
      searchValue: '',
      loading: {
        forms: false,
        evaluations: false
      }
    }

    this.handleSelectClick = this.handleSelectClick.bind(this)
    this.getFormsToEvaluate = this.getFormsToEvaluate.bind(this)
    this.getEvaluationsToReview = this.getEvaluationsToReview.bind(this)
    this.selectForm = this.selectForm.bind(this)
    this.evaluateForm = this.evaluateForm.bind(this)
    this.approveEvaluation = this.approveEvaluation.bind(this)
    this.voteEvaluation = this.voteEvaluation.bind(this)
    this.deleteEvaluation = this.deleteEvaluation.bind(this)
    this.handleSearchFieldChange = this.handleSearchFieldChange.bind(this)
    this.renderFormDetails = this.renderFormDetails.bind(this)
    this.renderFormView = this.renderFormView.bind(this)
    this.renderReviewFormDetails = this.renderReviewFormDetails.bind(this)
  }

  setLoadingState(key, value) {
    this.setState({
      loading: {
        ...this.state.loading,
        [key]: value
      }
    })
  }
  async getFormsToEvaluate(searchValue = '') {
    this.setLoadingState('forms', true)
    this.setState({ forms: [], selectedForm: '' })
    let queryString = ''

    // Check if searchValue is a valid UUID
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      searchValue
    )
    if (isUuid) {
      // If searchValue is a valid UUID, use it directly
      queryString += `?search=${searchValue}`
    } else {
      // If searchValue is a form link, extract the UUID
      const match = searchValue.match(/\/([^/]+)\/?$/)
      if (match && match[1]) {
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          match[1]
        )
        if (isUuid) {
          queryString += `?search=${match[1]}`
        }
      }
    }
    const { data } = await api({
      resource: `/api/admin/evaluate/forms${queryString}`
    })

    this.setLoadingState('forms', false)
    this.setState({ forms: data })
  }

  async getEvaluationsToReview(evalType) {
    let { cursor } = this.state
    let type = ''
    if (evalType === undefined) {
      type = this.state.selectedOption
    } else {
      type = evalType
    }

    this.setLoadingState('evaluations', true)
    if (type === 'approved') {
      if (cursor === Infinity) {
        this.setState({ forms: [], reachedEnd: false })
      }
      const { data } = await api({
        resource: `/api/admin/evaluate/evaluations/${type}?cursor=${cursor}`
      })
      if (data.length > 0) {
        const updatedForms = [...this.state.forms, ...data]
        this.setState({ forms: updatedForms, cursor: data[data.length - 1].id })
      } else {
        this.setState({ reachedEnd: true })
      }
      this.setLoadingState('evaluations', false)
      return
    }

    const { data } = await api({
      resource: `/api/admin/evaluate/evaluations/${type}`
    })

    this.setState({ forms: [] })
    this.setLoadingState('evaluations', false)
    this.setState({ forms: data })
  }
  selectForm(id) {
    const selectedForm = this.state.forms.filter((form) => form.id === id)

    this.setState({ selectedForm: selectedForm[0], tab: 'details' })
  }

  async evaluateForm(type) {
    await api({
      resource: `/api/admin/evaluate/forms/${this.state.selectedForm.id}`,
      method: 'post',
      body: { form: this.state.selectedForm, type: type }
    })

    const forms = [...this.state.forms]
    const updatedForms = forms.filter(
      (form) => form.id !== this.state.selectedForm.id
    )
    this.setState({ selectedForm: '', forms: updatedForms })
  }

  async approveEvaluation() {
    await api({
      resource: `/api/admin/evaluate/approve/${this.state.selectedForm.id}`
    })

    const forms = [...this.state.forms]
    const updatedForms = forms.filter(
      (form) => form.id !== this.state.selectedForm.id
    )
    this.setState({ selectedForm: '', forms: updatedForms })
  }

  async deleteEvaluation() {
    const { selectedForm } = this.state
    await api({
      resource: `/api/admin/evaluate/delete/${selectedForm.id}/${selectedForm.form_published_id}`
    })

    const forms = [...this.state.forms]
    const updatedForms = forms.filter(
      (form) => form.id !== this.state.selectedForm.id
    )

    this.setState({ selectedForm: '', forms: updatedForms })
  }

  async voteEvaluation(vote) {
    const { selectedForm, forms } = this.state

    await api({
      resource: `/api/admin/evaluate/${selectedForm.id}/vote/${vote}`
    })

    const updatedForms = [...forms]

    const votedForm = updatedForms.find((form) => form.id === selectedForm.id)

    votedForm.vote = votedForm.vote + (vote === 'down' ? -1 : 1)

    this.setState({ forms: updatedForms })
  }

  async handleSelectClick(event) {
    const selectedOption = event.target.value
    if (selectedOption !== 'approved') {
      this.setState({ cursor: Infinity, reachedEnd: false })
    }

    this.setState({ selectedOption: selectedOption, selectedForm: '' })
    await this.getEvaluationsToReview(selectedOption)
  }

  handleSearchFieldChange(elem, e) {
    const searchValue = e.target.value
    this.setState({
      searchValue
    })
  }
  renderReviewEvaluations() {
    const {
      forms,
      selectedOption,
      selectedForm,
      reachedEnd,
      cursor
    } = this.state
    const options = [
      { value: 'notapproved', label: 'Not Approved' },
      { value: 'good', label: 'Good' },
      { value: 'bad', label: 'Bad' },
      { value: 'approved', label: 'Approved' }
    ]
    return (
      <div className="eval-wrapper">
        <div className="eval-header">
          <div className="load-reviews">
            <select
              value={this.state.selectedOption}
              onChange={this.handleSelectClick}>
              <option value="" disabled>
                Select an option
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span
              onClick={
                reachedEnd ? () => {} : () => this.getEvaluationsToReview()
              }
              className={reachedEnd ? 'end' : ''}>
              {selectedOption === 'approved'
                ? cursor !== Infinity
                  ? 'Load More'
                  : 'Load Evaluations'
                : 'Load Evaluations'}
            </span>
          </div>
        </div>
        <div className="eval-content">
          <div
            className={
              'review-eval-list' +
              (selectedOption === 'approved' ? ' approved' : '')
            }>
            {this.state.forms.length !== 0 && (
              <div className="header-row">
                <span>ID</span>
                <span>Form ID</span>
                <span>Form P. ID</span>
                <span>Type</span>
                <span>Evaluator</span>
                <span>Evaluated At</span>
                {selectedOption === 'approved' && (
                  <>
                    <span>Approver</span>
                    <span>Approved At</span>
                  </>
                )}
                <span>Vote</span>
              </div>
            )}

            {forms.map((form) => (
              <div
                key={form.id}
                onClick={() => this.selectForm(form.id)}
                className={
                  'data-row' +
                  (form.id === selectedForm.id ? ' selected' : '') +
                  (selectedOption === 'approved' ? ' approved' : '')
                }>
                <span>{form.id}</span>
                <span>{form.form_id}</span>
                <span>{form.form_published_id}</span>
                <span>{form.type}</span>
                <span>{form.evaluator}</span>
                <span>
                  {new Date(form.evaluated_at)
                    .toISOString()
                    .slice(0, 16)
                    .replace('T', ' ')}
                </span>{' '}
                {selectedOption === 'approved' && (
                  <>
                    <span>{form.approver}</span>
                    <span>
                      {new Date(form.approved_at)
                        .toISOString()
                        .slice(0, 16)
                        .replace('T', ' ')}
                    </span>
                  </>
                )}
                <span>{form.vote}</span>
              </div>
            ))}
          </div>
          {this.renderForm()}
        </div>
      </div>
    )
  }

  renderEvaluateForms() {
    const { forms, selectedForm } = this.state
    const link = `${process.env.FE_BACKEND || global.env.FE_BACKEND}/form/view/`
    return (
      <div className="eval-wrapper">
        <div className="eval-header">
          <div className="load-forms-container">
            <Renderer
              className="form-search"
              theme="infernal"
              allowInternal={true}
              handleFieldChange={this.handleSearchFieldChange}
              form={{
                props: {
                  elements: [
                    {
                      id: 1,
                      type: 'TextBox',
                      label: 'Search Forms with UUID or Form Link',
                      value: this.state.searchValue
                    }
                  ]
                }
              }}
            />
            <div
              className="load-forms"
              onClick={() => this.getFormsToEvaluate(this.state.searchValue)}>
              Load Forms
            </div>
          </div>
        </div>
        <div className="eval-content">
          <div className="eval-list">
            {this.state.forms.length !== 0 && (
              <div className="header-row">
                <span>ID</span>
                <span>User</span>
                <span></span>
              </div>
            )}

            {forms.map((form) => (
              <div
                key={form.id}
                onClick={() => this.selectForm(form.id)}
                className={
                  'data-row' + (form.id === selectedForm.id ? ' selected' : '')
                }>
                <span>{form.id}</span>
                <span>{form.email}</span>
                <span>
                  <a
                    href={link + form.uuid}
                    target="_blank"
                    rel="noopener noreferrer">
                    Go to Form
                  </a>
                </span>
              </div>
            ))}
          </div>
          {this.renderForm()}
        </div>
      </div>
    )
  }

  renderFormDetails(selectedForm) {
    return (
      <div className="form-info">
        <div>
          <b>Form ID</b>: {selectedForm.id}
        </div>
        <div>
          <b>Form UUID:</b> {selectedForm.uuid}
        </div>
        <div>
          <b>User:</b> {selectedForm.email}
        </div>
        <div>
          <b>Form Title:</b> {selectedForm.title}
        </div>
        <div>
          <b>Form Props:</b> {selectedForm.props}
        </div>
      </div>
    )
  }

  renderReviewFormDetails(selectedForm) {
    return (
      <div className="form-info">
        <div>
          <b>Evaluation Id: </b>
          {selectedForm.id}
        </div>
        <div>
          <b>Form Id: </b>
          {selectedForm.form_id}
        </div>
        <div>
          <b>Form UUID: </b> {selectedForm.uuid}
        </div>
        <div>
          <b>Published Id: </b>
          {selectedForm.form_published_id}
        </div>
        <div>
          <b>Form Title: </b>
          {selectedForm.title}
        </div>
        <div>
          <b>Form Props: </b>
          {selectedForm.props}
        </div>
        <div>
          <b>Type: </b>
          {selectedForm.type}
        </div>
        <div>
          <b>Evaluated By: </b>
          {selectedForm.evaluator}
        </div>
        <div>
          <b>Evaluated At: </b>
          {new Date(selectedForm.evaluated_at)
            .toISOString()
            .slice(0, 16)
            .replace('T', ' ')}
        </div>
        <div>
          <b>Vote: </b>
          {selectedForm.vote}
        </div>
        {selectedForm.approver_id !== null ? (
          <>
            <div>
              <b>Approved By: </b>
              {selectedForm.approver}
            </div>
            <div>
              <b>Approved At: </b>
              {new Date(selectedForm.approved_at)
                .toISOString()
                .slice(0, 16)
                .replace('T', ' ')}
            </div>
          </>
        ) : (
          ''
        )}
      </div>
    )
  }

  renderFormView(selectedForm) {
    return (
      <div className="iframe-wrapper">
        <iframe
          src={`${process.env.FE_BACKEND || global.env.FE_BACKEND}/form/view/${
            selectedForm.uuid
          }?preview=true`}
          title="Form View"
        />
      </div>
    )
  }
  renderForm() {
    const { selectedForm, page, tab } = this.state
    if (selectedForm === '') {
      return ''
    } else {
      const link = `${
        process.env.FE_BACKEND || global.env.FE_BACKEND
      }/form/view/${selectedForm.uuid}`
      if (page === 'evaluate') {
        return (
          <div className="selected-form">
            <a href={link} target="_blank" rel="noopener noreferrer">
              Go to Form
            </a>
            <div className="form-tabs">
              <div
                className={`form-tab ${tab === 'details' ? 'selected' : ''}`}
                onClick={() => this.setState({ tab: 'details' })}>
                Form Details
              </div>
              <div
                className={`form-tab ${tab === 'view' ? 'selected' : ''}`}
                onClick={() => this.setState({ tab: 'view' })}>
                View
              </div>
            </div>
            {tab === 'details'
              ? this.renderFormDetails(selectedForm)
              : this.renderFormView(selectedForm)}
            <div className="eval-controls vertical">
              <div
                className="eval-button good"
                onClick={() => this.evaluateForm('good')}>
                Good
              </div>
              <div
                className="eval-button bad"
                onClick={() => this.evaluateForm('bad')}>
                Bad
              </div>
            </div>
          </div>
        )
      } else if (page === 'review') {
        return (
          <div className="selected-eval-form">
            <a href={link} target="_blank" rel="noopener noreferrer">
              Go to Form
            </a>
            <div className="form-tabs">
              <div
                className={`form-tab ${tab === 'details' ? 'selected' : ''}`}
                onClick={() => this.setState({ tab: 'details' })}>
                Form Details
              </div>
              <div
                className={`form-tab ${tab === 'view' ? 'selected' : ''}`}
                onClick={() => this.setState({ tab: 'view' })}>
                View
              </div>
            </div>
            {tab === 'details'
              ? this.renderReviewFormDetails(selectedForm)
              : this.renderFormView(selectedForm)}
            <div className="eval-controls">
              {selectedForm.approver_id === null && (
                <div
                  className="eval-button"
                  onClick={() => this.approveEvaluation()}>
                  Approve
                </div>
              )}
              <div className="eval-controls vertical">
                <div
                  className="eval-button good"
                  onClick={() => this.voteEvaluation('up')}>
                  Vote Up
                </div>
                <div
                  className="eval-button bad"
                  onClick={() => this.voteEvaluation('down')}>
                  Vote Down
                </div>
              </div>
              <div
                className="eval-button"
                onClick={() => this.deleteEvaluation()}>
                Delete
              </div>
            </div>
          </div>
        )
      }
    }
  }

  renderEvaluationPage() {
    const { page, loading } = this.state
    if (loading.forms || loading.evaluations)
      return <div className="loading">Loading...</div>
    else {
      if (page === 'evaluate') {
        return <>{this.renderEvaluateForms()}</>
      } else if (page === 'review') {
        return <>{this.renderReviewEvaluations()}</>
      }
    }
  }

  render() {
    return (
      <div className="evaluation">
        <div className="eval-nav">
          <div
            className={this.state.page === 'evaluate' ? 'selected' : ''}
            onClick={() =>
              this.setState({
                page: 'evaluate',
                selectedForm: '',
                forms: [],
                cursor: Infinity,
                reachedEnd: false,
                tab: 'details'
              })
            }>
            Evaluate Forms
          </div>
          <div
            className={this.state.page === 'review' ? 'selected' : ''}
            onClick={() =>
              this.setState({
                page: 'review',
                selectedForm: '',
                forms: [],
                cursor: Infinity,
                reachedEnd: false,
                tab: 'details'
              })
            }>
            Review Evaluations
          </div>
        </div>
        {this.renderEvaluationPage()}
      </div>
    )
  }
}
