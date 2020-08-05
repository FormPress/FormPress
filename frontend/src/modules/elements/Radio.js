import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

export default class Radio extends Component {
    static weight = 6

    static defaultConfig = {
        id: 0,
        type: 'Radio',
        label: 'Radio'
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
            options: [1, 2, 3],
            checked: 0
        };
        this.onChange = this.onChange.bind(this);
    };


    onChange(i) {
        this.setState({
            checked: i
        });
    }

    render() {
        const { config, mode } = this.props
        const { options } = this.state;

        let optionsList = options.length > 0 && options.map((item, i) => {
            return (
                <label key={i}>
                    <input type="radio" checked={this.state.checked === i ? true : false} key={i + 100} onChange={this.onChange.bind(this, i)} value={i} />
                    {item}
                </label>
            )
        }, this);

        return (
            <ElementContainer type={config.type} {...this.props}>
                {(mode !== 'preview')
                    ? <>
                        <EditableLabel
                            className='fl label'
                            mode={mode}
                            labelKey={config.id}
                            handleLabelChange={this.props.handleLabelChange}
                            value={config.label}
                            required={config.required}
                        />
                        <div>
                            {optionsList}
                        </div>
                    </>
                    :
                    <div>
                        {optionsList}
                    </div>
                }
            </ElementContainer>
        )
    }
}