import React, { Component } from 'react'

import './PostSubmission.css'
import moment from 'moment'
import Renderer from '../Renderer'
import { api } from '../../helper'
import GeneralContext from '../../general.context'
import EditableLabel from '../common/EditableLabel'
import Modal from '../common/Modal'

class PostSubmission extends Component {
  constructor(props) {
    super(props)

    this.date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    this.handleTyPageTextChange = this.handleTyPageTextChange.bind(this)
    this.handleTyPageTitleChange = this.handleTyPageTitleChange.bind(this)
    this.handleInputLimit = this.handleInputLimit.bind(this)
    this.handleEvaluationTextChange = this.handleEvaluationTextChange.bind(this)
    this.handleOnKeyDown = this.handleOnKeyDown.bind(this)
    this.handleOnPaste = this.handleOnPaste.bind(this)
    this.loadPostSubmissionPages = this.loadPostSubmissionPages.bind(this)
    this.renderCustomPageManager = this.renderCustomPageManager.bind(this)
    this.handleOnSave = this.handleOnSave.bind(this)
    this.handleDeletePage = this.handleDeletePage.bind(this)
    this.handleOnDeleteClick = this.handleOnDeleteClick.bind(this)
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.getCurrentIntegration = this.getCurrentIntegration.bind(this)
    this.handleOnHTMLEditorPaste = this.handleOnHTMLEditorPaste.bind(this)
    this.handleChoosePostSubmissionPage = this.handleChoosePostSubmissionPage.bind(
      this
    )
    this.handleSetTyPage = this.handleSetTyPage.bind(this)
    this.handleOnHTMLEditorKeyDown = this.handleOnHTMLEditorKeyDown.bind(this)

    this.editor = React.createRef()

    this.state = {
      targetName: '',
      postSubmissionPages: [],
      warningMessage: '',
      selectorOptions: [],
      selectedPostSubmissionPage: null,
      isModalOpen: false,
      modalContent: {}
    }
  }

  async loadPostSubmissionPages(seamless = false) {
    const result = await api({
      resource: `/api/user/${this.props.generalContext.auth.user_id}/get/thankyou`,
      method: 'get'
    })

    const { data } = result

    if (data.length > 0) {
      const selectorOptions = data.map((page) => {
        if (page.id === 1) {
          return {
            display: 'Default',
            value: page.id
          }
        }

        return {
          display:
            page.title +
            ' - ' +
            (page.updated_at
              ? moment(page.updated_at).format('YYYY-MM-DD HH:mm')
              : moment(page.created_at).format('YYYY-MM-DD HH:mm')),
          value: page.id
        }
      })

      const defaultPostSubmissionPage = data[0]

      this.setState({
        selectorOptions,
        postSubmissionPages: data
      })

      if (seamless === false) {
        this.setState({
          selectedPostSubmissionPage: defaultPostSubmissionPage
        })
        this.editor.current.innerHTML = defaultPostSubmissionPage.html
      }
    } else {
      return this.setState({
        warningMessage: 'There has been an error loading pages.'
      })
    }
  }

  async componentDidMount() {
    if (this.editor.current === null) {
      return
    }

    await this.loadPostSubmissionPages()

    const tyPageIdIntegration = this.getCurrentIntegration()

    if (tyPageIdIntegration !== false) {
      const foundTyPage = this.state.postSubmissionPages.find(
        (page) => page.id === tyPageIdIntegration.value
      )

      if (foundTyPage) {
        this.setState({
          selectedPostSubmissionPage: foundTyPage
        })
        this.editor.current.innerHTML = foundTyPage.html
      }
    }
  }

  handleSetTyPage() {
    const { selectedPostSubmissionPage } = this.state

    let formSetToDefaultPage = false

    const tyPageIdIntegration = this.getCurrentIntegration()

    if (tyPageIdIntegration === false) {
      formSetToDefaultPage = true
    } else if (tyPageIdIntegration.value === 1) {
      formSetToDefaultPage = true
    }

    if (formSetToDefaultPage === false) {
      return this.props.setIntegration({
        type: 'tyPageId',
        value: 1
      })
    }

    this.props.setIntegration({
      type: 'tyPageId',
      value: selectedPostSubmissionPage.id
    })
  }

