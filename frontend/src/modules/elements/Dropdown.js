import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

export default class Dropdown extends Component {

  static defaultConfig = {
    id: 0,
    type: 'Dropdown',
    dropdownText: 'Toggle'
  }

  constructor(){
    super();
    this.state = {
          displayMenu: false,
        };
   
     this.showDropdownMenu = this.showDropdownMenu.bind(this);
     this.hideDropdownMenu = this.hideDropdownMenu.bind(this);
   };

   showDropdownMenu(event) {
    event.preventDefault();
    this.setState({ displayMenu: true }, () => {
    document.addEventListener('click', this.hideDropdownMenu);
    });
  }

  hideDropdownMenu() {
    this.setState({ displayMenu: false }, () => {
      document.removeEventListener('click', this.hideDropdownMenu);
    });
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.onClick !== 'undefined') {
      inputProps.onClick = config.onClick
    }

    return (
      <ElementContainer type={ config.type } { ...this.props }>
        { (mode === 'builder')
          ? <div  className="dropdown" style = {{background:"gray",width:"200px"}} onClick={this.showDropdownMenu}>
            <EditableLabel
                className='button'
                mode={ mode }
                labelKey={ config.id }
                handleLabelChange={ this.props.handleLabelChange }
                value={ config.dropdownText }
            />
            { this.state.displayMenu ? (
            <ul>
              <li><a className="active" href="#Item 1">Item 1</a></li>
              <li><a href="#Item 2">Item 2</a></li>
              <li><a href="#Item 3">Item 3</a></li>
              <li><a href="#Item 4">Item 4</a></li>
              <li><a href="#Item 5">Item 5</a></li>
              <li><a href="#Item 6">Item 6</a></li>
            </ul>
            ):(null)
            }
          </div>
          : <input type='dropdown' value={ config.dropdownText } { ...inputProps } />
        }
      </ElementContainer>
    );
  }
}