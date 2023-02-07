import React, { Component } from 'react'
import './FormRules.css'
import Renderer from '../Renderer'
import * as Elements from '../elements'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faPencilSquare,
  faPlusCircle,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons'

const operators = {
  equals: 'Is Equal To',
  notEquals: 'Is Not Equal To',
  contains: 'Contains',
  notContains: 'Does Not Contain',
  startsWith: 'Starts With',
  notStartsWith: 'Does Not Start With',
  endsWith: 'Ends With',
  notEndsWith: 'Does Not End With',
  isEmpty: 'Is Empty',
  isFilled: 'Is Filled'
}

const commands = {
  show: 'Show',
  hide: 'Hide'
}

class FormRules extends Component {
  constructor(props) {
    super(props)

    this.formId = this.props.formId
    this.uuid = this.props.uuid

    this.state = {
      mode: 'view',
      editingRule: null
    }

    this.handleToggleRuleBuilder = this.handleToggleRuleBuilder.bind(this)
    this.deleteRule = this.deleteRule.bind(this)
  }

  deleteRule(rule) {
    rule.delete = true
    this.props.setFormRule(rule)
  }

  editRule(rule) {
    this.setState({ mode: 'build', editingRule: rule })
  }

  handleToggleRuleBuilder() {
    if (this.state.mode === 'build') {
      this.setState({ mode: 'view', editingRule: null })
    } else {
      this.setState({ mode: 'build', editingRule: null })
    }
  }

