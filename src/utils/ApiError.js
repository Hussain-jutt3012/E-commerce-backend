class ApiError extends Error {
    constructor(statuscode, message = "SomeThing went Wrong", error = []) {
        super(message)
        this.statuscode = statuscode > 400
        this.data = null
        this.message = message
        this.error = error
    }
}

export { ApiError }