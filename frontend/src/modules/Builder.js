import React, { Component } from 'react'
import { Link, NavLink, Switch, Route } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faPaintBrush,
  faPlusSquare,
  faShareAlt,
  faHeading,
  faAlignJustify,
  faCheckSquare,
  faMousePointer,
  faSort,
  faDotCircle,
  faAddressCard,
  faFileAlt,
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons'

import * as Elements from './elements'
import AuthContext from '../auth.context'
import Renderer from './Renderer'
import EditableLabel from './common/EditableLabel'
import FormProperties from './helper/FormProperties'
import QuestionProperties from './helper/QuestionProperties'
import ShareForm from './helper/ShareForm'
import { api } from '../helper'

import './Builder.css'

const BACKEND = process.env.REACT_APP_BACKEND

//list of element icons
const iconMap = {
  Text: faHeading,
  TextArea: faAlignJustify,
  Checkbox: faCheckSquare,
  Button: faMousePointer,
  Dropdown: faSort,
  Radio: faDotCircle,
  Name: faAddressCard,
  FileUpload: faFileAlt
}

//list of element texts
const textMap = {
  Text: 'Text',
  TextArea: 'Text Area',
  Checkbox: 'Checkbox',
  Button: 'Button',
  Dropdown: 'Dropdown',
  Radio: 'Radio button',
  Name: 'Name',
  FileUpload: 'File Upload'
}
const getElements = () =>
  Object.values(Elements).map((element) => {
    const config = Object.assign({}, element.defaultConfig)

    if (typeof element.configurableSettings !== 'undefined') {
      const configurableKeys = Object.keys(element.configurableSettings)

      for (const key of configurableKeys) {
        config[key] = element.configurableSettings[key].default
      }
    }

    return config
  })
const getElementsConfigurableSettingsObject = () =>
  Object.values(Elements).reduce((acc, element) => {
    acc[element.defaultConfig.type] = {
      configurableSettings: element.configurableSettings || {}
    }

    return acc
  }, {})

const getWeightedElements = () =>
  Object.values(Elements).map((element) =>
    Object.assign({}, element.defaultConfig, { weight: element.weight })
  )
const getElementsKeys = () =>
  getElements().reduce((acc, item) => {
    acc[item.type] = item

    return acc
  }, {})

//Stuff that we render in left hand side
const pickerElements = getWeightedElements().sort((a, b) => a.weight - b.weight)

class Builder extends Component {
  async componentDidMount() {
    if (typeof this.props.match.params.formId !== 'undefined') {
      const { formId } = this.props.match.params

      if (formId !== 'new') {
        await this.loadForm(formId)
        window.localStorage.setItem('lastEditedFormId', formId)
      } else {
        window.scrollTo(0, 0)
        this.setIntegration({ type: 'email', to: this.props.auth.email })
      }
    } else {
      const lastEditedFormId = window.localStorage.getItem('lastEditedFormId')

      if (lastEditedFormId !== null) {
        this.props.history.push(`/editor/${lastEditedFormId}/builder`)
        setTimeout(() => {
          this.componentDidMount()
        }, 1)
      }
    }
  }

