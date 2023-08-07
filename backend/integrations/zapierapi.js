const path = require('path')
const { model } = require(path.resolve('helper'))
const formModel = model.form

const { mustHaveValidToken } = require(path.resolve(
  'middleware',
  'authorization'
))
const { getPool } = require(path.resolve('./', 'db'))
const { submissionhandler } = require(path.resolve('helper'))
const { validate } = require('uuid')
const fetch = require('node-fetch')

const { error } = require('../helper')
const moment = require('moment')

exports.zapierApi = (app) => {
  app.post(
    `/zapier/webhook/subscribe`,
    mustHaveValidToken,
    async (req, res) => {
      const options = req.body

      // first, lets see if we have params that we need
      let { form_id, hookUrl, zapId } = options

      if (!form_id || !hookUrl || !zapId) {
        return res.status(400).send('No form_id or hookUrl provided')
      }

      zapId = parseInt(zapId)

      // let's be safe
      if (typeof hookUrl !== 'string' || hookUrl.length > 200) {
        return res.status(400).send('Hook url is invalid.')
      }

      if (validate(form_id)) {
        form_id = await formModel.getFormIdFromUUID(form_id)
      }

      const form = await formModel.get({ form_id })

      if (form === false) {
        return res.status(400).send('Form not found.')
      }

      const integrationList = form.props.integrations

      const newZapIntegration = {
        type: 'Zapier',
        active: true,
        paused: false,
        value: hookUrl,
        zapId
      }

      const zapier = integrationList.find(
        (i) => i.type === 'Zapier' && i.zapId === zapId
      )

      // in case zapier integration already exists, we update it, if not we add it
      if (zapier !== undefined) {
        const index = integrationList.indexOf(zapier)
        integrationList[index] = newZapIntegration
      } else {
        integrationList.push(newZapIntegration)
      }

      // update form
      const dbRes = await formModel.update({ form })

      if (dbRes.affectedRows === 0) {
        return res.status(400).send('Form could not be updated.')
      }

      return res.status(201).json({ zapId })
    }
  )

  app.delete(
    `/zapier/webhook/unsubscribe`,
    mustHaveValidToken,
    async (req, res) => {
      const options = req.body
      let { form_id, zapId } = options

      // same as above but we will delete the integration instead
      if (!form_id || !zapId) {
        return res.status(400).send('No form_id or zapId provided')
      }

      zapId = parseInt(zapId)

      if (validate(form_id)) {
        form_id = await formModel.getFormIdFromUUID(form_id)
      }

      const form = await formModel.get({ form_id })

      if (form === false) {
        return res.status(400).send('Form not found.')
      }

      const integrationList = form.props.integrations

      const zapier = integrationList.find(
        (i) => i.type === 'Zapier' && i.zapId === zapId
      )

      if (zapier === undefined) {
        return res.status(400).send('Zapier integration not found.')
      }

      // delete integration
      const index = integrationList.indexOf(zapier)
      integrationList.splice(index, 1)

      // update form
      const dbRes = await formModel.update({ form })

      if (dbRes.affectedRows === 0) {
        return res.status(400).send('Form could not be updated.')
      }

      return res.status(201).json({ zapId })
    }
  )

  app.get(
    `/zapier/sample/submissions/:form_id`,
    mustHaveValidToken,
    async (req, res) => {
      let { form_id } = req.params
      let uuid = null

      if (validate(form_id)) {
        uuid = form_id
        form_id = await formModel.getFormIdFromUUID(form_id)
      } else if (parseInt(form_id) > 1200) {
        return res.status(404).send('Form Not Found')
      }

      const db = await getPool()

      const result = await db.query(
        `SELECT * FROM \`entry\` WHERE form_id = ?`,
        [form_id]
      )
      const submissionsResult = await db.query(
        `
        SELECT * FROM \`submission\`
          WHERE form_id = ?
      `,
        [form_id]
      )
      const formResult = await formModel.get({ form_id })

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

      const finalSubmissionsArray = []

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
          entries[QnA.question] = QnA.answer
        })

        const organizedSubmission = {
          id: submissionData.id,
          createdAt: submissionData.created_at,
          entries: entries
        }

        finalSubmissionsArray.push(organizedSubmission)
      })

      res.json(finalSubmissionsArray)
    }
  )
}

exports.triggerZapierWebhook = async ({
  integrationConfig,
  questionsAndAnswers,
  submissionId
}) => {
  const entries = {}

  questionsAndAnswers.forEach((QnA) => {
    entries[QnA.question] = QnA.answer
  })

  const organizedSubmission = {
    id: submissionId,
    createdAt: moment(new Date()).utc().format('YYYY-MM-DD HH:mm:ss') + ' UTC',
    entries: entries
  }

  const webhookUrl = integrationConfig.value
  const payload = organizedSubmission

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  } catch (err) {
    console.log('Could not send Zapier webhook', err)
    error.errorReport(err)
  }
}
