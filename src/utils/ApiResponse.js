class ApiResponse {
  constructor(statusCode, data, message = "success", extra = {}) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
    this.data = data;
    Object.assign(this, extra); // merge extra fields
  }
}

export default ApiResponse;
