export const Resp = {
  success: {
    errorCode: 0,
    errorMessage: '',
  },

  backendCheckSessionFail: {
    errorCode: 9999,
    errorMessage: 'Session無效或過期',
  },

  exceptionError: {
    errorCode: 9998,
    errorMessage: 'ExceptionError',
  },

  // Api Fail
  paramInputEmpty: {
    errorCode: 1000,
    errorMessage: 'param Input Empty',
  },

  paramInputFormateError: {
    errorCode: 1001,
    errorMessage: 'param Input formate error',
  },
};
