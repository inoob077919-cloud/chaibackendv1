class ApiError extends Error {

    constructor(
        statusCode,
        message = "something went wrong",
        erros = [],
        stacktracks = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.erros = erros

        if (stacktracks) {
            this.stack = stacktracks
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export { ApiError }