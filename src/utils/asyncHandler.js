const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        /*you must return this hard function other wise 
        TypeError: argument handler must be a function */
        Promise
            .resolve(requestHandler(req, res, next))
            .catch((error) => next(error))
    }
}

export { asyncHandler }







// const asyncHandler = () => {}
// const asyncHandler = (func) => { ()=>{ } }
//   //in this situation we have remove after function {}
//like this (func) => ()=>{}

/* try catch code
    const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(error.code || 500).json(
            {
                success: false,
                message: error.message
            }
        )
    }
}
    */