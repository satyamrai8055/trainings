const {default:mongoose  } = require('mongoose')


const connect = mongoose.connect('mongodb://localhost:27017/usersdb').then(()=>{
    console.log('  db is connected');
});