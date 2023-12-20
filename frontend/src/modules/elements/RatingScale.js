import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'

import './RatingScale.css'

export default class RatingScale extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedOptionId: -1
    }
  }
  static weight = 6

  static defaultConfig = {
    id: 0,
    type: 'RatingScale',
    label: 'Rating Scale',
    ratingScaleFloat: 'Center',
    ratingScaleOptionType: 'Numbers',
    ratingScaleOptionTopLimit: '5'
  }

  static metaData = {
    icon: faStar,
    displayText: 'Rating Scale',
    group: 'inputElement'
  }

  static submissionHandler = {
    findQuestionValue: (inputs, qid) => {
      let value = ''
      for (const elem of inputs) {
        if (elem.q_id === qid) {
          value = elem.value
        }
      }
      return value
    }
  }

  static getPlainStringValue(entry) {
    let plainString

    if (entry.value !== '') {
      plainString = entry.value
    } else {
      plainString = '-'
    }

    return plainString
  }

  static configurableSettings = {
    ratingScaleFloat: {
      default: 'Center',
      formProps: {
        type: 'Dropdown',
        label: 'Rating Scale Float',
        options: ['Left', 'Center', 'Right'],
        placeholder: false
      }
    },
    ratingScaleOptionType: {
      default: 'Numbers',
      formProps: {
        type: 'Dropdown',
        label: 'Rating Scale Option Type',
        options: ['Numbers', 'Stars'],
        placeholder: false
      }
    },
    ratingScaleOptionTopLimit: {
      default: '5',
      formProps: {
        type: 'Dropdown',
        label: 'Rating Scale Option Top Limit',
        options: ['3', '4', '5', '6', '7', '8', '9', '10'],
        placeholder: false
      }
    }
  }

  static renderDataValue(entry, question) {
    return (
      <ul className="rating-scale-data">
        {[...Array(parseInt(question.ratingScaleOptionTopLimit))].map(
          (e, i) => (
            <li key={i}>
              <input
                type="radio"
                id={`q_${question.id}_${i}`}
                name={`q_${question.id}`}
                value={i}
                className={`rating-scale-input ${
                  question.ratingScaleOptionType
                } ${parseInt(entry.value) - 1 === i ? 'checked' : ''}`}
                disabled="disabled"
                style={{ display: 'none !important' }}></input>
              <label
                className={`rating-scale-${question.ratingScaleOptionType} ${
                  question.ratingScaleOptionType === 'Stars' &&
                  parseInt(entry.value - 1) >= i
                    ? 'extends-select'
                    : ''
                }`}
                htmlFor={`q_${question.id}_${i}`}>
                {question.ratingScaleOptionType === 'Numbers' ? (
                  i + 1
                ) : (
                  <FontAwesomeIcon icon={faStar} size="2x" />
                )}
              </label>
            </li>
          )
        )}
      </ul>
    )
  }

  static helpers = {
    getElementValue: (id) => {
      const nodeList = document.getElementsByName(`q_${id}`)
      for (let i = 0; i < nodeList.length; i++) {
        if (nodeList[i].checked) {
          return nodeList[i].value
        }
      }
    },
    isFilled: (value) => {
      return value !== '' && value !== undefined
    }
  }

  ratingScaleOnChange = (e) => {
    this.setState({
      selectedOptionId: e.target.id.split('_')[2]
    })
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    inputProps.onClick = this.ratingScaleOnChange

    if (
      typeof config.customFieldId !== 'undefined' &&
      config.customFieldId !== ''
    ) {
      inputProps['data-fp-custom-field-id'] = 'q_' + config.customFieldId
    }

    let script = ''

    if (mode === 'renderer') {
      script = (
        <script
          dangerouslySetInnerHTML={{
            __html: `
            var elements_${config.id} = [...document.getElementsByClassName("rating-scale-Stars-${config.id}")];
            var list_container = document.getElementsByClassName("rating-scale-float-${config.id}");
            var list_elements_${config.id} = [...list_container[0].querySelectorAll('li')];
            elements_${config.id}.forEach(elem => {
              elem.addEventListener('click', ratingScale${config.id});
            });

            function ratingScale${config.id}(elem){
              var elem_index = elem.target.closest(".rating-scale-Stars").getAttribute("for").split('_')[2];
              elements_${config.id}.forEach(e => {e.classList.remove('extends-select')});

              list_elements_${config.id}.forEach((element, index) => {
                if(index <= elem_index){
                  element.lastChild.classList.add("extends-select");
                }
              });
            }`
          }}></script>
      )
    }

    var display = [
      <div className="elemLabelTitle" key={0}>
        <EditableLabel
          key="1"
          className="fl label"
          mode={mode}
          labelKey={config.id}
          dataPlaceholder="Type a question"
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
      </div>,
      <div key="2" className="fl input">
        <ul
          className={`rating-scale-float-${config.ratingScaleFloat} rating-scale-float-${config.id}`}>
          {[...Array(parseInt(config.ratingScaleOptionTopLimit))].map(
            (e, i) => (
              <li key={i}>
                <input
                  type="radio"
                  id={`q_${config.id}_${i}`}
                  name={`q_${config.id}`}
                  value={i + 1}
                  {...inputProps}
                />
                <label
                  className={`rating-scale-${
                    config.ratingScaleOptionType
                  } rating-scale-${config.ratingScaleOptionType}-${config.id} ${
                    config.ratingScaleOptionType === 'Stars' &&
                    parseInt(this.state.selectedOptionId) >= i
                      ? 'extends-select'
                      : ''
                  }`}
                  htmlFor={`q_${config.id}_${i}`}>
                  {config.ratingScaleOptionType === 'Numbers' ? (
                    i + 1
                  ) : (
                    <FontAwesomeIcon icon={faStar} size="2x" />
                  )}
                </label>
              </li>
            )
          )}
        </ul>
      </div>,
      <div className="clearfix" key="3">
        <EditableLabel
          className="sublabel"
          dataPlaceholder="Click to edit sublabel"
          mode={mode}
          labelKey={`sub_${config.id}`}
          handleLabelChange={this.props.handleLabelChange}
          value={
            typeof config.sublabelText !== 'undefined' &&
            config.sublabelText !== ''
              ? config.sublabelText
              : ''
          }
        />
      </div>
    ]

    if (mode !== 'builder') {
      display.push(
        <div key="4" className="fl metadata">
          {script}
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      )
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
      </ElementContainer>
    )
  }
}