  render() {
    const { mode } = this.state
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
                'addNewRule-button' + (mode === 'build' ? ' active' : '')
              }
              onClick={() => this.handleToggleRuleBuilder()}>
              {dynamicButtonJSX}
            </button>
            <div
              className={'formRules-list' + (mode === 'build' ? ' build' : '')}>
              {rules.length === 0 ? (
                <div className="noRules">
                  No rules found. Click the button above to start adding rules.
                </div>
              ) : (
                rules.map((rule, index) => {
                  const resolvedTexts = {
                    ifField: '',
                    ifOperator: operators[rule.if.operator].toLowerCase(),
                    ifValue: '',
                    thenCommand: commands[rule.then.command].toLowerCase(),
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

                  let foundIfValueRefField = null

                  if (rule.fieldLink === true) {
                    foundIfValueRefField = elements.find(
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

                  const foundThenField = elements.find(
                    (e) => e.id === parseInt(rule.then.field)
                  )

                  if (foundThenField !== undefined) {
                    if (foundThenField.type !== 'Button') {
                      resolvedTexts.thenField =
                        foundThenField.label ||
                        foundThenField.type ||
                        ` Field ${foundThenField.id}`
                    } else {
                      resolvedTexts.thenField =
                        foundThenField.buttonText || 'Button'
                    }
                  }

                  return (
                    <div className="formRule" key={index}>
                      <div className="formRule-header">
                        <FontAwesomeIcon icon={faEye} /> Show / Hide Fields
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
                        <span className="ifField">
                          {resolvedTexts.ifField.substring(0, 35)}
                        </span>{' '}
                        <span className="ifOperator">
                          {resolvedTexts.ifOperator}
                        </span>{' '}
                        <span className="ifValue">
                          {resolvedTexts.ifValue.substring(0, 35)}
                        </span>
                        ,{' '}
                        <span className="thenCommand">
                          {resolvedTexts.thenCommand}
                        </span>
                        <span className="thenField">
                          {resolvedTexts.thenField.substring(0, 35)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        </div>
        <RuleBuilder
          className={mode === 'build' ? ' build' : ''}
          form={this.props.form}
          setFormRule={this.props.setFormRule}
          editingRule={this.state.editingRule}
          handleToggleRuleBuilder={this.handleToggleRuleBuilder}
        />
      </div>
    )
  }
}

class RuleBuilder extends Component {
  constructor(props) {
    super(props)

    this.state = {
      inputElements: [],
      fieldLink: true,
      operators: Object.keys(operators).map((key) => {
        return { value: key, display: operators[key] }
      }),
      commands: Object.keys(commands).map((key) => {
        return { value: key, display: commands[key] }
      }),
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
        fieldLink: true,
        type: 'showHide'
      }
    }

    this.filterElementsWithInput = this.filterElementsWithInput.bind(this)
    this.changeRule = this.changeRule.bind(this)
    this.addRule = this.addRule.bind(this)
  }

  componentDidMount() {
    this.filterElementsWithInput()
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.editingRule !== null &&
      (prevProps.editingRule === null ||
        prevProps.editingRule.id !== this.props.editingRule.id)
    ) {
      const selectedIfField = this.props.form.props.elements.find(
        (e) => e.id === parseInt(this.props.editingRule.if.field)
      )
      this.setState({
        currentRule: this.props.editingRule,
        selectedIfField
      })
    }
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
      'RatingScale'
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
        type: 'showHide',
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
          value: elem.id
        }
        inputElements.push(inputElement)
      }
    })
    this.setState({ inputElements: inputElements })
  }

  changeRule(key, value) {
    const { currentRule } = this.state
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
        currentRule.if.operator = value
        break
      case 'ifValue':
        currentRule.if.value = value
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

  render() {
    const { currentRule, selectedIfField } = this.state
    const { operator } = currentRule.if
    const elemsThatHasArrayValue = [
      'Checkbox',
      'Radio',
      'NetPromoterScore',
      'RatingScale'
    ]

    const excludedFields = []

    let arrayValueField = false
    if (selectedIfField !== undefined) {
      arrayValueField = elemsThatHasArrayValue.includes(selectedIfField.type)
      excludedFields.push(selectedIfField.id)
    }

    let thenFields = this.props.form.props.elements
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

    let ruleTypeFormattedText = ''
    let ruleTypeIcon = faEye // TODO: improve this

    if (currentRule.type === 'showHide') {
      ruleTypeFormattedText = 'Show / Hide Fields'
      ruleTypeIcon = faEye
    }

    return (
      <div className={'ruleBuilder-wrapper' + this.props.className}>
        <div>
          <div className="bs-mild">
            <div className="ruleBuilder-header">
              <FontAwesomeIcon icon={ruleTypeIcon} />{' '}
              {ruleTypeFormattedText || ' Show / Hide Fields'}
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
                      this.changeRule('ifField', e.target.value)
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
                <div className="input-block">
                  <div className="input-block-title">STATEMENT</div>
                  <Renderer
                    className="form"
                    theme="infernal"
                    allowInternal={true}
                    handleFieldChange={(elem, e) =>
                      this.changeRule('ifOperator', e.target.value)
                    }
                    form={{
                      props: {
                        elements: [
                          {
                            id: 1,
                            type: 'Dropdown',
                            options: this.state.operators,
                            placeholder: 'Select a statement',
                            value: currentRule.if.operator
                          }
                        ]
                      }
                    }}
                  />
                </div>
                {operator === 'isFilled' || operator === 'isEmpty' ? null : (
                  <div className="input-block">
                    <div className="input-block-title">VALUE</div>

                    <div className="fieldLink-row">
                      {arrayValueField === true ? (
                        <Renderer
                          className="form"
                          theme="infernal"
                          allowInternal={true}
                          handleFieldChange={(elem, e) =>
                            this.changeRule('ifValue', e.target.value)
                          }
                          form={{
                            props: {
                              elements: [
                                {
                                  id: 1,
                                  type: 'Dropdown',
                                  options: selectedIfField.options || [],
                                  placeholder: 'Select a field',
                                  value: currentRule.if.value
                                }
                              ]
                            }
                          }}
                        />
                      ) : currentRule.fieldLink ? (
                        <Renderer
                          className="form"
                          theme="infernal"
                          allowInternal={true}
                          handleFieldChange={(elem, e) =>
                            this.changeRule('ifValue', e.target.value)
                          }
                          form={{
                            props: {
                              elements: [
                                {
                                  id: 1,
                                  type: 'Dropdown',
                                  options: this.state.inputElements.filter(
                                    (elem) => {
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
                          className="form"
                          theme="infernal"
                          allowInternal={true}
                          handleFieldChange={(elem, e) =>
                            this.changeRule('ifValue', e.target.value)
                          }
                          form={{
                            props: {
                              elements: [
                                {
                                  id: 1,
                                  type: 'TextBox',
                                  placeholder: 'Enter a value',
                                  value: currentRule.if.value
                                }
                              ]
                            }
                          }}
                        />
                      )}

                      {arrayValueField === true ? null : (
                        <Renderer
                          className="form"
                          theme="infernal"
                          allowInternal={true}
                          handleFieldChange={() => this.changeRule('fieldLink')}
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
                )}
              </div>

              <div className={'thenBlock'}>
                <div className="input-block">
                  <div className="input-block-title">THEN</div>
                  <Renderer
                    className="form"
                    theme="infernal"
                    allowInternal={true}
                    handleFieldChange={(elem, e) =>
                      this.changeRule('thenCommand', e.target.value)
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
                <div className="input-block">
                  <div className="input-block-title">FIELD</div>
                  <Renderer
                    className="form"
                    theme="infernal"
                    allowInternal={true}
                    handleFieldChange={(elem, e) =>
                      this.changeRule('thenField', e.target.value)
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
              </div>
            </div>
          </div>
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
        </div>
      </div>
    )
  }
}

export default FormRules
