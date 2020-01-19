/*
  This file contains a static list of endpoints.

  It is used in unit test suits for various testing. For example:
  if security is applied for given endpoint. There even is a test
  suite for checking if all endpoints are accounted for
*/

module.exports = {
  endpoints: [
    {
      method: 'post',
      path: '/api/users/:user_id/forms'
    },
    {
      method: 'put',
      path: '/api/users/:user_id/forms'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms/:form_id'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms/:form_id/submissions'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms/:form_id/submissions/:submission_id/entries'
    },
    {
      method: 'get',
      path: '/form/view/:id'
    },
    {
      method: 'delete',
      path: '/api/users/:user_id/forms/:form_id'
    },
    {
      method: 'put',
      path: '/api/users/:user_id/forms/:form_id/submissions/:submission_id'
    }
  ]
}