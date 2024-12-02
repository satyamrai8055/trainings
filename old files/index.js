const express = require('express')
const app = express()
const db = require('./db/dbconnection')
const model = require('./model/schema')
const Router = require("./router/route")



app.use("/api",Router);



var port = 8000



app.listen(port,()=>{
    console.log(`server is running ${port}`)
})


