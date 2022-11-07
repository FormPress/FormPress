import React, { Component } from 'react'
import { BrandLogoMotto, SubmitSuccess } from '../../svg'

import './PostSubmission.css'
import moment from 'moment'

class PostSubmission extends Component {
  constructor(props) {
    super(props)

    this.date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    this.handleTyPageTextChange = this.handleTyPageTextChange.bind(this)
    this.handleTyPageTitleChange = this.handleTyPageTitleChange.bind(this)
    this.handleInputLimit = this.handleInputLimit.bind(this)
    this.handleEvaluationTextChange = this.handleEvaluationTextChange.bind(this)
  }

  handleTyPageTitleChange(e) {
    this.props.setIntegration({
      type: 'tyPageTitle',
      value: e.target.innerText
    })
  }

  handleTyPageTextChange(e) {
    this.props.setIntegration({
      type: 'tyPageText',
      value: e.target.innerText
    })
  }

  handleEvaluationTextChange(e, property) {
    const text = e.target.innerText
    const integration = { type: 'evaluationPageLabels' }
    integration[property] = text
    this.props.setIntegration(integration)
  }

  handleInputLimit(e, limit = 128) {
    const text = e.target.innerText
    if (text.length >= limit) {
      e.target.innerText = text.substr(0, limit)

      e.target.focus()
      document.execCommand('selectAll', false, null)
      document.getSelection().collapseToEnd()
    }
  }
  render() {
    const { form } = this.props
    const { integrations } = this.props.form.props

    const matchingIntegration = (type) =>
      integrations.filter((integration) => integration.type === type)

    let tyPageTitle = 'Thank you!'

    if (matchingIntegration('tyPageTitle').length > 0) {
      tyPageTitle = matchingIntegration('tyPageTitle')[0].value
    }

    let tyPageText =
      'Your submission was successful and the form owner has been notified.'

    if (matchingIntegration('tyPageText').length > 0) {
      tyPageText = matchingIntegration('tyPageText')[0].value
    }

    let evaluationPageLabels = {
      questionCount: 'Questions',
      correctAnswers: 'Correct',
      incorrectAnswers: 'Incorrect',
      unansweredQuestions: 'Unanswered',
      score: 'Score',
      completionDate: 'Completed',
      completionTime: 'Time'
    }

    if (matchingIntegration('evaluationPageLabels').length > 0) {
      evaluationPageLabels = {
        ...evaluationPageLabels,
        ...matchingIntegration('evaluationPageLabels')[0]
      }
    }

    const submitBevaviourIntegration = form.props.integrations.find(
      (integration) => integration.type === 'submitBehaviour'
    )

    let mode

    if (submitBevaviourIntegration !== undefined) {
      if (submitBevaviourIntegration.value === 'Evaluate Form') {
        mode = 'Results'
      } else if (submitBevaviourIntegration.value === 'Show Thank You Page') {
        mode = 'Thank You'
      }
    } else {
      mode = 'Thank You'
    }

    return (
      <div className="postSubmission-wrapper">
        <div className="postSubmission-message">Customize {mode} Page</div>
        {mode === 'Thank You' ? (
          <div className="thankYouPage-preview">
            <div className="big-box">
              <p className="submit-photo">
                <SubmitSuccess />
              </p>

              <div>
                <div
                  className="testing"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={this.handleInputLimit}
                  onBlur={this.handleTyPageTitleChange}>
                  {tyPageTitle}
                </div>
                <div
                  className="texting"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => this.handleInputLimit(e, 256)}
                  onBlur={this.handleTyPageTextChange}>
                  {tyPageText}
                </div>
              </div>
            </div>

            <div className="upper-box">
              <div className="free-form">
                {' '}
                This form has been created on FORMPRESS.
                <br />{' '}
                <span className="click">
                  <a
                    href="https://app.formpress.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Visit FORMPRESS and start building awesome forms!">
                    Click here
                  </a>
                </span>{' '}
                to create your own form now! <br />
              </div>

              <div>
                <BrandLogoMotto />
              </div>
            </div>
          </div>
        ) : (
          <div className="evaluatePage-preview">
            <div className="results-header">
              <div className="r-header-section userData">
                <div className="completion-date">
                  <span
                    className="evaluationPage-variable"
                    data-placeholder="Completed"
                    contentEditable={true}
                    spellCheck={false}
                    onInput={(e) => this.handleInputLimit(e, 16)}
                    onBlur={(e) =>
                      this.handleEvaluationTextChange(e, 'completionDate')
                    }>
                    {evaluationPageLabels.completionDate}
                  </span>
                  :&nbsp;
                  <span id="completionDate">{this.date}</span>
                </div>
                <div className="completion-time">
                  <span
                    className="evaluationPage-variable"
                    data-placeholder="Time"
                    contentEditable={true}
                    spellCheck={false}
                    onInput={(e) => this.handleInputLimit(e, 16)}
                    onBlur={(e) =>
                      this.handleEvaluationTextChange(e, 'completionTime')
                    }>
                    {evaluationPageLabels.completionTime}
                  </span>
                  :&nbsp;
                  <span id="completionTime">00:00:09</span>
                </div>
              </div>
              <div className="r-header-section formInfo">{form.title}</div>
              <div className="r-header-section testResults">
                <div className="leftHand">
                  <div className="lhContent">
                    <div className="question-info-row">
                      <span
                        className="evaluationPage-variable"
                        data-placeholder="Questions"
                        contentEditable={true}
                        spellCheck={false}
                        onInput={(e) => this.handleInputLimit(e, 16)}
                        onBlur={(e) =>
                          this.handleEvaluationTextChange(e, 'questionCount')
                        }>
                        {evaluationPageLabels.questionCount}
                      </span>
                      :{' '}
                      <span id="questionCount" className="total-question-count">
                        2
                      </span>
                    </div>
                    <div className="answer-info-row">
                      <span
                        className="evaluationPage-variable"
                        data-placeholder="Correct"
                        contentEditable={true}
                        spellCheck={false}
                        onInput={(e) => this.handleInputLimit(e, 16)}
                        onBlur={(e) =>
                          this.handleEvaluationTextChange(e, 'correctAnswers')
                        }>
                        {evaluationPageLabels.correctAnswers}
                      </span>
                      :&nbsp;
                      <span
                        id="correctAnswers"
                        className="correct-answer-count">
                        1
                      </span>
                    </div>
                    <div className="answer-info-row">
                      <span
                        className="evaluationPage-variable"
                        data-placeholder="Incorrect"
                        contentEditable={true}
                        spellCheck={false}
                        onInput={(e) => this.handleInputLimit(e, 16)}
                        onBlur={(e) =>
                          this.handleEvaluationTextChange(e, 'incorrectAnswers')
                        }>
                        {evaluationPageLabels.incorrectAnswers}
                      </span>
                      :&nbsp;
                      <span id="wrongAnswers" className="wrong-answer-count">
                        1
                      </span>
                    </div>
                    <div className="answer-info-row">
                      <span
                        className="evaluationPage-variable"
                        data-placeholder="Unanswered"
                        contentEditable={true}
                        spellCheck={false}
                        onInput={(e) => this.handleInputLimit(e, 16)}
                        onBlur={(e) =>
                          this.handleEvaluationTextChange(
                            e,
                            'unansweredQuestions'
                          )
                        }>
                        {evaluationPageLabels.unansweredQuestions}
                      </span>
                      :&nbsp;
                      <span id="unanswered" className="unanswered-count">
                        0
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rightHand">
                  <div className="rhContent">
                    <span
                      className="evaluationPage-variable"
                      data-placeholder="Score"
                      contentEditable={true}
                      spellCheck={false}
                      onInput={(e) => this.handleInputLimit(e, 16)}
                      onBlur={(e) =>
                        this.handleEvaluationTextChange(e, 'score')
                      }>
                      {evaluationPageLabels.score}
                    </span>
                    :&nbsp;
                    <span id="percentageScore" className="percentage-score">
                      50
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="fp-powered">
              powered by{' '}
              <a href="https://formpress.org" target="_blank" rel="noreferrer">
                <img
                  alt="Go to Formpress."
                  src="https://static.formpress.org/images/formpressBrand.svg"
                />
              </a>
            </div>
            <div id="FORMPRESS_FORM_165">
              <div
                className="form renderer gleam formPage-1 "
                data-fp-pagenumber="1">
                <div className="element oh elementRadio" id="qc_4">
                  <div className="elemLabelTitle">
                    <div className="fl label">
                      <div className="question-placeholder">&nbsp;</div>
                      <div className="question-placeholder2">&nbsp;</div>
                    </div>
                  </div>
                  <div className="fl input">
                    <ul id="q_4_radioList" className="radioList">
                      <li>
                        <input
                          type="radio"
                          id="q_4_0"
                          name="q_4"
                          value="0"
                          disabled="true"
                        />
                        <label className="radio-label" htmlFor="q_4_0">
                          <div className="answer-placeholder">&nbsp;</div>
                        </label>
                        <div className="check">
                          <div className="inside"></div>
                        </div>
                      </li>
                      <li>
                        <input
                          type="radio"
                          id="q_4_1"
                          name="q_4"
                          value="1"
                          disabled="true"
                        />
                        <label className="radio-label" htmlFor="q_4_1">
                          <div className="answer-placeholder">&nbsp;</div>
                        </label>
                        <div className="check">
                          <div className="inside"></div>
                        </div>
                      </li>
                      <li className="correct">
                        <input
                          type="radio"
                          id="q_4_2"
                          name="q_4"
                          value="2"
                          disabled="true"
                          checked="true"
                          readOnly="true"
                        />
                        <label className="radio-label" htmlFor="q_4_2">
                          <div className="answer-placeholder">&nbsp;</div>
                        </label>
                        <div className="check">
                          <div className="inside"></div>
                        </div>
                      </li>
                      <li>
                        <input
                          type="radio"
                          id="q_4_3"
                          name="q_4"
                          value="3"
                          disabled="true"
                        />
                        <label className="radio-label" htmlFor="q_4_3">
                          <div className="answer-placeholder">&nbsp;</div>
                        </label>
                        <div className="check">
                          <div className="inside"></div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="clearfix">
                    <div className="sublabel">
                      <span
                        dataplaceholder="Click to edit sublabel"
                        spellCheck="false"
                        labelkey="sub_4"
                        className="emptySpan"></span>
                    </div>
                  </div>
                  <div className="fl metadata">
                    <div className="requiredErrorText">Required field</div>
                  </div>
                </div>
                <div className="element oh elementRadio" id="qc_3">
                  <div className="elemLabelTitle">
                    <div className="fl label">
                      <div className="question-placeholder">&nbsp;</div>
                      <div className="question-placeholder2">&nbsp;</div>
                    </div>
                  </div>
                  <div className="fl input">
                    <ul id="q_3_radioList" className="radioList">
                      <li className="expected">
                        <input
                          type="radio"
                          id="q_3_0"
                          name="q_3"
                          value="0"
                          disabled="true"
                        />
                        <label className="radio-label" htmlFor="q_3_0">
                          <div className="answer-placeholder">&nbsp;</div>
                        </label>
                        <div className="check">
                          <div className="inside"></div>
                        </div>
                      </li>
                      <li>
                        <input
                          type="radio"
                          id="q_3_1"
                          name="q_3"
                          value="1"
                          disabled="true"
                        />
                        <label className="radio-label" htmlFor="q_3_1">
                          <div className="answer-placeholder">&nbsp;</div>
                        </label>
                        <div className="check">
                          <div className="inside"></div>
                        </div>
                      </li>
                      <li className="wrong">
                        <input
                          type="radio"
                          id="q_3_2"
                          name="q_3"
                          value="2"
                          checked="true"
                          disabled="true"
                        />
                        <label className="radio-label" htmlFor="q_3_2">
                          <div className="answer-placeholder">&nbsp;</div>
                        </label>
                        <div className="check">
                          <div className="inside"></div>
                        </div>
                      </li>
                      <li>
                        <input
                          type="radio"
                          id="q_3_3"
                          name="q_3"
                          value="3"
                          disabled="true"
                        />
                        <label className="radio-label" htmlFor="q_3_3">
                          <div className="answer-placeholder">&nbsp;</div>
                        </label>
                        <div className="check">
                          <div className="inside"></div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="clearfix">
                    <div className="sublabel">
                      <span
                        dataplaceholder="Click to edit sublabel"
                        spellCheck="false"
                        labelkey="sub_3"
                        className="emptySpan"></span>
                    </div>
                  </div>
                  <div className="fl metadata">
                    <div className="requiredErrorText">Required field</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default PostSubmission
