const express = require('express')
const assert = require('assert')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const ObjectId = require('mongodb').ObjectId
const dbConnection = require('../db')

require('dotenv/config')
const router = express.Router()

/**
 *  @request.body
 *  {
 *      entity: {
 *          action: <insert>, <update>, <delete>, <query>,
 *          query: <One>, <Many>, <ById>,
 *          collection: default <users>
 *          fields: { <field1: 1>, <field2: 1>}
 *      },
 *      value: <object>, <array>, <string>
 *  }
 * 
 */

router.post('/', async (req, res) => {
    const db = dbConnection.getDB()

    const { entity: { action, collection, query, fields }, value } = req.body;
    
    if (!db) return res.status(500).send('No database connected..')

    const dbCollection = db.collection('users')

    switch(action) {
        case 'insert':
            let user = await dbCollection.findOne({ email: value.email })
            if (user) return res.status(409).send('User with that email already exists.')

            value.password = await bcrypt.hash(value.password, 10)

            dbCollection.insertOne(value, (err, result) => {
                    assert.deepStrictEqual(null, err)
                    const token  = jwt.sign({ _id: result.insertedId }, process.env.TOKEN_KEY) 
                    res.header('x-auth-token', token).json({_id:result.insertedId, name: value.name, email: value.email})
                })

           break;
        case 'update':
            if (value.update.$set.hasOwnProperty('password')) {           
                value.update.$set.password = await bcrypt.hash(value.update.$set.password, 10);
            }
            dbCollection.updateOne({ _id: ObjectId(value.filter) }, value.update, (err, result) => {
                    assert.deepStrictEqual(null, err)
                    res.send(result)
                })
           
            break;
        case 'query':
            switch (query) {
                case 'One':
                    dbCollection.findOne(value, (err, result) => {
                            assert.deepStrictEqual(null, err)
                            res.send(result)
                        })
                    break;
                case 'Many':
                    dbCollection.find(value)
                            .project(fields)
                            .toArray((err, result) => {
                                assert.deepStrictEqual(null, err)
                                res.send(result)
                            })
                    break;
                case 'ById':
                        dbCollection.findOne({ _id: ObjectId(value) }, (err, result) => {
                            assert.deepStrictEqual(null, err)                
                            callback(result)
                        })
                break;
            
            }
            
            break;
        case 'delete':            
            dbCollection.deleteOne(value, (err, result) => {
                    assert.deepStrictEqual(null, err)
                    res.send(result)
                })
        
            break;
        
        default:
            res.status(400).send('Input invalid.!')
   }
})

router.post('/auth', async (req, res) => {
    const { email, password } = req.body;

    const db = dbConnection.getDB()
    if (!db) return res.status(500).send('No database connected.')

    const dbCollection = db.collection('users')

    let user = await dbCollection.findOne({ email: email });
    if (!user) return res.status(400).send('Invalid email or password')

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) return res.status(400).send('Invalid email or password')
    
    const token  = jwt.sign({ _id: user._id }, process.env.TOKEN_KEY) 

    res.header('x-auth-token', token).send({ _id: user._id, name: user.name, email: user.email })
})

module.exports = router