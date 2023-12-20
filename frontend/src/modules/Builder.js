import React, { Component } from 'react'
import { Link, NavLink, Switch, Route, Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cloneDeep, isEqual } from 'lodash'
import { Buffer } from 'buffer'
import {
  faChevronLeft,
  faPaintBrush,
  faPlusSquare,
  faShareAlt,
  faPlusCircle,
  faQuestionCircle,
  faPen,
  faBoltLightning,
  faCircleCheck,
  faGears
} from '@fortawesome/free-solid-svg-icons'

import * as Elements from './elements'
import Renderer from './Renderer'
import EditableLabel from './common/EditableLabel'
import FormProperties from './helper/FormProperties'
import QuestionProperties from './helper/QuestionProperties'
import DesignForm from './helper/design/DesignForm'
import ShareForm from './helper/ShareForm'
import FormRules from './helper/FormRules'

import PreviewForm from './helper/PreviewForm'
import Modal from './common/Modal'
import Templates from './Templates'
import FormIntegrations from './helper/FormIntegrations'
import PostSubmission from './helper/PostSubmission'
import { api } from '../helper'
import { getConfigurableSettings } from './ConfigurableSettings'
import { TemplateOptionSVG } from '../svg'
import './Builder.css'

const DEFAULT_FORM = {
  id: null,
  uuid: null,
  user_id: null,
  title: 'Untitled Form',
  private: 0,
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
        order: 0,
        type: 'TextBox',
        placeholder: '',
        required: false,
        label: 'Short Text',
        requiredText: 'Required field'
      },
      {
        id: 2,
        order: 1,
        type: 'Button',
        buttonText: 'Submit'
      }
    ],
    design: {
      theme: 'gleam',
      colorScheme: 'default'
    },
    customCSS: {
      value: '',
      isEncoded: false
    },
    tags: []
  }
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
    let mergedObject = getConfigurableSettings(element.defaultConfig.type)

    for (const key in element.configurableSettings) {
      Object.assign(mergedObject, {
        [key]: element.configurableSettings[key]
      })
    }
    acc[element.defaultConfig.type] = {
      configurableSettings: mergedObject
    }

    return acc
  }, {})

const getWeightedElements = () =>
  Object.values(Elements).map((element) =>
    Object.assign(
      {},
      element.defaultConfig,
      { weight: element.weight },
      element.metaData
    )
  )

const getElementsKeys = () =>
  getElements().reduce((acc, item) => {
    acc[item.type] = item

    return acc
  }, {})

//Stuff that we render in left hand side
let pickerElements = getWeightedElements().sort((a, b) => a.weight - b.weight)

export default class Builder extends Component {
  async componentDidMount() {
    if (typeof this.props.match.params.formId !== 'undefined') {
      const { formId } = this.props.match.params

      if (this.props.history.location.pathname.endsWith('/new')) {
        this.setState({ isTemplateModalOpen: true })
      }

      if (formId !== 'new') {
        await this.loadForm(formId)
      } else {
        window.scrollTo(0, 0)
        this.setIntegration({
          type: 'email',
          to: this.props.generalContext.auth.email
        })

        this.setState({ loading: false })
      }
    } else {
      const lastEditedFormId = window.localStorage.getItem('lastEditedFormId')

      if (lastEditedFormId !== undefined && lastEditedFormId !== null) {
        this.props.history.push(`/editor/${lastEditedFormId}/builder`)
        setTimeout(() => {
          this.componentDidMount()
        }, 1)
      } else {
        const { data } = await api({
          resource: `/api/users/${this.props.generalContext.auth.user_id}/editor`
        })
        this.props.history.push(`/editor/${data.message}/builder`)
        setTimeout(() => {
          this.componentDidMount()
        }, 1)
      }
    }

    this.shouldBlockNavigation = this.props.history.block(this.blockReactRoutes)

    const isWindows = navigator.platform.indexOf('Win') > -1
    this.setState({ isWindows })
  }

  componentWillUnmount() {
    this.shouldBlockNavigation()
  }

  blockReactRoutes = (location) => {
    this.ignoreFormDifference = () => {
      this.props.history.push(location.pathname)
    } // if user still wants to proceed without saving

    const { form, savedForm } = this.state
    let isFormChanged = !isEqual(form.props.elements, savedForm.props.elements)

    const disallowedPath = !location.pathname.startsWith('/editor')

    if (isFormChanged === true && disallowedPath === false) {
      return true
    }

    if (isFormChanged === true && disallowedPath === true) {
      const modalContent = {
        header: 'Unsaved Changes',
        status: 'warning',
        content: 'Are you sure you want to discard changes?'
      }

      modalContent.dialogue = {
        abortText: 'Cancel',
        abortClick: this.handleCloseModalClick,
        negativeText: 'Discard',
        negativeClick: this.handleDiscardChangesClick
      }
      this.setState({ modalContent, isModalOpen: true })
      return false
    }

    return isFormChanged === false
  }

  handleCloseModalClick() {
    this.setState({ isModalOpen: false, modalContent: {} })
  }

  handleCloseTemplateModalClick() {
    this.props.history.replace('/editor/new/builder')
    this.setState({ isTemplateModalOpen: false, modalContent: {} })
  }

  handleDiscardChangesClick() {
    this.shouldBlockNavigation()

    this.ignoreFormDifference()
  }

