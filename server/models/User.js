const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
var sanitize = require('mongo-sanitize');
const sgMail = require('@sendgrid/mail')
const config = require("./../config/key");
sgMail.setApiKey(config.sendGrid)

const userSchema = mongoose.Schema({
    username: {
        type:String,
        maxlength:50
    },
    email: {
        type:String,
        trim:true,
        unique: 1 
    },
    password: {
        type: String,
        minglength: 5
    },
    firstName: {
        type: String,
        maxlength: 50
    },
    lastName: {
        type: String,
        maxlength: 50
    },
    role : {
        type: Number,
        default: 0 
    },
    image: { 
        type: String,
    },
    token : {
        type: String,
    }, 
    tokenConf : {
        type: String,
    },
    token_mail: {
        type: Boolean,
        default: false
      },
    tokenExp :{
        type: Number
    },
    id_42: {
        type: Number
    },
    id_discord: {
        type: Number
    },
    id_github: {
        type: Number
    }
})


userSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash
                let token = ((+new Date) + Math.random() * 100).toString(32);
                user.tokenConf = crypto.createHash('md5').update(token).digest("hex");

                if (user.token_mail == false) {
                   
                    console.log("user token is :", user.tokenConf)

                    const html =
                        `<html>
      <body>
          <center>
            
              <h3 
                  style="
                      padding-top: 30px;
                      padding-bottom: 10px;
                      font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;"
              >
                    Hi ${user.username},
                    <br/>
                  To watch all our films, there's only one last step left!
              </h3>
              <a 
                  href="https://hypertube-scao.herokuapp.com/confirmation/${user.tokenConf}" 
                  style="
                      background-color: rgb(25, 186, 144);
                      padding: 15px 20px;
                      font-size: 0.875rem;
                      border-radius: 3px; 
                      color: white;
                      font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
                      font-weight: 500;
                      line-height: 1.75;
                      letter-spacing: 0.02857em;
                      text-transform: uppercase;
                      text-decoration: none;
                      margin-top: 50px;
                      margin-bottom: 50px"
              >
                  Confirm your registration
              </a>
              <br /><br /><br />
              <small>This email is automatic, please do not answer it.</small>
          </center>
      </body>
  </html>`;
                    var mailOptions = {
                        from: {
                            name: "Hypertube Team",
                            email: "emilie.brun.dmv@gmail.com"},
                          to: sanitize(user.email),
                        subject: 'HYPERTUBE 🎬 | Registration confirmation',
                        html: html,
                    }

                    sgMail.send(mailOptions, function(err){
                        if (err ){
                          console.log(err);
                        }
                        else {
                          console.log('Message sent');
                        }
                    });
                }
                next()
            })
        })
    } else {
        next()
    }

});

userSchema.methods.CheckTokenMail = function (tokenfind, cb) {
    var user = this
    return cb(null, user.token_mail)
}
userSchema.methods.ConfTokenMail = function (token, cb) {
    var user = this
    console.log("test")
    return cb(null, user.token_mail)
}

userSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function (cb) {
    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secret')

    user.token = token;
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user);
    })
}

userSchema.statics.findByToken = function (token, cb) {
    var user = this;

    jwt.verify(token, 'secret', function (err, decode) {
        user.findOne({ "_id": decode, "token": token }, function (err, user) {
            if (err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = { User }