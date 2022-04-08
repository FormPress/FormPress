import React, { Component } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import Moment from 'react-moment'
import Modal from './common/Modal'
import { api } from '../helper'
import AuthContext from '../auth.context'
import Table from './common/Table'
import * as Elements from './elements'
import { createBrowserHistory } from 'history'

import { LineChart, Line, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
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

//dummy variables and functions start

const data1 = [];
const data2 = [];

const rand = 300;
for (let i = 0; i < 7; i++) {
  let d = {
    year: 2000 + i,
    value: { x: Math.random() * (rand + 50) + 100 }
  };

  data1.push(d);
}

for (let i = 0; i < 7; i++) {
  let d = {
    year: 2000 + i,
    value: { x: Math.random() * (rand + 50) + 100 }
  };

  data2.push(d);
}

const getXValueData1 = (data) => {
  const index = data1.findIndex((obj) => obj.year === data.year);
  return data1[index].value.x;
};

const getXValueData2 = (data) => {
  const index = data2.findIndex((obj) => obj.year === data.year);
  return data2[index].value.x;
};

//dummy variables and functions end

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

class Data extends Component {
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
      resource: `/api/users/${this.props.auth.user_id}/forms`
    })

    const forms = data

    this.setLoadingState('forms', false)
    this.setState({ forms })
  }

  async updateSubmissionsSeamless(form_id) {
    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/submissions?orderBy=created_at&desc=true`
    })

    this.setState({ submissions: data })
  }

  async updateSubmissions(form_id) {
    this.setLoadingState('submissions', true)
    this.setState({
      submissions: [],
      selectedFormId: form_id,
      selectedSubmissionId: null,
      entries: []
    })

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/submissions?orderBy=created_at&desc=true`
    })

    let submissions = data
    const { submissionFilterSelectors } = this.state
    const filterActive = !Object.values(submissionFilterSelectors).every(
      (selector) => selector === false
    )

    if (filterActive) {
      let submissionFilterParams = {}

      if (submissionFilterSelectors.showUnread) {
        submissionFilterParams.read = 0
      }
      submissions = submissions.filter((submission) => {
        let result = true
        Object.keys(submissionFilterParams).forEach((key) => {
          if (submissionFilterParams[key] !== undefined) {
            if (submission[key] !== submissionFilterParams[key]) {
              result = false
            }
          }
        })

        return result
      })
    }

    this.setLoadingState('submissions', false)
    this.setState({ submissions })
  }

  componentDidMount() {
    // clear location state on page refresh
    const history = createBrowserHistory()
    if (history.location.state) {
      let state = undefined
      history.replace({ ...history.location, state })
    }

    if (this.props.location.state?.form_id) {
      const { form_id, submissionFilterSelectors } = this.props.location.state

      this.updateForms()

      this.setState({
        selectedFormId: form_id
      })

      if (submissionFilterSelectors) {
        this.setState({
          submissionFilterSelectors
        })
      }

      this.updateSubmissions(form_id)
    } else {
      this.updateForms()
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      formSelectorOpen: false,
      submissionFilterSelectors: { showUnread: false },
      forms: [],
      selectedFormId: null,
      selectedSubmission: null,
      selectedSubmissionForm: null,
      selectedSubmissionIds: [],
      submissions: [],
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
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.handleUnreadFilterToggle = this.handleUnreadFilterToggle.bind(this)
  }

  handleFormClick(form) {
    this.setState({ formSelectorOpen: false })
    this.updateSubmissions(form.id)
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
    const { submissionFilterSelectors } = this.state
    const { id, form_id, version } = submission
    let selectedSubmissionForm

    if (version === 0) {
      selectedSubmissionForm = await api({
        resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/`
      })
      selectedSubmissionForm = selectedSubmissionForm.data
    } else {
      selectedSubmissionForm = await api({
        resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/${version}`
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
      resource: `/api/users/${this.props.auth.user_id}/forms/${selectedSubmissionForm.form_id}/submissions/${id}/entries`
    })

    try {
      for (let dataContent of data) {
        for (let element of this.state.selectedSubmissionForm.props.elements) {
          if (
            element.id === dataContent.question_id &&
            (element.type === 'Checkbox' || element.type === 'Radio')
          ) {
            dataContent.value = Elements[element.type].dataContentOrganizer(
              dataContent.value,
              element
            )
          }
        }
      }
      this.setState({ parseError: false })
    } catch {
      this.setState({ parseError: true })
    }

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

    const filterActive = !Object.values(submissionFilterSelectors).every(
      (selector) => selector === false
    )

    // If filter is active, send request to backend but do not update state
    if (filterActive) {
      document.querySelector(`.s_${id}`).classList.add('read')
    } else {
      this.updateSubmissionsSeamless(form_id)
    }
  }

  async handleCSVExportClick() {
    const form_id = this.state.selectedFormId
    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form_id}/CSVExport`,
      method: 'post',
      body: {
        submissionIds: this.state.selectedSubmissionIds
      }
    })

    download(data.filename, data.content)
    this.setState({ selectedSubmissionIds: [] })
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
      entries
    } = this.state

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${selectedFormId}/deleteSubmission`,
      method: 'delete',
      body: {
        submissionIds: this.state.selectedSubmissionIds
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

      this.setState({
        submissions: submissions.filter(
          (submission) => selectedSubmissionIds.includes(submission.id) !== true
        )
      })

      if (selectedSubmissionIds.includes(entries[0].submission_id)) {
        this.setState({ entries: [] })
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
    this.setState({ isModalOpen: false, modalContent: {} })
  }

  handleUnreadFilterToggle(e) {
    const { selectedFormId, submissionFilterSelectors } = this.state
    e.value = !e.value
    submissionFilterSelectors.showUnread = e.value
    this.setState({ submissionFilterSelectors })
    this.updateSubmissions(selectedFormId)
  }

  COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  pieData = [
      {
          "name": "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32.",
          "value": 68.85
      },
      {
          "name": "Firefox",
          "value": 7.91
      },
      {
          "name": "Edge",
          "value": 6.85
      },
      {
          "name": "Internet Explorer",
          "value": 6.14
      },
      {
          "name": "Others",
          "value": 10.25
      }
  ];

  CustomTooltip = ({ active, payload, label }) => {
      if (active) {
          return (
              <div className="custom-tooltip" style={{ backgroundColor: '#ffff', padding: '5px', border: '1px solid #cccc' }}>
                  <label>{`${payload[0].name} : ${payload[0].value}%`}</label>
              </div>
          );
      }

      return null;
  };

  render() {
    const { forms, formSelectorOpen, loading, selectedFormId } = this.state
    const submissions = this.renderSubmissions()
    const entries =
      loading.entries === true ? 'Loading...' : this.renderEntries()
    let formSelectorText = 'Please select form'

    if (selectedFormId !== null && forms.length > 0) {
      formSelectorText = forms.filter((form) => form.id === selectedFormId)[0]
        .title
    }

    let tabs = [
      { name: 'responses', text: 'Responses', path: '/data' },
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
        <div className="formSelectorContainer center">
          <div
            className="formSelector cw center grid"
            onClick={() => {
              this.setState({ formSelectorOpen: !formSelectorOpen })
            }}>
            <div className="col-15-16 formSelectorContent">
              {formSelectorText}
            </div>
            <div className="col-1-16 down">
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
                    {form.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {
          this.props.history.location.pathname.endsWith('/data') ?
          <div className="cw center grid dataContent">
            <div className="submissionSelector col-5-16">{submissions}</div>
            <div className="entriesViewer col-11-16">{entries}</div>
          </div> :
          <div className="cw center grid dataStatistics">
            <div className="selectedSubmissionStatistics col-16-16">
              <div className="submissionResponsesContainer">
                <div class="submissionResponsesDetails">
                  <div>
                    <div class="detailLabel">10</div>
                    <div class="detailSublabel">Response(s)</div>
                  </div>
                  <div>
                    <div class="detailLabel">00:15</div>
                    <div class="detailSublabel">Average completion time</div>
                  </div>
                  <div>
                    <div class="detailLabel">Active</div>
                    <div class="detailSublabel">Status</div>
                  </div>
                </div>
              </div>
              <div className="statisticsContainer">
                <div className="questionContainer">
                  <div className="question">1. Question 1</div>
                  <PieChart width={730} height={300}>
                    <Pie data={this.pieData} color="#000000" dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" >
                      {
                        this.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={this.COLORS[index % this.COLORS.length]} />)
                      }
                    </Pie>
                    <Tooltip content={<this.CustomTooltip />} />
                    <Legend layout="vertical" verticalAlign="text-bottom" align="left" />
                  </PieChart>
                </div>
                <div className="questionContainer">
                  <div className="question">2. Question 2</div>
                  <LineChart
                    width={500}
                    height={300}
                    data={data2}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <Line
                      type="monotone"
                      dataKey={getXValueData1}
                      stroke="#8884d8"
                      dot={false}
                    />
                    <Line type="monotone" dataKey={getXValueData2} stroke="red" dot={false} />
                    <XAxis dataKey="year" />
                    <YAxis />
                  </LineChart>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }

  renderSubmissions() {
    const {
      submissions,
      selectedSubmissionId,
      selectedSubmissionIds,
      selectedFormId,
      submissionFilterSelectors,
      loading
    } = this.state
    let checkAllProps = { checked: true }

    for (const { id } of submissions) {
      if (selectedSubmissionIds.includes(id) === false) {
        checkAllProps.checked = false
        break
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
      <div className="submissionActions grid" key="actions">
        <div className="col-6-16">
          {submissions.length} total submission(s). <br />
          {getNumberOfSubmissionsToday(submissions)} submission(s) today.
        </div>
        <div className="col-5-16 buttonContainer">
          <button
            className={deleteSubmissionButtonClassNames.join(' ')}
            {...(selectedSubmissionIds.length !== 0 && {
              onClick: this.handleDeleteSubmissionClick.bind(this)
            })}>
            {deleteSubmissionButtonText}
          </button>
        </div>
        <div className="col-5-16 buttonContainer">
          <button
            className={csvExportClassNames.join(' ')}
            {...(selectedSubmissionIds.length !== 0 && {
              onClick: this.handleCSVExportClick
            })}>
            {csvExportButtonText}
          </button>
        </div>
      </div>,
      <div key="unreadSwitchContainer" className="unreadSwitchContainer">
        <label className="unreadSwitch" id="unreadSwitch">
          <input
            type="checkbox"
            name="unreadSwitch"
            checked={submissionFilterSelectors.showUnread}
            value="unread"
            onChange={this.handleUnreadFilterToggle}
          />
          <span className="slider round" />
        </label>
        <label
          key="unreadSwitchLabel"
          className={`unreadSwitchLabel ${
            submissionFilterSelectors.showUnread ? ' active' : ''
          } `}>
          Show unread only
        </label>
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
                      this.setState({
                        selectedSubmissionIds: submissions.map(
                          (submission) => submission.id
                        )
                      })
                    } else {
                      this.setState({
                        selectedSubmissionIds: []
                      })
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
              label: 'Response Date',
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
      return Elements[
        selectedSubmissionForm.props.elements.filter(
          (element) => element.id === entry.question_id
        )[0].type
      ].renderDataValue(entry)
    } catch (e) {
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
            <div className="label">{getLabel(entry.question_id)}</div>
            <div className="value">{this.renderEntryElements(entry)}</div>
          </div>
        )
      })
    } else {
      return <div className="entry">This submission can not parse.</div>
    }
  }
}

const DataWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Data {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default DataWrapped
