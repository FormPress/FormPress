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
    const { forms, selectedOption } = this.state
    const options = [
      { value: 'notapproved', label: 'Not Approved' },
      { value: 'good', label: 'Good' },
      { value: 'bad', label: 'Bad' },
      { value: 'approved', label: 'Approved' }
    ]
    return (
      <div>
        <div>Review Evaluations</div>
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
        <div
          className="load-forms"
          onClick={() => this.getEvaluationsToReview()}>
          Load Evaluations
        </div>
        <div className="eval-list">
          {forms.map((form) => (
            <div key={form.id}>
              <div onClick={() => this.selectForm(form.id)}>
                <span>Id: {form.id} </span>
                <span>Form Id: {form.form_id}</span>
                <span>Form Published Id: {form.form_published_id}</span>
                <span>Type : {form.type}</span>
                <span>Evaluator: {form.evaluator}</span>
                <span>Evaluated At: {form.evaluated_at}</span>
                {selectedOption === 'approved' ? (
                  <>
                    <span>Approver: {form.approver}</span>
                    <span>Approved At: {form.approved_at}</span>
                  </>
                ) : (
                  ''
                )}
                <span>Vote: {form.vote}</span>
              </div>
            </div>
          ))}
        </div>
        {this.renderForm()}
      </div>
    )
  }

  renderEvaluateForms() {
    const { forms } = this.state
    const link = `${process.env.FE_BACKEND || global.env.FE_BACKEND}/form/view/`
    return (
      <div>
        <div>Evaluate Forms</div>
        <div className="load-forms" onClick={() => this.getFormsToEvaluate()}>
          Load Forms
        </div>
        <div className="eval-list">
          {forms.map((form) => (
            <div key={form.id}>
              <div onClick={() => this.selectForm(form.id)}>
                <span>Id: {form.id} </span>
                <span>User: {form.email}</span>
                <span>
                  <a href={link + form.uuid} target="blank">
                    Link
                  </a>
                </span>
              </div>
            </div>
          ))}
        </div>
        {this.renderForm()}
      </div>
    )
  }

  renderForm() {
    const { selectedForm, page } = this.state
    if (selectedForm === '') {
      return 'Select Form'
    } else {
      if (page === 'evaluate') {
        const link = `${
          process.env.FE_BACKEND || global.env.FE_BACKEND
        }/form/view/${selectedForm.uuid}`
        return (
          <div className="selected-form">
            <div>Form Id: {selectedForm.id}</div>
            <div>User: {selectedForm.email}</div>
            <div>Form Uuid: {selectedForm.uuid}</div>
            <div>
              Form link:{' '}
              <a href={link} target="blank">
                Link
              </a>
            </div>
            <div>Form Props: {selectedForm.props}</div>
            <div>Evaluate</div>
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
        )
      } else if (page === 'review') {
        return (
          <div className="selected-form">
            <div>Evaluation Id: {selectedForm.id}</div>
            <div>Form Id: {selectedForm.form_id}</div>
            <div>Published Id: {selectedForm.form_published_id}</div>
            <div>Form Props: {selectedForm.props}</div>
            <div>Type : {selectedForm.type}</div>
            <div>Evaluated By: {selectedForm.evaluator}</div>
            <div>Evaluated At: {selectedForm.evaluated_at}</div>
            <div>Vote : {selectedForm.vote}</div>
            <div onClick={() => this.deleteEvaluation()}>DELETE EVALUATION</div>
            {selectedForm.approver_id === null ? (
              <div
                className="eval-button"
                onClick={() => this.approveEvaluation()}>
                Approve
              </div>
            ) : (
              <>
                <div>Approved By: {selectedForm.approver}</div>
                <div>Approved At: {selectedForm.approved_at}</div>
              </>
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
          <span
            onClick={() =>
              this.setState({ page: 'evaluate', selectedForm: '', forms: [] })
            }>
            Evaluate Forms
          </span>
          <span
            onClick={() =>
              this.setState({ page: 'review', selectedForm: '', forms: [] })
            }>
            Review Evaluations
          </span>
        </div>
        {this.renderEvaluationPage()}
      </div>
    )
  }
}
