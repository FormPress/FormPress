const fs = require('fs')
const path = require('path')
const { FP_ENV } = process.env
const BACKEND = process.env.FE_BACKEND
const reactDOMServer = require('react-dom/server')
const sass = require('sass')
const { getPool } = require(path.resolve('./', 'db'))

const React = require('react')

const Renderer = require(
  path.resolve('script', 'transformed', 'Renderer')
).default

const { mustHaveValidToken } = require(
  path.resolve('middleware', 'authorization')
)

module.exports = (app) => {
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

  app.get('/api/templates/metrics', async (req, res) => {
    const db = await getPool()
    const result = await db.query(`SELECT * FROM \`templates\``)
    if (result.length > 0) {
      return res.json(result)
    } else {
      return res.json([])
    }
  })

  app.post(
    '/api/templates/:template_id/metrics',
    mustHaveValidToken,
    async (req, res) => {
      const db = await getPool()

      const template_id = req.params.template_id

      if (isNaN(template_id) || parseInt(template_id) > 46) {
        return res.status(400).json({ message: 'Invalid template id' })
      }

      const result = await db.query(
        `INSERT INTO \`templates\` (\`id\`, \`times_cloned\`) VALUES (?, 1) ON DUPLICATE KEY UPDATE times_cloned = times_cloned + 1`,
        [template_id]
      )

      if (result.warningCount === 0) {
        return res.status(200).json({ message: 'Done!' })
      } else {
        return res.status(500).json({ message: 'Error!' })
      }
    }
  )
}
