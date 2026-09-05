export class ApiError extends Error {
  public statusCode: number;
  public errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: string, errors?: any[]) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg: string = 'Unauthorized') {
    return new ApiError(401, msg);
  }

  static forbidden(msg: string = 'Forbidden - Access denied') {
    return new ApiError(403, msg);
  }

  static notFound(msg: string = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static conflict(msg: string) {
    return new ApiError(409, msg);
  }

  static internal(msg: string = 'Internal server error') {
    return new ApiError(500, msg);
  }
}
