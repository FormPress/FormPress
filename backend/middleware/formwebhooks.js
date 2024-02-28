const path = require('path')
const { model } = require(path.resolve('helper'))
const { FormModel, FormPublishedModel } = model

const Elements = require('../script/transformed/elements/')

const { mustHaveValidToken } = require(
  path.resolve('middleware', 'authorization')
)
const { getPool } = require(path.resolve('./', 'db'))
const { submissionhandler } = require(path.resolve('helper'))
const { validate } = require('uuid')
const ShortUniqueId = require('short-unique-id')
const uid = new ShortUniqueId({ length: 10 })

const knownPlatforms = ['Zapier', 'Pipedream']

exports.formWebhooksApi = (app) => {
  app.post(
    `/api/forms/:formId/webhooks/subscribe`,
    mustHaveValidToken,
    async (req, res) => {
      let { webhookUrl } = req.body

      const formModel = new FormModel()
      const formPublishedModel = new FormPublishedModel()

      let { formId } = req.params
      let { user_id } = req.user
      const platform = req.query.platform

      if (!formId || !webhookUrl) {
        return res.status(400).send('No formId or webhookUrl provided')
      }

      // let's be safe
      if (typeof webhookUrl !== 'string' || webhookUrl.length > 200) {
        return res.status(400).send('Hook url is invalid.')
      }

      if (validate(formId)) {
        formId = await formModel.getFormIdFromUUID(formId)
      }

      const form = await formModel.get({ form_id: formId })

      if (form === false) {
        return res.status(400).send('Form not found.')
      }

      if (user_id !== form.user_id) {
        return res.status(401).send('Unauthorized')
      }

      const isKnownPlatform = knownPlatforms.includes(platform)

      const integrationList = form.props.integrations

      const existingWebhookIntegrationWithGivenURL = integrationList.find(
        (i) => i.webhookUrl === webhookUrl
      )

      if (existingWebhookIntegrationWithGivenURL !== undefined) {
        return res
          .status(400)
          .send('Webhook integration with this URL already exists.')
      }

      const newWebhookIntegration = {
        type: 'Webhook',
        createdBy: isKnownPlatform ? platform : 'unknown',
        active: true,
        paused: false,
        value: webhookUrl,
        webhookId: uid.rnd()
      }

      const { webhookId } = newWebhookIntegration

      integrationList.push(newWebhookIntegration)

      // update form
      const dbRes = await formModel.update({ form: { ...form } })

      if (dbRes.affectedRows === 0) {
        return res.status(400).send('Form could not be updated.')
      }

      // publish form
      const version = parseInt(form.published_version || 0)

      if (version > 0) {
        await formPublishedModel.update({ form: { ...form } })
      }

      return res.status(201).json({ webhookId })
    }
  )

  app.delete(
    `/api/forms/:formId/webhooks/unsubscribe`,
    mustHaveValidToken,
    async (req, res) => {
      let { formId } = req.params
      let { webhookId } = req.body
      let { user_id } = req.user

      const formModel = new FormModel()
      const formPublishedModel = new FormPublishedModel()

      if (!formId || !webhookId) {
        return res.status(400).send('No formId or webhookId provided')
      }

      if (validate(formId)) {
        formId = await formModel.getFormIdFromUUID(formId)
      }

      const form = await formModel.get({ form_id: formId })

      if (form === false) {
        return res.status(400).send('Form not found.')
      }

      if (user_id !== form.user_id) {
        return res.status(401).send('Unauthorized')
      }

      const integrationList = form.props.integrations

      const existingWebhookIntegration = integrationList.find(
        (i) => i.webhookId === webhookId || i.zapId === webhookId // zapId is for backwards compatibility
      )

      if (existingWebhookIntegration === undefined) {
        return res.status(400).send('Webhook integration not found.')
      }

      // delete integration
      const index = integrationList.indexOf(existingWebhookIntegration)
      integrationList.splice(index, 1)

      // update form
      const dbRes = await formModel.update({ form: { ...form } })

      if (dbRes.affectedRows === 0) {
        return res.status(400).send('Form could not be updated.')
      }

      // publish form
      const version = parseInt(form.published_version || 0)

      if (version > 0) {
        await formPublishedModel.update({ form: { ...form } })
      }

      return res.status(201).json({ webhookId })
    }
  )

  app.get(
    `/api/forms/:formId/submissions/sample`,
    mustHaveValidToken,
    async (req, res) => {
      let { formId } = req.params

      const formModel = new FormModel()
      // const formPublishedModel = new FormPublishedModel()

      if (validate(formId)) {
        formId = await formModel.getFormIdFromUUID(formId)
      } else if (parseInt(formId) > 1200) {
        return res.status(404).send('Form Not Found')
      }

      const db = await getPool()

      const formResult = await formModel.get({ form_id: formId })

      if (formResult === false) {
        //form not found
        return res.status(200).json({ message: 'Form not found' })
      }

      const form = formResult

      const submissionsResult = await db.query(
        `
        SELECT * FROM \`submission\`
          WHERE form_id = ? LIMIT 3
      `,
        [formId]
      )

      const submissionIds = submissionsResult.map((row) => row.id)

      // No submissions found. We will send users a sample submission with example answers.
      if (submissionIds.length === 0) {
        // get all form elems
        const allFormElems = form.props.elements

        // filter out elems that are hidden, and not an input element Elements[e.type].metaData.group === 'inputElement' might help
        const inputElems = allFormElems.filter((elem) => {
          if (elem.hidden === true) {
            return false
          }
          return Elements[elem.type].metaData.group === 'inputElement'
        })

        // now the labels of the input elements are the questions and answers can be "Example answer here."
        const entries = inputElems.map((elem) => {
          const entry = {}
          entry.question = elem.label
          entry.answer = 'Example answer here.'
          return entry
        })

        const organizedSubmission = {
          metadata: {
            formId: formId,
            submissionId: 1,
            formTitle: form.title,
            submissionDate: new Date()
          },
          entries
        }

        return res.json([organizedSubmission])
      }

      const result = await db.query(
        `SELECT * FROM \`entry\` WHERE form_id = ? AND submission_id IN (?)`,
        [formId, submissionIds]
      )

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

        const questionsWithRenderedAnswers =
          submissionhandler.getQuestionsWithRenderedAnswers(
            form,
            hydratedSubmission,
            parseInt(submission)
          )

        const entries = questionsWithRenderedAnswers.map((QnA) => {
          const entry = {}
          entry.question = QnA.question
          entry.answer = QnA.answer
          return entry
        })

        const organizedSubmission = {
          metadata: {
            formId: formId,
            submissionId: submissionData.id,
            formTitle: form.title,
            submissionDate: submissionData.created_at
          },
          entries
        }

        finalSubmissionsArray.push(organizedSubmission)
      })

      return res.json(finalSubmissionsArray)
    }
  )
}
