const path = require('path')
const fs = require('fs')
const archiver = require('archiver')
const fetch = require('node-fetch')
const sanitizeHtml = require('sanitize-html')
const sass = require('sass')

const moment = require('moment')
const uuidAPIKey = require('uuid-apikey')
const jwt = require('jsonwebtoken')
const { validate } = require('uuid')
const { hydrateForm } = require(path.resolve('helper', 'formhydration'))
const { getPool } = require(path.resolve('./', 'db'))

const {
  mustHaveValidToken,
  mustHaveValidAPIKey,
  paramShouldMatchTokenUserId,
  userShouldOwnSubmission,
  userShouldOwnForm,
  userHavePermission,
  userHaveFormLimit,
  mustBeAdmin
} = require(path.resolve('middleware', 'authorization'))

const reactDOMServer = require('react-dom/server')
const React = require('react')
const Renderer = require(path.resolve('script', 'transformed', 'Renderer'))
  .default
const { FP_ENV } = process.env
const BACKEND = process.env.FE_BACKEND
const {
  storage,
  model,
  error,
  testStringIsJson,
  publicStorage
} = require(path.resolve('helper'))
const formModel = model.form
const formPublishedModel = model.formpublished
const { updateFormPropsWithNewlyAddedProps } = require(path.resolve(
  './',
  'helper',
  'oldformpropshandler.js'
))

const JWT_SECRET = process.env.JWT_SECRET

