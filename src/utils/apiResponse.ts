class ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  timestamp: Date;
  isCached: boolean;

  constructor(
    statusCode: number,
    data: T,
    message: string = 'Success',
    timestamp: Date = new Date(),
    isCached: boolean = false
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = timestamp;
    this.isCached = isCached;
  }
}

export { ApiResponse };
