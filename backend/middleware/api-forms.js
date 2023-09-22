const path = require('path')
const {
  mustHaveValidToken,
  paramShouldMatchTokenUserId,
  userShouldOwnForm
} = require(path.resolve('middleware', 'authorization'))
const { model } = require(path.resolve('helper'))
const formPermissionModel = model.formPermission

module.exports = (app) => {
  app.get(
    '/api/users/:user_id/forms/:form_id/permissions/list',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      owner: true,
      matchType: 'strict'
    }),
    async (req, res) => {
      let { form_id } = req.params

      const permissions = await formPermissionModel.list({ form_id })

      res.json(permissions)
    }
  )

  app.get(
    '/api/users/:user_id/forms/:form_id/permissions/:id',
    mustHaveValidToken,
    userShouldOwnForm('user_id', 'form_id', {
      owner: true,
      matchType: 'strict'
    }),
    //paramShouldMatchTokenUserId('user_id'), // TODO: this part should allow also invitee
    async (req, res) => {
      let { id } = req.params

      try {
        const permission = await formPermissionModel.get({ id })
        res.json({ permission })
      } catch (e) {
        res.status(500).json({
          message: `Error while trying to read permission ${e.message}`
        })
      }
    }
  )

  app.post(
    '/api/users/:user_id/forms/:form_id/permissions/:id/accept',
    mustHaveValidToken,
    //paramShouldMatchTokenUserId('user_id'), // TODO this part should also allow invitee
    async (req, res) => {
      let { id } = req.params

      try {
        await formPermissionModel.accept({
          id,
          target_user_id: req.user.user_id,
          target_user_email: req.user.email
        })
        res.json({ status: 'done' })
      } catch (e) {
        res.status(404).json({
          message: `Error while trying to accept invitation ${e.message}`
        })
      }
    }
  )

  app.delete(
    '/api/users/:user_id/forms/:form_id/permissions/:id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      owner: true,
      matchType: 'strict'
    }),
    async (req, res) => {
      let { id } = req.params

      try {
        await formPermissionModel.delete({ id })
        res.json({ message: 'OK' })
      } catch (e) {
        res.status(500).json({
          message: `Error while trying to delete permission ${e.message}`
        })
      }
    }
  )

  app.post(
    '/api/users/:user_id/forms/:form_id/permissions/new',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      owner: true,
      matchType: 'strict'
    }),
    async (req, res) => {
      const { user_id, form_id } = req.params
      const { target_user_email, permissions } = req.body.permission
      try {
        await formPermissionModel.create({
          user: req.user,
          user_id,
          form_id,
          target_user_email,
          permissions
        })
        res.json({ message: 'OK' })
      } catch (e) {
        res.status(500).json({
          message: `Error while trying to create permission ${e.message}`
        })
      }
    }
  )

  app.put(
    '/api/users/:user_id/forms/:form_id/permissions/:id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id', {
      owner: true,
      matchType: 'strict'
    }),
    async (req, res) => {
      const { id } = req.params
      const { target_user_id, permissions } = req.body.permission
      try {
        await formPermissionModel.updatePermissions({
          id,
          target_user_id,
          permissions
        })
        res.json({ message: 'OK' })
      } catch (e) {
        res.status(500).json({
          message: `Error while trying to update permission ${e.message}`
        })
      }
    }
  )
}
