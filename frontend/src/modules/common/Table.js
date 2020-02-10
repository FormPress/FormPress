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
    return <tr>
      { this.props.columns.map((column, key) => {
        return (
          <th key={ key }>
            { column.label }
          </th>
        )
      })}
    </tr>
  }

  renderBody () {
    return this.props.data.map((row, rowKey) => {
      return (
        <tr key={ rowKey }>
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