  dataUrlToFile = async (dataUrl, filename) => {
    const arr = dataUrl.split(',')
    if (arr.length < 2) {
      return undefined
    }
    const mimeArr = arr[0].match(/:(.*?);/)
    if (!mimeArr || mimeArr.length < 2) {
      return undefined
    }
    const mime = mimeArr[1]
    const buff = Buffer.from(arr[1], 'base64')
    return new File(
      [buff],
      `${filename}.${dataUrl.substring(
        'data:image/'.length,
        dataUrl.indexOf(';base64')
      )}`,
      { type: mime }
    )
  }

  async loadForm(formId, seamless = false) {
    if (seamless === false) {
      this.setState({ loading: true })
    }

    const { data, status } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${formId}`
    })

    if (status === 403 || data.id === undefined) {
      this.props.history.replace('/editor/new/builder')
      localStorage.removeItem('lastEditedFormId')
      this.setState({ loading: false })

      return
    }

    if (typeof data.props === 'undefined') {
      this.setState({
        loading: false
      })

      return
    }

    const props = data.props
    const form = {
      ...data,
      props
    }
    const savedForm = cloneDeep(form)

    const publishedFormResult = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${formId}?published=true`
    })

    const autoPageBreakSettings = form.props.autoPageBreak
    if (autoPageBreakSettings !== undefined) {
      if (autoPageBreakSettings.active !== undefined) {
        this.setState({
          autoPBEnabled: autoPageBreakSettings.active
        })
      }
    }

    this.setState({
      loading: false,
      form,
      savedForm,
      publishedForm: publishedFormResult.data
    })

    window.localStorage.setItem('lastEditedFormId', form.id)
  }

  setFormTags(tags) {
    const form = { ...this.state.form }
    form.props.tags = tags
    this.setState({ form })
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

  setFormRule(_rule) {
    const form = { ...this.state.form }

    form.props.rules = [...(form.props.rules || [])]

    if (_rule.delete === true) {
      const index = form.props.rules.indexOf(_rule)
      form.props.rules.splice(index, 1)

      this.setState({ form })
      return
    }

    const matched = form.props.rules.find((rule) => rule.id === _rule.id)

    if (matched !== undefined) {
      const index = form.props.rules.indexOf(matched)

      form.props.rules[index] = {
        ...form.props.rules[index],
        ..._rule
      }
    } else {
      // auto increment rule id
      const ruleId = form.props.rules.length + 1

      _rule.id = ruleId
      form.props.rules.push(_rule)
    }

    this.setState({ form })

    this.handleSaveClick()
  }

  setAutoPageBreak(key, value) {
    const form = { ...this.state.form }
    let autoPageBreak = { ...form.props.autoPageBreak }

    if (typeof form.props.autoPageBreak === 'object') {
      autoPageBreak = cloneDeep(form.props.autoPageBreak)
    }

    Object.assign(autoPageBreak, { [key]: value })
    if (key === 'active' && autoPageBreak.elemPerPage === undefined) {
      autoPageBreak.elemPerPage = 1
    }

    Object.assign(form.props, { autoPageBreak })

    this.setState({ form })

    if (key === 'active') {
      this.setState({ autoPBEnabled: value })
    }
  }

  setFormDesign(_design) {
    const form = { ...this.state.form }
    const design = { ..._design }

    let oldTheme = 'gleam'
    if (form.props.design !== undefined) {
      oldTheme = form.props.design.theme
    }

    if (oldTheme !== _design.theme) {
      console.log('Loading theme: ', _design.theme)
      // require(`../style/themes/${_design.theme}.css`)
    }

    form.props.design = design

    this.setState({ form })
  }

  setCSS(cssProp) {
    const form = { ...this.state.form }
    form.props.customCSS = cssProp
    this.setState({ form })
  }

  cloneTemplate = (template) => {
    this.props.history.push('/editor/new/builder')
    this.setState({ loading: true })
    const form = { ...this.state.form }
    form.props = template.props
    form.title = template.title
    form.props.integrations = [
      {
        type: 'email',
        to: this.props.generalContext.auth.email
      }
    ]
    this.setState({ form, isTemplateModalOpen: false })
    this.setState({ loading: false })
  }

  constructor(props) {
    super(props)
    this.state = {
      counter: 0,
      redirect: false,
      isModalOpen: false,
      saving: false,
      loading: true,
      modalContent: {},
      dragging: false,
      dragIndex: false,
      draggingItemType: '',
      dragMode: 'insert',
      sortItem: false,
      insertBefore: false,
      selectedFieldId: false,
      selectedLabelId: false,
      publishedForm: {},
      selectedIntegration: false,
      form: cloneDeep(DEFAULT_FORM),
      savedForm: cloneDeep(DEFAULT_FORM),
      autoPBEnabled: false,
      additionalSaveFunction: null
    }
    //this.handleClick = this.handleClick.bind(this)
    this.handleDragStart = this.handleDragStart.bind(this)
    this.handleDragOver = this.handleDragOver.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleDragEnd = this.handleDragEnd.bind(this)
    this.handleSaveClick = this.handleSaveClick.bind(this)
    this.handleFormItemMovement = this.handleFormItemMovement.bind(this)
    this.handlePublishClick = this.handlePublishClick.bind(this)
    this.handleLabelChange = this.handleLabelChange.bind(this)
    this.handleTitleChange = this.handleTitleChange.bind(this)
    this.setFormAsPrivate = this.setFormAsPrivate.bind(this)
    this.handleFormElementClick = this.handleFormElementClick.bind(this)
    this.handleFormElementDeleteClick = this.handleFormElementDeleteClick.bind(
      this
    )
    this.handleAddFormElementClick = this.handleAddFormElementClick.bind(this)
    this.setIntegration = this.setIntegration.bind(this)
    this.configureQuestion = this.configureQuestion.bind(this)
    this.setCSS = this.setCSS.bind(this)
    this.setFormTags = this.setFormTags.bind(this)
    this.setAutoPageBreak = this.setAutoPageBreak.bind(this)
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.handleCloseTemplateModalClick = this.handleCloseTemplateModalClick.bind(
      this
    )
    this.handleDiscardChangesClick = this.handleDiscardChangesClick.bind(this)
    this.cloneTemplate = this.cloneTemplate.bind(this)
    this.handleAddNewPage = this.handleAddNewPage.bind(this)
    this.imageUploadHandler = this.imageUploadHandler.bind(this)
    this.rteUploadHandler = this.rteUploadHandler.bind(this)
    this.handleLabelClick = this.handleLabelClick.bind(this)
    this.setFormRule = this.setFormRule.bind(this)
    this.setFormDesign = this.setFormDesign.bind(this)
    this.setAdditionalSaveFunction = this.setAdditionalSaveFunction.bind(this)
    this.renderLeftElements = this.renderLeftElements.bind(this)
  }

  setAdditionalSaveFunction(func) {
    this.setState({ additionalSaveFunction: func })
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
      draggingItemType: _item.type,
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

    //A necessary condition for the element to work with drag and drop
    if (type.length > 0) {
      let item = getElementsKeys()[type]
      const { form, dragIndex, dragMode, sortItem } = this.state

      let elements = cloneDeep([...form.props.elements])

      if (dragMode === 'insert') {
        //set auto increment element id
        let maxId = Math.max(
          ...form.props.elements.map((element) => element.id)
        )

        if (form.props.nextUniqueId === undefined) {
          form.props.nextUniqueId = maxId === -Infinity ? 0 : maxId + 1
        }

        item.id = form.props.nextUniqueId
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

      // hide last elem if it is a button
      if (item.type === 'PageBreak') {
        const lastElement = newElements[newElements.length - 1]
        if (lastElement.type === 'Button') {
          lastElement.hidden = true
        }
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
            nextUniqueId:
              dragMode === 'insert'
                ? form.props.nextUniqueId + 1
                : form.props.nextUniqueId,
            elements: newElements
          }
        }
      })
    }
  }

  handleAddFormElementClick(elemType) {
    let item = getElementsKeys()[elemType]
    const { form } = this.state
    let elements = cloneDeep([...form.props.elements])
    let maxId = Math.max(...form.props.elements.map((element) => element.id))
    let newElements, lastElement
    //if no elements, Math.max returns -Infinity

    // backwards compatibility
    if (form.props.nextUniqueId === undefined) {
      form.props.nextUniqueId = maxId === -Infinity ? 0 : maxId + 1
    }

    item.id = form.props.nextUniqueId

    if (maxId === -Infinity) {
      newElements = elements.concat(item)
    } else {
      lastElement = elements.pop()
      if (lastElement.type === 'Button') {
        lastElement.hidden = item.type === 'PageBreak'
        newElements = elements.concat(item, lastElement)
      } else {
        newElements = elements.concat(lastElement, item)
      }
    }

    form.props.nextUniqueId++

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

  handleAddNewPage() {
    this.handleAddFormElementClick('PageBreak')
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
    let insertBefore = diff < 0

    if (e.target.classList.contains('elementPageBreak')) {
      const emptyPage = e.target.classList.contains('emptyPage')

      if (emptyPage) {
        insertBefore = !e.target.classList.contains('reflection')
      } else {
        return
      }
    }

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

    form.props.elements = cloneDeep([...form.props.elements])

    if (Number.isInteger(id) === false) {
      const questionID = id.split('_')[1]
      const itemID = id.split('_')[2]

      let question = form.props.elements.filter(
        (element) => element.id === parseInt(questionID)
      )[0]

      if (id.split('_')[0] === 'sub') {
        question.sublabelText = value
      } else if (id.split('_')[0] === 'header') {
        question.sublabel = value
      } else if (id.split('_')[0] === 'name') {
        question[`${itemID}SublabelText`] = value
      } else if (id.split('_')[0] === 'address') {
        question[`${itemID}SublabelText`] = value
      } else if (id.split('_')[0] === 'net') {
        question[`${itemID}SublabelText`] = value
      } else if (id.split('_')[0] === 'pbButton') {
        question[`${itemID}ButtonText`] = value
      } else if (id.split('_')[0] === 'radio') {
        question[`${itemID}Text`] = value
      } else if (id.split('_')[0] === 'location') {
        question[`${itemID}SublabelText`] = value
      } else if (id.split('_')[0] === 'date' || id.split('_')[0] === 'time') {
        question[`${itemID}SublabelText`] = value
      } else {
        try {
          if (question.type === 'Button') {
            question.buttonText = value
          } else {
            question.options[itemID] = value
          }
        } catch (e) {
          console.log(e)
        }
      }
    } else {
      const question = form.props.elements.filter(
        (element) => element.id === id
      )[0]

      try {
        if (question.type === 'Button') {
          question.buttonText = value
        } else {
          question.label = value
        }
      } catch (e) {
        console.log(e)
      }
    }

    this.setState({ form })
  }

  handleFormItemMovement(_item, movementType, itemType = 'formItem') {
    if (itemType === 'formItem') {
      const { formId } = this.props.match.params
      let item = getElementsKeys()[_item.type]
      const dragIndex = _item.id.toString()
      const { form } = this.state
      const sortItem = form.props.elements.filter(
        (element) => element.id.toString() === dragIndex
      )[0]

      const elements = cloneDeep(form.props.elements)

      item = sortItem
      //mark sorted element to be deleted
      const sortedElementOriginal = elements.filter(
        (element) => element.id === item.id
      )

      if (movementType !== 'clone') {
        sortedElementOriginal[0].__original__ = true
      }

      const index = form.props.elements.findIndex(
        (element) => element.id.toString() === dragIndex
      )

      let newElements
      if (movementType === 'moveDown') {
        if (index === elements.length - 1) {
          return
        } else {
          newElements = [
            ...elements.slice(0, index + 2),
            item,
            ...elements.slice(index + 2)
          ]
        }
      } else if (movementType === 'moveUp') {
        if (index === 0) {
          newElements = []
          newElements.push(...elements, item)
          newElements.shift()
        } else {
          newElements = [
            ...elements.slice(0, index - 1),
            item,
            ...elements.slice(index - 1)
          ]
        }
      } else {
        let maxId = Math.max(
          ...form.props.elements.map((element) => element.id)
        )
        item.id = maxId + 1
        newElements = [
          ...elements.slice(0, index + 1),
          item,
          ...elements.slice(index + 1)
        ]
      }
      if (movementType !== 'clone') {
        newElements = newElements.filter(
          (element) => element.__original__ !== true
        )
      }
      this.props.history.push(
        `/editor/${formId}/builder/question/${item.id}/properties`
      )

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
    } else {
      const form = cloneDeep(this.state.form)
      for (let elem of form.props.elements) {
        if (elem.id === _item.id) {
          if (movementType === 'moveDown') {
            if (_item.listItemId === elem.options.length - 1) {
              elem.options.unshift(elem.options[_item.listItemId])
              elem.options.pop()
            } else {
              elem.options.splice(
                _item.listItemId + 2,
                0,
                elem.options[_item.listItemId]
              )
              elem.options.splice(_item.listItemId, 1)
            }
          } else if (movementType === 'moveUp') {
            if (_item.listItemId === 0) {
              elem.options.push(elem.options[_item.listItemId])
              elem.options.shift()
            } else {
              elem.options.splice(
                _item.listItemId - 1,
                0,
                elem.options[_item.listItemId]
              )
              elem.options.splice(_item.listItemId + 1, 1)
            }
          } else {
            elem.options.splice(
              _item.listItemId + 1,
              0,
              elem.options[_item.listItemId]
            )
          }
        }
      }

      this.setState({
        dragMode: 'insert',
        sortItem: false,
        dragging: false,
        dragIndex: false,
        form: {
          ...form
        }
      })
    }
  }

  async rteUploadHandler(blobInfo) {
    //need save to get form id before upload
    if (this.state.form.id === null) {
      await this.handleSaveClick()
    }

    return new Promise((resolve, reject) => {
      const image_size = blobInfo.blob().size / 1000,
        max_size = 3000
      if (image_size > max_size) {
        reject(
          'Image is too large ( ' +
            image_size +
            ') ,Maximum image size is:' +
            max_size +
            ' Kb',
          { remove: true }
        )
      } else {
        let xhr, formData
        xhr = new XMLHttpRequest()
        xhr.withCredentials = false
        xhr.open(
          'POST',
          `${global.env.FE_BACKEND}/api/upload/${this.state.form.id}/${this.state.selectedFieldId}`
        )

        xhr.onload = function () {
          let json

          if (xhr.status !== 200) {
            alert('HTTP Error: ' + xhr.status)
            return
          }

          json = JSON.parse(xhr.responseText)

          if (!json || typeof json.location != 'string') {
            alert('Invalid JSON: ' + xhr.responseText)
            return false
          }

          resolve(json.location)
        }

        formData = new FormData()
        formData.append('file', blobInfo.blob(), blobInfo.filename())

        xhr.send(formData)
      }
    })
  }

  async imageUploadHandler(id, file) {
    //need save to get form id before upload
    if (this.state.form.id === null) {
      await this.handleSaveClick()
    }
    const form = cloneDeep(this.state.form)

    let elementToBeChanged = form.props.elements.filter((e) => e.id === id)

    const image = await this.dataUrlToFile(file, Math.floor(Date.now() / 1000))

    elementToBeChanged[0].uploadedImageUrl = await new Promise((success) => {
      let xhr = new XMLHttpRequest()
      xhr.withCredentials = false
      xhr.open(
        'POST',
        `${global.env.FE_BACKEND}/api/upload/${this.state.form.id}/${this.state.selectedFieldId}`
      )

      xhr.onload = function () {
        let json

        if (xhr.status !== 200) {
          alert('HTTP Error: ' + xhr.status)
          return
        }

        json = JSON.parse(xhr.responseText)

        if (!json || typeof json.location != 'string') {
          alert('Invalid JSON: ' + xhr.responseText)
          return false
        }

        success(json.location)
      }

      let formData = new FormData()
      formData.append('file', image, image.name)

      xhr.send(formData)
    })

    this.setState({ form })
  }

  handleTitleChange(id, value) {
    const form = { ...this.state.form }

    form.title = value

    this.setState({ form })
  }

  setFormAsPrivate() {
    const form = { ...this.state.form }

    form.private = Number(!form.private)

    this.setState({ form })
  }

  handleFormElementClick(e) {
    let elemID = e.target
    let id = parseInt(elemID.id.replace('qc_', ''))

    while (elemID.id === '' || isNaN(id) === true) {
      elemID = elemID.parentNode
      id = parseInt(elemID.id.replace('qc_', ''))
      if (elemID.id === 'root') {
        return false
      }
    }

    const { elements } = this.state.form.props
    let { formId } = this.props.match.params

    const matchingElements = elements.filter((elem) => elem.id === id)

    if (matchingElements.length === 1) {
      this.props.history.push(
        `/editor/${formId}/builder/question/${id}/properties`
      )
      this.setState({
        dragging: false,
        selectedFieldId: id
      })
    }
  }

  handleFormElementDeleteClick(id) {
    const form = { ...this.state.form }
    const { params } = this.props.match

    const elemToDelete = form.props.elements.find((elem) => elem.id === id)

    if (elemToDelete === undefined) {
      return
    }

    if (elemToDelete.type === 'PageBreak') {
      const lastElem = form.props.elements[form.props.elements.length - 1]

      if (lastElem.type === 'Button') {
        lastElem.hidden = false
      }
    }

    form.props.elements = form.props.elements.filter(
      (elem) => elem.id !== elemToDelete.id
    )

    this.setState({
      form
    })

    if (typeof params.questionId !== 'undefined') {
      this.props.history.push(`/editor/${params.formId}/builder`)
    }
  }

  handleLabelClick(labelId) {
    this.setState({ selectedLabelId: labelId })
  }

  async handleSaveClick() {
    const { form, additionalSaveFunction } = this.state

    this.setState({ saving: true })

    const { data } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms`,
      method: form.id === null ? 'post' : 'put',
      body: this.state.form
    })

    this.setState({ saving: false })

    if (form.id === null && typeof data.id !== 'undefined') {
      const currentPath = this.props.history.location.pathname
      const newPath = currentPath.replace(/new/, `${data.id}`)

      this.props.history.replace(newPath)
      this.setState({
        form: {
          ...this.state.form,
          id: data.id,
          uuid: data.uuid
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
    const savedForm = cloneDeep(this.state.form)
    this.setState({ savedForm })

    // additionalSaveFunction is a function that is set by the child component eg. PostSubmission, FormProperties
    // and is used to save additional data that is not part of the form object
    if (additionalSaveFunction !== null) {
      additionalSaveFunction()
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
        resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${form.id}/publish`,
        method: 'post'
      })

      await this.loadForm(form.id, true)
    }

    this.setState({ publishing: false })
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

  removeUnavailableElems = (elem) => {
    const { capabilities } = this.props.generalContext
    const elementsToRemove = []

    if (
      capabilities.fileUploadBucket === false ||
      capabilities.googleServiceAccountCredentials === false
    ) {
      elementsToRemove.push('FileUpload')
    }

    if (capabilities.googleCredentialsClientID === false) {
      elementsToRemove.push('Image')
    }

    return !elementsToRemove.includes(elem.type)
  }

  render() {
    const isInTemplates =
      this.props.history.location.pathname.indexOf('/template') !== -1

    const noComponentPresent = this.props.history.location.pathname.endsWith(
      '/new'
    )

    if (this.state.redirect) {
      return (
        <Redirect
          to={{
            pathname: '/forms',
            state: { from: this.props.location }
          }}
        />
      )
    }
    let canEdit = true
    if (this.state.form.permissions !== undefined) {
      canEdit = this.state.form.permissions.edit
    }
    const { params } = this.props.match
    const { formId, questionId } = params

    let tabs = [
      { name: 'elements', text: 'Elements', path: `/editor/${formId}/builder` },
      {
        name: 'formProperties',
        text: 'Form Properties',
        path: `/editor/${formId}/builder/properties`
      }
    ]

    if (isInTemplates) {
      tabs = []
    }

    if (typeof questionId !== 'undefined') {
      tabs.push({
        name: 'questionProperties',
        text: 'Question Properties',
        path: `/editor/${formId}/builder/question/${params.questionId}/properties`
      })
    }
    const { form, publishedForm, loading, saving, publishing } = this.state

    console.log('form nextUniqueId', form.props.nextUniqueId)
    console.log(
      'form element ids',
      form.props.elements.map((e) => e.id)
    )

    const isPublishRequired = form.updated_at !== publishedForm.created_at
    const saveButtonProps = {}

    if (saving === true || loading === true) {
      saveButtonProps.disabled = true
    }

    return (
      <div className={`builder` + (isInTemplates ? ' templates' : '')}>
        {this.state.isModalOpen ? (
          <Modal
            isOpen={this.state.isModalOpen}
            modalContent={this.state.modalContent}
            closeModal={this.handleCloseModalClick}
          />
        ) : null}
        {this.state.isTemplateModalOpen ? this.renderTemplateModal() : null}
        <div className="headerContainer">
          <div
            className={`header grid center ${
              isInTemplates || noComponentPresent ? ' dn' : null
            }`}>
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
          <div
            className={
              'builderStageHeader builderStage' +
              (noComponentPresent ? ' dn' : '')
            }>
            <div className="formTitle col-12-16">
              {loading === false ? (
                <EditableLabel
                  className="label"
                  mode="builder"
                  canEdit={canEdit}
                  dataPlaceholder="Click to edit form title"
                  labelKey="title"
                  handleLabelChange={this.handleTitleChange}
                  limit={128}
                  value={form.title}
                />
              ) : null}
            </div>
            <div className="col-4-16 formControls">
              {canEdit ? (
                <button onClick={this.handleSaveClick} {...saveButtonProps}>
                  {saving === true ? 'Saving...' : 'Save'}
                </button>
              ) : (
                <button title="Don't have permission">Disabled</button>
              )}
              {typeof this.state.form.id === 'number' ? (
                <NavLink to={`/editor/${params.formId}/preview`}>
                  <button>Preview</button>
                </NavLink>
              ) : (
                <span>
                  <button
                    className="preview-disabled-button"
                    title="Form has to be saved before it can be previewed.">
                    Preview
                  </button>
                </span>
              )}
              {typeof this.state.form.id === 'number' ? (
                canEdit ? (
                  <button className="publish" onClick={this.handlePublishClick}>
                    {publishing === true ? 'Publishing...' : 'Publish'}
                    {isPublishRequired === true ? (
                      <div className="publishRequired"></div>
                    ) : null}
                  </button>
                ) : (
                  <button title="Don't have permission">Disabled</button>
                )
              ) : (
                <button
                  className="publish-disabled-button"
                  title="Form has to be saved before it can be published.">
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="content">
          <div
            className={`leftTabs ${
              isInTemplates || noComponentPresent ? ' dn' : null
            }`}>
            {this.renderLeftVerticalTabs()}
          </div>
          {this.renderMainContent()}
        </div>
      </div>
    )
  }

  renderTemplateModal() {
    let modalContent = {}
    const closeModal = this.handleCloseTemplateModalClick

    return (
      <Modal
        isOpen={this.state.isTemplateModalOpen}
        modalContent={modalContent}
        closeModal={closeModal}>
        <div
          className="new-form-dialogue"
          onClick={(e) => {
            e.stopPropagation()
          }}>
          <div className="modal-title">Create a new form</div>
          <div className="options-wrapper">
            <NavLink
              className="option-container"
              to="/editor/new/template"
              activeClassName="selected"
              onClick={closeModal}>
              <div className="option" onClick={closeModal}>
                <TemplateOptionSVG />
              </div>
              <span className="option-label">USE A TEMPLATE</span>
            </NavLink>

            <NavLink
              className="option-container"
              to="/editor/new/builder"
              activeClassName="selected"
              onClick={closeModal}>
              <div className="option">
                <FontAwesomeIcon
                  className="option-img"
                  icon={faPen}
                  color={'#1c5c85'}
                  size="5x"
                />
              </div>
              <span className="option-label">CREATE FROM SCRATCH</span>
            </NavLink>
          </div>
        </div>
      </Modal>
    )
  }
  renderLeftElements(elems) {
    let elements = elems.filter((elem) => this.removeUnavailableElems(elem))

    let canEdit = true
    if (this.state.form.permissions !== undefined) {
      canEdit = this.state.form.permissions.edit
    }

    const { permission } = this.props.generalContext.auth

    if (permission.admin) {
      elements.forEach((elem) => {
        permission[elem.type] = true
      })
    }

    const renderedElems = elements.map((elem) => {
      if (permission[elem.type] && canEdit) {
        // Only one captcha element is allowed
        if (elem.type === 'CAPTCHA') {
          const captchaElements = this.state.form.props.elements.filter(
            (element) => element.type === 'CAPTCHA'
          )
          if (captchaElements.length > 0) {
            return (
              <div className="element disabled-element" key={elem.type}>
                <span className="element-picker-icon-wrapper">
                  <FontAwesomeIcon
                    icon={elem.icon}
                    className="element-picker-icon"
                  />
                </span>
                <span className="element-picker-text">{elem.displayText}</span>
                <span className="planover-container">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <div className="popoverText">
                    CAPTCHA element is already present in the form.
                  </div>
                </span>
              </div>
            )
          }
        }

        // Auto Page Break is enabled, which means that manual page breaks are not allowed
        if (elem.type === 'PageBreak' && this.state.autoPBEnabled) {
          return (
            <div className="element disabled-element" key={elem.type}>
              <span className="element-picker-icon-wrapper">
                <FontAwesomeIcon
                  icon={elem.icon}
                  className="element-picker-icon"
                />
              </span>
              <span className="element-picker-text">{elem.displayText}</span>
              <span className="planover-container">
                <FontAwesomeIcon icon={faQuestionCircle} />
                <div className="popoverText">
                  Auto Page Break is enabled. Please disable it in form
                  properties to add manual page breaks.
                </div>
              </span>
            </div>
          )
        } else {
          // Render the element
          return (
            <div
              className="element"
              draggable
              onDragStart={this.handleDragStart.bind(this, elem)}
              onDragEnd={this.handleDragEnd}
              key={elem.type}>
              <span className="element-picker-icon-wrapper">
                <FontAwesomeIcon
                  icon={elem.icon}
                  className="element-picker-icon"
                />
              </span>
              <span className="element-picker-text">{elem.displayText}</span>
              <span className="add-element-button">
                <FontAwesomeIcon
                  icon={faPlusCircle}
                  title="Add Field"
                  onClick={() => this.handleAddFormElementClick(elem.type)}
                />
              </span>
            </div>
          )
        }
      } else {
        return (
          <div className="element disabled-element" key={elem.type}>
            <span className="element-picker-icon-wrapper">
              <FontAwesomeIcon
                icon={elem.icon}
                className="element-picker-icon"
              />
            </span>
            <span className="element-picker-text">{elem.displayText}</span>
            <span className="planover-container">
              <FontAwesomeIcon icon={faQuestionCircle} />
              {canEdit ? (
                <>
                  <a
                    href={global.env.FE_UPGRADE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="upgrade_button">
                    UPGRADE
                  </a>
                  <div className="popoverText">
                    Your plan does not include this element. Click here to
                    upgrade your plan!
                  </div>
                </>
              ) : (
                <div className="popoverText">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  You don't have necessary permissions
                </div>
              )}
            </span>
          </div>
        )
      }
    })

    return renderedElems
  }

  renderLeftMenuContents() {
    const { form } = this.state
    const { params } = this.props.match
    const { permission } = this.props.generalContext.auth
    const selectedField = {}
    const { questionId } = params

    let canEdit = true
    if (this.state.form.permissions !== undefined) {
      canEdit = this.state.form.permissions.edit
    }
    if (permission.admin) {
      pickerElements.forEach((elem) => {
        permission[elem.type] = true
      })
    }
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
      <div className="leftMenu leftMenuContents">
        <Switch>
          <Route exact path="/editor/:formId/builder">
            <div className="elements">
              <div className="elementsMessage">
                Drag and Drop elements into the form, or click the + icon
                that&apos;s next to the elements
              </div>
              <div className="elementList">
                {this.renderLeftElements(pickerElements)}
              </div>
            </div>
          </Route>
          <Route path="/editor/:formId/builder/properties">
            <FormProperties
              form={form}
              canEdit={canEdit}
              generalContext={this.props.generalContext}
              setIntegration={this.setIntegration}
              setFormTags={this.setFormTags}
              setAutoPageBreak={this.setAutoPageBreak}
              setFormAsPrivate={this.setFormAsPrivate}
            />
          </Route>
          <Route path="/editor/:formId/builder/question/:questionId/properties">
            {questionPropertiesReady === true ? (
              <QuestionProperties
                form={form}
                rteUploadHandler={this.rteUploadHandler}
                selectedField={selectedField}
                configureQuestion={this.configureQuestion}
                customBuilderHandlers={{
                  onDelete: this.handleFormElementDeleteClick,
                  handleDragEnd: this.handleDragEnd,
                  handleDragStart: this.handleDragStart,
                  handleFormItemMovement: this.handleFormItemMovement
                }}
                handleLabelChange={this.handleLabelChange}
                handleLabelClick={this.handleLabelClick}
                selectedLabelId={this.state.selectedLabelId}
                canEdit={canEdit}
              />
            ) : null}
          </Route>
        </Switch>
      </div>
    )
  }

  renderLeftVerticalTabs() {
    const { formId } = this.props.match.params
    const { form } = this.state

    let submitBehaviour = 'Show Thank You Page'
    // find submitBehaviour in form props.integrations
    if (form.props.integrations) {
      const foundSubmitBehaviour = form.props.integrations.find(
        (integration) => integration.type === 'submitBehaviour'
      )
      if (foundSubmitBehaviour) {
        submitBehaviour = foundSubmitBehaviour.value
      }
    }

    const postSubmissionText =
      submitBehaviour === 'Show Thank You Page'
        ? 'Thank You Page'
        : 'Evaluation Page'

    return (
      <>
        <NavLink
          to={`/editor/${formId}/builder`}
          activeClassName="selected"
          onClick={this.handleCloseIntegrationClick}>
          <FontAwesomeIcon icon={faPlusSquare} />
          <span>Build</span>
        </NavLink>
        <NavLink
          to={`/editor/${formId}/integrations`}
          activeClassName="selected"
          onClick={this.handleCloseIntegrationClick}>
          <FontAwesomeIcon icon={faGears} />
          <span>Integrations</span>
        </NavLink>
        <NavLink
          to={`/editor/${formId}/rules`}
          activeClassName="selected"
          onClick={this.handleCloseIntegrationClick}>
          <FontAwesomeIcon icon={faBoltLightning} />
          <span>Rules</span>
        </NavLink>
        <NavLink
          to={`/editor/${formId}/postsubmission`}
          activeClassName="selected"
          onClick={this.handleCloseIntegrationClick}>
          <FontAwesomeIcon icon={faCircleCheck} />
          <span>{postSubmissionText}</span>
        </NavLink>
        <NavLink to={`/editor/${formId}/design`} activeClassName="selected">
          <FontAwesomeIcon icon={faPaintBrush} />
          <span>Design</span>
        </NavLink>
        <NavLink
          to={`/editor/${formId}/share`}
          activeClassName="selected"
          onClick={this.handleCloseIntegrationClick}>
          <FontAwesomeIcon icon={faShareAlt} />
          <span>Share</span>
        </NavLink>
      </>
    )
  }

  renderMainContent() {
    const { formId } = this.props.match.params

    const { form } = this.state

    let canEdit = true
    if (this.state.form.permissions !== undefined) {
      canEdit = this.state.form.permissions.edit
    }
    if (this.state.loading === true) {
      return null
    }

    return (
      <Switch>
        <Route path="/editor/:formId/builder">
          {this.renderLeftMenuContents()}
          {this.renderBuilder()}
        </Route>
        <Route path="/editor/:formId/integrations">
          <FormIntegrations
            setIntegration={this.setIntegration}
            handleSaveClick={this.handleSaveClick}
            form={form}
            canEdit={canEdit}
          />
        </Route>
        <Route path="/editor/:formId/design">
          <DesignForm
            formId={formId}
            form={this.state.form}
            uuid={this.state.form.uuid}
            setCSS={this.setCSS}
            setFormDesign={this.setFormDesign}
            canEdit={canEdit}
          />
        </Route>
        <Route path="/editor/:formId/rules">
          <FormRules
            formId={formId}
            form={this.state.form}
            uuid={this.state.form.uuid}
            setFormRule={this.setFormRule}
            canEdit={canEdit}
          />
        </Route>
        <Route path="/editor/:formId/postsubmission">
          <PostSubmission
            form={this.state.form}
            setAdditionalSaveFunction={this.setAdditionalSaveFunction}
            setIntegration={this.setIntegration}
            canEdit={canEdit}
          />
        </Route>
        <Route path="/editor/:formId/share">
          <ShareForm
            formId={formId}
            uuid={this.state.form.uuid}
            published={this.state.form.published_version > 0}
            canEdit={canEdit}
          />
        </Route>
        <Route path="/editor/:formId/template">
          <Templates
            formId={formId}
            cloneTemplate={this.cloneTemplate}
            history={this.props.history}
            location={this.props.location}
          />
        </Route>
        <Route path="/editor/:formId/preview">
          <PreviewForm
            formID={formId}
            uuid={this.state.form.uuid}
            history={this.props.history}
          />
        </Route>
      </Switch>
    )
  }

  renderBuilder() {
    const { dragging, form, dragMode, sortItem, loading } = this.state
    const { params } = this.props.match
    let selectedFieldId = parseInt(params.questionId)

    let canEdit = true
    if (this.state.form.permissions !== undefined) {
      canEdit = this.state.form.permissions.edit
    }
    let examMode = false
    if (form.props.integrations) {
      const foundSubmitBehaviour = form.props.integrations.find(
        (integration) => integration.type === 'submitBehaviour'
      )
      if (foundSubmitBehaviour) {
        examMode = foundSubmitBehaviour.value === 'Evaluate Form'
      }
    }

    // backward compatibility for old forms without design
    const theme =
      this.state.form.props.design === undefined
        ? 'gleam'
        : this.state.form.props.design.theme

    return (
      <div className="builderStage">
        {this.state.isWindows ? (
          <style
            dangerouslySetInnerHTML={{
              __html: `
          @font-face {
            font-family: "Twemoji Country Flags";
            unicode-range: U+1F1E6-1F1FF, U+1F3F4, U+E0062-E0063, U+E0065, U+E0067,
            U+E006C, U+E006E, U+E0073-E0074, U+E0077, U+E007F;
            src: url('https://cdn.jsdelivr.net/npm/country-flag-emoji-polyfill@0.1/dist/TwemojiCountryFlags.woff2') format('woff2');
          }`
            }}
          />
        ) : null}
        {loading === true ? (
          'Loading...'
        ) : (
          <Renderer
            className={
              `fl form` +
              (canEdit ? '' : ' renderer') +
              (examMode ? ' exam-mode' : '')
            }
            builderHandlers={{
              onDrop: this.handleDrop,
              onDragOver: this.handleDragOver,
              onClick: this.handleFormElementClick
            }}
            customBuilderHandlers={{
              onDelete: this.handleFormElementDeleteClick,
              handleDragEnd: this.handleDragEnd,
              handleDragStart: this.handleDragStart,
              handleFormItemMovement: this.handleFormItemMovement
            }}
            imageUploadHandler={this.imageUploadHandler}
            rteUploadHandler={this.rteUploadHandler}
            draggingItemType={this.state.draggingItemType}
            handleLabelChange={this.handleLabelChange}
            handleLabelClick={this.handleLabelClick}
            configureQuestion={this.configureQuestion}
            dragIndex={this.state.dragIndex}
            dragging={dragging}
            dragMode={dragMode}
            sortItem={sortItem}
            insertBefore={this.state.insertBefore}
            form={form}
            selectedField={selectedFieldId}
            selectedLabelId={this.state.selectedLabelId}
            mode={canEdit ? 'builder' : 'viewer'}
            theme={theme}
          />
        )}
        {form.props.elements.length > 0 && !this.state.autoPBEnabled ? (
          <div
            onClick={this.handleAddNewPage}
            className="pagebreak-new-placeholder">
            Click here to add a new page.
          </div>
        ) : null}
        {this.props.generalContext.auth.user_role === 2 &&
        form.sharedUserId === undefined ? (
          <span
            className="branding-container"
            onMouseEnter={(e) => {
              // can later be moved into a separate function for reusability
              const rect = e.target.getBoundingClientRect()
              const diff = rect.right - e.clientX
              const rightPercentage = (100 * diff) / rect.width
              const popover = document.getElementById('branding-popover')
              popover.style.position = 'absolute'
              popover.style.top = e.clientY + 'px'
              popover.style.left =
                (rightPercentage > 20 ? e.clientX : e.clientX - 230) + 'px'
            }}>
            <div
              className="branding"
              title="Upgrade your plan to remove branding.">
              <img
                alt="Formpress Logo"
                src="https://static.formpress.org/images/formpresslogomotto.png"
                className="formpress-logo"
              />
              <div
                className="branding-text"
                title="Visit FormPress and start building awesome forms!">
                Created via FormPress{' '}
                <a
                  href="https://formpress.org"
                  target="_blank"
                  rel="noopener noreferrer">
                  Online Form Builder.
                </a>{' '}
              </div>
            </div>
            <div id="branding-popover" className="popoverText">
              Want to remove branding?{' '}
              <a
                href={global.env.FE_UPGRADE_LINK}
                target="_blank"
                rel="noopener noreferrer">
                Upgrade your plan.
              </a>
            </div>
          </span>
        ) : null}
      </div>
    )
  }
}
