const { ErrorReporting } = require('@google-cloud/error-reporting');

exports.errorReport = (msg) => {
    const errors = new ErrorReporting();
    errors.report(msg);
}
