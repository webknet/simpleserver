const express = require('express')
const assert = require('assert')
const ObjectId = require('mongodb').ObjectId
const dbConnection = require('../db')

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
 */

router.post('/', (req, res) => {    
    const db = dbConnection.getDB()
    const { entity: { action, collection, query, fields }, value } = req.body;
    
    if (collection == 'users') 
        return res.status(400).send('Invalid input')
    
    if (!db) return res.status(500).send('No database connected.')

    const dbCollection = db.collection(collection)

    switch(action) {
        case 'insert':
            Array.isArray(value) 
                ? dbCollection.insertMany(value, (err, result) => {
                        assert.deepStrictEqual(null, err)                        
                        res.json(result)
                    })
                : dbCollection.insertOne(value, (err, result) => {
                        assert.deepStrictEqual(null, err)
                        res.json(result)
                    })

           break;
        case 'update':
            switch (query) {
                case 'One':
                    dbCollection.updateOne(value.filter, value.update, (err, result) => {
                        assert.deepStrictEqual(null, err)
                        res.send(result)
                    })
                    break;
                case 'Many':
                    dbCollection.updateMany(value.filter, value.update, (err, result) => {
                        assert.deepStrictEqual(null, err)
                        res.send(result)
                    })
                    break;
                case 'ById':
                    dbCollection.updateOne({ _id: ObjectId(value.filter) }, value.update, (err, result) => {
                        assert.deepStrictEqual(null, err)
                        res.send(result)
                    })
                    break;
            }
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
            switch (query) {
                case 'One':
                    dbCollection.deleteOne(value, (err, result) => {
                        assert.deepStrictEqual(null, err)
                        res.send(result)
                    })
                    break;
                case 'Many':
                    dbCollection.deleteMany(value, (err, result) => {
                        assert.deepStrictEqual(null, err)
                        res.send(result)
                    })
                    break;
                case 'ById':
                    dbCollection.deleteOne({ _id: ObjectId(value) }, value.update, (err, result) => {
                        assert.deepStrictEqual(null, err)
                        res.send(result)
                    })
                    break;
            }
            break;
        case 'drop':
            db.collection.drop((err, result) => {
                assert.deepStrictEqual(null, err)
                res.send(result)
            })
            break;
        default:
            res.status(400).send('Input invalid.')
   }
   
})

module.exports = router