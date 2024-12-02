const { default: mongoose } = require('mongoose');

const mongoosePaginate = require('mongoose-paginate-v2');
 
const user = mongoose.Schema({
    name:{
        type: String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    mobile  :{
        type:String
    },
    otp:{
        type:String

    },
    id:{
        type: String
    },
 
    npassword:{
        type:String
    },
    cmpassword:{
        type:String
    },
    isverify:{
        type:Boolean,
        default:false
    },
    // tokens:[{
    //     token:{
    //         type:String
    //     }
    // }]
    token:{
        type:String
    }

  },
  { timestamps: true }

 
 );

user.plugin(mongoosePaginate)
module.exports = mongoose.model('user' , user)

