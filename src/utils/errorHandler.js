export const ErrorTypes = {
  FIELD: 'field',
  FORM: 'form',
  GLOBAL: 'global',
  OAUTH: 'oauth'
};

export const ErrorSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export class ErrorObject {
  constructor({
    type,
    severity,
    field = null,
    code,
    message,
    guidance,
    blocking,
    actions = []
  }) {
    this.type = type;
    this.severity = severity;
    this.field = field;
    this.code = code;
    this.message = message;
    this.guidance = guidance;
    this.blocking = blocking;
    this.actions = actions;
  }
}

export const mapValidationErrors = (backendErrors) => {
  if (!backendErrors || typeof backendErrors !== 'object') {
    return {};
  }

  const fieldErrors = {};
  Object.keys(backendErrors).forEach(field => {
    fieldErrors[field] = new ErrorObject({
      type: ErrorTypes.FIELD,
      severity: ErrorSeverity.ERROR,
      field: field,
      code: `VALIDATION_${field.toUpperCase()}`,
      message: backendErrors[field],
      guidance: backendErrors[field],
      blocking: true
    });
  });

  return fieldErrors;
};

export const mapOAuthError = (backendError) => {
  const errorMessage = backendError?.response?.data?.message || '';
  
  const oauthErrorMap = {
    'Google account email not verified': {
      message: 'Google account email not verified',
      guidance: 'Please verify your email with Google first, then try signing in again.'
    },
    'Email domain not allowed': {
      message: 'Email domain not allowed',
      guidance: 'Your email domain is not permitted. Contact your administrator or use a different email.'
    },
    'No account found for this school': {
      message: 'No account found for this school',
      guidance: 'Contact your administrator to create your account first.'
    },
    'Google OAuth not configured': {
      message: 'Google sign-in temporarily unavailable',
      guidance: 'Please use email/password login.'
    }
  };

  const mappedError = oauthErrorMap[errorMessage] || {
    message: 'Google sign-in failed',
    guidance: 'Please try again or use email/password login.'
  };

  return new ErrorObject({
    type: ErrorTypes.OAUTH,
    severity: ErrorSeverity.ERROR,
    code: 'OAUTH_ERROR',
    message: mappedError.message,
    guidance: mappedError.guidance,
    blocking: false
  });
};

export const mapFormError = (message, code = 'FORM_ERROR') => {
  return new ErrorObject({
    type: ErrorTypes.FORM,
    severity: ErrorSeverity.ERROR,
    code: code,
    message: message,
    guidance: message,
    blocking: false
  });
};
