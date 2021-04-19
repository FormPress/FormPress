import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faTrash, faPen } from '@fortawesome/free-solid-svg-icons'
import Moment from 'react-moment'

import { api } from '../helper'
import Table from './common/Table'
import AuthContext from '../auth.context'

import './Forms.css'

const BACKEND = process.env.REACT_APP_BACKEND
class Forms extends Component {
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

    const forms = (data || []).map((form) => {
      return {
        ...form,
        props: JSON.parse(form.props)
      }
    })

    this.setLoadingState('forms', false)
    this.setState({ forms })
  }

  componentDidMount() {
    this.updateForms()
  }

  constructor(props) {
    super(props)
    this.state = {
      forms: [],
      loading: {
        forms: false,
        deletingId: false
      }
    }
  }

  async handleFormDeleteClick(form, e) {
    e.preventDefault()

    this.setState({
      loading: {
        ...this.state.loading,
        deletingId: form.id
      }
    })

    await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form.id}`,
      method: 'delete'
    })

    this.updateForms()
  }

  handlePreviewClick(form) {
    const { id } = form

    window.open(`${BACKEND}/form/view/${id}`, '_blank')
  }

  render() {
    const { forms } = this.state

    return (
      <div className="forms">
        <div className="headerContainer"></div>
        <div className="formsContent">
          <Table
            columns={[
              {
                label: <span> </span>,
                content: () => <span> </span>,
                className: 'mw'
              },
              {
                label: 'Name',
                content: (form) => form.title,
                className: 'name'
              },
              {
                label: 'Responses',
                content: (form) => (
                  <div className="responseCount">{form.responseCount}</div>
                )
              },
              {
                label: 'Created At',
                content: (form) => [
                  <Moment fromNow ago date={form.created_at} key="1" />,
                  <span key="2">{' ago'}</span>
                ]
              },
              {
                label: 'Actions',
                content: (form) => (
                  <div className="actions">
                    <span>
                      <FontAwesomeIcon
                        icon={faEye}
                        title={
                          form.published_version
                            ? 'View Form'
                            : 'You have to publish form to view'
                        }
                        onClick={
                          form.published_version
                            ? this.handlePreviewClick.bind(this, form)
                            : undefined
                        }
                      />
                    </span>
                    <span>
                      <FontAwesomeIcon
                        icon={faTrash}
                        title="Delete Form"
                        onClick={this.handleFormDeleteClick.bind(this, form)}
                      />
                    </span>
                    <Link to={`/editor/${form.id}/builder`}>
                      <FontAwesomeIcon icon={faPen} title="Edit Form" />
                    </Link>
                  </div>
                )
              }
            ]}
            data={forms}
          />
        </div>
        <div className="newButtonContainer">
          <Link to="/editor/new/builder">Create a new form</Link>
        </div>
      </div>
    )
  }
}

const FormsWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Forms {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default FormsWrapped
