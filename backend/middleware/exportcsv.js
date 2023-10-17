const {
  mustHaveValidToken,
  paramShouldMatchTokenUserId
} = require('./authorization')

const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))
const { model } = require(path.resolve('helper'))
const formModel = model.form
const { submissionhandler } = require(path.resolve('helper'))
const { userShouldOwnForm } = require(path.resolve(
  'middleware',
  'authorization'
))
module.exports = (app) => {
  // return csv export of incoming submission IDS
  app.post(
    '/api/users/:user_id/forms/:form_id/CSVExport',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      data: true,
      matchType: 'strict' // Only allow if user has data rights to form
    }),
    async (req, res) => {
      const { form_id } = req.params
      const db = await getPool()
      let ids = []
      if (req.body && req.body.submissionIds.length !== 0) {
        ids = req.body.submissionIds
      } else {
        //get all submission ids for this form needed for export all
        const query = 'SELECT id FROM `submission` WHERE form_id = ?'
        const result = await db.query(query, [form_id])
        ids = result.map((submission) => submission.id)
      }

      const result = await db.query(
        `
        SELECT * FROM \`entry\`
          WHERE form_id = ? AND submission_id IN (${ids
            .map(() => '?')
            .join(',')})
      `,
        [form_id, ...ids]
      )
      const submissionsResult = await db.query(
        `
        SELECT * FROM \`submission\`
          WHERE form_id = ? AND id IN (${ids.map(() => '?').join(',')})
      `,
        [form_id, ...ids]
      )
      const formResult = await formModel.get({ form_id })

      /*
              TODO: returning HTTP200 here is wrong. This is done since unit tests
              mocking db does not support mocking 3 sequencial SQL queries.

              We should add more SQL behaviour to config/endpoints.js and
              properly extend unit tests
            */
      if (formResult === false) {
        //form not found
        return res.status(200).json({ message: 'Form not found' })
      }

      const form = formResult

      const idsOfElemsPresent = form.props.elements.map((elem) => elem.id)

      // preformatted submissions are grouped by submission id and filtered by ids of elements present in form
      const preformattedSubmissions = result.reduce((submission, entry) => {
        if (idsOfElemsPresent.includes(parseInt(entry.question_id))) {
          submission[entry.submission_id] =
            submission[entry.submission_id] || []
          submission[entry.submission_id].push(entry)
        }

        return submission
      }, {})

      const CSVData = {}
      const submissionsData = {}

      for (const submission of submissionsResult) {
        submissionsData[submission.id] = submission
      }

      Object.keys(preformattedSubmissions).forEach((submission) => {
        const submissionData = submissionsData[submission]

        const hydratedSubmission = preformattedSubmissions[submission].map(
          (entry) => {
            // getQuestionsWithRenderedAnswers only takes hydrated values
            try {
              entry.value = JSON.parse(entry.value)
            } catch (e) {
              // do nothing
            }
            return entry
          }
        )

        const questionsWithRenderedAnswers = submissionhandler.getQuestionsWithRenderedAnswers(
          form,
          hydratedSubmission,
          parseInt(submission)
        )

        const entries = {}

        questionsWithRenderedAnswers.forEach((QnA) => {
          entries[QnA.id.toString()] = QnA.answer
        })

        CSVData[submission] = entries

        CSVData[submission].createdAt = submissionData.created_at
        CSVData[submission].submissionId = submissionData.id
      })

      const createCsvStringifier = require('csv-writer')
        .createObjectCsvStringifier
      const header = [
        { id: 'submissionId', title: 'ID' },
        { id: 'createdAt', title: 'CREATED_AT' }
      ]

      for (const element of form.props.elements) {
        header.push({
          id: element.id.toString(),
          title: element.label
        })
      }

      const csvStringifier = createCsvStringifier({
        header
      })
      const csv =
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(Object.values(CSVData))

      res.json({
        content: csv,
        filename: `${form.title}-${new Date().getTime()}.csv`
      })
    }
  )
}
