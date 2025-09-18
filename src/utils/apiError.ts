class ApiError extends Error {
  statusCode: number;
  data: any;
  success: boolean;
  errors: Error[];
  timestamp: Date;
  isCached: boolean;

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    errors: Error[] = [],
    stack: string = '',
    timestamp: Date = new Date(),
    isCached: boolean = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.timestamp = timestamp;
    this.isCached = isCached;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