  async loadForm(formId, seamless = false) {
    if (seamless === false) {
      this.setState({ loading: true })
    }

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${formId}`
    })

    if (typeof data.props === 'undefined') {
      this.setState({
        loading: false
      })

      return
    }

    const props = JSON.parse(data.props)
    const form = {
      ...data,
      props
    }

    const publishedFormResult = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${formId}?published=true`
    })

    if (typeof publishedFormResult.data.props !== 'undefined') {
      publishedFormResult.data.props = JSON.parse(
        publishedFormResult.data.props
      )
    }

    this.setState({
      loading: false,
      form,
      publishedForm: publishedFormResult.data
    })
  }

  setIntegration(_integration) {
    const form = { ...this.state.form }

    form.props.integrations = [...form.props.integrations]

    const matched = form.props.integrations.filter(
      (integration) => integration.type === _integration.type
    )

    if (matched.length > 0) {
      const index = form.props.integrations.indexOf(matched[0])

      form.props.integrations[index] = {
        ...form.props.integrations[index],
        ..._integration
      }
    } else {
      form.props.integrations.push(_integration)
    }

    this.setState({ form })
  }

  constructor(props) {
    super(props)
    this.state = {
      counter: 0,
      saving: false,
      loading: false,
      dragging: false,
      dragIndex: false,
      dragMode: 'insert',
      sortItem: false,
      insertBefore: false,
      selectedFieldId: false,
      publishedForm: {},
      form: {
        id: null,
        user_id: null,
        title: 'Untitled Form',
        props: {
          integrations: [
            {
              type: 'email',
              value: ''
            }
          ],
          elements: [
            {
              id: 1,
              type: 'Text',
              label: 'First Name'
            },
            {
              id: 2,
              type: 'Button',
              buttonText: 'Submit'
            }
          ]
        }
      }
    }
    //this.handleClick = this.handleClick.bind(this)
    this.handleDragStart = this.handleDragStart.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleDragEnd = this.handleDragEnd.bind(this)
    this.handleSaveClick = this.handleSaveClick.bind(this)
    this.handlePublishClick = this.handlePublishClick.bind(this)
    this.handlePreviewClick = this.handlePreviewClick.bind(this)
    this.handleLabelChange = this.handleLabelChange.bind(this)
    this.handleTitleChange = this.handleTitleChange.bind(this)
    this.handleFormElementClick = this.handleFormElementClick.bind(this)
    this.handleFormElementDeleteClick = this.handleFormElementDeleteClick.bind(
      this
    )
    this.handleAddFormElementClick = this.handleAddFormElementClick.bind(this)
    this.setIntegration = this.setIntegration.bind(this)
    this.configureQuestion = this.configureQuestion.bind(this)
  }

  handleDragStart(_item, e) {
    console.log('Drag start')
    let item = _item
    let dragMode = 'insert'
    let type = item.type

    e.dataTransfer.setData('text/plain', type)

    if (item.mode === 'sort') {
      const { ref, ...rest } = item

      item = rest
      dragMode = 'sort'
      type = ''

      e.dataTransfer.setDragImage(ref.current, 710, 15)
      e.dataTransfer.dropEffect = 'move'
    }

    const dragState = {
      dragMode,
      selectedFieldId: false,
      dragging: true
    }
    setTimeout(() => {
      this.setState(dragState)

      setTimeout(() => {
        this.setState({ sortItem: item })
      }, 20)
    }, 20)
  }

  handleDrop(e) {
    e.stopPropagation()
    e.preventDefault()

    const { formId } = this.props.match.params
    const type = e.dataTransfer.getData('text')
    let item = getElementsKeys()[type]
    const { form, dragIndex, dragMode, sortItem } = this.state
    let elements = [...form.props.elements]

    if (dragMode === 'insert') {
      //set auto increment element id
      let maxId = Math.max(...form.props.elements.map((element) => element.id))
      //if no elements, Math.max returns -Infinity
      if (maxId === -Infinity) {
        maxId = -1
      }

      item.id = maxId + 1
    } else {
      item = sortItem
      //mark sorted element to be deleted
      const sortedElementOriginal = elements.filter(
        (element) => element.id === item.id
      )

      sortedElementOriginal[0].__original__ = true
    }

    const index = form.props.elements.findIndex(
      (element) => element.id.toString() === dragIndex
    )
    let newElements

    if (this.state.insertBefore === true) {
      newElements = [
        ...elements.slice(0, index),
        item,
        ...elements.slice(index)
      ]
    } else {
      newElements = [
        ...elements.slice(0, index + 1),
        item,
        ...elements.slice(index + 1)
      ]
    }

    if (dragMode === 'sort') {
      newElements = newElements.filter(
        (element) => element.__original__ !== true
      )
      this.props.history.push(
        `/editor/${formId}/builder/question/${item.id}/properties`
      )
    }

    this.setState({
      dragMode: 'insert',
      sortItem: false,
      dragging: false,
      dragIndex: false,
      form: {
        ...form,
        props: {
          ...form.props,
          elements: newElements
        }
      }
    })
  }

  handleAddFormElementClick(elemType) {
    let item = getElementsKeys()[elemType]
    const { form } = this.state
    let elements = [...form.props.elements]
    let maxId = Math.max(...form.props.elements.map((element) => element.id))
    //if no elements, Math.max returns -Infinity
    if (maxId === -Infinity) {
      maxId = -1
    }
    item.id = maxId + 1
    const newElements = elements.concat(item)
    this.setState({
      form: {
        ...form,
        props: {
          ...form.props,
          elements: newElements
        }
      }
    })
  }

  handleDragEnd(e) {
    e.stopPropagation()
    e.preventDefault()
    console.log('drag ended')
    this.setState({
      dragging: false,
      dragMode: 'insert',
      sortItem: false
    })
  }

  handleDragOver(e) {
    const rect = e.target.getBoundingClientRect()
    const { top, height } = rect
    const { clientY } = e
    const id = e.target.id.replace('qc_', '')
    const middleTop = top + height / 2
    const diff = clientY - middleTop
    const insertBefore = diff < 0

    if (
      id !== '' &&
      (id !== this.state.dragIndex.toString() ||
        insertBefore !== this.state.insertBefore)
    ) {
      this.setState({
        dragIndex: id,
        insertBefore
      })
    }

    e.stopPropagation()
    e.preventDefault()
  }

  handleLabelChange(id, value) {
    const form = { ...this.state.form }

    form.props.elements = [...form.props.elements]

    const question = form.props.elements.filter(
      (element) => element.id === id
    )[0]

    if (question.type === 'Button') {
      question.buttonText = value
    } else {
      question.label = value
    }

    this.setState({ form })
  }

  handleTitleChange(id, value) {
    const form = { ...this.state.form }

    form.title = value

    this.setState({ form })
  }

  handleFormElementClick(e) {
    e.preventDefault()
    const id = parseInt(e.target.id.replace('qc_', ''))
    const { elements } = this.state.form.props
    let { formId } = this.props.match.params

    const matchingElements = elements.filter((elem) => elem.id === id)

    if (matchingElements.length === 1) {
      this.props.history.push(
        `/editor/${formId}/builder/question/${id}/properties`
      )
      this.setState({
        dragging: false
      })
    }
  }

  handleFormElementDeleteClick(id) {
    const form = { ...this.state.form }
    const { params } = this.props.match

    form.props.elements = form.props.elements.filter((elem) => elem.id !== id)

    this.setState({
      form
    })

    if (typeof params.questionId !== 'undefined') {
      this.props.history.push(`/editor/${params.formId}/builder`)
    }
  }

  async handleSaveClick() {
    const { form } = this.state

    this.setState({ saving: true })

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms`,
      method: form.id === null ? 'post' : 'put',
      body: this.state.form
    })

    this.setState({ saving: false })

    if (form.id === null && typeof data.id !== 'undefined') {
      this.props.history.push(`/editor/${data.id}`)
      this.setState({
        form: {
          ...this.state.form,
          id: data.id
        }
      })
      window.localStorage.setItem('lastEditedFormId', data.id)
    }

    if (form.id !== null && data.updated_at !== null) {
      this.setState({
        form: {
          ...this.state.form,
          updated_at: data.updated_at
        }
      })
    }
  }

  async handlePublishClick() {
    const { form, publishing, saving } = this.state

    if (publishing === true || saving === true) {
      return
    }

    this.setState({ publishing: true })

    await this.handleSaveClick()

    if (typeof form.id !== 'undefined' && form.id !== null) {
      await api({
        resource: `/api/users/${this.props.auth.user_id}/forms/${form.id}/publish`,
        method: 'post'
      })

      await this.loadForm(form.id, true)
    }

    this.setState({ publishing: false })
  }

  handlePreviewClick() {
    const { id } = this.state.form

    window.open(`${BACKEND}/form/view/${id}?preview=true`, '_blank')
  }

  configureQuestion(changes) {
    const form = { ...this.state.form }

    form.props.elements = [...form.props.elements]

    const question = form.props.elements.filter(
      (element) => element.id === changes.id
    )[0]

    Object.assign(question, changes.newState)

    this.setState({ form })
  }

  render() {
    const { params } = this.props.match
    const { formId, questionId } = params
    const tabs = [
      { name: 'elements', text: 'Elements', path: `/editor/${formId}/builder` },
      {
        name: 'formProperties',
        text: 'Form Properties',
        path: `/editor/${formId}/builder/properties`
      }
    ]

    if (typeof questionId !== 'undefined') {
      tabs.push({
        name: 'questionProperties',
        text: 'Question Properties',
        path: `/editor/${formId}/builder/question/${params.questionId}/properties`
      })
    }

    return (
      <div className="builder">
        <div className="headerContainer">
          <div className="header grid center">
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
        <div className="content grid">
          <div className="leftTabs col-1-16">
            {this.renderLeftVerticalTabs()}
          </div>
          {this.renderMainContent()}
        </div>
      </div>
    )
  }

  renderLeftMenuContents() {
    const { form } = this.state
    const { params } = this.props.match
    const selectedField = {}
    const { questionId } = params
    let questionPropertiesReady = true

    if (typeof questionId !== 'undefined') {
      try {
        const selectedFieldConfig = form.props.elements.filter(
          (elem) => elem.id === parseInt(questionId)
        )[0]

        const elements = getElementsConfigurableSettingsObject()

        selectedField.config = selectedFieldConfig
        selectedField.configurableSettings =
          elements[selectedFieldConfig.type].configurableSettings || {}
      } catch (e) {
        questionPropertiesReady = false
      }
    }

    return (
      <Switch>
        <Route exact path="/editor/:formId/builder">
          <div className="elements">
            <div className="elementsMessage">
              Drag and Drop elements to right hand side to add to the form. Or
              you can click + icon
            </div>
            <div className="elementList">
              {pickerElements.map((elem) => (
                <div
                  className="element"
                  draggable
                  onDragStart={this.handleDragStart.bind(this, elem)}
                  onDragEnd={this.handleDragEnd}
                  key={elem.type}>
                  <span className="element-picker-icon-wrapper">
                    <FontAwesomeIcon
                      icon={iconMap[elem.type]}
                      className="element-picker-icon"
                    />
                  </span>
                  <span className="element-picker-text">
                    {textMap[elem.type]}
                  </span>
                  <span className="add-element-button">
                    <FontAwesomeIcon
                      icon={faPlusCircle}
                      title="Add Field"
                      onClick={() => this.handleAddFormElementClick(elem.type)}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Route>
        <Route path="/editor/:formId/builder/properties">
          <FormProperties form={form} setIntegration={this.setIntegration} />
        </Route>
        <Route path="/editor/:formId/builder/question/:questionId/properties">
          {questionPropertiesReady === true ? (
            <QuestionProperties
              selectedField={selectedField}
              configureQuestion={this.configureQuestion}
            />
          ) : null}
        </Route>
      </Switch>
    )
  }

  renderLeftVerticalTabs() {
    const { formId } = this.props.match.params

    return (
      <div>
        <NavLink to={`/editor/${formId}/builder`} activeClassName="selected">
          <FontAwesomeIcon icon={faPlusSquare} />
        </NavLink>
        <NavLink to={`/editor/${formId}/design`} activeClassName="selected">
          <FontAwesomeIcon icon={faPaintBrush} />
        </NavLink>
        <NavLink to={`/editor/${formId}/share`} activeClassName="selected">
          <FontAwesomeIcon icon={faShareAlt} />
        </NavLink>
      </div>
    )
  }

  renderMainContent() {
    return (
      <Switch>
        <Route path="/editor/:formId/builder">
          <div className="leftMenu col-5-16">
            <div className="leftMenuContents">
              {this.renderLeftMenuContents()}
            </div>
          </div>
          {this.renderBuilder()}
        </Route>
        <Route path="/editor/:formId/design">
          Form Designer will come here
        </Route>
        <Route path="/editor/:formId/share">
          <ShareForm />
        </Route>
      </Switch>
    )
  }

  renderBuilder() {
    const {
      dragging,
      form,
      dragMode,
      sortItem,
      publishedForm,
      loading,
      saving,
      publishing
    } = this.state
    const { params } = this.props.match
    let selectedFieldId = parseInt(params.questionId)

    const isPublishRequired = form.updated_at !== publishedForm.created_at
    const saveButtonProps = {}

    if (saving === true || loading === true) {
      saveButtonProps.disabled = true
    }

    return (
      <div className="builderStage col-10-16 grid">
        <div className="formTitle col-16-16">
          {loading === false ? (
            <EditableLabel
              className="label"
              mode="builder"
              labelKey="title"
              handleLabelChange={this.handleTitleChange}
              value={form.title}
            />
          ) : null}
        </div>
        <div className="col-16-16 formControls">
          <button onClick={this.handleSaveClick} {...saveButtonProps}>
            {saving === true ? 'Saving...' : 'Save'}
          </button>
          <button onClick={this.handlePreviewClick}>Preview</button>
          <button className="publish" onClick={this.handlePublishClick}>
            {publishing === true ? 'Publishing...' : 'Publish'}
            {isPublishRequired === true ? (
              <div className="publishRequired"></div>
            ) : null}
          </button>
        </div>
        {loading === true ? (
          'Loading...'
        ) : (
          <Renderer
            className={`col-16-16 form${dragging === true ? ' dragging' : ''}`}
            builderHandlers={{
              onDrop: this.handleDrop,
              onDragOver: this.handleDragOver,
              onClick: this.handleFormElementClick
            }}
            customBuilderHandlers={{
              onDelete: this.handleFormElementDeleteClick,
              handleDragEnd: this.handleDragEnd,
              handleDragStart: this.handleDragStart
            }}
            handleLabelChange={this.handleLabelChange}
            configureQuestion={this.configureQuestion}
            dragIndex={this.state.dragIndex}
            dragging={dragging}
            dragMode={dragMode}
            sortItem={sortItem}
            insertBefore={this.state.insertBefore}
            form={form}
            selectedFieldId={selectedFieldId}
            mode="builder"
          />
        )}
      </div>
    )
  }
}

const BuilderWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Builder {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default BuilderWrapped
