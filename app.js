const express                       = require('express'),
    mongoose                        = require('mongoose'),
    app                             = express(),
    fs                              = require('fs'),
    http                            = require('http').Server(app),
    io                              = require('socket.io')(http),
    bodyPareser                     = require('body-parser'),
    queryString                     = require('query-string'),
    // cookiePareser                   = require('cookie-parser'),
    session                         = require('express-session'),
    models                          = require('./models/models.js'),
    fileUpload                      = require('express-fileupload'),
    functions                       = require('./functions/functions'),
    {check, validationResult}       = require('express-validator/check')
    
let sessionOptions = {
    secret: 'MabroukMe',
    cookie: {
        expires: 60*60*24*356
    },
    saveUninitialized: false,
    resave:false
};
if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    sessionOptions.cookie.secure = true;
}else {
    sessionOptions.cookie.secure = false;
}   

app.use(session(sessionOptions));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyPareser.json());
app.use(bodyPareser.urlencoded({extended: true}));
// app.use(cookiePareser('MabroukMe'));
app.use(fileUpload())
http.listen(process.env.PORT || 3030);



// ********* Index Page ********************
app.get(['/', '/index', '/home'], (req, res) => {
    var sess = req.session.mabroukUserId
    console.log('session: ', req.session.mabroukUserId)
    if(sess)
        return res.render('index', {sess: sess});
    else
        return res.render('index', {sess:0});
});

// ********* Login Page ********************
app.get('/Login', (req, res) => {
    // res.cookie('ali', 'learning style', {httpOnly: true, maxAge: 1000 * 60 * 60, expires: 1000 * 60 * 60 *20});
    // console.log('the cookie is set')
    const sess = req.session.mabroukUserId
    if(sess){
        //if there is session then i need to get the account of this user 
        const user = models.users.findById(sess).then((result) => {
            if(result){
                //if there is session and result then show the account
                return res.render('AllMyPage', {sess: sess, data: result})
            }else{
                //if there is session but not there account then goto login page to login
                return res.render('Login', {sess: 0})
            }
        }).catch((err) => {
            return res.render('Login', {sess: 0})
        })
        
    }else
        return res.render('Login', {sess: 0})
});
app.post('/Login', (req, res) => {
    //validate the input data fields first
    
    // console.log(req.body);
    res.end('welcome to post Login Page ');
});

// ********* Register Page ********************

app.get('/Register', (req, res) => {
    var sess = req.session.mabroukUserId
    // console.log('sess in register get: ', sess)
    if(sess){ //if there is session then get the account of that user
        models.users.findById(sess).then((result) => {
            if(result)  return res.render('AllMyPage', {sess: sess, data: result})
            else        return res.render('Register', {sess: 0})
        }).catch((err) => {
            return res.render('Register', {sess: 0, errors:0})
        })
    }else{
        return res.render('Register', {sess: 0, errors: 0, data: 0})
    }
        
});

//Validation Array of Register POST (validates Register Form and myInfo Page Form also)
const validateRegister = [
    check('name', 'الاسم  يجب ان يكون 5 احرف على الاقل').trim().isLength({ min: 5 }).escape(),
    check('eduPlace', 'مكان التعليم يجب ان يكون 5 اخرف على الاقل').optional().escape(),
    check('description', 'ادخل الوصف بشكل صحيح').optional().escape(),
    check('username', 'اسم المستخدم يجب ان يحتوى على 5 احرف على الاقل').isLength({min:5}).trim().escape().custom((value, {req}) => {
        if(value.includes(' '))
            return false
        return true
    }).withMessage('اسم المستخدم لايمكن ان يحتوى على مسافات'),
    check('password', 'الرقم السري يجب ان يحتوى على الاقل 5 اخرف').trim().isLength({min:5}).escape().custom((value, {req}) => {
        if(value.includes(' '))
            return false
        return true
    }).withMessage('الرقم السري لايمكن ان يحتوى على مسافات'),
    check('conPassword').trim().escape().custom((value, {req}) => {
        if(value !== req.body.password)
            return false
        return true
    }).withMessage('الراقم السري غير متطابق')
]

