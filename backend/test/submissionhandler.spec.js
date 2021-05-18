const path = require('path')
const assert = require('assert').strict


const submissionhandler = require(path.resolve('helper', 'submissionhandler'))

describe('submission handler', () => {
  const formProps = [
    {
      id: 1,
      type:"Text",
      label:"Text Label"
    },
    {
      id: 3,
      type:"TextArea",
      label:"TextArea Label"
    },
    {
      id: 5,
      type:"Dropdown",
      label:"Dropdown Label",
      options:[
        "Dropdown 1",
        "Dropdown 2"
      ],
      required:false
    },
    {
      mode:"sort",
      id:9,
      type:"Checkbox",
      label:"Checkbox Label",
      required:false
    },
    {
      id: 6,
      type:"Radio",
      label:"Radio Label",
      options:[
        "Radio option 1",
        "Radio option 2"
      ],
      required:false
    },
    {
      id: 7,
      type:"Name",
      label:"Full Name Label",
      required:false
    },
    {
      id: 8,
      type:"FileUpload",
      label:"File Upload Label",
      required:false
    },
    {
      mode:"sort",
      id: 2,
      type:"Button",
      buttonText:"SubmitButton"
    }
  ]

  it('default values', () => {
    const input = []
    const expectedOutput = [
      {q_id: 5, value: ''},
      {q_id: 9, value: 'off'},
      {q_id: 6, value: ''},
      {q_id: 8, value: ''},
    ]
    const formattedInput = submissionhandler.formatInput(formProps,input)
    assert.deepEqual(formattedInput, expectedOutput)
  })

  it('check multiple input for single question(Name)', () => {
    const input = [
      { q_id: 'q_7[firstName]', value: 'omer' },
      { q_id: 'q_7[lastName]', value: 'korkmaz' }
    ]
    const expectedOutput = [
      {q_id: 5, value: ''},
      {q_id: 9, value: 'off'},
      {q_id: 6, value: ''},
      {q_id: 7, value: {
        firstName:"omer",
        lastName:"korkmaz"
        }
      },
      {q_id: 8, value: ''},
    ]
    const formattedInput = submissionhandler.formatInput(formProps,input)
    assert.deepEqual(formattedInput, expectedOutput)
  })
})
