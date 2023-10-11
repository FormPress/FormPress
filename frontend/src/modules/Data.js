import React, { Component } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import _ from 'lodash'
import Moment from 'react-moment'
import Modal from './common/Modal'
import { api } from '../helper'
import Table from './common/Table'
import * as Elements from './elements'
import Renderer from './Renderer'
import { createBrowserHistory } from 'history'
import {
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts'

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

export default class Data extends Component {
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
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms`
    })
    const formsWithShared = data.filter((form) => {
      if (form.permissions === undefined) {
        return true
      } else if (form.permissions.data) {
        return true
      } else {
        return false
      }
    })
    const forms = formsWithShared
    this.setLoadingState('forms', false)
    this.setState({ forms }, this.componenDidMountWorker)
  }

  async updateSubmissions(form_id, initLoad = false, endOfList = false) {
    this.setLoadingState('submissions', true)
    await this.setState({
      selectedFormId: form_id,
      selectedSubmissionId: null,
      entries: []
    })

    const { cursor, fetchNext, showUnread, submissionsPerPage } = this.state

    let submissionCursor = cursor.next
    if (!fetchNext) {
      submissionCursor = cursor.prev
    }

    //Extract number submissionPerPage (25) from string 'Show 25 submissions'
    const words = submissionsPerPage.split(' ')
    const perPage = parseInt(words[1])

    let resource = `/api/users/${this.props.generalContext.auth.user_id}/forms/${form_id}/submissions`
    resource += `?orderBy=created_at&limit=${perPage}`
    if (!fetchNext) {
      resource += `&prevPage=true`
    }
    if (submissionCursor) {
      resource += `&cursor=${submissionCursor}`
    }
    if (showUnread) {
      resource += '&read=0'
    }
    const { data } = await api({ resource })

    await this.setLoadingState('submissions', false)
    if (data.submissions.length === 0) {
      if (fetchNext) {
        await this.setState({
          cursor: { ...this.state.cursor, next: null }
        })
      } else {
        await this.setState({
          cursor: { ...this.state.cursor, prev: null }
        })
      }
    } else {
      this.setState({
        submissions: data.submissions,
        cursor: {
          prev: initLoad ? null : data.prevCursor,
          next: endOfList ? null : data.nextCursor
        },
        todaySubmissionCount: data.todaySubmissionCount,
        totalSubmissionCount: data.submissionCount
      })
    }
  }

  async updateSubmissionStatistics(form_id) {
    const { data } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${form_id}/statistics`
    })

    this.setState({
      statistics: data
    })
  }

  componentDidMount() {
    // clear location state on page refresh
    const history = createBrowserHistory()
    if (history.location.state) {
      let state = undefined
      history.replace({ ...history.location, state })
    }

    this.updateForms()
  }

  componenDidMountWorker() {
    if (
      this.props.location.state !== null &&
      this.props.location.state?.form_id
    ) {
      const { form_id } = this.props.location.state

      let selectedFormId,
        selectedFormPublishedId,
        selectedFormSelectedPublishedVersion

      const matchingForm = this.state.forms.find((form) => form.id === form_id)

      if (matchingForm) {
        selectedFormId = form_id
        selectedFormPublishedId = matchingForm.published_id
        selectedFormSelectedPublishedVersion = matchingForm.published_version
      }

      this.setState({
        selectedFormId,
        selectedFormPublishedId,
        selectedFormPublishedVersion: selectedFormSelectedPublishedVersion,
        selectedFormSelectedPublishedVersion
      })

      this.updateSubmissionStatistics(
        form_id,
        selectedFormSelectedPublishedVersion
      )
      this.updateSubmissions(form_id, true)
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      formSelectorOpen: false,
      forms: [],
      selectedFormId: null,
      selectedFormPublishedId: null,
      selectedFormPublishedVersion: null,
      selectedFormSelectedPublishedVersion: null,
      selectedFormSelectedPublishedVersionStatistics: [],
      selectedSubmission: null,
      selectedSubmissionForm: null,
      selectedSubmissionIds: [],
      statistics: {},
      submissions: [],
      cursor: { prev: null, next: null },
      submissionsPerPage: 'Show 10 submissions',
      submissionsPerPageOptions: [
        'Show 10 submissions',
        'Show 25 submissions',
        'Show 50 submissions',
        'Show 100 submissions'
      ],
      showUnread: false,
      fetchNext: true,
      totalSubmissionCount: 0,
      todaySubmissionCount: 0,
      entries: [],
      loading: {
        forms: false,
        submissions: false,
        entries: false
      },
      parseError: false,
      isModalOpen: false,
      modalContent: {}
    }

    this.handleFormClick = this.handleFormClick.bind(this)
    this.handleSubmissionClick = this.handleSubmissionClick.bind(this)
    this.handleCSVExportClick = this.handleCSVExportClick.bind(this)
    this.handleCSVExportAllClick = this.handleCSVExportAllClick.bind(this)
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.handleUnreadFilterToggle = this.handleUnreadFilterToggle.bind(this)
    this.componenDidMountWorker = this.componenDidMountWorker.bind(this)
    this.handleNextClick = this.handleNextClick.bind(this)
    this.handlePrevClick = this.handlePrevClick.bind(this)
    this.handleSubmissionsPerPageChange = this.handleSubmissionsPerPageChange.bind(
      this
    )
  }

  async handleFormClick(form) {
    await this.setState({
      formSelectorOpen: false,
      selectedFormId: form.id,
      selectedFormPublishedId: form.published_id,
      selectedFormPublishedVersion: form.published_version,
      selectedFormSelectedPublishedVersion: form.published_version,
      selectedSubmissionIds: [],
      cursor: { prev: null, next: null },
      fetchNext: true,
      showUnread: false,
      submissionsPerPage: 'Show 10 submissions'
    })
    this.updateSubmissionStatistics(form.id, form.published_version)
    this.updateSubmissions(form.id, true)
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

  async handleSubmissionClick(submission) {
    const { showUnread, submissions } = this.state
    const { id, form_id, version } = submission
    let selectedSubmissionForm

    if (version === 0) {
      selectedSubmissionForm = await api({
        resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${form_id}/`
      })
      selectedSubmissionForm = selectedSubmissionForm.data
    } else {
      selectedSubmissionForm = await api({
        resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${form_id}/${version}`
      })
      selectedSubmissionForm = selectedSubmissionForm.data
    }

    this.setLoadingState('entries', true)
    this.setState({
      entries: [],
      selectedSubmissionId: id,
      selectedSubmissionForm: selectedSubmissionForm
    })

    const { data } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${selectedSubmissionForm.form_id}/submissions/${id}/entries`
    })

    this.setLoadingState('entries', false)
    this.setState({ entries: data })

    // Do not update and refetch submissions as it is already read!
    if (submission.read === 1) {
      return
    }

    await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${form_id}/submissions/${id}`,
      method: 'put',
      body: JSON.stringify({
        ...submission,
        read: 1
      })
    })

    // If filter is active, send request to backend but do not update state
    if (showUnread) {
      document.querySelector(`.s_${id}`).classList.add('read')
    } else {
      submissions.find((submission) => submission.id === id).read = 1

      this.setState({ submissions })
    }
  }
  async handleCSVExportClick(submissionIds) {
    const form_id = this.state.selectedFormId
    const { data } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${form_id}/CSVExport`,
      method: 'post',
      body: {
        submissionIds: submissionIds
      }
    })

    download(data.filename, data.content)
    this.setState({ selectedSubmissionIds: [] })
  }

  async handleCSVExportAllClick() {
    await this.handleCSVExportClick([])
  }

  handleDeleteSubmissionClick(e) {
    e.preventDefault()
    const { selectedSubmissionIds } = this.state
    const modalContent = {
      header:
        selectedSubmissionIds.length > 1
          ? `Delete ${selectedSubmissionIds.length} submissions?`
          : 'Delete submission?',
      status: 'warning'
    }

    modalContent.dialogue = {
      negativeText: 'Delete',
      negativeClick: this.deleteSubmission.bind(this),
      abortText: 'Cancel',
      abortClick: this.handleCloseModalClick
    }

    modalContent.content = (
      <div>
        {selectedSubmissionIds.length > 1
          ? `Selected submissions and the attached file uploads will be `
          : 'Selected submission and the attached file uploads will be '}
        <span
          style={{
            color: '#be0000',
            fontWeight: 'bold',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            wordBreak: 'break-all'
          }}>
          PERMANENTLY
        </span>{' '}
        {selectedSubmissionIds.length > 1
          ? 'deleted. Are you sure you want to delete selected submissions?'
          : 'deleted. Are you sure you want to delete selected submission?'}
      </div>
    )

    this.setState({ modalContent, isModalOpen: true })
  }

  async deleteSubmission() {
    const {
      selectedFormId,
      submissions,
      selectedSubmissionIds,
      entries,
      cursor
    } = this.state

    const { data } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${selectedFormId}/deleteSubmission`,
      method: 'delete',
      body: {
        submissionIds: selectedSubmissionIds
      }
    })

    let modalContent = {}
    if (data.success === true) {
      modalContent = {
        content: 'Submission successfully deleted!',
        status: 'success',
        header: 'Success!'
      }
      this.setState({ modalContent })

      //Calculate how many of the deleted submissions were submitted today
      const numberOfSubmissionsToday = getNumberOfSubmissionsToday(
        submissions.filter((submission) =>
          selectedSubmissionIds.includes(submission.id)
        )
      )

      await this.setState({
        submissions: submissions.filter(
          (submission) => selectedSubmissionIds.includes(submission.id) !== true
        ),
        totalSubmissionCount:
          this.state.totalSubmissionCount - selectedSubmissionIds.length,
        todaySubmissionCount:
          this.state.todaySubmissionCount - numberOfSubmissionsToday
      })

      if (
        entries.length > 0 &&
        selectedSubmissionIds.includes(entries[0].submission_id)
      ) {
        this.setState({ entries: [] })
      }

      if (this.state.submissions.length === 0) {
        if (cursor.prev === null) {
          this.setState(
            {
              cursor: { prev: null, next: null },
              fetchNext: true
            },
            () => {
              this.updateSubmissions(selectedFormId, true)
            }
          )
        } else if (cursor.next === null) {
          this.setState(
            {
              fetchNext: false
            },
            () => this.updateSubmissions(selectedFormId, false, true)
          )
        } else {
          this.setState(
            {
              fetchNext: false
            },
            () => this.updateSubmissions(selectedFormId)
          )
        }
      }
      this.setState({ selectedSubmissionIds: [] })
    } else {
      modalContent = {
        content:
          'There has been an error deleting submissions. Please contact support.',
        status: 'error',
        header: 'Error'
      }
      this.setState({ modalContent })
      console.log('ERROR WHILE DELETING SUBMISSION', data)
    }
  }

  handleCloseModalClick() {
    this.setState({
      isModalOpen: false,
      modalContent: {},
      formSelectorOpen: false
    })
  }

  handleUnreadFilterToggle() {
    let { showUnread, selectedFormId } = this.state

    this.setState(
      {
        selectedSubmissionIds: [],
        showUnread: !showUnread,
        cursor: { prev: null, next: null },
        fetchNext: true
      },
      () => {
        this.updateSubmissions(selectedFormId, true)
      }
    )
  }

  handleNextClick() {
    this.setState({ fetchNext: true }, () => {
      this.updateSubmissions(this.state.selectedFormId)
    })
  }

  handlePrevClick() {
    this.setState({ fetchNext: false }, () => {
      this.updateSubmissions(this.state.selectedFormId)
    })
  }

  handleSubmissionsPerPageChange(elem, e) {
    const perPage = e.target.value
    this.setState(
      {
        submissionsPerPage: perPage,
        cursor: { prev: null, next: null },
        fetchNext: true
      },
      () => {
        this.updateSubmissions(this.state.selectedFormId, true)
      }
    )
  }

  CustomTooltipForPieChart = ({ active, payload, label }) => {
    if (active) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: '#ffff',
            padding: '5px',
            border: '1px solid #cccc'
          }}>
          <label>{`${payload[0].name} : ${payload[0].value.toFixed(
            2
          )}%`}</label>
        </div>
      )
    }

    return null
  }

  CustomTooltipForBarChart = ({ active, payload, label }) => {
    if (active) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: '#ffff',
            padding: '5px',
            border: '1px solid #cccc'
          }}>
          <label>{`${payload[0].payload.name}`}</label>
        </div>
      )
    }

    return null
  }

  render() {
    const { forms, formSelectorOpen, loading, selectedFormId } = this.state
    const submissions = this.renderSubmissions()
    const entries =
      loading.entries === true ? 'Loading...' : this.renderEntries()
    let formSelectorText = 'Please select form'

    if (selectedFormId !== null && forms.length > 0) {
      const formSelector = forms.find((form) => form.id === selectedFormId)
      if (formSelector.permissions === undefined) {
        formSelectorText = formSelector.title
      } else {
        formSelectorText = (
          <>
            {formSelector.title}{' '}
            <span className="sharedform"> (shared with me) </span>
          </>
        )
      }
    }

    let tabs = [
      { name: 'submissions', text: 'Submissions', path: '/data' },
      {
        name: 'statistics',
        text: 'Statistics',
        path: '/data/statistics'
      }
    ]

    return (
      <div className="data">
        <Modal
          history={this.props.history}
          isOpen={this.state.isModalOpen}
          modalContent={this.state.modalContent}
          closeModal={this.handleCloseModalClick}
        />
        <div className="headerContainer">
          <div className="header cw grid center">
            <div className="col-1-16">
              <Link to="/forms" className="back">
                <FontAwesomeIcon icon={faChevronLeft} />
              </Link>
            </div>
            <div className="col-15-16 mainTabs">
              {tabs.map((item, key) => (
                <NavLink
                  key={key}
                  exact
                  to={`${item.path}`}
                  activeClassName="selected">
                  {item.text}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
        <div
          className={`formSelectorContainer center ${
            formSelectorOpen ? 'open' : 'closed'
          }`}
          onClick={() => {
            this.setState({
              formSelectorOpen: !formSelectorOpen,
              isModalOpen: !formSelectorOpen,
              modalContent: 'backdrop'
            })
          }}>
          <div className="formSelector cw center grid">
            <div className="fl formSelectorContent">{formSelectorText}</div>
            <div className="fl down">
              <FontAwesomeIcon icon={faChevronDown} />
            </div>
          </div>
          <div
            className={`formSelectorOptions cw center grid ${
              formSelectorOpen ? '' : 'dn'
            }`}>
            <div className="col-16-16">
              <ul>
                {forms.map((form, index) => (
                  <li
                    key={index}
                    onClick={this.handleFormClick.bind(this, form)}>
                    <>
                      {form.permissions === undefined ? (
                        form.title
                      ) : (
                        <>
                          {form.title}{' '}
                          <span className="sharedform"> (shared with me) </span>
                        </>
                      )}
                    </>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {this.props.history.location.pathname.endsWith('/data') ? (
          <div className="cw center grid dataContent">
            <div className="submissionSelector col-5-16">{submissions}</div>
            <div className="entriesViewer col-11-16">{entries}</div>
          </div>
        ) : (
          <div className="cw center grid dataStatistics">
            <div className="selectedSubmissionStatistics col-16-16">
              {_.isEmpty(this.state.statistics) === false ? (
                <div className="submissionResponsesContainer">
                  <div className="submissionResponsesDetails">
                    <div>
                      <div className="detailLabel">
                        {this.state.statistics.responses}
                      </div>
                      <div className="detailSublabel">Submission(s)</div>
                    </div>
                    <div>
                      <div className="detailLabel">
                        {moment()
                          .startOf('day')
                          .seconds(
                            this.state.statistics.average_completion_time
                          )
                          .format('mm:ss')}
                      </div>
                      <div className="detailSublabel">
                        Average completion time
                      </div>
                    </div>

                    <div>
                      <div className="detailLabel">Active</div>
                      <div className="detailSublabel">Status</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="noData">No submission(s)</div>
              )}
              {_.isEmpty(this.state.statistics) === false ? (
                <div className="statisticsContainer">
                  {this.state.statistics.elements.map((question, i) => {
                    if (question.chartType === 'lastFive') {
                      return (
                        <div className="questionContainer" key={i}>
                          <div className="question">{question.label}</div>
                          <div className="response_container">
                            <div className="response_count_container">
                              <div className="response_count_title">
                                {question.responseCount}
                              </div>
                              <div className="response_count">
                                Submission(s)
                              </div>
                            </div>
                            <div className="last_responses_container">
                              <div className="last_responses_title">
                                Last Submission(s)
                              </div>
                              <div className="last_responses">
                                {question.chartItems.map((response, index) => {
                                  return (
                                    <div key={index} title={response}>
                                      &quot;{response}&quot;
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    } else if (question.chartType === 'pieChart') {
                      question.label = question.label
                        .replace(/<span(.*?)>(.*?)<\/span>/, '')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&amp;/g, ' ')
                        .replace(/(<([^>]+)>)/gi, '')
                        .trim()
                      question.chartItems.filter((chartItem) => {
                        return (chartItem.name = chartItem.name
                          .replace(/<span(.*?)>(.*?)<\/span>/, '')
                          .replace(/&nbsp;/g, ' ')
                          .replace(/&amp;/g, ' ')
                          .replace(/(<([^>]+)>)/gi, '')
                          .trim())
                      })
                      return (
                        <div className="questionContainer" key={i}>
                          <div
                            className="question"
                            dangerouslySetInnerHTML={{
                              __html: question.label
                            }}></div>
                          <PieChart width={730} height={300}>
                            <Pie
                              data={question.chartItems}
                              color="#000000"
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              fill="#8884d8">
                              {question.chartItems.map((chartItem, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={chartItem.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              content={<this.CustomTooltipForPieChart />}
                            />
                            <Legend
                              layout="vertical"
                              verticalAlign="text-bottom"
                              align="left"
                            />
                          </PieChart>
                        </div>
                      )
                    } else if (question.chartType === 'barChart') {
                      return (
                        <div className="questionContainer" key={i}>
                          <div className="question">{question.label}</div>
                          <BarChart
                            width={730}
                            height={300}
                            data={question.chartItems}
                            barCategoryGap={5}>
                            <XAxis
                              type="category"
                              stroke="#000000"
                              dataKey="nameForXaxis"
                            />
                            <YAxis
                              type="number"
                              stroke="#000000"
                              dataKey="value"
                            />
                            <Tooltip
                              content={<this.CustomTooltipForBarChart />}
                            />
                            <Bar
                              dataKey="value"
                              fill="#00a0fc"
                              stroke="#000000"
                              strokeWidth={1}
                              barSize={20}>
                              {question.chartItems.map((chartItem, index) => (
                                <Cell key={index} fill={chartItem.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </div>
                      )
                    } else if (question.chartType === 'netPromoterScore') {
                      return (
                        <div className="questionContainer" key={i}>
                          <div className="question">{question.label}</div>
                          <div className="response_container">
                            <div className="response_count_container">
                              <div className="response_count_title">
                                {question.responseCount}
                              </div>
                              <div className="response_count">Response(s)</div>
                            </div>
                            <div className="last_responses_container">
                              <div className="last_responses_title">
                                Net Promoter Score
                              </div>
                              <div className="last_responses">
                                <div title={question.netPromoterScore}>
                                  &quot;{question.netPromoterScore.toFixed(2)}
                                  &quot;
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    } else if (question.chartType === 'average') {
                      return (
                        <div className="questionContainer" key={i}>
                          <div className="question">{question.label}</div>
                          <div className="response_container">
                            <div className="response_count_container">
                              <div className="response_count_title">
                                {question.responseCount}
                              </div>
                              <div className="response_count">Response(s)</div>
                            </div>
                            <div className="last_responses_container">
                              <div className="last_responses_title">
                                Average
                              </div>
                              <div className="last_responses">
                                <div title={question.average}>
                                  &quot;{question.average.toFixed(2)}
                                  &quot;
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    )
  }

  renderSubmissions() {
    const {
      submissions,
      selectedSubmissionId,
      selectedSubmissionIds,
      selectedFormId,
      loading,
      cursor,
      showUnread,
      totalSubmissionCount,
      todaySubmissionCount
    } = this.state
    let checkAllProps = { checked: true }
    let options = Array.from(
      Array(this.state.selectedFormPublishedVersion).keys(),
      (x) => x + 1
    )
    options.pop()
    options = options.reverse()

    if (submissions.length > 0) {
      for (const { id } of submissions) {
        if (selectedSubmissionIds.includes(id) === false) {
          checkAllProps.checked = false
          break
        }
      }
    }

    if (selectedFormId === null) {
      return <div className="noData">No data</div>
    }

    const csvExportClassNames = ['csvExportButton']
    let csvExportButtonText = 'Export CSV'

    const deleteSubmissionButtonClassNames = ['deleteSubmissionButton']
    let deleteSubmissionButtonText = 'Delete'

    if (selectedSubmissionIds.length === 0) {
      csvExportClassNames.push('disabled')
      deleteSubmissionButtonClassNames.push('disabled')
    } else {
      csvExportButtonText = `Export CSV (${selectedSubmissionIds.length})`
      deleteSubmissionButtonText = `Delete (${selectedSubmissionIds.length})`
    }

    return [
      <div className="submissionActions" key="actions">
        <div className="submissionInfo">
          {totalSubmissionCount || '0'}
          {totalSubmissionCount > 1
            ? ' total submissions'
            : ' total submission'}
          . <br />
          {todaySubmissionCount || '0'}
          {todaySubmissionCount > 1 ? ' submissions' : ' submission'} today.
        </div>
        <div className="submissionControlButtons">
          <div className="buttonContainer">
            <button
              className={deleteSubmissionButtonClassNames.join(' ')}
              {...(selectedSubmissionIds.length !== 0 && {
                onClick: this.handleDeleteSubmissionClick.bind(this)
              })}>
              {deleteSubmissionButtonText}
            </button>
          </div>
          <div className="buttonContainer">
            <button
              className={csvExportClassNames.join(' ')}
              {...(selectedSubmissionIds.length !== 0 && {
                onClick: () =>
                  this.handleCSVExportClick(this.state.selectedSubmissionIds)
              })}>
              {csvExportButtonText}
            </button>
          </div>
          <div className="buttonContainer">
            <button
              className="csvExportButton"
              onClick={this.handleCSVExportAllClick}>
              Export All CSV
            </button>
          </div>
        </div>
      </div>,
      <div key="unreadSwitchContainer" className="unreadSwitchContainer">
        <article>
          <label className="unreadSwitch" id="unreadSwitch">
            <input
              type="checkbox"
              name="unreadSwitch"
              checked={showUnread}
              value="unread"
              onChange={this.handleUnreadFilterToggle}
            />
            <span className="slider round" />
          </label>
          <label
            key="unreadSwitchLabel"
            className={`unreadSwitchLabel ${showUnread ? ' active' : ''} `}>
            Show unread only
          </label>
        </article>
      </div>,
      <div key="pagination-controls" className="pagination-controls">
        <div className="navigation">
          <span
            className={`prev ${cursor.prev === null ? 'disabled' : ''}`}
            onClick={cursor.prev === null ? undefined : this.handlePrevClick}>
            Prev
          </span>
          <span
            className={`next ${cursor.next === null ? 'disabled' : ''}`}
            onClick={cursor.next === null ? undefined : this.handleNextClick}>
            Next
          </span>
        </div>
        <Renderer
          className="pagination-item-per-page"
          theme="infernal"
          handleFieldChange={this.handleSubmissionsPerPageChange}
          form={{
            props: {
              elements: [
                {
                  id: 1,
                  type: 'Dropdown',
                  options: this.state.submissionsPerPageOptions,
                  value: this.state.submissionsPerPage,
                  placeholder: false
                }
              ]
            }
          }}
        />
      </div>,
      loading.submissions === false && submissions.length > 0 ? (
        <Table
          key="table"
          onTrClick={this.handleSubmissionClick}
          getTrClassName={(submission) => {
            let classNames = ['submission', `s_${submission.id}`]
            if (selectedSubmissionId === submission.id) {
              classNames.push('selected')
            }

            if (submission.read === 1) {
              classNames.push('read')
            }

            return classNames.join(' ')
          }}
          columns={[
            {
              label: (
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked === true) {
                      this.setState((prevState) => ({
                        selectedSubmissionIds: [
                          ...prevState.selectedSubmissionIds,
                          ...submissions
                            .map((submission) => submission.id)
                            .filter(
                              (id) =>
                                !prevState.selectedSubmissionIds.includes(id)
                            )
                        ]
                      }))
                    } else {
                      const submissionIdsToRemove = submissions.map(
                        (submission) => submission.id
                      )
                      this.setState((prevState) => ({
                        selectedSubmissionIds: prevState.selectedSubmissionIds.filter(
                          (id) => !submissionIdsToRemove.includes(id)
                        )
                      }))
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
              label: 'Submission Date',
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
      ) : loading.submissions === true ? (
        'Loading...'
      ) : (
        'No submissions'
      )
    ]
  }

  renderEntryElements(entry) {
    const { selectedSubmissionForm } = this.state
    try {
      const question = selectedSubmissionForm.props.elements.find(
        (element) => element.id === entry.question_id
      )

      try {
        const parsed = JSON.parse(entry.value)
        entry.value = parsed
      } catch (e) {
        // do nothing
      }
      return Elements[question.type].renderDataValue(entry, question)
    } catch (e) {
      console.log(e)
      return 'This data is corrupted.'
    }
  }

  renderEntries() {
    const { entries, selectedSubmissionForm, parseError } = this.state

    if (parseError === false) {
      if (entries.length === 0) {
        return null
      }

      const getLabel = (question_id) => {
        const matchingQuestion = selectedSubmissionForm.props.elements.filter(
          (element) => element.id === question_id
        )

        if (matchingQuestion.length > 0) {
          return matchingQuestion[0].label
        } else {
          return 'Deleted Question'
        }
      }

      return entries.map((entry, index) => {
        return (
          <div key={index} className="entry">
            <div
              className="label"
              dangerouslySetInnerHTML={{
                __html: getLabel(entry.question_id)
              }}></div>
            <div className="value">{this.renderEntryElements(entry)}</div>
          </div>
        )
      })
    } else {
      return <div className="entry">This submission can not parse.</div>
    }
  }
}
