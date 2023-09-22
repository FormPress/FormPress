import React, { Component } from 'react'
import { Switch, Route, NavLink, Redirect } from 'react-router-dom'
import Renderer from '../../Renderer'
import Theme from './Theme'
import ColorScheme from './ColorScheme'
import CustomCSS from './CustomCSS'
import './DesignForm.css'

export default class DesignForm extends Component {
  constructor(props) {
    super(props)

    this.formId = this.props.formId

    this.setTheme = this.setTheme.bind(this)
    this.setColorScheme = this.setColorScheme.bind(this)
  }

  componentDidMount() {
    if (
      this.props.form.props.design === undefined ||
      this.props.form.props.design.theme === undefined ||
      this.props.form.props.design.colorScheme === undefined
    ) {
      const design = {
        theme: 'gleam',
        colorScheme: 'default'
      }
      this.props.setFormDesign(design)
    }
  }

  setTheme(theme) {
    const design = {
      theme: theme,
      colorScheme: this.props.form.props.design.colorScheme
    }

    this.props.setFormDesign(design)
  }

  setColorScheme(colorScheme) {
    const design = {
      theme: { ...this.props.form.props.design.theme },
      colorScheme: colorScheme
    }

    this.props.form.setFormDesign(design)
  }

  render() {
    let theme = ''
    let colorScheme = ''
    if (this.props.form.props.design === undefined) {
      theme = 'gleam'
      colorScheme = 'default'
    } else {
      theme = this.props.form.props.design.theme
      colorScheme = this.props.form.props.design.colorScheme
    }
    return (
      <>
        <div className="FormTabCover">
          <h2 className="shareFormTitle">Design Your Form</h2>
          <div className="designtabs">
            <NavLink
              to={`/editor/${this.formId}/design/theme`}
              activeClassName="selected">
              Theme
            </NavLink>
            {/* WIP */}
            {/* <NavLink
          to={`/editor/${this.props.form.id}/design/colorscheme`}
          activeClassName="selected">
          Color Scheme
        </NavLink> */}
            <NavLink
              to={`/editor/${this.formId}/design/customcss`}
              activeClassName="selected">
              Custom CSS
            </NavLink>
          </div>
          <Switch>
            {/* To make "theme" selected when opening design */}
            <Route exact path="/editor/:formId/design">
              <Redirect to={`/editor/${this.formId}/design/theme`} />
            </Route>
            <Route exact path="/editor/:formId/design/theme">
              <Theme
                theme={theme}
                setTheme={this.setTheme}
                canEdit={this.props.canEdit}
              />
            </Route>
            <Route exact path="/editor/:formId/design/colorscheme">
              <ColorScheme
                colorScheme={colorScheme}
                setColorScheme={this.setColorScheme}
              />
            </Route>
            <Route exact path="/editor/:formId/design/customcss">
              <CustomCSS
                form={this.props.form}
                setCSS={this.props.setCSS}
                canEdit={this.props.canEdit}
              />
            </Route>
          </Switch>
          <div></div>
        </div>

        <div className="desingForm">
          <Renderer
            form={this.props.form}
            theme={theme}
            mode="renderer"
            className="fl form"
          />
        </div>
      </>
    )
  }
}