app.post('/Register', validateRegister, (req, res) => {
    var errors = {} //to assign new objects use Object.assign(parent, child)

    //collect the validatiion Results 
    if(validationResult(req).array().length != 0){
        Object.assign(errors, {data: validationResult(req).array()})
    }

    //check if the username is in the DB
    models.users.findOne({username: req.body.username}).then((result) => {
        if(result) //if the usernaqme is already exists
            Object.assign(errors, {existUsername: 'اسم المستخدم موجود بالفعل'})
        
        //validate the images file first
        var imagePath   = '',
            random      = Date.now()
        if(req.files != null && Object.entries(errors).length == 0){
            const checkext = functions.checkImgExt(req.files.file.mimetype) //check the extension of the image
            const checkSize = functions.checkImgSize(req.files.file.size) //check the size of the image must be less than 10MB
            if(checkext == false || checkSize == false){
                Object.assign(errors, {image: 'حجم الصورة يجب ان يكون اقل من 10 ميجا كذلك امتداد الصورة jpg, jpeg, png, gif'})
            }else
                imagePath = 'data/imgUser/' + random + req.files.file.name
        }

        //if there is nor errors then save to database
        if(Object.entries(errors).length == 0){
            //save to the DB
            const user = new models.users({
                username:       req.body.username,
                password:       req.body.password,
                name:           req.body.name,
                description:    req.body.description,
                image:          imagePath,
                eduPlace:       req.body.eduPlace
            })
            //save the model to DB
            user.save().then((result) => {
                //get the session id
                req.session.mabroukUserId = result._id  //start the session
                
                //Upload the Image
                if(req.files){
                    var file = req.files.file, 
                        filename = file.name;
                    file.mv('./public/data/imgUser/' + random + filename)
                }

                res.render('AllMyPage', {sess: result._id, data: result})
            }).catch((err) => {
                // console.log('the Message is: ',err)
                res.send('خدثت مشكله اثناء انشاء الحساب حاول مرة اخرى')
                res.end()
            })
        }else{
            console.log(errors)
            return res.render('Register', {sess: 0, errors: errors, data: req.body})
            
        }
    })
    
       
});


// ********* AllMyPage Page ********************

app.get('/AllMyPage', (req, res) => {
    let sess = req.session.mabroukUserId

    // Check first if the GET comming from Login Form By socket.io event
    if(req.query.Login){ //if the Login == true then the GET coming from location.replace in client side
        sess = req.query.id
        req.session.mabroukUserId = sess
    }
    // console.log('sess from AllMyPage get is: ', sess)
    if(sess){
        models.users.findById(req.query.id).select('name description eduPlace').then((result) => {
            // console.log('result is: ', result)
            if(result)
                return res.render('AllMyPage', {sess: sess, data: result});
            else
                return res.render('index', {sess: sess})
        }).catch((err) => {
            console.log('error: ', err)
            return res.render('index', {sess: sess})
        })
    }else{
        return res.render('index', {sess: 0})
    }
   
});



// ********* Messages Page ********************
app.get('/Messages', (req, res) => {
    var sess = req.session.mabroukUserId
    // console.log('sess from messages get: ', sess)
    if(sess){
        models.message.find({user_id: mongoose.Types.ObjectId(sess)}).sort({'_id': 'desc'}).then((result) => { //find the messages of this person
            // console.log('Result is: ',result)
            if(result.length){
                // console.log('i am inside array')
                return res.render('Messages', {sess: sess, msg: result})
            }else{
                return res.render('Messages', {sess: sess, msg: 0});
            }
                
        }).catch((err) => {
            console.log('error happened: ', err)
            return res.render('index', {sess: sess});
        })
    }else{
        return res.render('index', {sess: 0});
    }
   
    
});

//Start To Validate the Message POST that sender sends it to his friend
var validateMessage = [
    check('senderName', 'الاسم يجب ان يكون 5 احرف على الاقل').isLength({min: 5}).escape(),
    check('message', 'يجب وضع شئ فى الرساله').not().isEmpty().escape()
]

