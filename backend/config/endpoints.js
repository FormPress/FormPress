/*
  This file contains a static list of endpoints.

  It is used in unit test suits for various testing. For example:
  if security is applied for given endpoint. There even is a test
  suite for checking if all endpoints are accounted for

  format: {
    method // Method of the HTTP request
    path // self explanatory
    protected // if true, it conveys that endpoint must only respond
              // to a request with a valid Authorization header
              // Plus if there is user_id param in path
              // valid token should contain same user_id
    TODO: ownership // for requests containing sub resources such as
              // form and submission
              // an owner ship check will be made if specific resource
              // belongs to requesting user, obtained from token user_id
  }

*/

module.exports = {
  endpoints: [
    {
      method: 'post',
      path: '/api/users/:user_id/forms',
      protected: true,
      exampleRequestPath: '/api/users/1/forms',
      exampleRequestBody: {
        id: 1,
        user_id: 1,
        title: 'form title',
        props: { elements: [{ id: 1, type: 'TextBox', label: 'Label' }] }
      }
    },
    {
      method: 'put',
      path: '/api/users/:user_id/forms',
      protected: true,
      exampleRequestPath: '/api/users/1/forms',
      exampleRequestBody: {
        user_id: 1,
        title: 'form title',
        props: { elements: [{ id: 1, type: 'TextBox', label: 'Label' }] }
      }
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms/:form_id',
      protected: true,
      exampleRequestPath: '/api/users/1/forms/1'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms/:form_id/:version_id',
      protected: true,
      exampleRequestPath: '/api/users/1/forms/1/1'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms/:form_id/:version_id/submissions',
      protected: true,
      exampleRequestPath: '/api/users/1/forms/1/1/submissions'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms/:form_id/:version_id/statistics',
      protected: true,
      exampleRequestPath: '/api/users/1/forms/1/1/statistics'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms/:form_id/elements',
      protected: false,
      exampleRequestPath: '/api/users/1/forms/1'
    },
    {
      method: 'post',
      path: '/api/users/:user_id/forms/:form_id/publish',
      protected: true,
      exampleRequestPath: '/api/users/1/forms/1/publish'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms',
      protected: true,
      exampleRequestPath: '/api/users/1/forms'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms/:form_id/submissions',
      protected: true,
      exampleRequestPath: '/api/users/1/forms/1/submissions'
    },
    {
      method: 'post',
      path: '/api/users/:user_id/forms/:form_id/CSVExport',
      protected: true,
      exampleRequestPath: '/api/users/1/forms/1/CSVExport',
      exampleRequestBody: {
        submissionIds: [1]
      }
    },
    {
      method: 'delete',
      path: '/api/users/:user_id/forms/:form_id/deleteSubmission',
      protected: true,
      exampleRequestPath: '/api/users/1/forms/1/deleteSubmission',
      exampleRequestBody: {
        submissionIds: [1]
      }
    },
    {
      method: 'get',
      path:
        '/api/users/:user_id/forms/:form_id/submissions/:submission_id/entries',
      protected: true,
      exampleRequestPath: '/api/users/1/forms/1/submissions/1/entries'
    },
    {
      method: 'get',
      path: '/form/view/:id',
      protected: false,
      exampleRequestPath: '/form/view/1'
    },
    {
      method: 'delete',
      path: '/api/users/:user_id/forms/:form_id',
      protected: true,
      exampleRequestPath: '/api/users/1/forms/1'
    },
    {
      method: 'put',
      path: '/api/users/:user_id/forms/:form_id/submissions/:submission_id',
      protected: true,
      exampleRequestPath: '/api/users/1/forms/1/submissions/1',
      exampleRequestBody: {
        read: 1
      }
    },
    {
      method: 'get',
      path:
        '/api/users/:user_id/forms/:form_id/submissions/:submission_id/questions/:question_id/:file_name',
      protected: true,
      exampleRequestPath:
        '/api/users/1/forms/1/submissions/1/questions/1/photo.png'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/editor',
      protected: true,
      exampleRequestPath: '/api/users/1/editor'
    },
    {
      method: 'get',
      path: '/api/server/capabilities',
      protected: false
    },
    {
      method: 'get',
      path: '/api/health',
      protected: false
    },
    {
      method: 'get',
      path: '/api/users/:user_id/export/forms',
      protected: false,
      exampleRequestPath: '/api/users/1/export/forms'
    },
    {
      method: 'get',
      path: '/templates/view/:id',
      protected: false
    },
    {
      method: 'get',
      path: '/api/get/templates',
      protected: false
    },
    {
      method: 'get',
      path: '/api/form/element/validators',
      protected: false,
      exampleRequestPath: 'api/form/element/validators?elements=Button,Email'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/forms/:form_id/rules',
      protected: false,
      exampleRequestPath: 'api/users/1/forms/1/rules'
    },
    {
      method: 'get',
      path: '/api/datasets',
      protected: false,
      exampleRequestPath: 'api/datasets?dataset=countries'
    },
    {
      method: 'post',
      path: '/api/upload/:form_id/:question_id',
      protected: false,
      exampleRequestPath: '/api/upload/1/1'
    },
    {
      method: 'get',
      path: '/thank-you',
      protected: false
    },
    {
      method: 'get',
      path:
        '/api/users/:user_id/forms/:form_id/submissions/:submission_id/evaluate',
      exampleRequestPath: '/api/users/1/forms/1/submissions/1/evaluate',
      protected: false
    },
    {
      method: 'get',
      path: '/api/users/:user_id/api-key',
      protected: false,
      exampleRequestPath: '/api/users/1/api-key'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/usages',
      protected: false,
      exampleRequestPath: '/api/users/1/usages'
    },
    {
      method: 'post',
      path: '/api/create-token',
      protected: false,
      exampleRequestPath: '/api/create-token',
      exampleRequestBody: {
        form_id: 1,
        exp: 500000
      }
    },
    {
      method: 'get',
      path:
        '/api/checkIfFileIsExist/:user_id/:form_id/:submission_id/:question_id/:file_name',
      protected: false,
      exampleRequestPath: '/api/checkIfFileIsExist/1/1/1/1/asd.jpg'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/talkyard-sso',
      protected: false,
      exampleRequestPath: '/api/users/1/talkyard-sso'
    },
    {
      method: 'get',
      path: '/api/user/:user_id/get/settings',
      protected: true,
      exampleRequestPath: '/api/user/1/get/settings'
    },
    {
      method: 'post',
      path: '/api/user/:user_id/update/settings',
      protected: false,
      exampleRequestPath: '/api/user/1/update/settings'
    },
    {
      method: 'get',
      path: '/api/loadvariables',
      protected: false
    },
    {
      method: 'get',
      path: '/api/user/:user_id/get/thankyou',
      protected: false,
      exampleRequestPath: '/api/user/1/get/thankyou'
    },
    {
      method: 'post',
      path: '/api/user/:user_id/update/thankyou',
      protected: false,
      exampleRequestPath: '/api/user/1/update/thankyou'
    },
    {
      method: 'delete',
      path: '/api/user/:user_id/delete/thankyou/:id',
      protected: false,
      exampleRequestPath: '/api/user/1/delete/thankyou/1'
    },
    {
      method: 'get',
      path: '/api/users/:user_id/refresh-auth',
      protected: false,
      exampleRequestPath: '/api/user/1/refresh-auth'
    }
  ]
}
