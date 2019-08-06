const express = require('express')
const MongoClient = require('mongodb').MongoClient
const db = require('../db')

const router = express.Router()
const url = process.env.DB_CONNECTION //'mongodb://localhost:27017'

const mongoOptions =  { useNewUrlParser: true }

router.use('/', (req, res) => {
    MongoClient.connect(url, mongoOptions, (err, client) => {
        if (err)
            console.log(err)
        else
            db.setDB(client.db(req.body.db))
        
    })
    res.send({ state: 'connected', db: req.body.db })
})


module.exports = router 