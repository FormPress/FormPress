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
      message: ''
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
    let type = ''
    if (evalType === undefined) {
      type = this.state.selectedOption
    } else {
      type = evalType
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

    let rating = 1
    if (vote === 'down') {
      rating = -1
    }

    const updatedForms = [...forms]

    const votedForm = updatedForms.find((form) => form.id === selectedForm.id)

    votedForm.vote = votedForm.vote + rating

    selectedForm.vote = selectedForm.vote + rating

    this.setState({ forms: updatedForms })
  }

  async handleSelectClick(event) {
    const selectedOption = event.target.value

    this.setState({ selectedOption: selectedOption, selectedForm: '' })
    this.getEvaluationsToReview(selectedOption)
  }

  renderReviewEvaluations() {
    const { forms, selectedOption, selectedForm } = this.state
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
            <span onClick={() => this.getEvaluationsToReview()}>
              Load Evaluations
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
                <span>Link</span>
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
                    Link
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
                <b>Form Id</b>: {selectedForm.id}
              </div>
              <div>
                <b>User:</b> {selectedForm.email}
              </div>
              <div>
                <b>Form Uuid:</b> {selectedForm.uuid}
              </div>
              <div>
                <b>Link:</b>{' '}
                <a href={link} target="_blank" rel="noopener noreferrer">
                  Link
                </a>
              </div>
              <div>
                <b>Form Props:</b> {selectedForm.props}
              </div>
            </div>
            <div className="eval-controls">
              <div
                className="eval-button"
                onClick={() => this.evaluateForm('good')}>
                Good
              </div>
              <div
                className="eval-button"
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
              <div
                className="eval-button"
                onClick={() => this.voteEvaluation('up')}>
                Vote Up
              </div>
              <div
                className="eval-button"
                onClick={() => this.voteEvaluation('down')}>
                Vote Down
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
              this.setState({ page: 'evaluate', selectedForm: '', forms: [] })
            }>
            Evaluate Forms
          </div>
          <div
            onClick={() =>
              this.setState({ page: 'review', selectedForm: '', forms: [] })
            }>
            Review Evaluations
          </div>
        </div>
        {this.renderEvaluationPage()}
      </div>
    )
  }
}
