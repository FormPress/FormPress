const { google } = require('googleapis')
const { error } = require('../helper')
const moment = require('moment/moment')

const googleClientID = process.env.GOOGLE_CREDENTIALS_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CREDENTIALS_CLIENT_SECRET

async function create({ token, targetSpreadsheet }) {
  const oAuth2Client = new google.auth.OAuth2(
    googleClientID,
    googleClientSecret
  )
  oAuth2Client.setCredentials(token)

  const service = google.sheets({ version: 'v4', auth: oAuth2Client })
  const resource = {
    properties: {
      title: targetSpreadsheet.title
    },
    sheets: [
      {
        properties: {
          title: targetSpreadsheet.sheet.title
        }
      }
    ]
  }
  try {
    const spreadsheet = await service.spreadsheets.create({
      resource
    })
    return spreadsheet.data.spreadsheetId
  } catch (err) {
    console.log(err)
    error.errorReport(err)
  }
}

async function addSheet({ token, targetSpreadsheet }) {
  const oAuth2Client = new google.auth.OAuth2(
    googleClientID,
    googleClientSecret
  )

  oAuth2Client.setCredentials(token)

  const sheets = google.sheets({ version: 'v4', auth: oAuth2Client })

  const spreadSheet = await sheets.spreadsheets.get({
    spreadsheetId: targetSpreadsheet.id,
    includeGridData: false
  })

  const foundSheet = spreadSheet.data.sheets.find(
    (sheet) => sheet.properties.title === targetSpreadsheet.sheet.title
  )

  if (foundSheet !== undefined) {
    let i = 1
    let proposedTitle = `${targetSpreadsheet.sheet.title} (${i})`

    while (
      spreadSheet.data.sheets.find(
        (sheet) => sheet.properties.title === proposedTitle
      ) !== undefined
    ) {
      i++
      proposedTitle = `${targetSpreadsheet.sheet.title} (${i})`
    }

    targetSpreadsheet.sheet.title = proposedTitle
  }

  const resource = {
    requests: [
      {
        addSheet: {
          properties: {
            title: targetSpreadsheet.sheet.title
          }
        }
      }
    ]
  }

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: targetSpreadsheet.id,
    resource
  })

  targetSpreadsheet.sheet.id =
    response.data.replies[0].addSheet.properties.sheetId
  targetSpreadsheet.sheet.title =
    response.data.replies[0].addSheet.properties.title

  return targetSpreadsheet
}

async function prepareSheet({ token, targetSpreadsheet, fieldMapping }) {
  const oAuth2Client = new google.auth.OAuth2(
    googleClientID,
    googleClientSecret
  )
  const finalTargetSpreadsheet = targetSpreadsheet

  const spreadsheetId = targetSpreadsheet.id

  oAuth2Client.setCredentials(token)

  const sheets = google.sheets({ version: 'v4', auth: oAuth2Client })
  const spreadSheet = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId
  })

  let referenceRow

  if (fieldMapping.advancedConfigEnabled === true) {
    referenceRow = fieldMapping.referenceRow
  } else {
    referenceRow = fieldMapping.valuesRow.map((elem) => {
      if (typeof elem === 'string') {
        if (elem === 'id') {
          return '=ARRAYFORMULA(IF(sequence(match(2,1/(B:B<>""),1),1,0,1) = 0, "ID", sequence(match(2,1/(B:B<>""),1),1,0,1)))'
        }
        if (elem === 'submissionDate') {
          return 'Submission Date'
        }
      }

      return elem.label
    })
  }

  let sheetName = targetSpreadsheet.sheet.title
  let range
  let sheetId

  const foundSheet = spreadSheet.data.sheets.find(
    (sheet) => sheet.properties.title === sheetName
  )

  if (foundSheet !== undefined) {
    sheetId = foundSheet.properties.sheetId
    range = `${sheetName}!A1:Z1`
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [referenceRow]
    }
  })

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: sheetId,

              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.6,
                  green: 0.83,
                  blue: 1.0
                },
                horizontalAlignment: 'LEFT',
                wrapStrategy: 'CLIP',
                textFormat: {
                  foregroundColor: {
                    red: 1.0,
                    green: 1.0,
                    blue: 1.0
                  },
                  fontSize: 12,
                  bold: true
                }
              }
            },
            fields:
              'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,wrapStrategy)'
          }
        },
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetId,

              gridProperties: {
                frozenRowCount: 1
              }
            },
            fields: 'gridProperties.frozenRowCount'
          }
        }
      ]
    }
  })

  return finalTargetSpreadsheet
}

