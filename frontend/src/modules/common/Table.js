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
      { this.props.columns.map((column) => {
        return (
          <th>
            { column.label }
          </th>
        )
      })}
    </tr>
  }

  renderBody () {
    return this.props.data.map((row) => {
      return (
        <tr>
          { this.props.columns.map((column)=> {
            const props = {}

            if (typeof column.className !== 'undefined') {
              props.className = column.className
            }

            return (
              <td { ...props }>
                { column.content(row) }
              </td>
            )
          }) }
        </tr>
      )
    })
  }
}
