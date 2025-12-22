export class AuthError extends Error {
    constructor(message: string){
        super(message);
        this.name = 'AuthError'
    }
}

export class SessionExpiredError extends AuthError {
    constructor(message ='Your session has expired. Please log in again.'){
        super(message);
        this.name = 'SessionExpiredError'
    }
}

export class RefreshTokenError extends AuthError {
  constructor(message = 'Failed to refresh authentication token.') {
    super(message);
    this.name = 'RefreshTokenError';
  }
}
