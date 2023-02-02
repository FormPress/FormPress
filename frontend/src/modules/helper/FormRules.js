import React, { Component } from 'react'
import './FormRules.css'
import Renderer from '../Renderer'
import * as Elements from '../elements'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faEye,
  faPlusCircle,
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
      mode: 'view'
    }

    this.handleToggleRuleBuilder = this.handleToggleRuleBuilder.bind(this)
    this.deleteRule = this.deleteRule.bind(this)
  }

  deleteRule(rule) {
    rule.delete = true
    this.props.setFormRule(rule)
  }

  handleToggleRuleBuilder(elem, e) {
    if (this.state.mode === 'build') {
      this.setState({ mode: 'view' })
    } else {
      this.setState({ mode: 'build' })
    }
  }

  render() {
    const { mode } = this.state
    const { form } = this.props
    const elements = form.props.elements || []

    const rules = form.props.rules || []

    return (
      <div className="formRules-wrapper">
        <div>
          <div className="formRules-title">Form Rules</div>
          {mode === 'build' ? (
            <RuleBuilder
              form={this.props.form}
              setFormRule={this.props.setFormRule}
              handleToggleRuleBuilder={this.handleToggleRuleBuilder}
            />
          ) : (
            <>
              <button
                className="addNewRule-button"
                onClick={() => this.handleToggleRuleBuilder()}>
                <FontAwesomeIcon icon={faPlusCircle} /> Add New Rule{' '}
              </button>
              <div className="formRules-list">
                {rules.map((rule, index) => {
                  return (
                    <div className="formRule" key={index}>
                      <div className="formRule-header">
                        <FontAwesomeIcon icon={faEye} /> Show / Hide Fields{' '}
                        {/* TODO: needs dynamic overhaul */}
                        <FontAwesomeIcon
                          icon={faTrash}
                          className={'deleteRule'}
                          title={'Remove Rule'}
                          onClick={() => this.deleteRule(rule)}
                        />{' '}
                      </div>
                      <div className="formRule-body">
                        If...{' '}
                        <span className="ifField">
                          {elements
                            .find((e) => e.id === parseInt(rule.if.field))
                            ?.label.substring(0, 35)}
                        </span>{' '}
                        <span className="ifOperator">
                          {operators[rule.if.operator].toLowerCase()}
                        </span>{' '}
                        <span className="ifValue">
                          {rule.fieldLink === true
                            ? elements
                                .find((e) => e.id === parseInt(rule.if.value))
                                ?.label.substring(0, 35)
                            : rule.if.value}
                        </span>
                        ,{' '}
                        <span className="thenCommand">
                          {commands[rule.then.command].toLowerCase()}
                        </span>
                        <span className="thenField">
                          {elements
                            .find((e) => e.id === parseInt(rule.then.field))
                            ?.label.substring(0, 35)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
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

  addRule() {
    const { currentRule } = this.state
    const { if: ifRule, then: thenRule } = currentRule

    if (
      ifRule.field === '' ||
      ifRule.operator === '' ||
      ifRule.value === '' ||
      thenRule.command === '' ||
      thenRule.field === ''
    ) {
      return
    }

    this.props.setFormRule(currentRule)

    this.setState({
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

    const elemsThatHasArrayValue = ['Checkbox', 'Radio', 'Address', 'Name']

    let arrayValueField = false

    if (selectedIfField !== undefined) {
      arrayValueField = elemsThatHasArrayValue.includes(selectedIfField.type)
    }

    let thenFields = this.props.form.props.elements.map((elem) => {
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
      <div className="ruleBuilder-wrapper">
        <button onClick={this.props.handleToggleRuleBuilder}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div>
          <div className="bs-mild">
            <div className="ruleBuilder-header">
              <FontAwesomeIcon icon={ruleTypeIcon} />
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
                                options: this.state.inputElements,
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
                                value: this.state.fieldLink
                              }
                            ]
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
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