module.exports = (app) => {
  const handleCreateForm = async (req, res) => {
    const form = req.body
    const { user_id } = req.params

    if (!form.private) {
      form.private = 0
    }

    if (typeof form.id !== 'undefined' && form.id !== null) {
      // Existing form should update!!!
      const result = await formModel.update({ form })

      const responseObject = {
        status: 'updated',
        id: form.id,
        updated_at: null
      }

      if (result.length > 0) {
        responseObject.updated_at = result[0].updated_at
      }

      res.json(responseObject)
    } else {
      // New Form
      const result = await formModel.create({ user_id, form })

      res.json({ status: 'done', id: result.insertId, uuid: result.uuid })
    }
  }

  // Update form
  app.put(
    '/api/users/:user_id/forms',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userHavePermission,
    userShouldOwnForm('user_id', (req) => req.body.id, {
      edit: true,
      matchType: 'strict' // Only allow if user has edit rights to form
    }),
    handleCreateForm
  )

  // Create form
  app.post(
    '/api/users/:user_id/forms',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userHavePermission,
    userHaveFormLimit('user_id'),
    handleCreateForm
  )

  // return forms of given user id
  app.get(
    '/api/users/:user_id/forms',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const db = await getPool()
      const user_id = req.params.user_id

      const formIds = (
        await db.query(
          `SELECT id FROM form WHERE user_id = ? AND deleted_at IS NULL`,
          [user_id]
        )
      ).map((form) => form.id)
      const sharedIdsAndPerms = await formModel.getFormsAndPermsSharedWithUser(
        user_id,
        {
          matchType: 'loose',
          read: true,
          edit: true,
          data: true
        }
      )
      const sharedIds = sharedIdsAndPerms.map((idAndPerm) => idAndPerm.form_id)
      const ids = [...formIds, ...sharedIds]

      // I think this little hack is acceptable
      if (ids.length === 0) {
        ids.push(-999)
      }

      const formResults = await db.query(
        `SELECT
            *, 
            CASE WHEN (
              SELECT id FROM form_published WHERE form_id = f.id AND version = f.published_version) IS NULL
            THEN 0 ELSE
            id END AS published_id,
            (SELECT COUNT(*) FROM submission WHERE form_id = f.id AND version != 0 ) as responseCount,
            (SELECT COUNT(*) FROM submission as S WHERE form_id = f.id AND S.read = 0 AND version != 0) as unreadCount
          FROM form AS f
          WHERE f.id IN (${ids.map(() => '?').join(',')})`,
        [...ids]
      )
      if (formResults.length === 0) {
        res.json([])
      } else {
        const response = formResults.map(hydrateForm)
        sharedIdsAndPerms.forEach((idAndPerm) => {
          response.forEach((formResult) => {
            if (formResult.id === idAndPerm.form_id) {
              formResult.permissions = idAndPerm.permissions
            }
          })
        })
        return res.json(response)
      }
    }
  )

  // return single form via id
  app.get(
    '/api/users/:user_id/forms/:form_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      read: true,
      edit: true,
      data: true,
      matchType: 'loose' // if form is shared with any of permission types
    }),
    async (req, res) => {
      const { form_id } = req.params

      if (req.query.published === 'true') {
        res.json((await formPublishedModel.get({ form_id })) || {})
      } else {
        const form = await formModel.get({ form_id })
        //if shared owner info and permissions
        if (res.locals.sharedUserId !== undefined) {
          form.sharedUserId = res.locals.sharedUserId
          form.permissions = res.locals.sharedPermissions
        }
        res.json(form)
      }
    }
  )

  //return new or last updated form
  app.get(
    '/api/users/:user_id/editor',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { user_id } = req.params

      if (req.user.permission.admin || req.user.permission.formLimit === 0) {
        res.status(200).json({ message: 'new' })
      } else {
        const db = await getPool()
        const result = await db.query(
          `SELECT COUNT(\`id\`) AS \`count\` FROM \`form\` WHERE user_id = ? AND deleted_at IS NULL`,
          [user_id]
        )

        if (parseInt(req.user.permission.formLimit) > result[0].count) {
          res.status(200).json({ message: 'new' })
        } else {
          const lastForm = await db.query(
            `SELECT \`id\` FROM \`form\` WHERE user_id = ? ORDER BY \`updated_at\` DESC LIMIT 1`,
            [user_id]
          )
          const lastFormId = lastForm[0].id

          res.status(200).json({ message: lastFormId })
        }
      }
    }
  )

  // return form questions
  app.get('/api/users/:user_id/forms/:form_id/elements', async (req, res) => {
    let { form_id } = req.params

    const elems = (await formModel.get({ form_id })).props.elements

    // remove the keys that are named 'expectedAnswer' out of the elements
    const sanitizedElems = elems.map((elem) => {
      delete elem.expectedAnswer
      delete elem.answerExplanation
      return elem
    })

    res.json(sanitizedElems || [])
  })

  app.get('/api/users/:user_id/forms/:form_id/rules', async (req, res) => {
    let { form_id } = req.params

    const form = await formModel.get({ form_id })

    try {
      const rules = form.props.rules
      return res.json(rules || [])
    } catch (e) {
      res.json([])
    }
  })

  // a new endpoint to return an ejs template for exam evaluations
  app.get(
    '/api/users/:user_id/forms/:form_id/submissions/:submission_id/evaluate',
    async (req, res) => {
      const { submission_id, form_id } = req.params
      // TODO: currently user_id is not used in the query but will be used in the future for security reasons
      // TODO: a check to make sure the viewer is the owner of the submission should be added

      const Renderer = require(path.resolve(
        'script',
        'transformed',
        'Renderer'
      )).default

      let form
      const regularForm = await formModel.get({ form_id })

      if (regularForm.published_version > 0) {
        form = await formPublishedModel.get({
          form_id,
          version_id: regularForm.published_version
        })
      } else {
        form = regularForm
      }

      if (form.props.autoPageBreak !== undefined) {
        delete form.props.autoPageBreak
      }

      const questions = (form.props.elements = form.props.elements.filter(
        (elem) => elem.type === 'Radio'
      ))

      const db = await getPool()
      const submissionQuery = await db.query(
        `
        SELECT  \`id\`, \`created_at\`, \`completion_time\` FROM \`submission\`
          WHERE form_id = ? AND id = ? LIMIT 1
      `,
        [form_id, submission_id]
      )

      const submission = submissionQuery[0]

      submission.completion_time = moment()
        .startOf('day')
        .seconds(submission.completion_time)
        .format('HH:mm:ss')

      submission.created_at = moment().format('HH:mm:ss YYYY-MM-DD')

      const allEntries = await db.query(
        `
        SELECT * FROM \`entry\` WHERE submission_id = ?
      `,
        [submission_id]
      )

      // filter out the entries that don't have questions
      const entriesWithQuestions = allEntries.filter((entry) => {
        const questionId = entry.question_id
        const question = questions.find(
          (question) => question.id === questionId
        )
        return question !== undefined
      })

      const defaultPageLabels = {
        questionCount: 'Questions',
        correctAnswers: 'Correct',
        incorrectAnswers: 'Incorrect',
        unansweredQuestions: 'Unanswered',
        score: 'Score',
        completionDate: 'Completed',
        completionTime: 'Time'
      }

      let evaluationPageLabels

      const evaluationPageLabelsIntegration = form.props.integrations.find(
        (integration) => integration.type === 'evaluationPageLabels'
      )

      if (evaluationPageLabelsIntegration !== undefined) {
        evaluationPageLabels = evaluationPageLabelsIntegration
      } else {
        evaluationPageLabels = {}
      }

      evaluationPageLabels = {
        ...defaultPageLabels,
        ...evaluationPageLabels
      }

      const str = reactDOMServer.renderToStaticMarkup(
        React.createElement(Renderer, {
          className: 'form',
          form,
          mode: 'renderer'
        })
      )

      let style = fs.readFileSync(
        path.resolve('../', 'frontend/src/style/normalize.css')
      )

      style += fs.readFileSync(
        path.resolve('../', 'frontend/src/style/common.css')
      )
      style += fs.readFileSync(
        path.resolve('../', 'frontend/src/style/themes/gleam.css')
      )
      style += fs.readFileSync(
        path.resolve('../', 'frontend/src/style/exam_results.css')
      )
      style += fs.readFileSync(
        path.resolve('../', 'frontend/src/modules/elements/index.css')
      )
      style += ' body {background-color: #f5f5f5;} '
      style += ' .form {box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);} '
      style += ' .branding {box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);}  '

      const templateProps = {
        headerAppend: `<style type='text/css'>${style}</style>`,
        form: str,
        title: form.title,
        QUESTIONS: questions,
        ANSWERS: entriesWithQuestions,
        RUNTIMEJSURL: `${BACKEND}/runtime/evaluate.js`,
        FORMID: form_id,
        USERID: form.user_id,
        BACKEND,
        SUBMISSION: submission,
        EVALUATION_PAGE_LABELS: evaluationPageLabels
      }

      res.render('results.tpl.ejs', templateProps)
    }
  )

  //return form validators
  app.get('/api/form/element/validators', async (req, res) => {
    const elementQuery = req.query.elements.split(',')

    const elementValidators = {}

    elementQuery.forEach((element) => {
      const elemClass = require(path.resolve(
        'script',
        'transformed',
        'elements',
        `${element}`
      ))

      if (elemClass.default !== undefined) {
        elementValidators[element] = elemClass.default?.helpers || 'unset'
      } else {
        elementValidators[element] = 'unset'
        console.error(
          `Element class default not found for ${element}`,
          `req.query.elements: ${req.query.elements}`
        )
      }
    })

    const output = JSON.stringify(
      elementValidators, //transform element helper functions to string
      (key, value) => (typeof value === 'function' ? value.toString() : value),
      2
    )

    res.json(output)
  })

  // publish form, takes latest form and publishes it
  app.post(
    '/api/users/:user_id/forms/:form_id/publish',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      edit: true,
      matchType: 'strict' // if form is shared with any of permission types
    }),
    async (req, res) => {
      const { user_id, form_id } = req.params

      const form = await formModel.get({ form_id })

      if (form !== false) {
        form.props = updateFormPropsWithNewlyAddedProps(form.props)

        await formPublishedModel.create({ user_id, form })

        res.json({ message: 'Published' })
      } else {
        // TODO: handle status 404, it is set to 200 because of
        // Unit tests was expecting HTTP200. Unit tests should be improved to handle
        // When form is not found and when form is found
        res.status(200).json({ message: 'Form not found' })
      }
    }
  )

  // delete single form via id
  app.delete(
    '/api/users/:user_id/forms/:form_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      owner: true,
      matchType: 'strict'
    }),
    async (req, res) => {
      const { form_id } = req.params

      await formModel.delete({ form_id })

      res.json({ message: 'deleted' })
    }
  )

  // return submissions of given form id
  app.get(
    '/api/users/:user_id/forms/:form_id/submissions',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      data: true,
      matchType: 'strict' // Only allow if user has data rights to form
    }),
    async (req, res) => {
      const { form_id } = req.params
      const { orderBy, limit, cursor, read, prevPage } = req.query
      const db = await getPool()

      let countQuery =
        'SELECT COUNT(*) AS submissionCount, SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS todaySubmissionCount FROM `submission` WHERE form_id = ? AND version != 0'
      let query =
        'SELECT * FROM `submission` WHERE form_id = ? AND version != 0'
      let queryData = [form_id]

      if (read !== undefined) {
        query += ' AND `read` = ?'
        queryData.push(parseInt(read))
      }

      let fetchDirection = '<'
      if (cursor !== undefined) {
        if (prevPage === 'true') {
          fetchDirection = '>'
        }
        query += ` AND id ${fetchDirection} ?`
        queryData.push(parseInt(cursor))
      }

      if (typeof orderBy !== 'undefined') {
        if (['created_at', 'deleted_at', 'updated_at'].includes(orderBy)) {
          query += ` ORDER BY ${orderBy}`
          countQuery += ` ORDER BY ${orderBy} DESC`
          if (prevPage === 'true') {
            query += ' ASC'
          } else {
            query += ' DESC, id DESC'
          }
        }
      }

      //Set limit to submission per page + 1 to check if there are more submissions that direction
      if (typeof limit !== 'undefined' && !isNaN(parseInt(limit))) {
        query += ' LIMIT ' + (parseInt(limit) + 1)
      }
      const result = await db.query(query, queryData)
      const countResult = await db.query(countQuery, [form_id])
      if (prevPage === 'true') {
        //reverse the result to get the correct order
        result.reverse()
      }
      let endOfList = false

      if (result.length > 0) {
        if (result.length < parseInt(limit) + 1) {
          endOfList = true
        } else {
          //remove the extra submission from the result
          if (prevPage === 'true') {
            result.shift()
          } else {
            result.pop()
          }
        }
        res.json({
          submissions: result,
          submissionCount: countResult[0].submissionCount,
          todaySubmissionCount: countResult[0].todaySubmissionCount,
          prevCursor: prevPage === 'true' && endOfList ? null : result[0].id,
          nextCursor:
            prevPage !== 'true' && endOfList
              ? null
              : result[result.length - 1].id
        })
      } else {
        res.json({
          submissions: [],
          submissionCount: null,
          todaySubmissionCount: null,
          prevCursor: null,
          nextCursor: null
        })
      }
    }
  )

  // return statistics of given form id and version number
  app.get(
    '/api/users/:user_id/forms/:form_id/statistics',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      data: true,
      matchType: 'strict' // Only allow if user has data rights to form
    }),
    async (req, res) => {
      const elementCharts = {
        TextBox: 'lastFive',
        TextArea: 'lastFive',
        Separator: 'none',
        Radio: 'pieChart',
        Name: 'lastFive',
        Header: 'none',
        FileUpload: 'none',
        Email: 'lastFive',
        DropDown: 'barChart',
        Checkbox: 'barChart',
        Button: 'none',
        NetPromoterScore: 'netPromoterScore',
        RatingScale: 'average',
        DatePicker: 'lastFive'
      }

      const colors = [
        '#1D91C0',
        '#67001F',
        '#CB181D',
        '#78C679',
        '#F46D43',
        '#A6CEE3',
        '#FD8D3C',
        '#A6D854',
        '#D4B9DA',
        '#6A51A3',
        '#7F0000',
        '#D9D9D9',
        '#FFF7BC',
        '#000000',
        '#F0F0F0',
        '#C7EAE5',
        '#003C30',
        '#F16913',
        '#FFF7FB',
        '#8C6BB1',
        '#C7E9B4',
        '#762A83',
        '#FC9272',
        '#AE017E',
        '#F7F7F7',
        '#DF65B0',
        '#EF3B2C',
        '#74C476',
        '#E5F5F9',
        '#F7FCFD'
      ]

      const { form_id } = req.params

      const form = await formModel.get({ form_id })

      const version_id = form.published_version

      // version 0 is preview version, doesn't count
      if (version_id > 0) {
        let statistics = {
          responses: 0,
          title: '',
          average_completion_time: 0,
          elements: []
        }
        const db = await getPool()
        let query = 'SELECT * FROM `submission` WHERE form_id = ?'
        let submissions = await db.query(query, [form_id])

        let willReturnObject = {},
          willReturnArray = []

        if (submissions.length > 0) {
          statistics.responses = submissions.length

          query =
            'SELECT AVG(completion_time) AS average_completion_time FROM `submission` WHERE form_id = ?'
          const a_c_t = await db.query(query, [form_id])

          statistics.average_completion_time = Math.round(
            a_c_t[0].average_completion_time
          )

          query = 'SELECT * FROM `form_published` WHERE form_id = ?'
          let result = await db.query(query, [form_id, version_id])

          const latestVersion = result[result.length - 1]

          statistics.title = latestVersion.title

          for (let element of JSON.parse(latestVersion.props).elements) {
            let elementTemplate = {
              label: element.label,
              elementType: element.type,
              chartType: elementCharts[element.type],
              chartItems: []
            }
            if (elementTemplate.chartType !== 'none') {
              for (let submission of submissions) {
                query =
                  'SELECT * FROM `entry` WHERE form_id = ? AND submission_id = ? AND question_id = ?'
                let questionStatistics = await db.query(query, [
                  form_id,
                  submission.id,
                  element.id
                ])

                if (questionStatistics.length > 0) {
                  if (
                    elementTemplate.elementType === 'Name' ||
                    elementTemplate.elementType === 'DatePicker'
                  ) {
                    if (questionStatistics[0].value === '') {
                      elementTemplate.chartItems.push('Unanswered')
                    } else {
                      elementTemplate.chartItems.push(
                        Object.values(JSON.parse(questionStatistics[0].value))
                          .join(' ')
                          .trim()
                      )
                    }
                  } else if (elementTemplate.elementType === 'Radio') {
                    try {
                      questionStatistics[0].value = JSON.parse(
                        questionStatistics[0].value
                      )
                    } catch (e) {
                      // do nothing
                    }
                    if (!isNaN(questionStatistics[0].value)) {
                      // if value is empty string, `Unanswered` will be pushed
                      if (questionStatistics[0].value === '') {
                        elementTemplate.chartItems.push('Unanswered')
                      } else {
                        elementTemplate.chartItems.push(
                          element.options[questionStatistics[0].value]
                        )
                      }
                    } else {
                      elementTemplate.chartItems.push(
                        questionStatistics[0].value
                      )
                    }
                  } else if (elementTemplate.elementType === 'Checkbox') {
                    try {
                      questionStatistics[0].value = JSON.parse(
                        questionStatistics[0].value
                      )
                    } catch (e) {
                      // do nothing
                    }
                    if (Array.isArray(questionStatistics[0].value)) {
                      for (let index of questionStatistics[0].value) {
                        // if value is empty string, `Unanswered` will be pushed
                        if (index === '') {
                          elementTemplate.chartItems.push('Unanswered')
                        } else {
                          elementTemplate.chartItems.push(
                            element.options[index]
                          )
                        }
                      }
                    } else {
                      elementTemplate.chartItems.push(
                        questionStatistics[0].value
                      )
                    }
                  } else {
                    elementTemplate.chartItems.push(questionStatistics[0].value)
                  }
                } else {
                  if (elementTemplate.elementType !== 'NetPromoterScore') {
                    elementTemplate.chartItems = []
                  }
                }
              }

              if (elementTemplate.chartItems.length > 0) {
                switch (elementTemplate.chartType) {
                  case 'lastFive':
                    elementTemplate.responseCount =
                      elementTemplate.chartItems.length
                    elementTemplate.chartItems = elementTemplate.chartItems.slice(
                      -5
                    )
                    statistics.elements.push(elementTemplate)

                    break
                  case 'pieChart':
                    willReturnArray = []
                    for (let [key, value] of Object.entries(
                      elementTemplate.chartItems.reduce((obj, chartItem) => {
                        if (!obj[chartItem]) {
                          obj[chartItem] = 1
                        } else {
                          obj[chartItem] = obj[chartItem] + 1
                        }
                        return obj
                      }, {})
                    )) {
                      if (key === '') {
                        key = 'Unanswered'
                      }
                      willReturnObject = {}
                      willReturnObject.name = key
                      willReturnObject.value =
                        (value * 100) / elementTemplate.chartItems.length

                      willReturnArray.push(willReturnObject)
                    }

                    elementTemplate.chartItems = willReturnArray

                    for (const [
                      index,
                      value
                    ] of elementTemplate.chartItems.entries()) {
                      value.color = colors[index]
                    }

                    statistics.elements.push(elementTemplate)
                    break
                  case 'barChart':
                    willReturnArray = []
                    for (let [key, value] of Object.entries(
                      elementTemplate.chartItems.reduce((obj, chartItem) => {
                        if (!testStringIsJson.hasJsonStructure(chartItem)) {
                          if (!obj[chartItem]) {
                            obj[chartItem] = 1
                          } else {
                            obj[chartItem] = obj[chartItem] + 1
                          }
                        } else {
                          testStringIsJson
                            .safeJsonParse(chartItem)
                            .map((item) => {
                              if (!obj[item]) {
                                obj[item] = 1
                              } else {
                                obj[item] = obj[item] + 1
                              }
                            })
                        }
                        return obj
                      }, {})
                    )) {
                      willReturnObject = {}
                      if (key === '') {
                        key = 'Unanswered'
                      }
                      willReturnObject.nameForXaxis = key.substring(0, 10)
                      willReturnObject.name = key
                      willReturnObject.value = value

                      willReturnArray.push(willReturnObject)
                    }

                    elementTemplate.chartItems = willReturnArray

                    for (const [
                      index,
                      value
                    ] of elementTemplate.chartItems.entries()) {
                      value.color = colors[index]
                    }

                    statistics.elements.push(elementTemplate)
                    break

                  case 'netPromoterScore': {
                    elementTemplate.responseCount =
                      elementTemplate.chartItems.length

                    let lowValue = 0,
                      highValue = 0
                    for (let [
                      ,
                      value
                    ] of elementTemplate.chartItems.entries()) {
                      if (value >= 0 && value <= 6) {
                        lowValue++
                      } else if (value == 9 || value == 10) {
                        highValue++
                      }
                    }

                    elementTemplate.netPromoterScore =
                      ((highValue - lowValue) / elementTemplate.responseCount) *
                      100

                    statistics.elements.push(elementTemplate)

                    break
                  }

                  case 'average': {
                    elementTemplate.responseCount =
                      elementTemplate.chartItems.length

                    let sum = 0

                    elementTemplate.chartItems.map((e) => {
                      if (/^\d+$/.test(e)) {
                        sum += parseInt(e)
                      }
                    })

                    elementTemplate.average =
                      sum / elementTemplate.chartItems.length

                    statistics.elements.push(elementTemplate)
                    break
                  }
                }
              }
            }
          }

          res.json(statistics)
        } else {
          res.json([])
        }
      } else {
        res.json([])
      }
    }
  )

  // return submissions of given form id and version number
  app.get(
    '/api/users/:user_id/forms/:form_id/:version_id/submissions',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      data: true,
      matchType: 'strict' // Only allow if user has data rights to form
    }),
    async (req, res) => {
      const { form_id, version_id } = req.params
      const { orderBy, desc } = req.query
      const db = await getPool()
      let query = 'SELECT * FROM `submission` WHERE form_id = ? AND version = ?'

      if (typeof orderBy !== 'undefined') {
        if (['created_at', 'deleted_at', 'updated_at'].includes(orderBy)) {
          query += ` ORDER BY ${orderBy}`

          if (desc === 'true') {
            query += ' DESC'
          } else {
            query += ' ASC'
          }
        }
      }

      const result = await db.query(query, [form_id, version_id])

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  // return form of given form id and version number
  app.get(
    '/api/users/:user_id/forms/:form_id/:version_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      data: true,
      read: true,
      edit: true,
      matchType: 'loose' // Only allow if user has data rights to form
    }),
    async (req, res) => {
      const { form_id, version_id } = req.params
      const result = await formPublishedModel.get({ form_id, version_id })

      if (result !== false) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  //delete submissions
  app.delete(
    '/api/users/:user_id/forms/:form_id/deleteSubmission',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      owner: true,
      matchType: 'strict'
    }),
    async (req, res) => {
      const { form_id, user_id } = req.params
      const ids = req.body.submissionIds
      const db = await getPool()

      await db.query(
        `
        DELETE FROM \`entry\`
          WHERE form_id = ? AND submission_id IN (${ids
            .map(() => '?')
            .join(',')})
      `,
        [form_id, ...ids]
      )

      await db.query(
        `
        DELETE FROM \`submission\`
          WHERE form_id = ? AND id IN (${ids.map(() => '?').join(',')})
      `,
        [form_id, ...ids]
      )

      const uploadName = await db.query(
        `
      SELECT \`upload_name\` FROM \`storage_usage\` WHERE user_id = ? AND form_id = ? AND submission_id IN (${ids
        .map(() => '?')
        .join(',')})
      `,
        [user_id, form_id, ...ids]
      )

      await db.query(
        `
        DELETE FROM \`storage_usage\`
          WHERE user_id = ? AND form_id = ? AND submission_id IN (${ids
            .map(() => '?')
            .join(',')})
      `,
        [user_id, form_id, ...ids]
      )

      if (uploadName.length > 0) {
        uploadName.forEach((fileName) => {
          storage.deleteFile(fileName.upload_name)
        })
      }
      res.json({ success: true })
    }
  )

  // return entries of given submission id
  app.get(
    '/api/users/:user_id/forms/:form_id/submissions/:submission_id/entries',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      data: true,
      matchType: 'strict' // Only allow if user has data rights to form
    }),
    async (req, res) => {
      const { submission_id } = req.params
      const db = await getPool()
      const result = await db.query(
        `
        SELECT * FROM \`entry\` WHERE submission_id = ?
      `,
        [submission_id]
      )

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  //download uploaded file remain here for legacy support
  app.get(
    '/api/users/:user_id/forms/:form_id/submissions/:submission_id/questions/:question_id/:file_name',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      data: true,
      matchType: 'strict' // Only allow if user has data rights to form
    }),
    async (req, res) => {
      const { submission_id, question_id, file_name } = req.params
      const db = await getPool()
      const preResult = await db.query(
        `
          SELECT \`value\` from \`entry\` WHERE submission_id = ? AND question_id = ?
        `,
        [submission_id, question_id]
      )
      if (preResult.length < 1) {
        /*
        TODO: returning HTTP200 here is wrong. This is done since unit tests
        mocking db does not support mocking 3 sequencial SQL queries.

        We should add more SQL behaviour to config/endpoints.js and
        properly extend unit tests
        */

        res.status(200).json({ message: 'Entry not found' })
      } else {
        const resultArray = JSON.parse(preResult[0].value)

        let result = resultArray.find((file) => {
          return file.fileName === file_name
        })

        const uploadName = result.uploadName
        const fileName = result.fileName

        res.set('Content-disposition', 'attachment; filename=' + fileName)
        res.set('Content-Type', 'application/json')

        const file = await storage.downloadFile(uploadName)
        file.pipe(res)
      }
    }
  )

  // Update single submission, ie it is read!
  app.put(
    '/api/users/:user_id/forms/:form_id/submissions/:submission_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      data: true,
      matchType: 'strict' // Only allow if user has data rights to form
    }),
    async (req, res) => {
      const { submission_id } = req.params
      const db = await getPool()
      const submission = req.body

      await db.query(
        `
        UPDATE \`submission\`
        SET
          \`read\` = ?
        WHERE
          \`id\` = ?
      `,
        [submission.read, submission_id]
      )

      res.json({ message: 'OK' })
    }
  )

  // view or preview a form
  app.get('/form/view/:id', async (req, res) => {
    let form_id = req.params.id
    let uuid = null

    if (validate(form_id)) {
      uuid = form_id
      form_id = await formModel.getFormIdFromUUID(form_id)
    } else if (parseInt(form_id) > 1200) {
      return res.status(404).send('Form Not Found')
    }

    const result = await formModel.get({ form_id })
    if (result === false) {
      return res.status(404).send('Form not found')
    }

    if (
      result.private &&
      req.query.preview !== 'true' &&
      req.get('host') !== 'localhost:3001'
    ) {
      if (!req.query.token) {
        return res.status(404).send('token must be sent')
      }

      jwt.verify(req.user, JWT_SECRET, (err, decoded) => {
        if (err !== null) {
          return res.status(404).send(err)
        }

        if (decoded.form_id !== form_id) {
          return res.status(404).send('token is not valid')
        }
      })
    }

    let form = result

    const db = await getPool()
    const userResult = await db.query(
      `SELECT \`isActive\` FROM \`user\` WHERE \`id\` = ?`,
      [form.user_id]
    )

    if (userResult[0].isActive === 0) {
      return res.status(404).send('Error: Form not found')
    }

    if (req.query.preview !== 'true' && form.published_version !== 0) {
      const publishedResult = await formPublishedModel.get({
        form_id: form.id,
        version_id: form.published_version
      })

      if (publishedResult !== false) {
        form = publishedResult
      } else {
        console.error(
          `Published version can't be found form_id = ${form_id} version = ${form.published_version}`
        )
        error.errorReport(
          `Published version can't be found form_id = ${form_id} version = ${form.published_version}`
        )
      }
    }

    form.props = updateFormPropsWithNewlyAddedProps(form.props)

    const userRoleResult = await db.query(
      `
    SELECT \`role_id\` FROM \`user_role\` WHERE \`user_id\` = ?
    `,
      [form.user_id]
    )

    let showBranding = false

    if (userRoleResult[0].role_id === 2) {
      showBranding = true
    }

    let style = fs.readFileSync(
      path.resolve('../', 'frontend/src/style/normalize.css')
    )

    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/style/common.css')
    )
    //fall back to default theme
    let designTheme = 'gleam'
    if (form.props.design !== undefined) {
      designTheme = form.props.design.theme
    }

    let themePath = path.resolve(
      '../',
      `frontend/src/style/themes/scss/${designTheme}.scss`
    )

    if (FP_ENV !== 'development') {
      themePath = path.resolve(
        '../',
        `frontend/src/style/themes/${designTheme}.css`
      )
      style += fs.readFileSync(themePath)
    } else {
      try {
        const result = await sass.renderSync({
          file: themePath
        })
        const css = result.css.toString('utf8').trim()
        style += css
      } catch (e) {
        console.log('Error loading theme:  \n ', e)
      }
    }

    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/modules/elements/index.css')
    )

    if (req.query.embed === 'true') {
      style +=
        ' body {background: none !important; margin: 3px; padding-bottom: 3px; } '
    }

    if (form.private || showBranding === false) {
      // remove the part that says 'Never Submit Passwords'
      style += ' .renderer::after {content: none !important; }'
    }

    const str = reactDOMServer.renderToStaticMarkup(
      React.createElement(Renderer, {
        className: 'form',
        form,
        mode: 'renderer',
        theme: designTheme
      })
    )

    //form table has "published_version" while form_published has "version"
    const id = uuid ? uuid : form_id
    const postTarget =
      form.version === undefined
        ? `${BACKEND}/form/submit/${id}`
        : `${BACKEND}/form/submit/${id}/${form.version}`

    res.render('form.tpl.ejs', {
      headerAppend: `<style type='text/css'>${style}</style>`,
      title: form.title,
      form: str,
      postTarget,
      BACKEND,
      showBranding,
      FORMID: form_id,
      USERID: form.user_id,
      RUNTIMEJSURL: `${BACKEND}/runtime/form.js`
    })
  })

  app.post('/form/view/demo', async (req, res) => {
    let { form } = req.body

    if (form === undefined) {
      return res.send('Form not found')
    }

    let showBranding = true

    let style = fs.readFileSync(
      path.resolve('../', 'frontend/src/style/normalize.css')
    )

    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/style/common.css')
    )
    //fall back to default theme
    let designTheme = 'gleam'
    if (form.props.design !== undefined) {
      designTheme = form.props.design.theme
    }

    let themePath = path.resolve(
      '../',
      `frontend/src/style/themes/scss/${designTheme}.scss`
    )

    if (FP_ENV !== 'development') {
      themePath = path.resolve(
        '../',
        `frontend/src/style/themes/${designTheme}.css`
      )
      style += fs.readFileSync(themePath)
    } else {
      try {
        const result = await sass.renderSync({
          file: themePath
        })
        const css = result.css.toString('utf8').trim()
        style += css
      } catch (e) {
        console.log('Error loading theme:  \n ', e)
      }
    }

    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/modules/elements/index.css')
    )

    const str = reactDOMServer.renderToStaticMarkup(
      React.createElement(Renderer, {
        className: 'form',
        form,
        mode: 'renderer',
        theme: designTheme
      })
    )

    const id = 0
    const postTarget = `${BACKEND}/templates/submit/${id}`

    res.render('template.tpl.ejs', {
      headerAppend: `<style type='text/css'>${style}</style>`,
      showBranding,
      title: form.title,
      form: str,
      postTarget,
      rules: form.props.rules || [],
      elements: form.props.elements || [],
      RUNTIMEJSURL: `${BACKEND}/runtime/form.js`,
      BACKEND,
      FORMID: id
    })
  })

  app.get('/templates/view/:id', async (req, res) => {
    const form_id = req.params.id

    if (form_id === 'undefined') {
      return res.status(404)
    }

    let rawTemplate = fs.readFileSync(
      path.resolve('../', `frontend/src/templates/forms/tpl-${form_id}.json`)
    )
    let form = JSON.parse(rawTemplate)

    const str = reactDOMServer.renderToStaticMarkup(
      React.createElement(Renderer, {
        className: 'form',
        form,
        mode: 'renderer'
      })
    )

    let style = fs.readFileSync(
      path.resolve('../', 'frontend/src/style/normalize.css')
    )
    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/style/common.css')
    )

    //fall back to default theme
    let designTheme = 'gleam'
    if (form.props.design !== undefined) {
      designTheme = form.props.design.theme
    }

    let themePath = path.resolve(
      '../',
      `frontend/src/style/themes/scss/${designTheme}.scss`
    )

    if (FP_ENV !== 'development') {
      themePath = path.resolve(
        '../',
        `frontend/src/style/themes/${designTheme}.css`
      )
      style += fs.readFileSync(themePath)
    } else {
      try {
        const result = sass.renderSync({
          file: themePath
        })
        const css = result.css.toString('utf8').trim()
        style += css
      } catch (e) {
        console.log('Error loading theme:  \n ', e)
      }
    }

    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/modules/elements/index.css')
    )

    res.render('template.tpl.ejs', {
      headerAppend: `<style type='text/css'>${style}</style>`,
      title: form.title,
      form: str,
      postTarget: `${BACKEND}/templates/submit/${form_id}`,
      rules: form.props.rules || [],
      elements: form.props.elements || [],
      showBranding: false,
      RUNTIMEJSURL: `${BACKEND}/runtime/form.js`,
      BACKEND,
      FORMID: form_id
    })
  })

  app.get('/api/get/templates', async (req, res) => {
    const files = fs.readdirSync(
      path.resolve('../', 'frontend/src/templates/forms')
    )
    const templates = []
    files.forEach((file) => {
      if (file.endsWith('.json')) {
        const rawTemplate = fs.readFileSync(
          path.resolve('../', `frontend/src/templates/forms/${file}`)
        )
        const form = JSON.parse(rawTemplate)
        templates.push(form)
      }
    })

    res.send(templates)
  })

  app.get('/api/server/capabilities', async (req, res) => {
    const isEnvironmentVariableSet = {
      googleServiceAccountCredentials:
        process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS !== '',
      sendgridApiKey: process.env.SENDGRID_API_KEY !== '',
      googleCredentialsClientID:
        process.env.GOOGLE_CREDENTIALS_CLIENT_ID !== '',
      fileUploadBucket: process.env.FILE_UPLOAD_BUCKET !== '',
      zapierClientID: process.env.FE_ZAPIER_APP_CLIENT_ID !== ''
    }
    res.json(isEnvironmentVariableSet)
  })

  // uptime check
  app.get('/api/health', async (req, res) => {
    try {
      const db = await getPool()
      const result = await db.query(`SHOW TABLES`)

      if (result.length > 0) {
        res.status(200).json({ message: 'ok' })
      } else {
        res.status(500).json({ message: 'DB error' })
      }
    } catch (err) {
      console.error(err)
      error.errorReport(err)
      res.status(500).json({ message: 'DB error' })
    }
  })

  // a public endpoint to return datasets
  app.get('/api/datasets', async (req, res) => {
    const datasetQuery = req.query.dataset.split(',')

    const jsonpResponse = {}

    try {
      datasetQuery.forEach((dataset) => {
        jsonpResponse[dataset] =
          require(path.resolve(
            'script',
            'transformed',
            'datasets',
            `${dataset}.json`
          )) || {}
      })
      res.jsonp(jsonpResponse)
    } catch (err) {
      console.error(err)
      res
        .status(500)
        .json({ message: 'Error while retrieving the dataset from server.' })
    }
  })

  // returns the forms of specified user in zip format
  app.get(
    '/api/users/:user_id/export/forms',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const user_id = req.params.user_id
      const formsArray = (await formModel.list({ user_id })) || []
      const archive = archiver('zip')

      archive.on('finish', function () {
        return res.end()
      })

      formsArray.forEach((form) => {
        archive.append(JSON.stringify(form), { name: `form_${form.id}.json` })
      })

      archive.pipe(res)
      await archive.finalize()
    }
  )

  // return api key
  app.get(
    '/api/users/:user_id/api-key',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const db = await getPool()
      const user_id = req.params.user_id
      const result = await db.query(
        `SELECT * FROM \`api_key\` WHERE user_id = ?`,
        [user_id]
      )

      if (result.length > 0) {
        return res.json(result)
      } else {
        const api_key = await uuidAPIKey.create().apiKey
        const data = await db.query(
          `
                INSERT INTO \`api_key\`
                  (user_id, api_key, created_at)
                VALUES
                  (?, ?, NOW())
              `,
          [user_id, api_key]
        )

        const result = await db.query(
          `SELECT * FROM \`api_key\` WHERE id = ?`,
          [data.insertId]
        )
        return res.json(result)
      }
    }
  )

  // create a token with API key for private form view
  app.post('/api/create-token', mustHaveValidAPIKey, async (req, res) => {
    const { form_id, exp } = req.body

    if (!form_id || !exp) {
      return res.status(404).json({ message: 'form_id and exp must be sent' })
    }

    if (typeof form_id !== 'string') {
      return res.status(404).json({ message: 'form_id format must be uuid' })
    }

    const result = await formModel.get({ form_id })
    if (result === false) {
      return res.status(404).json({ message: 'Form not found' })
    }

    if (result.user_id !== res.locals.key.user_id) {
      return res.status(404).json({ message: 'Form not found' })
    }

    const jwt_data = { form_id, action: 'view', exp }

    jwt.sign(jwt_data, JWT_SECRET, (err, token) => {
      if (err) {
        console.log('token sign error ', err)
        error.errorReport(err)
      }

      return res.status(200).json({
        message: 'Create a new token',
        token,
        form_id,
        action: 'view',
        exp
      })
    })
  })

  app.get(
    '/api/checkIfFileIsExist/:user_id/:form_id/:submission_id/:question_id/:file_name',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      data: true,
      matchType: 'strict' // Only allow if user has data rights to form
    }),
    userShouldOwnSubmission('user_id', 'submission_id'),
    async (req, res) => {
      const db = await getPool()
      const { submission_id, question_id, file_name } = req.params

      const preResult = await db.query(
        `
          SELECT \`value\`, \`form_id\` from \`entry\` WHERE submission_id = ? AND question_id = ?
        `,
        [submission_id, question_id]
      )

      if (preResult.length < 1) {
        return res.json([false])
      } else {
        const resultArray = JSON.parse(preResult[0].value)

        let result = resultArray.find((file) => {
          return file.fileName === file_name
        })

        if (result === undefined) {
          return res.json([false])
        }

        const uploadName = result.uploadName

        return res.json(await storage.checkIfFileIsExist(uploadName))
      }
    }
  )

  app.post('/api/upload/:form_id/:question_id', async (req, res) => {
    let value = await publicStorage.uploadFileForRte(
      req.files,
      req.params.form_id,
      req.params.question_id
    )
    res.json(value)
  })

  // return users usage information
  app.get(
    '/api/users/:user_id/usages',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const db = await getPool()
      const user_id = req.params.user_id

      const dateObj = new Date()
      const month = dateObj.getUTCMonth() + 1 //months from 1-12
      const year = dateObj.getUTCFullYear()
      const yearMonth = year + '-' + month

      const usagesResult = await db.query(
        `SELECT 
        (SELECT COUNT(\`id\`) FROM \`form\` WHERE user_id = ? AND deleted_at IS NULL) as 'formUsage',
        (SELECT \`count\` FROM \`submission_usage\` WHERE user_id = ? AND date = ?) as 'submissionUsage',
        (SELECT SUM(\`size\`) FROM \`storage_usage\` WHERE user_id = ? ) as 'uploadUsage'
        FROM dual`,
        [user_id, user_id, yearMonth, user_id]
      )
      if (usagesResult.length > 0) {
        const usages = usagesResult[0]
        res.json(usages)
      }
    }
  )
  // TODO: review below part
  app.get(
    '/api/users/:user_id/talkyard-sso',
    mustHaveValidToken,
    async (req, res) => {
      const { user_id } = req.params

      if (
        process.env.TALKYARD_SECRET === '' ||
        process.env.TALKYARD_SECRET === undefined
      ) {
        return res.json({
          status: 'error',
          error_message: 'Talkyard secret is not provided'
        })
      }

      const db = await getPool()
      const result = await db.query(`SELECT * FROM \`user\` WHERE id = ?`, [
        user_id
      ])

      const options = {
        method: 'POST',
        body: JSON.stringify({
          ssoId: result[0].emailVerificationCode,
          primaryEmailAddress: result[0].email,
          isEmailAddressVerified: true,
          username: result[0].email.split('@')[0],
          fullName: result[0].email.split('@')[0]
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${process.env.TALKYARD_SECRET}`
        }
      }

      try {
        if (result.length > 0) {
          await fetch(
            `https://${process.env.TALKYARD_SERVER}/-/v0/sso-upsert-user-generate-login-secret`,
            options
          )
            .then(async (resp) => resp.json())
            .then((json) => {
              res.json(
                `https://${process.env.TALKYARD_SERVER}/-/v0/login-with-secret?oneTimeSecret=${json.ssoLoginSecret}&thenGoTo=/`
              )
            })
        } else {
          res.json({ status: 'error', error_message: 'User not found.' })
        }
      } catch (e) {
        console.log(e)
      }
    }
  )

  app.get(
    '/api/users/:user_id/preferences',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const db = await getPool()
      const user_id = req.params.user_id
      const result = await db.query(
        `SELECT * FROM \`user_settings\` WHERE user_id = ?`,
        [user_id]
      )
      if (result.length > 0) {
        return res.json(result)
      } else {
        return res.json([])
      }
    }
  )

  app.post(
    '/api/users/:user_id/preferences',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const db = await getPool()
      const user_id = req.params.user_id
      const userSettings = req.body.userSettings || []

      const reportResult = []

      for (let i = 0; i < userSettings.length; i++) {
        const key = userSettings[i].key
        const value = JSON.stringify(userSettings[i].value)

        const result = await db.query(
          `SELECT * FROM \`user_settings\` WHERE user_id = ? AND \`key\` = ?`,
          [user_id, key]
        )

        if (result.length > 0) {
          const dbQuery = await db.query(
            `UPDATE \`user_settings\` SET \`value\` = ?, \`updated_at\` = NOW() WHERE user_id = ? AND \`key\` = ?`,
            [value, user_id, key]
          )

          reportResult.push(dbQuery)
        } else {
          const dbQuery = await db.query(
            `INSERT INTO \`user_settings\` (user_id, \`key\`, \`value\`, \`created_at\`) VALUES (?, ?, ?, NOW())`,
            [user_id, key, value]
          )
          reportResult.push(dbQuery)
        }
      }

      const success = reportResult.every((result) => {
        return result.affectedRows === 1 && result.warningCount === 0
      })

      const response = {
        message: success
          ? 'Settings updated successfully.'
          : 'There was an error updating settings, one or more settings were not updated.',
        success
      }

      return res.json(response)
    }
  )

  app.get('/api/loadvariables', async (req, res) => {
    const feVariables = {}
    for (const [key, value] of Object.entries(process.env)) {
      if (key.indexOf('FE_') >= 0) {
        feVariables[key] = value !== '' ? value : undefined
      }
    }

    return res.json(feVariables)
  })

  // to get user's custom thank you pages from the database
  app.get(
    '/api/users/:user_id/thankyou',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const db = await getPool()
      const user_id = req.params.user_id

      const result = await db.query(
        `SELECT * FROM \`custom_thank_you\` WHERE user_id = ? OR user_id = 0`,
        [user_id]
      )

      if (result.length > 0) {
        return res.json(result)
      } else {
        return res.json([])
      }
    }
  )

  // to edit / create a custom thank you page in the database
  app.post(
    '/api/users/:user_id/thankyou',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const db = await getPool()
      const user_id = req.params.user_id
      const { html, title, id } = req.body

      if (id === 1) {
        return res.json({
          message: 'You cannot edit the default thank you page.',
          success: false
        })
      }

      const cleanHtml = sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          'img',
          'ellipse',
          'svg',
          'path',
          'a',
          'g',
          'defs',
          'use',
          'symbol',
          'rect'
        ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src'],
          svg: ['*'],
          path: ['*'],
          a: ['*'],
          g: ['*'],
          defs: ['*'],
          use: ['*'],
          symbol: ['*'],
          rect: ['*'],
          ellipse: ['*']
        },
        allowedClasses: {
          '*': ['*']
        }
      })

      let result

      if (id === null) {
        result = await db.query(
          `INSERT INTO \`custom_thank_you\` (user_id, html, title, created_at) VALUES (?, ?, ?, NOW())`,
          [user_id, cleanHtml, title]
        )
      } else {
        result = await db.query(
          `UPDATE \`custom_thank_you\` SET html = ?, title = ?, updated_at = NOW() WHERE id = ? AND user_id = ?`,
          [cleanHtml, title, id, user_id]
        )
      }

      if (result.affectedRows === 1 && result.warningCount === 0) {
        return res.json({
          message: 'Thank you page updated successfully.',
          tyPageId: id === null ? result.insertId : id,
          tyPageTitle: title,
          success: true
        })
      } else {
        return res.json({
          message: 'There was an error updating the thank you page.',
          success: false
        })
      }
    }
  )

  // to delete a custom thank you page from the database
  app.delete(
    '/api/users/:user_id/thankyou',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const db = await getPool()
      const user_id = req.params.user_id

      let id = req.body.id

      id = parseInt(id)

      if (isNaN(id)) {
        return res.json({
          message: 'Invalid id.',
          success: false
        })
      }

      if (id === 1 || id === '1') {
        return res.json({
          message: 'You cannot delete the default thank you page.',
          success: false
        })
      }

      const userForms = (await formModel.list({ user_id })) || []

      const formsUsingThisPage = userForms.filter((form) => {
        const tyPageId = form.props.integrations?.find(
          (i) => i.type === 'tyPageId'
        )
        return tyPageId && tyPageId.value === parseInt(id)
      })

      if (formsUsingThisPage.length > 0) {
        return res.json({
          error: 'forms_using_this_page',
          message:
            'You cannot delete a thank you page that is being used by one or more forms.',
          formsUsingThisPage: formsUsingThisPage.map((form) => form.title),
          success: false
        })
      }

      const result = await db.query(
        `DELETE FROM \`custom_thank_you\` WHERE id = ? AND user_id = ?`,
        [id, user_id]
      )

      if (result.affectedRows === 1 && result.warningCount === 0) {
        return res.json({
          message: 'Thank you page deleted successfully.',
          success: true
        })
      } else {
        return res.json({
          message: 'There was an error deleting the thank you page.'
        })
      }
    }
  )
}