async function getMapData({ token, spreadsheetId }) {
  const oAuth2Client = new google.auth.OAuth2(
    googleClientID,
    googleClientSecret
  )

  oAuth2Client.setCredentials(token)

  const sheets = google.sheets({ version: 'v4', auth: oAuth2Client })

  let spreadSheet

  await sheets.spreadsheets
    .get({
      spreadsheetId: spreadsheetId
    })
    .then((response) => {
      if (response.status === 200) {
        spreadSheet = response.data
      }
    })
    .catch((err) => {
      return null
    })

  if (spreadSheet === undefined || spreadSheet === null) {
    return {
      status: 404,
      message: 'Spreadsheet not found'
    }
  }

  let ranges = []

  spreadSheet.sheets.forEach((sheet) => {
    ranges.push(`${sheet.properties.title}!A1:Z1`)
  })

  let error = false
  let response
  try {
    response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: spreadsheetId,
      majorDimension: 'ROWS',
      ranges
    })
  } catch (err) {
    error = true
  }

  let fieldMapping = []

  if (error === true || response.data.error) {
    return fieldMapping
  }

  if (response.data.valueRanges?.length > 0) {
    response.data.valueRanges.forEach((range) => {
      const mappingEntry = {
        title: range.range.split('!')[0].replace(/'/g, ''),
        fields: range.values ? range.values[0] : []
      }
      fieldMapping.push(mappingEntry)
    })
  }

  return fieldMapping
}

exports.googleSheetsApi = (app) => {
  app.post('/api/googlesheets/init', async (req, res) => {
    const { token, fieldMapping } = req.body
    let { targetSpreadsheet } = req.body

    if (!token) {
      return res.status(400).send('No token provided')
    }
    let existingSpreadsheet = true

    if (targetSpreadsheet.id === '') {
      existingSpreadsheet = false
      const spreadsheetId = await create({
        token,
        targetSpreadsheet
      })
      targetSpreadsheet.id = spreadsheetId

      await prepareSheet({
        token,
        targetSpreadsheet,
        fieldMapping,
        existingSpreadsheet
      })
    } else {
      targetSpreadsheet = await addSheet({ token, targetSpreadsheet })
      await prepareSheet({
        token,
        targetSpreadsheet,
        fieldMapping
      })
    }

    res.json({ targetSpreadsheet })
  })

  app.post('/api/googlesheets/getmapping', async (req, res) => {
    const { token, spreadsheetId } = req.body

    if (!token) {
      return res.status(400).send('No token provided')
    }

    const mapRes = await getMapData({
      token,
      spreadsheetId
    })

    if (mapRes.status === 404) {
      return res.status(404).json({ message: 'Spreadsheet not found' })
    }

    res.json(mapRes)
  })
}

exports.appendData = async ({ integrationConfig, questionsAndAnswers }) => {
  const oAuth2Client = new google.auth.OAuth2(
    googleClientID,
    googleClientSecret
  )

  const token = integrationConfig.value?.googleCredentials

  if (!token) {
    return false
  }

  oAuth2Client.setCredentials(token)

  const { fieldMapping, targetSpreadsheet } = integrationConfig

  const spreadsheetId = targetSpreadsheet.id
  const sheets = google.sheets({ version: 'v4', auth: oAuth2Client })

  const range = targetSpreadsheet.sheet.title + '!A1'

  const organizedValues = []

  fieldMapping.valuesRow.forEach((elem) => {
    if (typeof elem === 'string') {
      let metaDataValue = ''

      if (elem === 'submissionDate') {
        metaDataValue =
          moment(new Date()).utc().format('YYYY-MM-DD HH:mm:ss') + ' UTC'
      }

      if (elem === 'id') {
        // it means that this row has a formula to increment the ID, so we don't need to add anything
      }

      return organizedValues.push(metaDataValue)
    }

    const foundQnA = questionsAndAnswers.find((QnA) => QnA.id === elem.id)
    if (foundQnA !== undefined) {
      return organizedValues.push(foundQnA.answer)
    }

    organizedValues.push('')
  })

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [organizedValues]
      }
    })
  } catch (err) {
    return false
  }
}
