const mongoose  = require('mongoose'),
    schema      = mongoose.Schema,
    url         = 'mongodb+srv://wslny:wslny@cluster0-ejcmv.mongodb.net/mabroukMe?retryWrites=true&w=majority'
    // url         = 'mongodb://localhost/mabroukMe';


//Connect to the database
mongoose.connect(url, {useNewUrlParser: true}, (err) => {
    if(err){
        console.log('cannot connect to the database ;(')
    }else{
        console.log(`the database is connected and the port is ${process.env.PORT || 3030}`)
    }
}); 

// ******************** Users Model *******************
var usersSchema = new schema({
    username:       {type: String, default: '', trim: true, required: true},
    password:       {type: String, default: '', trim: true, required: true},
    name:           {type: String, default: '', trim: true, required: true},
    description:    {type: String, default: '', trim: true},
    image:          {type: String, default: '', trim: true},
    eduPlace:       {type: String, default: '', trim: true}
    
});

//*********************  Messages Schema ******************
var messageSchema = new schema({
    senderName:     {type: String, default: '', trim: true},
    senderImg:      {type: String, default: '', trim: true},
    date:           {type: Date, default: Date.now()},
    message:        {type: String, default: '', trim: true, required: true},
    user_id:        {type: mongoose.Types.ObjectId}
});

const users = mongoose.model('users', usersSchema),
    message = mongoose.model('message', messageSchema)

//insert at least one value to initialize the models in DB
//if the res is null then the model did'nt initialized yet then insert value to create the model
users.findOne({username: 'MABROUKME', password: 'MABROUKME'}).then((res) =>{
    if(res == null){  
        var user = new users({
            username:       'MABROUKME',
            password:       'MABROUKME',
            name:           'MABROUKME',
            description:    'MABROUKME',
            image:          'MABROUKME',
            eduPlace:       'MABROUKME'
        })
        user.save()
    }
})
message.findOne({senderName: 'MABROUKME'}).then((res) => {
    if(res == null){ 
        var msg = new message({
            senderName:     'MABROUKME',
            senderImg:      'MABROUKME',
            message:        'MABROUKME',
            date:           Date.now(),
            user_id:        new mongoose.Types.ObjectId('000000000000000000000000')
        })
        msg.save()
    }
})

module.exports = {
    users:      users,  
    message:   message
} 