// ********* MyInfo Page ********************
app.get('/MyInfo', (req, res) => {
    const sess = req.session.mabroukUserId
    if(sess){
        //get the account using session id
        models.users.findById(sess).then((result) => {
            // console.log('result', result)
            if(result)
                res.render('MyInfo', {sess: sess, errors: 0, data: result});
            else
                res.render('index', {sess:sess})
        }).catch((err) => {
            res.render('index', {sess:sess})
        })
    }else{
        res.render('index', {sess:0})
    }
    
});

//edit the information in myInfo Page
app.post('/MyInfo', validateRegister, (req, res) => {
    var sess = req.session.mabroukUserId
    if(sess){
        var errors = {} //to assign new objects use Object.assign(parent, child)

        //collect the validatiion Results 
        if(validationResult(req).array().length != 0){
            Object.assign(errors, {data: validationResult(req).array()})
        }

        //check if the username is in the DB and not of this account
        models.users.findOne({username: req.body.username}).then((result) => {
            var oldImgPath = ''
            if(result){ //if the usernaqme is already exists
                if(sess != result._id) //if this account is not of this user then he must enter another username
                    Object.assign(errors, {existUsername: 'اسم المستخدم موجود بالفعل'})
                oldImgPath = result.image
            }
            //validate the images file first
            var imagePath   = '',
                random      = Date.now()
            if(req.files != null && Object.entries(errors).length == 0){
                const checkext = functions.checkImgExt(req.files.file.mimetype) //check the extension of the image
                const checkSize = functions.checkImgSize(req.files.file.size) //check the size of the image must be less than 10MB
                if(checkext == false || checkSize == false){
                    Object.assign(errors, {image: 'حجم الصورة يجب ان يكون اقل من 10 ميجا كذلك امتداد الصورة jpg, jpeg, png, gif'})
                }else
                    imagePath = 'data/imgUser/' + random + req.files.file.name
            }

            //if there is nor errors then save to database
            if(Object.entries(errors).length == 0){
                //save to the DB
                var user = {
                    username:       req.body.username,
                    password:       req.body.password,
                    name:           req.body.name,
                    description:    req.body.description,
                    image:          imagePath,
                    eduPlace:       req.body.eduPlace
                }
                //update the model to DB
                models.users.findByIdAndUpdate(sess, user, {new: true}).then((result) => {
                    //Upload the Image
                    if(req.files){
                        var file = req.files.file, filename = file.name
                        file.mv('./public/data/imgUser/' + random + filename)
                        fs.unlink(oldImgPath, (err) => { //remove the old image
                            console.log('Failed to delete the old image', err)
                        }) 
                    }

                    res.render('MyInfo', {sess: sess, errors: 0, data: result})
                }).catch((err) => {
                    console.log('the Message is: ',err)
                    res.send('خدثت مشكله اثناء تعديل البيانات رجاءا حاول مرة اخرى')
                    res.end()
                })
            }else{
                console.log(errors)
                return res.render('MyInfo', {sess: sess, errors: errors, data: req.body})
                
            }
        })
    }else{
        res.render('index', {sess: 0})
    }
})

//edit the description in the myInfo Page
app.post('/editMyDescription', [
    check('description').escape().optional()
], (req, res) => {
    var sess = req.session.mabroukUserId
    if(sess){
        // console.log('desc: ', req.body.description)
        models.users.findByIdAndUpdate(sess, {description: req.body.description}, {new: true}).then((result) => {
            console.log(result)
            res.render('MyInfo', {sess: sess, errors: 0, data: result})
        }).catch((err) => {
            res.render('index', {sess:0})
        })
    }else{
        res.render('index', {sess:0})
    }
})

