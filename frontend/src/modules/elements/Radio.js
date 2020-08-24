import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

export default class Radio extends Component {
    static weight = 6

    static defaultConfig = {
        id: 0,
        type: 'Radio',
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
        super(props)
        this.state = {
            userInput: null,
            options: JSON.parse(localStorage.getItem('options')) || ['A', 'B'],
            checked: 0
        }
        this.add = this.add.bind(this)
        this.remove = this.remove.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    componentWillUnmount() {
        localStorage.setItem('options', null)
    }

    handleChange(event) { this.setState({ userInput: event.target.value }) }

    onChange(i) {
        this.setState({
            checked: i
        })
    }

    add() {
        this.setState({
            options: this.state.options.concat(this.state.userInput)
        }, () => {
            localStorage.setItem('options', JSON.stringify(this.state.options))
        })
    }

    remove() {
        this.setState(previousState => ({
            options: previousState.options.filter(el => el !== this.state.userInput)
        }), () => {
            localStorage.setItem('options', JSON.stringify(this.state.options))
        })
    }

    render() {
        const { config, mode } = this.props
        const inputProps = {}

        if (typeof config.onClick !== 'undefined') {
            inputProps.onClick = config.onClick
        }

        let optionsList = this.state.options.length > 0 && this.state.options.map((item, i) => {
            return (
                <label key={i}>
                    <input type="radio" checked={this.state.checked === i ? true : false} name='myradio' key={i + 100} value={i} onChange={this.onChange.bind(this, i)} />
                    {item}
                </label>
            )
        }, this)

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
                    <input type="text" value={this.state.userInput} placeholder="Choose..." list="optionsList" onChange={this.handleChange.bind(this)} />
                    <datalist id="optionsList">
                        {optionsList}
                    </datalist>
                    <button type="button" onClick={this.add}>Add</button>
                    <button type="button" onClick={this.remove}>Remove</button>
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