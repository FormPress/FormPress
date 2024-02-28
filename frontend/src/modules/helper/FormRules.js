import React, { Component } from 'react'
import './FormRules.css'
import Renderer from '../Renderer'
import * as Elements from '../elements'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faCircleCheck,
  faAsterisk,
  faPencilSquare,
  faPlusCircle,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons'

import { api } from '../../helper'
import GeneralContext from '../../general.context'

const rulesWithMetadata = [
  {
    icon: faEye,
    display: 'Show/Hide Elements',
    value: 'showHide'
  },
  {
    icon: faCircleCheck,
    display: 'Change Thank You Page',
    value: 'changeTyPage'
  },
  {
    icon: faAsterisk, // font-size: 15pt; olacak
    display: 'Change Required Status',
    value: 'changeRequiredStatus'
  }
]

// TODO: Improve policies
const operatorsWithMetadata = [
  {
    value: 'equals',
    display: 'Is Equal To',
    applyTo: [
      'TextBox',
      'TextArea',
      'Email',
      'Phone',
      'Dropdown',
      'Checkbox',
      'Radio',
      'RatingScale',
      'NetPromoterScore',
      'Name'
    ]
  },
  {
    value: 'notEquals',
    display: 'Is Not Equal To',
    applyTo: [
      'TextBox',
      'TextArea',
      'Email',
      'Phone',
      'Dropdown',
      'Checkbox',
      'Radio',
      'RatingScale',
      'NetPromoterScore',
      'Name'
    ]
  },
  {
    value: 'contains',
    display: 'Contains',
    applyTo: [
      'TextBox',
      'TextArea',
      'Email',
      'Phone',
      'Checkbox',
      'Name',
      'Address'
    ]
  },
  {
    value: 'notContains',
    display: 'Does Not Contain',
    applyTo: [
      'TextBox',
      'TextArea',
      'Email',
      'Phone',
      'Checkbox',
      'Name',
      'Address'
    ]
  },
  {
    value: 'startsWith',
    display: 'Starts With',
    applyTo: ['TextBox', 'TextArea', 'Email', 'Phone', 'Checkbox', 'Name']
  },
  {
    value: 'notStartsWith',
    display: 'Does Not Start With',
    applyTo: ['TextBox', 'TextArea', 'Email', 'Phone', 'Checkbox', 'Name']
  },
  {
    value: 'endsWith',
    display: 'Ends With',
    applyTo: ['TextBox', 'TextArea', 'Email', 'Phone', 'Checkbox', 'Name']
  },
  {
    value: 'notEndsWith',
    display: 'Does Not End With',
    applyTo: ['TextBox', 'TextArea', 'Email', 'Phone', 'Checkbox', 'Name']
  },
  {
    value: 'isEmpty',
    display: 'Is Empty',
    applyTo: [
      'TextBox',
      'TextArea',
      'Email',
      'Phone',
      'DatePicker',
      'Dropdown',
      'Checkbox',
      'Radio',
      'RatingScale',
      'NetPromoterScore',
      'Name',
      'Address',
      'FileUpload'
    ]
  },
  {
    value: 'isFilled',
    display: 'Is Filled',
    applyTo: [
      'TextBox',
      'TextArea',
      'Email',
      'Phone',
      'DatePicker',
      'Dropdown',
      'Checkbox',
      'Radio',
      'RatingScale',
      'NetPromoterScore',
      'Name',
      'Address',
      'FileUpload'
    ]
  },
  {
    value: 'isEarlierThan',
    display: 'Is Earlier Than',
    applyTo: ['DatePicker']
  },
  {
    value: 'isLaterThan',
    display: 'Is Later Than',
    applyTo: ['DatePicker']
  }
]

