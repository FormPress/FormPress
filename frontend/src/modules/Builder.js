import React, { Component } from 'react'

import * as Elements from './elements'
import AuthContext from '../auth.context'
import Renderer from './Renderer'
import EditableLabel from './common/EditableLabel'
import Tabs from './common/Tabs'
import FormProperties from './helper/FormProperties'
import QuestionProperties from './helper/QuestionProperties'
import { api } from '../helper'

import './Builder.css'

const BACKEND = process.env.REACT_APP_BACKEND

const getElements = () => Object.values(Elements).map((element) => {
    const config = Object
      .assign({}, element.defaultConfig)
    
    if (typeof element.configurableSettings !== 'undefined') {
      const configurableKeys = Object.keys(element.configurableSettings)

      for (const key of configurableKeys) {
        config[key] = element.configurableSettings[key].default
      }
    }

    return config
  }
)
const getElementsConfigurableSettingsObject = () => Object
  .values(Elements)
  .reduce((acc, element) => {
    acc[element.defaultConfig.type] = {
      configurableSettings: element.configurableSettings || {}
    }

    return acc
  }, {})

const getWeightedElements = () => Object
  .values(Elements)
  .map((element) => Object
    .assign({}, element.defaultConfig, {weight: element.weight})
  )
const getElementsKeys = () => getElements()
  .reduce((acc, item) => {
    acc[item.type] = item

    return acc
  }, {})

//Stuff that we render in left hand side
const pickerElements = getWeightedElements()
  .sort((a, b) => a.weight - b.weight)

