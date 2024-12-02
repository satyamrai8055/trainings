const apiErrorhandler = (err, req, res, next) => {
    console.log(err, "Error From Middleware.")
    console.log(err.name, err, "Error From Middleware.")

    if (err.isApiError) {
        res.json({
            responseCode: err.responseCode,
            responseMessage: err.responseMessage,
        });
        return;
    }
    if (err.message == 'Validation error') {
        res.json({
            code: 502,
            responseMessage: err.original.message,
        });
        return;
    }

    console.log("27")
    res.json({ 
        responseCode: err.code || 500,
        responseMessage: err.message,
    });
    return;
};
module.exports = apiErrorhandler;