const commandsDict = {
  changeTyPage: [
    {
      display: 'Display Selected Page',
      value: 'displaySelectedPage'
    }
  ],
  showHide: [
    {
      display: 'Show',
      value: 'show'
    },
    {
      display: 'Hide',
      value: 'hide'
    }
  ],
  changeRequiredStatus: [
    {
      display: 'Set as Required',
      value: 'setRequired'
    },
    {
      display: 'Set as Not Required',
      value: 'setNotRequired'
    }
  ]
}

class FormRules extends Component {
  constructor(props) {
    super(props)

    this.formId = this.props.formId
    this.uuid = this.props.uuid

    this.state = {
      loading: true,
      mode: 'view',
      editingRule: null,
      ruleConfig: null
    }

    this.handleToggleRuleBuilder = this.handleToggleRuleBuilder.bind(this)
    this.deleteRule = this.deleteRule.bind(this)
    this.renderTypeSelect = this.renderTypeSelect.bind(this)
  }

  async componentDidMount() {
    let userTyPages = []
    try {
      const result = await api({
        resource: `/api/users/${this.props.generalContext.auth.user_id}/thankyou?meta=true`,
        method: 'get'
      })

      const { data } = result

      userTyPages = data
    } catch (error) {
      console.error(error)
    }

    this.setState({ userTyPages, loading: false })
  }

  deleteRule(rule) {
    if (this.props.canEdit) {
      rule.delete = true
      this.props.setFormRule(rule)
    }
  }

  editRule(rule) {
    if (this.props.canEdit) {
      const ruleConfig = rulesWithMetadata.find(
        (item) => item.value === rule.type
      )
      if (!ruleConfig) {
        console.error('Rule config not found')
        return
      }
      this.setState({ mode: 'build', editingRule: rule, ruleConfig })
    }
  }

  handleToggleRuleBuilder() {
    // will replace build with typeSelect
    if (this.props.canEdit) {
      if (this.state.mode === 'view') {
        this.setState({ mode: 'typeSelect', editingRule: null })
      } else {
        this.setState({ mode: 'view', editingRule: null, ruleConfig: null })
      }
    }
  }

  renderTypeSelect() {
    const handleRuleClick = (rule) => {
      this.setState({ ruleConfig: rule, mode: 'build' })
    }
    return (
      <div className="rule-selector">
        {rulesWithMetadata.map((rule, index) => (
          <div
            key={index}
            className={`rule ` + (rule.value ? rule.value : '')}
            onClick={() => handleRuleClick(rule)}>
            <div className="rule-icon">
              <FontAwesomeIcon icon={rule.icon || faEye} />
            </div>
            <div className="rule-display">{rule.display}</div>
          </div>
        ))}
      </div>
    )
  }