// ********* MyPage Page ********************
app.get('/MyPage', (req, res) => {
    var sess = req.session.mabroukUserId
    // console.log('session from myPage is: ', sess)
    // console.log('id from myPage is: ', req.query.id)
    if(sess){
        var user = models.users.findById(sess).exec((err, result) => {
            if(err){
                return res.render('index', {sess: sess})
            }else if(result){
                return res.render('MyPage', {sess: sess, data: result, sender:0});
            }
            return res.render('index', {sess: sess}) //if there is no error but result == null then redirect to index page
        })
    }else{ //if there is no session then get the id from URL to get the user's data
        if(req.query.id){
            var user = models.users.findById(req.query.id).exec((err, result) => {
                if(err){
                    return res.render('index', {sess: 0})
                }else if(result){
                    // console.log('Sender Result Here: ', result)
                    return res.render('MyPage', {sess: 0, data: 0, sender: result});
                }
                return res.render('index', {sess: 0}) //if there is no error but result == null then redirect to index page
            })
        }
        else
            return res.render('index', {sess: 0})
    }
    
});

app.post('/MyPage', validateMessage, (req, res) => {
    //validate the input fields
    var errors      = {},
        imagePath   = '',
        random = Date.now()
        sess = req.session ?  req.session.mabroukUserId: 0; //if there is a sesion then get it
    
    
   
    //assign the validation error messages
    Object.assign(errors, validationResult(req).array())
    
    //validate the Image
    if(req.files && Object.entries(errors).length == 0){
        const checkext = functions.checkImgExt(req.files.file.mimetype) //check the extension of the image
        const checkSize = functions.checkImgSize(req.files.file.size) //check the size of the image must be less than 10MB
        if(checkext == false || checkSize == false){
            Object.assign(errors, {image: 'حجم الصورة يجب ان يكون اقل من 10 ميجا كذلك امتداد الصورة jpg, jpeg, png, gif'})
        }else
            imagePath = 'data/imgMessages/' + random + req.files.file.name
    }

    //store the Message in database
    if(Object.entries(errors).length == 0){
        //create the schema
        var msg = new models.message({
            senderName:     req.body.senderName,
            senderImg:      imagePath,
            date:           Date.now(),
            message:        req.body.message,
            user_id:        mongoose.Types.ObjectId(req.body.userid)
        })
        msg.save().then((result) => {
            
             //Upload the Image
            if(req.files){
                var file = req.files.file, filename = file.name
                file.mv('./public/data/imgMessages/' + random + filename)
            }
            
            //get the user account to back to the MyPage if my friend need to give me another message
            models.users.findById(req.body.userid).then((result) => {
                // console.log('user: ', result)
                req.query.id= req.query.userid
                if(result)
                    res.render('MyPage', {sess: sess, data: 0, sender: result, sentMsg: true})
                else
                    res.render('index', {sess: sess})
            }).catch((err) => {
                console.log('error: ', err)
                res.render('index', {sess: sess})
            })
        }).catch((err) => {
            return res.render('index', {sess: sess})
        })
    }else{
        return res.send(errors)
    }
    

});



// ********* Logout Page ********************
app.get('/LogOut', (req, res) =>{
    req.session.destroy((err) => {
        if(err){
            console.log('failed to destroy the session')
            req.session.mabroukUserId = 0  //set it with 0 if not destroyed
            return res.render('index', {sess: 0})
        }
        return res.render('index', {sess: 0})
    })
    
    
});


// ********** AddMessage To DB ***********
app.post('/AddMessage', (req, res) => {
    res.end('Welcome To Add Messages Post Form');
    console.log(req.body.senderName);
});



// Start Connection of socket 
var usersNumber = 0;
io.on('connection', (socket) => {
    console.log('user is connected');
    console.log('Total Users Connected: ' + ++usersNumber)
    // MyPage Page
    // socket.on('sendMessage', (data) => {
    //     console.log(data);
    // });

    socket.on('Login', (data) => {
        
        //check if the account is here
        const user = models.users.findOne({username: data.username, password: data.password}).then((result) => {
            if(result){
                socket.emit('LoginStatus', {status: true, id: result._id})
            }else{
                socket.emit('LoginStatus', {status: false});
            }
        }).catch((err) => {
            socket.emit('LoginStatus', {status: false});
        })
    })
});







