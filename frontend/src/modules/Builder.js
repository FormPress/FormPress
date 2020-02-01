import React, { Component } from 'react'

import * as Elements from './elements'
import AuthContext from '../auth.context'
import Renderer from './Renderer'
import EditableLabel from './common/EditableLabel'
import Tabs from './common/Tabs'
import FormProperties from './helper/FormProperties'
import { api } from '../helper'

import './Builder.css'

const BACKEND = process.env.REACT_APP_BACKEND

//Stuff that we render in left hand side
const getElements = () => Object.values(Elements).map((element) => Object
  .assign({}, element.defaultConfig)
)
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

  constructor (props) {
    super(props)
    this.state = {
      counter: 0,
      saving: false,
      loading: false,
      dragging: false,
      dragIndex: false,
      insertBefore: false,
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
    this.setIntegration = this.setIntegration.bind(this)
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
    const id = e.target.id
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

  render () {
    const { form, loading, saving } = this.state
    const saveButtonProps = {}

    if (saving === true || loading === true) {
      saveButtonProps.disabled = true
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
                }
              ]}
            />
          </div>
          {
            (loading === true)
              ? 'Loading...'
              : <Renderer
                className='fl form'
                ddHandlers={{
                  onDrop: this.handleDrop,
                  onDragOver: this.handleDragOver
                }}
                handleLabelChange={ this.handleLabelChange }
                dragIndex={ this.state.dragIndex }
                dragging={ this.state.dragging }
                insertBefore={ this.state.insertBefore }
                form={ form }
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
