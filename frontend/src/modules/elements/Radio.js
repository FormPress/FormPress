import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

export default class Radio extends Component {
    static weight = 6

    static defaultConfig = {
        id: 0,
        type: 'Radio',
        label: 'Radio',
        options: []
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
        super(props)
        this.state = {
            checked: 0
        }
        this.handleChange = this.handleChange.bind(this);
        this.onChange = this.onChange.bind(this)
    }

    onChange(i) {
        this.setState({
            checked: i
        })
    }

    handleChange(event) {
        const { config } = this.props
        const inputProps = {}
        var lines = event.target.value.split('\n')

        if (typeof config.value !== 'undefined') {
            inputProps.value = config.value
        }

        config.options = []
        for (var i = 0; i < lines.length; i++) {
            config.options = config.options.concat(lines[i])
        }

    }

    render() {
        const { config, mode } = this.props
        const inputProps = {}

        if (typeof config.onClick !== 'undefined') {
            inputProps.onClick = config.onClick
        }

        let optionsList = config.options.length > 0 && config.options.map((item, i) => {
            return (
                <label key={i}>
                    <input type="radio" checked={this.state.checked === i ? true : false} name='myradio' key={i + 100} value={i} onChange={this.onChange.bind(this, i)} />
                    {item}
                </label>
            )
        })

        var display
        if (mode === 'builder') {
            display = [
                <EditableLabel
                    key='1'
                    className='fl label'
                    mode={mode}
                    labelKey={config.id}
                    handleLabelChange={this.props.handleLabelChange}
                    value={config.label}
                    required={config.required}
                />,
                <div key='2'>
                    <textarea onChange={this.handleChange}></textarea>
                </div>
            ]
        }
        else {
            display = [
                <EditableLabel
                    key='1'
                    className='fl label'
                    mode={mode}
                    labelKey={config.id}
                    handleLabelChange={this.props.handleLabelChange}
                    value={config.label}
                    required={config.required}
                />,
                <div key='2'>
                    {optionsList}
                </div>
            ]
        }
        return (
            <ElementContainer type={config.type} {...this.props}>
                {display}
            </ElementContainer>
        )
    }
}