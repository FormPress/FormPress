const path = require('path')
const { storage } = require(path.resolve('helper'))
const { getPool } = require(path.resolve('./', 'db'))
const { model } = require(path.resolve('helper'))

module.exports = (app) => {
  //download directly from link
  app.get(
    '/api/downloads/entry/:entry_id/:submission_id/:upload_name',
    async (req, res) => {
      res.setHeader('Cache-Control', 'private')
      const { entry_id, submission_id, upload_name } = req.params
      const uploadNameFromUrl = submission_id + '/' + upload_name
      const db = await getPool()

      //check upload_name
      const uploadNameToCheck = await db.query(
        `
          SELECT \`upload_name\` FROM \`storage_usage\` WHERE entry_id = ?
        `,
        [entry_id]
      )
      if (uploadNameToCheck.length > 0) {
        if (uploadNameToCheck[0].upload_name !== uploadNameFromUrl)
          return res.status(404).send('File not Found E017D01')
      } else {
        return res.status(404).send('File not Found E017D02')
      }
      //get fileUploadValue
      const entryValues = await db.query(
        `
          SELECT \`form_id\`,\`question_id\`, \`value\` FROM \`entry\` WHERE id = ?
        `,
        [entry_id]
      )
      if (entryValues.length < 1) {
        return res.status(404).send('File not Found E017D03')
      }

      const { form_id, question_id, value } = entryValues[0]
      const fileName = JSON.parse(value)[0].fileName

      // check if public upload from last published form
      let publicAccess = false
      const publishedForm = await model.formpublished.get({ form_id })
      const fileUploadProps = publishedForm.props.elements.filter(
        (element) => element.id === parseInt(question_id)
      )
      if (fileUploadProps.length > 0) {
        if (fileUploadProps[0].publicEnabled !== undefined) {
          publicAccess = fileUploadProps[0].publicEnabled
        }
      }
      let downloadGranted = false
      if (publicAccess === false) {
        if (req.user === undefined) {
          //redirect to login
          if (process.env.FP_ENV === 'development') {
            // in development, full url should consist of protocol, host, port, and path
            let originalDestination = `${req.protocol}://${req.get('host')}${
              req.originalUrl
            }`

            const loginUrl =
              process.env.FE_FRONTEND +
              '/login?destination=' +
              encodeURIComponent(originalDestination)

            return res.redirect(loginUrl)
          } else {
            const originalDestination = req.originalUrl
            const loginUrl =
              '/login?destination=' + encodeURIComponent(originalDestination)

            return res.redirect(loginUrl)
          }
        } else {
          //Ensure form owner
          const result = await db.query(
            `SELECT \`user_id\` FROM \`form\` WHERE id = ?`,
            [form_id]
          )
          if (result.length > 0) {
            if (parseInt(req.user.user_id) !== result[0].user_id) {
              return res.status(403).send('File not Found E017D04')
            } else {
              downloadGranted = true
            }
          } else {
            return res.status(404).send('File not Found E017D05')
          }
        }
      } else {
        downloadGranted = true
      }

      if (downloadGranted) {
        //check if file exists
        const fileExists = await storage.checkIfFileIsExist(uploadNameFromUrl)

        if (!fileExists) {
          return res.status(404).send('File not Found E017D06')
        }
        // send file
        res.set('Content-disposition', 'attachment; filename=' + fileName)
        res.type(path.extname(fileName))

        const file = await storage.downloadFile(uploadNameFromUrl)
        file.pipe(res)
      }
    }
  )
}