  render() {
    const { mode, loading } = this.state

    if (loading) {
      return null
    }

    const { form } = this.props
    const elements = form.props.elements || []

    const rules = form.props.rules || []

    let dynamicButtonJSX

    if (mode === 'view') {
      dynamicButtonJSX = (
        <>
          <FontAwesomeIcon icon={faPlusCircle} /> Add New Rule{' '}
        </>
      )
    } else {
      dynamicButtonJSX = (
        <>
          <FontAwesomeIcon icon={faTimes} /> Close rule builder{' '}
        </>
      )
    }

    return (
      <div className="formRules-wrapper">
        <div>
          <div className="formRules-title">Form Rules</div>
          <>
            <button
              className={
                'addNewRule-button' + (mode !== 'view' ? ' active' : '')
              }
              onClick={() => this.handleToggleRuleBuilder()}>
              {dynamicButtonJSX}
            </button>
            <div className={'formRules-list' + (mode ? ` ${mode}` : '')}>
              {rules.length === 0 ? (
                <div className="noRules">
                  No rules found. Click the button above to start adding rules.
                </div>
              ) : (
                rules.map((rule, index) => {
                  const matchedRuleConfig = rulesWithMetadata.find(
                    (r) => r.value === rule.type
                  )

                  const resolvedTexts = {
                    ifField: '',
                    ifOperator: operatorsWithMetadata.find(
                      (o) => o.value === rule.if.operator
                    )?.display,
                    ifValue: '',
                    thenCommand: commandsDict[rule.type].find(
                      (c) => c.value === rule.then.command
                    )?.display,
                    thenField: ''
                  }

                  const foundIfField = elements.find(
                    (e) => e.id === parseInt(rule.if.field)
                  )

                  if (foundIfField !== undefined) {
                    if (foundIfField.type !== 'Button') {
                      resolvedTexts.ifField =
                        foundIfField.label ||
                        foundIfField.type ||
                        ` Field ${foundIfField.id}`
                    } else {
                      resolvedTexts.ifField =
                        foundIfField.buttonText || 'Button'
                    }
                  }

                  if (rule.fieldLink === true) {
                    let foundIfValueRefField = elements.find(
                      (e) => e.id === parseInt(rule.if.value)
                    )
                    if (foundIfValueRefField !== undefined) {
                      resolvedTexts.ifValue =
                        foundIfValueRefField.label ||
                        foundIfValueRefField.type ||
                        ` Field ${foundIfValueRefField.id}`
                    }
                  } else {
                    resolvedTexts.ifValue = rule.if.value
                  }

                  if (rule.type !== 'changeTyPage') {
                    const foundThenField = elements.find(
                      (e) => e.id === parseInt(rule.then.field)
                    )

                    if (foundThenField !== undefined) {
                      switch (foundThenField.type) {
                        case 'Button':
                          resolvedTexts.thenField =
                            foundThenField.buttonText || 'Button'
                          break
                        case 'Radio':
                          if (foundThenField.editor === true) {
                            resolvedTexts.thenField =
                              foundThenField.label.replace(/<[^>]*>?/gm, '')
                          } else {
                            resolvedTexts.thenField = foundThenField.label
                          }
                          break
                        default:
                          resolvedTexts.thenField =
                            foundThenField.label ||
                            foundThenField.type ||
                            ` Field ${foundThenField.id}`
                          break
                      }
                    }
                  } else {
                    const foundThenField = this.state.userTyPages.find(
                      (e) => e.id === parseInt(rule.then.field)
                    )

                    if (foundThenField !== undefined) {
                      resolvedTexts.thenField = foundThenField.title
                    }
                  }

                  Object.keys(resolvedTexts).forEach((key) => {
                    if (resolvedTexts[key].length > 50) {
                      resolvedTexts[key] =
                        resolvedTexts[key].substring(0, 50) + '...'
                    }
                  })

                  return (
                    <div className={'formRule ' + rule.type} key={index}>
                      <div className="formRule-header">
                        <FontAwesomeIcon icon={matchedRuleConfig.icon} />
                        {' ' + matchedRuleConfig.display}

                        <div className="formRule-controls">
                          <FontAwesomeIcon
                            icon={faPencilSquare}
                            className={'editRule'}
                            title={'Edit Rule'}
                            onClick={() => this.editRule(rule)}
                          />
                          &nbsp;&nbsp;
                          <FontAwesomeIcon
                            icon={faTrash}
                            className={'deleteRule'}
                            title={'Remove Rule'}
                            onClick={() => this.deleteRule(rule)}
                          />
                        </div>
                      </div>
                      <div className="formRule-body">
                        If{' '}
                        <span className="ifField">{resolvedTexts.ifField}</span>{' '}
                        <span className="ifOperator">
                          {resolvedTexts.ifOperator}
                        </span>{' '}
                        <span className="ifValue">{resolvedTexts.ifValue}</span>
                        ,{' '}
                        <span className="thenCommand">
                          {resolvedTexts.thenCommand}
                        </span>
                        <span className="thenField">
                          {resolvedTexts.thenField}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        </div>

        {mode === 'typeSelect' ? <>{this.renderTypeSelect()}</> : null}

        {mode === 'build' ? (
          <RuleBuilder
            className={mode === 'build' ? ' build' : ''}
            form={this.props.form}
            userTyPages={this.state.userTyPages}
            setFormRule={this.props.setFormRule}
            editingRule={this.state.editingRule}
            ruleConfig={this.state.ruleConfig}
            generalContext={this.props.generalContext}
            handleToggleRuleBuilder={this.handleToggleRuleBuilder}
          />
        ) : null}
      </div>
    )
  }
}

class RuleBuilder extends Component {
  constructor(props) {
    super(props)

    this.ruleConfig = this.props.ruleConfig

    this.state = {
      loading: true,
      inputElements: [],
      operators: operatorsWithMetadata,
      commands: commandsDict[this.ruleConfig.value],
      currentRule: {
        if: {
          field: '',
          operator: '',
          value: ''
        },
        then: {
          command: '',
          field: '',
          value: ''
        },
        fieldLink: false,
        type: null
      }
    }

    this.filterElementsWithInput = this.filterElementsWithInput.bind(this)
    this.changeRule = this.changeRule.bind(this)
    this.addRule = this.addRule.bind(this)
    this.isStepReadyToDisplay = this.isStepReadyToDisplay.bind(this)
  }

  async componentDidMount() {
    this.filterElementsWithInput()

    const { ruleConfig } = this.props
    const { currentRule } = this.state

    if (ruleConfig !== null) {
      currentRule.type = ruleConfig.value
    }

    const { editingRule } = this.props

    if (editingRule !== null) {
      Object.keys(currentRule).forEach((key) => {
        if (editingRule[key] !== undefined) {
          currentRule[key] = editingRule[key]
        }

        currentRule.id = editingRule.id
      })
    }

    const selectedIfField = this.props.form.props.elements.find(
      (e) => e.id === parseInt(currentRule.if.field)
    )

    this.setState({ currentRule, selectedIfField, loading: false })
  }

  addRule() {
    const { currentRule, selectedIfField } = this.state
    const { if: ifRule, then: thenRule } = currentRule

    if (
      ifRule.field === '' ||
      ifRule.operator === '' ||
      thenRule.command === '' ||
      thenRule.field === ''
    ) {
      return
    }

    const elemsThatHasArrayValue = [
      'Checkbox',
      'Radio',
      'NetPromoterScore',
      'RatingScale',
      'Dropdown'
    ]

    let arrayValueField = false
    if (selectedIfField !== undefined) {
      arrayValueField = elemsThatHasArrayValue.includes(selectedIfField.type)
    }

    // if the field is an array value field, it's sure that fieldlink can't be true
    if (arrayValueField) {
      currentRule.fieldLink = false
    }

    this.props.setFormRule(currentRule)

    this.setState({
      currentRule: {
        fieldLink: true,
        type: null,
        if: {
          field: '',
          operator: '',
          value: ''
        },
        then: {
          command: '',
          field: '',
          value: ''
        }
      }
    })

    this.props.handleToggleRuleBuilder()
  }

  filterElementsWithInput() {
    const elements = this.props.form.props.elements
    const inputElements = []

    elements.forEach((elem) => {
      if (Elements[elem.type].metaData.group === 'inputElement') {
        const inputElement = {
          display: elem.label,
          value: elem.id,
          required: elem.required,
          type: elem.type
        }
        inputElements.push(inputElement)
      }
    })

    this.setState({ inputElements: inputElements })
  }

  changeRule(key, htmlElem) {
    const { currentRule } = this.state
    const { value } = htmlElem

    let { selectedIfField } = this.state

    switch (key) {
      case 'fieldLink':
        currentRule.if.value = ''
        currentRule.fieldLink = !currentRule.fieldLink
        break
      case 'ifField':
        selectedIfField = this.props.form.props.elements.find(
          (e) => e.id === parseInt(value)
        )
        currentRule.if.field = value
        break
      case 'ifOperator':
        // and if the operator is isFilled or isEmpty and the previous value was a non-isFilled or non-isEmpty operator, then we need to reset the rest of the rule
        // to avoid errors and wrongfully configured rules
        if (
          (value === 'isFilled' || value === 'isEmpty') &&
          currentRule.if.operator !== 'isFilled' &&
          currentRule.if.operator !== 'isEmpty'
        ) {
          currentRule.if.value = ''
          currentRule.then.command = ''
          currentRule.then.field = ''
          currentRule.then.value = ''
        }

        currentRule.if.operator = value

        break
      case 'ifValue':
        if (
          selectedIfField.type === 'DatePicker' &&
          selectedIfField.timePicker === true
        ) {
          // we may have to get two values one being the date and the other being the time. so we have to combine them
          const valueIncludesTime = currentRule.if.value.split(' ').length === 2
          if (htmlElem.type === 'date') {
            currentRule.if.value = value + ' 00:00'
          } else if (htmlElem.type === 'time') {
            if (valueIncludesTime === false) {
              currentRule.if.value = currentRule.if.value + ' ' + value
            } else {
              currentRule.if.value =
                currentRule.if.value.split(' ')[0] + ' ' + value
            }
          }
        } else {
          currentRule.if.value = value
        }
        break
      case 'thenCommand':
        currentRule.then.command = value
        break
      case 'thenField':
        currentRule.then.field = value
        break
      case 'thenValue':
        currentRule.then.value = value
        break
      default:
        break
    }

    this.setState({ currentRule, selectedIfField })
  }

  isStepReadyToDisplay(stepName) {
    // this function is used to hide/show the rule steps based on the user entry
    // only if the user selected a step, the next step will be shown
    const { currentRule } = this.state
    let { selectedIfField } = this.state
    let emptyOrFilledOperator = false

    if (
      currentRule.if.operator === 'isFilled' ||
      currentRule.if.operator === 'isEmpty'
    ) {
      emptyOrFilledOperator = true
    }

    switch (stepName) {
      case 'ifField':
        return currentRule.type !== null
      case 'ifOperator':
        return currentRule.if.field !== ''
      case 'ifValue':
        if (currentRule.if.operator === '' || emptyOrFilledOperator === true) {
          return false
        } else {
          return true
        }
      case 'thenCommand':
        // if empty or filled operator is selected, only the step above can be hidden
        if (
          selectedIfField?.type === 'DatePicker' &&
          selectedIfField?.timePicker === true
        ) {
          // if not divisible by an empty space, then it's not a date and time value, yet.
          // so we can't show the next step
          if (currentRule.if.value.split(' ').length !== 2) {
            return false
          } else {
            return true
          }
        }

        return currentRule.if.value !== '' || emptyOrFilledOperator === true
      case 'thenField':
        return currentRule.then.command !== ''
      case 'thenValue':
        return currentRule.then.field !== ''
      case 'saveRule':
        if (
          currentRule.if.field === '' ||
          (currentRule.if.value === '' && emptyOrFilledOperator === false) ||
          currentRule.if.operator === '' ||
          currentRule.then.command === '' ||
          currentRule.then.field === ''
        ) {
          return false
        } else {
          return true
        }
      default:
        return false
    }
  }

  render() {
    const { currentRule, selectedIfField, loading } = this.state

    if (loading) {
      return null
    }

    const { ruleConfig } = this.props

    const { operator } = currentRule.if
    const elemsThatHasArrayValue = [
      'Checkbox',
      'Radio',
      'NetPromoterScore',
      'RatingScale',
      'Dropdown'
    ]

    const excludedFields = []

    let arrayValueField = false
    if (selectedIfField !== undefined) {
      arrayValueField = elemsThatHasArrayValue.includes(selectedIfField.type)
      excludedFields.push(selectedIfField.id)
    }

    let thenFields

    if (currentRule.type === 'changeTyPage') {
      thenFields = this.props.userTyPages.map((elem) => {
        return { display: elem.title, value: elem.id }
      })
    } else if (currentRule.type === 'showHide') {
      thenFields = this.props.form.props.elements
        .filter((elem) => {
          if (elem.type === 'PageBreak') {
            return false
          }

          if (excludedFields.includes(elem.id)) {
            return false
          }

          return true
        })
        .map((elem) => {
          return {
            display: elem.label || elem.buttonText || elem.type,
            value: elem.id
          }
        })
    } else if (currentRule.type === 'changeRequiredStatus') {
      const { then } = currentRule
      thenFields = this.state.inputElements.filter((elem) => {
        if (excludedFields.includes(elem.id)) {
          return false
        }

        if (then.command === 'setRequired') {
          return elem.required === false || elem.required === undefined
        } else if (then.command === 'setNotRequired') {
          return elem.required === true
        }

        return true
      })
    }

    return (
      <div className={'ruleBuilder-wrapper' + this.props.className}>
        <div>
          <div className={'bs-mild ruleBuilder-container ' + ruleConfig.value}>
            <div className="ruleBuilder-header">
              <FontAwesomeIcon icon={ruleConfig.icon} />{' '}
              {this.props.ruleConfig.display || 'err'}
            </div>
            <div className="ruleBuilder-content">
              <div className={'ifBlock'}>
                <div className="input-block">
                  <div className="input-block-title">IF</div>
                  <Renderer
                    className="form"
                    theme="infernal"
                    allowInternal={true}
                    handleFieldChange={(elem, e) =>
                      this.changeRule('ifField', e.target)
                    }
                    form={{
                      props: {
                        elements: [
                          {
                            id: 1,
                            type: 'Dropdown',
                            options: this.state.inputElements,
                            placeholder: 'Select a field',
                            value: currentRule.if.field
                          }
                        ]
                      }
                    }}
                  />
                </div>
                {this.isStepReadyToDisplay('ifOperator') ? (
                  <div className="input-block">
                    <div className="input-block-title">STATEMENT</div>
                    <Renderer
                      className="form"
                      theme="infernal"
                      allowInternal={true}
                      handleFieldChange={(elem, e) =>
                        this.changeRule('ifOperator', e.target)
                      }
                      form={{
                        props: {
                          elements: [
                            {
                              id: 1,
                              type: 'Dropdown',
                              options: this.state.operators.filter((elem) => {
                                if (selectedIfField !== undefined) {
                                  return !!elem.applyTo.includes(
                                    selectedIfField.type
                                  )
                                }
                                return true
                              }),
                              placeholder: 'Select a statement',
                              value: currentRule.if.operator
                            }
                          ]
                        }
                      }}
                    />
                  </div>
                ) : null}

                {this.isStepReadyToDisplay('ifValue') ? (
                  <div className="input-block">
                    <div className="input-block-title">VALUE</div>

                    <div className="fieldLink-row">
                      {arrayValueField === true ? (
                        <Renderer
                          className="form fieldLink-value"
                          theme="infernal"
                          allowInternal={true}
                          handleFieldChange={(elem, e) =>
                            this.changeRule('ifValue', e.target)
                          }
                          form={{
                            props: {
                              elements: [
                                {
                                  id: 1,
                                  type: 'Dropdown',
                                  options: (() => {
                                    if (
                                      selectedIfField.type === 'RatingScale'
                                    ) {
                                      const length =
                                        selectedIfField.ratingScaleOptionTopLimit ||
                                        5
                                      const options = Array.from(
                                        { length },
                                        (_, i) => (i + 1).toString()
                                      )

                                      return options || []
                                    }

                                    return selectedIfField.options
                                  })(),
                                  placeholder: 'Select a value',
                                  value: currentRule.if.value
                                }
                              ]
                            }
                          }}
                        />
                      ) : currentRule.fieldLink ? (
                        <Renderer
                          className="form fieldLink-value"
                          theme="infernal"
                          allowInternal={true}
                          handleFieldChange={(elem, e) =>
                            this.changeRule('ifValue', e.target)
                          }
                          form={{
                            props: {
                              elements: [
                                {
                                  id: 1,
                                  type: 'Dropdown',
                                  options: this.state.inputElements.filter(
                                    (elem) => {
                                      // a date will only be compared to another date
                                      if (
                                        selectedIfField.type === 'DatePicker'
                                      ) {
                                        return (
                                          elem.type === 'DatePicker' &&
                                          elem.value !== selectedIfField.id
                                        )
                                      }

                                      return (
                                        elem.value !==
                                        parseInt(currentRule.if.field)
                                      )
                                    }
                                  ),
                                  placeholder: 'Select a field',
                                  value: currentRule.if.value
                                }
                              ]
                            }
                          }}
                        />
                      ) : (
                        <Renderer
                          className="form fieldLink-value"
                          theme="infernal"
                          allowInternal={true}
                          handleFieldChange={(elem, e) =>
                            this.changeRule('ifValue', e.target)
                          }
                          form={{
                            props: {
                              elements: [
                                {
                                  id: 1,
                                  type:
                                    operator === 'isEarlierThan' ||
                                    operator === 'isLaterThan'
                                      ? 'DatePicker'
                                      : 'TextBox',
                                  placeholder: 'Enter a value',
                                  value: currentRule.if.value,
                                  timePicker: selectedIfField?.timePicker
                                }
                              ]
                            }
                          }}
                        />
                      )}

                      {arrayValueField === true ? null : (
                        <Renderer
                          className="form fieldLink-checkbox"
                          theme="infernal"
                          allowInternal={true}
                          handleFieldChange={(elem, e) =>
                            this.changeRule('fieldLink', e.target)
                          }
                          form={{
                            props: {
                              elements: [
                                {
                                  id: 1,
                                  type: 'Checkbox',
                                  options: ['Link to another field'],
                                  value: this.state.currentRule.fieldLink
                                }
                              ]
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className={'thenBlock'}>
                {this.isStepReadyToDisplay('thenCommand') ? (
                  <div className="input-block">
                    <div className="input-block-title">THEN</div>
                    <Renderer
                      className="form"
                      theme="infernal"
                      allowInternal={true}
                      handleFieldChange={(elem, e) =>
                        this.changeRule('thenCommand', e.target)
                      }
                      form={{
                        props: {
                          elements: [
                            {
                              id: 1,
                              type: 'Dropdown',
                              options: this.state.commands,
                              placeholder: 'Select a command',
                              value: currentRule.then.command
                            }
                          ]
                        }
                      }}
                    />
                  </div>
                ) : null}

                {this.isStepReadyToDisplay('thenField') ? (
                  <div className="input-block">
                    <div className="input-block-title">TARGET</div>
                    <Renderer
                      className="form"
                      theme="infernal"
                      allowInternal={true}
                      handleFieldChange={(elem, e) =>
                        this.changeRule('thenField', e.target)
                      }
                      form={{
                        props: {
                          elements: [
                            {
                              id: 1,
                              type: 'Dropdown',
                              options: thenFields,
                              placeholder: 'Select a field',
                              value: currentRule.then.field
                            }
                          ]
                        }
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {this.isStepReadyToDisplay('saveRule') ? (
            <Renderer
              className="form addRule-button"
              theme="gleam"
              allowInternal={true}
              form={{
                props: {
                  elements: [
                    {
                      id: 1,
                      type: 'Button',
                      buttonText: 'Save',
                      onClick: () => this.addRule()
                    }
                  ]
                }
              }}
            />
          ) : null}
        </div>
      </div>
    )
  }
}
const FormRulesWrapped = (props) => (
  <GeneralContext.Consumer>
    {(value) => <FormRules {...props} generalContext={value} />}
  </GeneralContext.Consumer>
)

export default FormRulesWrapped
