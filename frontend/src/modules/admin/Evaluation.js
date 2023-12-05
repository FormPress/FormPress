import React, { Component } from 'react'
import { api } from '../../helper'

import './Evaluation.css'

export default class Evaluation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedOption: 'notapproved',
      page: 'evaluate',
      forms: [],
      loading: false,
      selectedForm: '',
      cursor: 0,
      reachedEnd: false
    }

    this.handleSelectClick = this.handleSelectClick.bind(this)
    this.getFormsToEvaluate = this.getFormsToEvaluate.bind(this)
    this.getEvaluationsToReview = this.getEvaluationsToReview.bind(this)
    this.selectForm = this.selectForm.bind(this)
    this.evaluateForm = this.evaluateForm.bind(this)
    this.approveEvaluation = this.approveEvaluation.bind(this)
    this.voteEvaluation = this.voteEvaluation.bind(this)
    this.deleteEvaluation = this.deleteEvaluation.bind(this)
  }

  async getFormsToEvaluate() {
    const { data } = await api({
      resource: `/api/admin/evaluate/forms`
    })

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

    if (type === 'approved') {
      if (cursor === 0) {
        this.setState({ forms: [], cursor: 0, reachedEnd: false })
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
      return
    }

    const { data } = await api({
      resource: `/api/admin/evaluate/evaluations/${type}`
    })

    this.setState({ forms: data })
  }
  selectForm(id) {
    const selectedForm = this.state.forms.filter((form) => form.id === id)

    this.setState({ selectedForm: selectedForm[0] })
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
      this.setState({ cursor: 0, reachedEnd: false })
    }

    this.setState({ selectedOption: selectedOption, selectedForm: '' })
    await this.getEvaluationsToReview(selectedOption)
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
          <div className="eval-title">Review Evaluations</div>

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
              onClick={() => this.getEvaluationsToReview()}
              className={reachedEnd ? 'end' : ''}>
              {selectedOption === 'approved'
                ? cursor !== 0
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
          <div className="eval-title">Evaluate Forms</div>
          <div className="load-forms" onClick={() => this.getFormsToEvaluate()}>
            Load Forms
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

  renderForm() {
    const { selectedForm, page } = this.state
    if (selectedForm === '') {
      return ''
    } else {
      if (page === 'evaluate') {
        const link = `${
          process.env.FE_BACKEND || global.env.FE_BACKEND
        }/form/view/${selectedForm.uuid}`
        return (
          <div className="selected-form">
            <div className="form-info">
              <div>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  Go to Form
                </a>
              </div>
              <div>
                <b>ID</b>: {selectedForm.id} <b>Uuid:</b> {selectedForm.uuid}
              </div>
              <div>
                <b>User:</b> {selectedForm.email}
              </div>
              <div>
                <b>Form Props:</b> {selectedForm.props}
              </div>
            </div>
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
            <div className="form-info">
              <div>Evaluation Id: {selectedForm.id}</div>
              <div>Form Id: {selectedForm.form_id}</div>
              <div>Published Id: {selectedForm.form_published_id}</div>
              <div>Form Props: {selectedForm.props}</div>
              <div>Type : {selectedForm.type}</div>
              <div>Evaluated By: {selectedForm.evaluator}</div>
              <div>Evaluated At: {selectedForm.evaluated_at}</div>
              <div>Vote : {selectedForm.vote}</div>
              {selectedForm.approver_id !== null ? (
                <>
                  <div>Approved By: {selectedForm.approver}</div>
                  <div>Approved At: {selectedForm.approved_at}</div>
                </>
              ) : (
                ''
              )}
            </div>
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
    const { page } = this.state
    if (page === 'evaluate') {
      return <>{this.renderEvaluateForms()}</>
    } else if (page === 'review') {
      return <>{this.renderReviewEvaluations()}</>
    }
  }

  render() {
    return (
      <div className="evaluation">
        <div className="eval-nav">
          <div
            onClick={() =>
              this.setState({
                page: 'evaluate',
                selectedForm: '',
                forms: [],
                cursor: 0,
                reachedEnd: false
              })
            }>
            Evaluate Forms
          </div>
          <div
            onClick={() =>
              this.setState({
                page: 'review',
                selectedForm: '',
                forms: [],
                cursor: 0,
                reachedEnd: false
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