class Builder extends Component {
  async componentDidMount () {
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
        this.props.history.push(`/editor/${lastEditedFormId}`)
        setTimeout(() => {
          this.componentDidMount()
        }, 1)
      }
    }
  }

  async loadForm (formId) {
    this.setState({ loading: true })

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

    this.setState({
      loading: false,
      form
    })
  }

  setIntegration (_integration) {
    const form = { ...this.state.form }

    form.props.integrations = [...form.props.integrations]

    const matched = form.props.integrations.filter((integration) =>
      (integration.type === _integration.type)
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

  setActiveTab (activeTab) {
    this.setState({ activeTab })
  }

  constructor (props) {
    super(props)
    this.state = {
      counter: 0,
      activeTab: false,
      saving: false,
      loading: false,
      dragging: false,
      dragIndex: false,
      insertBefore: false,
      selectedFieldId: false,
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
    this.handlePreviewClick = this.handlePreviewClick.bind(this)
    this.handleLabelChange = this.handleLabelChange.bind(this)
    this.handleTitleChange = this.handleTitleChange.bind(this)
    this.handleFormElementClick = this.handleFormElementClick.bind(this)
    this.setIntegration = this.setIntegration.bind(this)
    this.setActiveTab = this.setActiveTab.bind(this)
    this.configureQuestion = this.configureQuestion.bind(this)
  }

  handleDragStart (item, e) {
    e.dataTransfer.setData('text/plain', item.type)
    this.setState({ dragging: true })
  }

  handleDrop (e) {
    e.stopPropagation()
    e.preventDefault()
    
    const type = e.dataTransfer.getData('text')
    const item = getElementsKeys()[type]
    const { form, dragIndex } = this.state

    //set auto increment element id
    const maxId = Math.max(...form.props.elements.map((element) => element.id))

    item.id = maxId + 1

    const index = form.props.elements.findIndex(
      (element) => (element.id.toString() === dragIndex)
    )

    let newElements

    if (this.state.insertBefore === true) {
      newElements = [
        ...form.props.elements.slice(0, index),
        item,
        ...form.props.elements.slice(index)
      ]
    } else {
      newElements = [
        ...form.props.elements.slice(0, index + 1),
        item,
        ...form.props.elements.slice(index + 1)
      ]
    }

    this.setState({
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

  handleDragEnd (e) {
    this.setState({ dragging: false })
  }

  handleDragOver (e) {
    const rect = e.target.getBoundingClientRect()
    const {top, height} = rect
    const {clientY} = e
    const id = e.target.id.replace('qc_', '')
    const middleTop = top + height / 2
    const diff = clientY - middleTop
    const insertBefore = (diff < 0)

    if (
      id !== '' &&
      (
        id !== this.state.dragIndex.toString() ||
        insertBefore !== this.state.insertBefore
      )
    ) {
      this.setState({
        dragIndex: id,
        insertBefore
      })
    }

    e.stopPropagation()
    e.preventDefault()
  }

  handleLabelChange (id, value) {
    const form = { ...this.state.form }

    form.props.elements = [...form.props.elements]

    const question = form
      .props
      .elements
      .filter((element) => (element.id === id))[0]

    if (question.type === 'Button') {
      question.buttonText = value
    } else {
      question.label = value
    }

    this.setState({ form })
  }

  handleTitleChange (id, value) {
    const form = { ...this.state.form }

    form.title = value

    this.setState({ form })
  }

  handleFormElementClick (e) {
    e.preventDefault()
    const id = parseInt(e.target.id.replace('qc_', ''))
    const { elements } = this.state.form.props

    const matchingElements = elements.filter((elem) => (elem.id === id))

    if (matchingElements.length === 1) {
      this.setState({
        selectedFieldId: id,
        activeTab: 'questionProperties'
      })
    }

    console.log('Form Element Clicked ', e.target.id)
  }

  async handleSaveClick (e) {
    const { form } = this.state

    this.setState({ saving: true })

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms`,
      method: (form.id === null) ? 'post' : 'put',
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
  }

  handlePreviewClick (e) {
    const { id } = this.state.form

    window.open(`${BACKEND}/form/view/${id}`, '_blank')
  }

  configureQuestion (changes) {
    console.log('Configure question is called with ', changes)
    const form = { ...this.state.form }

    form.props.elements = [...form.props.elements]

    const question = form
      .props
      .elements
      .filter((element) => (element.id === changes.id))[0]

    Object.assign(question, changes.newState)

    this.setState({ form })
  }

  render () {
    const {
      activeTab,
      dragging,
      form,
      loading,
      saving,
      selectedFieldId
    } = this.state
    const saveButtonProps = {}
    const selectedField = {}

    if (saving === true || loading === true) {
      saveButtonProps.disabled = true
    }

    if (selectedFieldId !== false) {
      const selectedFieldConfig = form
        .props
        .elements
        .filter((elem) => (elem.id === selectedFieldId))[0]

      const elements = getElementsConfigurableSettingsObject()

      selectedField.config = selectedFieldConfig
      selectedField.configurableSettings = elements[selectedFieldConfig.type]
        .configurableSettings || {}
    }

    return (
      <div className='builder center'>
        <div className='headerContainer'>
          <div className='header oh'>
            <div className='formTitle fl'>
              {
                (loading === false)
                  ? <EditableLabel
                    className='label'
                    mode='builder'
                    labelKey='title'
                    handleLabelChange={ this.handleTitleChange }
                    value={ form.title }
                  />
                  : null
              }
            </div>
            <div className='formControls fl'>
              <button onClick={ this.handleSaveClick } { ...saveButtonProps }>
                { saving === true ? 'Saving...': 'Save' }
              </button>
              <button onClick={ this.handlePreviewClick }>
                Preview Form
              </button>
            </div>
          </div>
        </div>
        <div className='content oh'>
          <div className='fl leftMenu'>
            <Tabs
              className='leftMenuContents'
              activeTab={ activeTab }
              setActiveTab={ this.setActiveTab }
              items={[
                {
                  name: 'elements',
                  text: 'Form Elements',
                  content: (
                    <div className='elements'>
                      <div className='elementsContent'>
                        <div>Form Elements</div>
                        <div className='elementList'>
                          {pickerElements.map((elem) =>
                            <div
                              className='element'
                              draggable
                              onDragStart={ this.handleDragStart.bind(this, elem) }
                              onDragEnd={ this.handleDragEnd }
                              key={ elem.type }
                            >
                              { elem.type }
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  name: 'formProperties',
                  text: 'Form Properties',
                  component: FormProperties,
                  props: {
                    form,
                    setIntegration: this.setIntegration
                  }
                },
                (selectedFieldId !== false)
                  ? {
                    name: 'questionProperties',
                    text: 'Question Properties',
                    component: QuestionProperties,
                    props: {
                      selectedField,
                      configureQuestion: this.configureQuestion
                    }
                  } :
                  null
              ]}
            />
          </div>
          {
            (loading === true)
              ? 'Loading...'
              : <Renderer
                className={`fl form${(dragging === true)? ' dragging' : ''}`}
                builderHandlers={{
                  onDrop: this.handleDrop,
                  onDragOver: this.handleDragOver,
                  onClick: this.handleFormElementClick
                }}
                handleLabelChange={ this.handleLabelChange }
                dragIndex={ this.state.dragIndex }
                dragging={ dragging }
                insertBefore={ this.state.insertBefore }
                form={ form }
                selectedFieldId={ selectedFieldId }
                mode='builder'
              />
          }
        </div>
      </div>
    )
  }
}

const BuilderWrapped = (props) => 
  <AuthContext.Consumer>
    {
      (value) => <Builder { ...props } auth={ value } />
    }
  </AuthContext.Consumer>

export default BuilderWrapped
