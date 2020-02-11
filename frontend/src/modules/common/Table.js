import React, { Component } from 'react';

import './Table.css'

export default class Table extends Component {
  render () {
    return (
      <table className='fp_table'>
        <thead>
          { this.renderHead() }
        </thead>
        <tbody>
          { this.renderBody() }
        </tbody>
      </table>
    )
  }

  renderHead () {
    return (
      <tr onClick={this.pro}>
        { this.props.columns.map((column, key) => {
          const props = {}

          if (typeof column.className !== 'undefined') {
            props.className = column.className
          }

          return (
            <th key={ key } { ...props }>
              { column.label }
            </th>
          )
        })}
      </tr>
    )
  }

  renderBody () {
    return this.props.data.map((row, rowKey) => {
      const props = {}

      if (typeof this.props.onTrClick !== 'undefined') {
        props.onClick = this.props.onTrClick.bind(this, row)
      }

      return (
        <tr key={ rowKey } {...props}>
          { this.props.columns.map((column, keyColumn)=> {
            const props = {}

            if (typeof column.className !== 'undefined') {
              props.className = column.className
            }

            return (
              <td key={ keyColumn } { ...props }>
                { column.content(row) }
              </td>
            )
          }) }
        </tr>
      )
    })
  }
}