  async handleOnSave() {
    const html = this.editor.current.innerHTML
    const { selectedPostSubmissionPage } = this.state

    let id = selectedPostSubmissionPage.id

    if (id <= 1) {
      id = null
    }

    const data = {
      title: selectedPostSubmissionPage.title,
      html,
      id
    }

    const saveResult = await api({
      resource: `/api/user/${this.props.generalContext.auth.user_id}/update/thankyou`,
      method: 'post',
      body: data
    })

    await this.loadPostSubmissionPages(true)

    if (saveResult.data.tyPageId !== undefined) {
      selectedPostSubmissionPage.id = saveResult.data.tyPageId
      this.setState({ selectedPostSubmissionPage })
    }
  }

  getCurrentIntegration() {
    const { form } = this.props

    const foundTyPageIdIntegration = form.props.integrations.find(
      (integration) => integration.type === 'tyPageId'
    )

    return foundTyPageIdIntegration || false
  }

  handleCloseModalClick() {
    this.setState({
      isModalOpen: false,
      modalContent: {}
    })
  }

  handleOnHTMLEditorPaste(e) {
    e.preventDefault()

    const text = e.clipboardData.getData('text/plain')

    document.execCommand('insertHTML', false, text)
  }

  handleOnHTMLEditorKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.target.blur()
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;')
      return
    }

    if (e.key === 'Backspace') {
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const text = range.startContainer.textContent
      if (text === '') {
        e.preventDefault()
        return
      }
    }
  }

  handleOnDeleteClick() {
    const { selectedPostSubmissionPage } = this.state
    const { title } = selectedPostSubmissionPage
    const modalContent = {
      header: `Delete ${
        title.length > 35 ? title.substring(0, 35) + '...' : title
      }?`,
      status: 'warning'
    }

    modalContent.dialogue = {
      negativeText: 'Delete',
      negativeClick: this.handleDeletePage,
      abortText: 'Cancel',
      abortClick: this.handleCloseModalClick
    }

    modalContent.content = (
      <div>
        Selected page will be
        <span
          style={{
            color: '#be0000',
            fontWeight: 'bold',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            wordBreak: 'break-all'
          }}>
          {' '}
          PERMANENTLY
        </span>{' '}
        deleted. Are you sure you want to delete this page?
      </div>
    )

    this.setState({ modalContent, isModalOpen: true })
  }

  async handleDeletePage() {
    const { selectedPostSubmissionPage } = this.state

    if (selectedPostSubmissionPage.id === 1) {
      return
    }
    let pageIsSelected

    const tyPageIdInIntegration = this.getCurrentIntegration()

    if (tyPageIdInIntegration) {
      pageIsSelected =
        tyPageIdInIntegration.value === selectedPostSubmissionPage.id
    } else {
      pageIsSelected = selectedPostSubmissionPage.id === 1
    }

    await api({
      resource: `/api/user/${this.props.generalContext.auth.user_id}/delete/thankyou/${selectedPostSubmissionPage.id}`,
      method: 'delete'
    })

    if (pageIsSelected) {
      await this.props.setIntegration({
        type: 'tyPageId',
        value: 1
      })
    }

    await this.loadPostSubmissionPages()

    this.handleCloseModalClick()
  }

  handleChoosePostSubmissionPage(elem, e) {
    const { postSubmissionPages } = this.state

    const selectedPostSubmissionPage = postSubmissionPages.filter(
      (page) => page.id === parseInt(e.target.value)
    )[0]

    this.setState({ selectedPostSubmissionPage })
    this.editor.current.innerHTML = selectedPostSubmissionPage.html
  }

  handleOnKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.target.blur()
    }
  }

  handleOnPaste(e) {
    e.preventDefault()
    var text = e.clipboardData.getData('text/plain')
    document.execCommand('insertHTML', false, text)
  }

  handleTyPageTitleChange(id, value) {
    const { selectedPostSubmissionPage } = this.state
    selectedPostSubmissionPage.title = value

    this.setState({ selectedPostSubmissionPage })
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

  renderCustomPageManager() {
    const { selectedPostSubmissionPage } = this.state

    if (selectedPostSubmissionPage === null) {
      return
    }

    const { id } = selectedPostSubmissionPage

    let defaultPage = false

    if (id <= 1) {
      defaultPage = true
    }

    let pageIsSelected

    const tyPageIdInIntegration = this.getCurrentIntegration()

    if (tyPageIdInIntegration) {
      pageIsSelected =
        tyPageIdInIntegration.value === selectedPostSubmissionPage.id
    } else {
      pageIsSelected = selectedPostSubmissionPage.id === 1
    }

    return (
      <>
        <div className="custom-pages-selector">
          <Renderer
            theme="infernal"
            handleFieldChange={this.handleChoosePostSubmissionPage}
            className="pagesSelector-dropdown"
            form={{
              props: {
                elements: [
                  {
                    id: 5,
                    type: 'Dropdown',
                    placeholder: 'Select a page',
                    options: this.state.selectorOptions,
                    value: selectedPostSubmissionPage?.id || 1
                  }
                ]
              }
            }}
          />
          <button
            className="postSubmissionPage-save"
            onClick={this.handleOnSave}>
            Create New Page
          </button>
        </div>
        <div className="custom-pages-manager">
          <div className="pageIdentifier">
            <div className="custom-page-title">
              <EditableLabel
                className="label"
                mode={defaultPage ? 'view' : 'builder'}
                dataPlaceholder="Click to edit page title"
                labelKey="title"
                handleLabelChange={this.handleTyPageTitleChange}
                value={
                  defaultPage
                    ? 'Default Thank You Page'
                    : selectedPostSubmissionPage.title
                }
                limit={128}
              />
            </div>
            <div className="custom-page-select">
              <Renderer
                theme="infernal"
                handleFieldChange={this.handleSetTyPage}
                form={{
                  props: {
                    elements: [
                      {
                        id: 6,
                        type: 'Checkbox',
                        options: ['Show this page after submission'],
                        value: pageIsSelected,
                        disabled: defaultPage && pageIsSelected
                      }
                    ]
                  }
                }}
              />
            </div>
            <div className="custom-page-controls">
              {defaultPage ? null : (
                <>
                  <button
                    className="postSubmissionPage-delete"
                    onClick={this.handleOnDeleteClick}>
                    Delete
                  </button>
                  <button
                    className="postSubmissionPage-save"
                    onClick={this.handleOnSave}>
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  render() {
    console.log('this.ref', this.props)
    const { selectedPostSubmissionPage } = this.state
    const { form } = this.props
    const { integrations } = this.props.form.props

    let defaultPage = false

    if (selectedPostSubmissionPage) {
      const { id } = selectedPostSubmissionPage
      defaultPage = id === undefined || id <= 1
    }

    const matchingIntegration = (type) =>
      integrations.filter((integration) => integration.type === type)

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
        <Modal
          isOpen={this.state.isModalOpen}
          modalContent={this.state.modalContent}
          closeModal={this.handleCloseModalClick}
        />
        <div className="postSubmission-message">Customize {mode} Page</div>
        {mode === 'Thank You' ? (
          <>
            <div className="pageManager">{this.renderCustomPageManager()}</div>
            <div
              className="thankYouPage-preview"
              ref={this.editor}
              contentEditable={!defaultPage}
              onPaste={this.handleOnHTMLEditorPaste}
              onKeyDown={this.handleOnHTMLEditorKeyDown}></div>
          </>
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
                    suppressContentEditableWarning
                    onKeyDown={this.handleOnKeyDown}
                    onPaste={this.handleOnPaste}
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
                    suppressContentEditableWarning
                    onKeyDown={this.handleOnKeyDown}
                    onPaste={this.handleOnPaste}
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
                        suppressContentEditableWarning
                        onKeyDown={this.handleOnKeyDown}
                        onPaste={this.handleOnPaste}
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
                        suppressContentEditableWarning
                        onKeyDown={this.handleOnKeyDown}
                        onPaste={this.handleOnPaste}
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
                        suppressContentEditableWarning
                        onKeyDown={this.handleOnKeyDown}
                        onPaste={this.handleOnPaste}
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
                        suppressContentEditableWarning
                        onKeyDown={this.handleOnKeyDown}
                        onPaste={this.handleOnPaste}
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
                      suppressContentEditableWarning
                      onKeyDown={this.handleOnKeyDown}
                      onPaste={this.handleOnPaste}
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
              <a
                href="https://formpress.org"
                target="_blank"
                rel="noopener noreferrer">
                <img
                  alt="Go to Formpress."
                  src="https://static.formpress.org/images/formpressBrand.svg"
                />
              </a>
            </div>
            <div>
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

const PostSubmissionWrapped = (props) => (
  <GeneralContext.Consumer>
    {(value) => <PostSubmission {...props} generalContext={value} />}
  </GeneralContext.Consumer>
)

export default PostSubmissionWrapped
