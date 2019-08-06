const jwt = require('jsonwebtoken')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')

require('dotenv/config');

// routes
const dbConnection = require('./routes/db')
const users = require('./routes/users')
const api = require('./routes/api')

const app = express()

app.use(helmet())
app.use(compression())

app.use(cors({ exposedHeaders: ['Content-Type', 'x-auth-token']}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', (req, res, next) => {   
    const token = req.header('x-auth-token')
    if (!token) 
        return res.status(401).send('Access denied. No token provided.')

    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
        if (err)  
            return res.status(400).send('Invalid token.')
        
        req.user = decoded
        next()
    })
   
})

app.use('/db', dbConnection)

app.use('/users',  users)

app.use('/api', api)


const port = process.env.PORT || 3000
app.listen(port, () => console.log(`App listening on port ${port}`))

