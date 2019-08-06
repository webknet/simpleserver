const state = {
    database: null
}

const setDB = db => state.database = db
const getDB = () => state.database


module.exports =  { setDB, getDB }