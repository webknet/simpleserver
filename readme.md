# Simple mongoDB server

For small noSQL data transations, **Simple mongoDB server**, can help you focus on the code without experience the frustration of setting up a serve each time you want start a new idea for an application.

## Dependencies
 - nodejs
 - expressjs
 - mongoDB
 - bcrypt
 - jsonwebtoken

## Server (structure) RESTful services
- Create a new database
    - For each application just need to designate a *new database name*
```javascript
/**
 * Initialize connection to a database
 * method POST
 * route <your server name>/db
**/

{
    "db": "<dbName>" //can be any name
}
```
- Users
    - To access **API**, you need *authenticated user*

```javascript
/**
 * User register
 * method POST
 * route <your server name>/users
**/

{
    "collection": {
        "name": "users",
        "action" "insert"
    },
    "value": {
        "name": "<userName>",
        "email": "<userEmail>",
        "password": "<userPassword>"
    }
}
/**
 * User authentication
 * method POST
 * route <your server name>/users/auth
 * */

{
    "email": "<userEmail>",
    "password": "<userPassword>"
}
```

- API
    - Valid **token** is *require*
    - Server issues a token for each authenticated user
    - Token header property **x-auth-token**

```javascript
/**
 * api
 * method POST
 * route <your server name>/api
 * */

{
    "collection": {
        "name": "<collectionName>",
        "action": "<insert>, <update>, <delete>, <query>",
        "query": "<One>, <Many>, <ById>",
        "fields": { "<field1: 1>", "<field2: 1>"}
    },
    "value": "<object>, <array>, <string>"
}
``` 
