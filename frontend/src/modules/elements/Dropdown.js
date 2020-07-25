import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

export default class Dropdown extends Component {
  static weight = 5

  static defaultConfig = {
    id: 0,
    type: 'Dropdown',
    label: 'Choose'
  }

  static configurableSettings = {
    required: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: 'Make this field required?'
      }
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      userInput: null
    };
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
  };

  componentDidMount() {
    this.setState({
      options: [
        { key: 'Item1', value: 'Item1' },
        { key: 'Item2', value: 'Item2' },
        { key: 'Item3', value: 'Item3' },
        { key: 'Item4', value: 'Item4' },
        { key: 'Item5', value: 'Item5' }
      ]
    });
  }

  handleChange(event) { this.setState({ userInput: event.target.value }) }

  add() {
    this.setState(previousState => ({
      options: [...previousState.options, { key: this.state.userInput, value: this.state.userInput }]
    }));
  }

  remove() {
    this.setState(previousState => ({
      options: previousState.options.filter(el => el.value !== this.state.userInput)
    }));
  }

  render() {
    const { config, mode } = this.props
    const { options } = this.state;

    let optionsList = options.length > 0 && options.map((item, i) => {
      return (
        <option
          key={i}
          value={item.key}>{item.value}
        </option>
      )
    }, this);


    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className='fl label'
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        <div>
          <input type="text" value={this.state.userInput} placeholder="Choose..." list="optionsList" onChange={this.handleChange.bind(this)} />
          <datalist id="optionsList">
            {optionsList}
          </datalist>
          <button type="button" onClick={this.add}>Add</button>
          <button type="button" onClick={this.remove}>Remove</button>
        </div>
      </ElementContainer>
    )
  }
}