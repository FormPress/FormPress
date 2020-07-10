import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

export default class Dropdown extends Component {
  static weight = 5

  static defaultConfig = {
    id: 0,
    type: 'Dropdown',
    label: 'Dropdown Label'
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
      options: []
    };
  };

  componentDidMount() {
    this.setState({
      options: [
        { id: 'id1', name: 'Item 1' },
        { id: 'id2', name: 'Item 2' },
        { id: 'id3', name: 'Item 3' },
      ]
    });
  } 

  render() {
    const { config, mode } = this.props
    const inputProps = {}
    const { options } = this.state;

    if (typeof config.onClick !== 'undefined') {
      inputProps.onClick = config.onClick
    }

    let optionsList = options.length > 0 && options.map((item, i) => {
      return (
        <option
          key={i}
          value={item.id}>{item.name}
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
          <select style={{ width: 240 }}>
            {optionsList}
          </select>
        </div>
      </ElementContainer>
    );
  }
}