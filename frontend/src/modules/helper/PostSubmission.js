import React, { Component } from 'react'

import './PostSubmission.css'
import moment from 'moment'
import Renderer from '../Renderer'
import { api } from '../../helper'
import GeneralContext from '../../general.context'
import EditableLabel from '../common/EditableLabel'
import Modal from '../common/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCross } from '@fortawesome/free-solid-svg-icons'

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
    this.handleOnCreate = this.handleOnCreate.bind(this)
    this.handleDeletePage = this.handleDeletePage.bind(this)
    this.handleOnDeleteClick = this.handleOnDeleteClick.bind(this)
    this.handleOnCreateNewPageClick = this.handleOnCreateNewPageClick.bind(this)
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.getCurrentIntegration = this.getCurrentIntegration.bind(this)
    this.handleOnHTMLEditorPaste = this.handleOnHTMLEditorPaste.bind(this)
    this.handleChoosePostSubmissionPage =
      this.handleChoosePostSubmissionPage.bind(this)
    this.handleSetTyPage = this.handleSetTyPage.bind(this)
    this.handleOnHTMLEditorKeyDown = this.handleOnHTMLEditorKeyDown.bind(this)
    this.organizePageSelectorEntries =
      this.organizePageSelectorEntries.bind(this)

    this.editor = React.createRef()

    this.state = {
      loading: true,
      targetName: '',
      postSubmissionPages: [],
      warningMessage: '',
      selectorOptions: [],
      selectedPostSubmissionPage: null,
      newPageTitle: '',
      isModalOpen: false,
      modalContent: {},
      taskFeedback: {}
    }
  }

  async loadPostSubmissionPages(seamless = false, pageId = 1) {
    // pageId is used when we want to load a specific page after the initial load
    const result = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/thankyou`,
      method: 'get'
    })

    const { data } = result

    if (data.length > 0) {
      this.setState({
        postSubmissionPages: data
      })

      if (seamless === false) {
        let selectedPostSubmissionPage = data.find((page) => page.id === pageId)
        //fall back to default page if its shared
        if (selectedPostSubmissionPage === undefined) {
          selectedPostSubmissionPage = data.find((page) => page.id === 1)
        }
        if (selectedPostSubmissionPage) {
          this.setState({
            selectedPostSubmissionPage
          })

          this.editor.current.innerHTML = selectedPostSubmissionPage.html
        }
      }
    } else {
      return this.setState({
        warningMessage: 'There has been an error loading pages.'
      })
    }
  }

  organizePageSelectorEntries() {
    const { postSubmissionPages } = this.state
    const tyPageIdIntegration = this.getCurrentIntegration()

    const selectorOptions = postSubmissionPages.map((page) => {
      const activePage =
        tyPageIdIntegration !== false && tyPageIdIntegration.value === page.id

      if (page.id === 1) {
        return {
          display:
            'Default' +
            (activePage || !tyPageIdIntegration ? ' - (Active)' : ''),
          value: page.id
        }
      }

      return {
        display:
          page.title +
          ' - ' +
          (activePage ? '(Active) - ' : '') +
          (page.updated_at
            ? moment(page.updated_at).format('YYYY-MM-DD HH:mm')
            : moment(page.created_at).format('YYYY-MM-DD HH:mm')),
        value: page.id
      }
    })

    return selectorOptions
  }

  async componentDidMount() {
    if (this.editor.current === null) {
      return
    }

    this.props.setAdditionalSaveFunction(() => this.handleOnSave())

    const tyPageIdIntegration = this.getCurrentIntegration()

    let pageIdToBeLoaded = 1

    if (tyPageIdIntegration !== false) {
      pageIdToBeLoaded = tyPageIdIntegration.value
    }

    await this.loadPostSubmissionPages(false, pageIdToBeLoaded)
  }

  async handleSetTyPage(e) {
    if (this.props.canEdit) {
      const { selectedPostSubmissionPage } = this.state

      let unselecting = false

      if (e.target.checked === false) {
        unselecting = true
      }

      if (unselecting === true) {
        this.props.setIntegration({
          type: 'tyPageId',
          value: 1
        })
        return
      }

      this.props.setIntegration({
        type: 'tyPageId',
        value: selectedPostSubmissionPage.id
      })
    }
  }

  componentWillUnmount() {
    this.props.setAdditionalSaveFunction(null)
  }

  async handleOnCreate() {
    if (this.props.canEdit) {
      const { newPageTitle, postSubmissionPages } = this.state

      const data = {
        title: newPageTitle,
        id: null,
        html: postSubmissionPages[0].html
      }

      if (data.title === '') {
        data.title = 'Untitled'
      }

      const saveResult = await api({
        resource: `/api/users/${this.props.generalContext.auth.user_id}/thankyou`,
        method: 'post',
        body: data
      })

      await this.loadPostSubmissionPages(false, saveResult.data.tyPageId || 1)

      const taskFeedback = {}

      if (saveResult.data.tyPageId !== undefined) {
        taskFeedback.message = 'Page created successfully.'
      } else {
        taskFeedback.message = 'There has been an error creating the page.'
      }

      taskFeedback.success = saveResult.success

      this.setState({
        isModalOpen: false,
        modalContent: {},
        newPageTitle: '',
        taskFeedback
      })

      setTimeout(() => {
        this.setState({
          taskFeedback: {}
        })
      }, 2000)
    }
  }

  async handleOnSave() {
    if (this.props.canEdit) {
      const { selectedPostSubmissionPage } = this.state

      let id = selectedPostSubmissionPage.id

      if (id <= 1) {
        return
      }

      const html = this.editor.current.innerHTML

      const data = {
        title: selectedPostSubmissionPage.title,
        html,
        id
      }

      if (data.title === '') {
        data.title = 'Untitled'
      }

      const saveResult = await api({
        resource: `/api/users/${this.props.generalContext.auth.user_id}/thankyou`,
        method: 'post',
        body: data
      })

      const taskFeedback = {}

      if (saveResult.data.tyPageId !== undefined) {
        taskFeedback.message = 'Page saved successfully.'
      } else {
        taskFeedback.message = 'There has been an error saving the page.'
      }

      await this.loadPostSubmissionPages(true)

      taskFeedback.success = saveResult.success

      this.setState({
        isModalOpen: false,
        modalContent: {},
        taskFeedback
      })

      setTimeout(() => {
        this.setState({
          taskFeedback: {}
        })
      }, 2000)
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

  async handleOnCreateNewPageClick() {
    const savedFormExists = this.props.form.id !== null

    if (savedFormExists === false) {
      return
    }

    if (this.props.canEdit) {
      const modalContent = {
        header: 'Create new thank you page',
        status: 'information'
      }

      modalContent.dialogue = {
        inputMaxLength: 128,
        abortText: 'Cancel',
        abortClick: this.handleCloseModalClick,
        positiveText: 'Create',
        positiveClick: () => this.handleOnCreate(),
        inputValue: () => {
          return this.state.newPageTitle
        },
        inputOnChange: (e) =>
          this.handleTyPageTitleChange(undefined, undefined, e)
      }

      modalContent.content = <div>Please specify a name for the new page</div>

      this.setState({ modalContent, isModalOpen: true })
    }
  }

  handleOnHTMLEditorPaste(e) {
    e.preventDefault()
    if (this.props.canEdit) {
      const text = e.clipboardData.getData('text/plain')

      document.execCommand('insertHTML', false, text)
    }
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

    const { data } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/thankyou`,
      body: {
        id: selectedPostSubmissionPage.id
      },
      method: 'delete'
    })

    if (data.success === true) {
      await this.loadPostSubmissionPages()

      return this.handleCloseModalClick()
    } else {
      if (data.error === 'forms_using_this_page') {
        const { formsUsingThisPage } = data

        const modalContent = {
          header: 'Could not delete page',
          status: 'error'
        }

        modalContent.dialogue = {
          abortText: 'Close',
          abortClick: this.handleCloseModalClick
        }

        modalContent.content = (
          <div>
            The page you are trying to delete is currently in use by the
            following forms:
            <ul>
              {formsUsingThisPage.map((form, i) => (
                <li className="formsUsingThisPage-listItem" key={i}>
                  • {form}
                </li>
              ))}
            </ul>
            Please remove the page from the forms listed above before deleting
            it.
          </div>
        )

        this.setState({ modalContent, isModalOpen: true })
      }
    }
  }

  handleChoosePostSubmissionPage(elem, e) {
    if (this.props.canEdit) {
      const { postSubmissionPages } = this.state

      const selectedPostSubmissionPage = postSubmissionPages.filter(
        (page) => page.id === parseInt(e.target.value)
      )[0]

      this.setState({ selectedPostSubmissionPage })
      this.editor.current.innerHTML = selectedPostSubmissionPage.html
    }
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

  handleTyPageTitleChange(id, value, e) {
    if (this.props.canEdit) {
      // e is only passed when the function is called from the modal
      if (e) {
        const newTitle = e.target.value
        this.setState({ newPageTitle: newTitle })
      } else {
        const { selectedPostSubmissionPage } = this.state
        selectedPostSubmissionPage.title = value

        this.setState({ selectedPostSubmissionPage })
      }
    }
  }

  handleTyPageTextChange(e) {
    if (this.props.canEdit) {
      this.props.setIntegration({
        type: 'tyPageText',
        value: e.target.innerText
      })
    }
  }

  handleEvaluationTextChange(e, property) {
    if (this.props.canEdit) {
      const text = e.target.innerText
      const integration = { type: 'evaluationPageLabels' }
      integration[property] = text
      this.props.setIntegration(integration)
    }
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
    const { selectedPostSubmissionPage, taskFeedback } = this.state

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
                    options: this.organizePageSelectorEntries(),
                    value: selectedPostSubmissionPage?.id || 1
                  }
                ]
              }
            }}
          />
          <button
            className="postSubmissionPage-save"
            onClick={this.handleOnCreateNewPageClick}>
            Create New Page
          </button>
        </div>
        <div className="custom-pages-manager">
          <div className="pageIdentifier">
            <div className="custom-page-title">
              <EditableLabel
                canEdit={this.props.canEdit}
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
                handleFieldChange={(elem, e) => this.handleSetTyPage(e)}
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
                    Delete Page
                  </button>
                </>
              )}
            </div>
          </div>
          {taskFeedback.message ? (
            <span
              className={
                'task-feedback ' +
                (taskFeedback.success === false ? 'error' : '')
              }>
              {taskFeedback.success === true ? (
                <FontAwesomeIcon icon={faCheck} />
              ) : (
                <FontAwesomeIcon icon={faCross} />
              )}
              &nbsp;&nbsp;{taskFeedback.message}
            </span>
          ) : null}
        </div>
      </>
    )
  }

  render() {
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
        <div className="postSubmission-message">
          Here you can customize {mode} Page. Don&apos;t forget to save after
          making changes!
        </div>
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
