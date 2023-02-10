const bcrypt = require('bcryptjs')
const passport = require('passport')
const jwt = require('jsonwebtoken')
var cron = require('node-cron');
const { userColl } = require('../models/user.js')
const { createRandomNumber, sendPasswordEmail, sendOtpEmail, sendSmsOtp, sendSmsPassword, generateBEP20Address, generateTRC20Address } = require('../common/index.js');
const { web3Provider } = require('../config/dbconfig.js')
const tokenSecret = 'mdb!@#123psd';
const crypto = require("crypto");
const { UserOtpModel } = require('../models/otpModel.js')

const algorithm = "aes-256-cbc";
// generate 16 bytes of random data
const initVector = crypto.randomBytes(16);
// secret key generate 32 bytes of random data
const Securitykey = crypto.randomBytes(32);

const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);

var speakeasy = require("speakeasy");

/**
 * handle login requests
 * @param {*} req 
 * @param {*} res 
 */
const login = async (req, res, next) => {
  const { username, password, dial_code, requestType } = req.body;
  let token = null;
  let otp = createRandomNumber(6, true, false, false);
  var secret = speakeasy.generateSecret({ length: 20 });
  try {
    /** check if user exist in database  */
    if (requestType == 'email') {
      console.log(requestType, 'here admin login request')
      userColl.findOne({ username }).then(async (result) => {
        if (result) {
          if(result.secret === undefined){
            await userColl.findOneAndUpdate({username},{secret : secret}).then((secretResult)=>{
              if(secretResult){
                console.log('secret update');
              }
            })
          }
          try {
            passport.authenticate('local', (authErr, user, info) => {
              if (authErr) return next(authErr);
              if (!user) {
                return res.send({ status: 401, message: "UserName or Email not matched!." });
              }
              return req.logIn(user, async (loginErr) => {
                if (loginErr) return res.sendStatus(401);

                token = jwt.sign({ _id: user._id }, tokenSecret, { expiresIn: '5h' });
                let session = req.session;
                session.token = token;
                if (user.TwoFA === 'enable') {
                  // let response = await sendOtpEmail(username, otp, res, true);
                  return res.send({ status: 200, id: user._id, auth: true, username: user.username, registerType: user.registerType, number: user.number, dial_code: user.dial_code, email: user.email, access_token: token, secutiryFA: user.TwoFA, fa_code: otp, kycStatus: user.kycstatus, tradePassword: user.tradingPassword, secret: user.secret });
                }
                else {
                  return res.send({ status: 200, id: user._id, auth: true, username: user.username, registerType: user.registerType, number: user.number, dial_code: user.dial_code, email: user.email, access_token: token, secutiryFA: user.TwoFA, kycStatus: user.kycstatus, tradePassword: user.tradingPassword, secret: user.secret });
                }

              })
            })(req, res, next);
          } catch (error) {
            console.log('===here', error);
          }
        }
        else {
          return res.send({ message: 'This Email not exist', status: 404 })
        }
      })
    }
    else {
      userColl.findOne({ username: username, dial_code: dial_code }).then(async(result) => {
        if (result) {
          try {
            if(result.secret === undefined){
              await userColl.findOneAndUpdate({username},{secret : secret}).then((secretResult)=>{
                if(secretResult){
                  console.log('secret update');
                }
              })
            }

            passport.authenticate('sms-local', async (authErr, user, info) => {
              if (authErr) return next(authErr);
              if (!user) {
                return res.send({ status: 401, message: "UserName or Number not matched!." });
              }
              token = jwt.sign({ _id: user._id }, tokenSecret, { expiresIn: '5h' });
              let session = req.session;
              session.token = token;
              console.log(user.secret,'====onlogin get user secret')
              if (user.TwoFA === 'enable') {
                // let response = await sendSmsOtp(username, otp, res, true);
                return res.send({ status: 200, id: user._id, auth: true, username: user.username, registerType: user.registerType, number: user.number, dial_code: user.dial_code, email: user.email, access_token: token, secutiryFA: user.TwoFA, fa_code: otp, kycStatus: user.kycstatus, tradePassword: user.tradingPassword, secret: user.secret });
              }
              else {
                return res.send({ status: 200, id: user._id, auth: true, username: user.username, registerType: user.registerType, number: user.number, dial_code: user.dial_code, email: user.email, access_token: token, secutiryFA: user.TwoFA, kycStatus: user.kycstatus, tradePassword: user.tradingPassword, secret: user.secret });
              }
            })(req, res, next);
          } catch (error) {
            console.log('===here', error);
          }
        }
        else {
          return res.send({ message: 'This Number not exist', status: 404 })
        }

      })
    }
  } catch (error) {
    console.log(error, 'error');
    res.status(203).json({ "message": "" })
  }
}

/**
 * handle admin login requests
 * @param {*} req 
 * @param {*} res 
 */
const adminLogin = async (req, res, next) => {
  const { username, password, role } = req.body;
  let token = null;
  let otp = createRandomNumber(6, true, false, false);
  try {
    /** check if user exist in database  */

    userColl.findOne({ username }).then(async (result) => {
      if (result.role == role) {
        try {
          passport.authenticate('local', (authErr, user, info) => {
            if (authErr) return next(authErr);
            if (!user) {
              return res.send({ status: 401, message: "UserName or Email not matched!." });
            }
            return req.logIn(user, async (loginErr) => {
              if (loginErr) return res.sendStatus(401);

              token = jwt.sign({ _id: user._id }, tokenSecret, { expiresIn: '5h' });
              let session = req.session;
              session.token = token;

              if (user.TwoFA === 'enable') {
                let response = await sendOtpEmail(username, otp, res, true);
                return res.send({ status: 200, id: user._id, auth: true, username: user.username, registerType: user.registerType, number: user.number, dial_code: user.dial_code, email: user.email, access_token: token, secutiryFA: user.TwoFA, fa_code: otp, kycStatus: user.kycstatus, tradePassword: user.tradingPassword });
              }
              else {
                return res.send({ status: 200, id: user._id, auth: true, username: user.username, registerType: user.registerType, number: user.number, dial_code: user.dial_code, email: user.email, access_token: token, secutiryFA: user.TwoFA, kycStatus: user.kycstatus, tradePassword: user.tradingPassword });
              }

            })
          })(req, res, next);
        } catch (error) {
          console.log('===here', error);
        }
      }
      else {
        return res.send({ message: 'This Email not exist', status: 404 })
      }
    })
  } catch (error) {
    console.log(error, 'error');
    res.status(203).json({ "message": "" })
  }
}

/**
 * handle register requests
 * @param {*} req 
 * @param {*} res 
 */
const register = async (req, res) => {
  const { email, number, password, dial_code, requestType, otp, time } = req.body
  var secret = speakeasy.generateSecret({ length: 20 });
  try {
    let ifUser;
    UserOtpModel.findOne({ "username": requestType == 'email' ? email : number, "otp": otp }).then(async (result) => {
      console.log('i am here')
      if (result) {
        let addMin = requestType == 'email' ? 2 : 1
        if (new Date(result.createdAt).getTime() + addMin * 60000 > new Date(time).getTime()) {
          console.log('Here Data Find')
          /** check if user exist in database  */
          if (requestType == 'email') {
            userColl.findOne({ username: email }).then(async (result) => {
              if (result) {
                return res.send({ status: 409, message: "This email is already exist" });
              }
              else {
                // let userPassword = createRandomNumber(10, true, true, true); //generate random password
                // let bcryptPassword = bcrypt.hashSync(userPassword, 12); //bcrypt random password that store in DB

                let bcryptPassword = bcrypt.hashSync(password, 12);
                userColl.create({ username: email, email: email, passwordHash: bcryptPassword, registerType: requestType, secret: secret }).then(async (data) => {
                  if (data) {
                    console.log(data)
                    setTimeout(() => {
                      let wallet = storeWalletAddress(data._id.toString());
                    }, 1000);
                    // await sendPasswordEmail(email, userPassword, res, data); //Send password email to register email
                    return res.send({ status: 200, message: "You are register succssfully!", data });
                  }
                }).catch((e) => {
                  console.log(e);
                  return res.send({ status: 500, message: "Something Wrong!!!", e });
                })
              }
            })
          }
          else {

            ifUser = userColl.find({ number }).then(async (result) => {
              if (result.length > 0) {
                return res.send({ status: 409, message: "This number is already exist" });
              }
              else {
                let bcryptPassword = bcrypt.hashSync(password, 12); //bcrypt random password that store in DB
                userColl.create({ username: number, number: number, dial_code: dial_code, passwordHash: bcryptPassword, registerType: requestType, secret: secret }).then(async (data) => {
                  if (data) {

                    setTimeout(() => {
                      let wallet = storeWalletAddress(data._id.toString());
                    }, 1000);
                    return res.send({ status: 200, message: "You are register succssfully!", data });
                  }
                }).catch((e) => {
                  console.log(e);
                  return res.send({ status: 500, message: "Something Wrong!!!", e });
                })
              }
            })

          }
        }
        else {
          console.log('OTP Expire')
          return res.send({ status: 404, message: 'OTP Expired' })
        }

      }
      else {
        console.log('OTP Not Matched')
        return res.send({ status: 404, message: 'OTP Not Matched' })
      }

    }).catch((error) => {
      console.log(error);
      return res.send({ status: 500, data: error })
    })

  } catch (error) {
    return res.send({ status: 500, message: error });
  }
}

const storeWalletAddress = async (id) => {
  console.log(new Date(), 'start time');
  let account = generateBEP20Address(web3Provider);
  const bep20cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
  const trc20cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
  let encryptedBep20Key = bep20cipher.update(account.privateKey, "utf-8", "hex");
  encryptedBep20Key += bep20cipher.final("hex");

  // let decryptedData = decipher.update(encryptedBep20Key, "hex", "utf-8");
  // decryptedData += decipher.final("utf8");
  // console.log("Decrypted message: " + decryptedData);

  let trc20Data = generateTRC20Address();
  let trc20 = await trc20Data.then((value) => {
    return value
  });
  let trc20Account = trc20.address.base58;
  let encryptedTrc20Key = trc20cipher.update(trc20.privateKey, "utf-8", "hex");
  encryptedTrc20Key += trc20cipher.final("hex");

  console.log(new Date(), 'end time');
  try {
    userColl.findOneAndUpdate({ _id: id }, { bep20Address: account.address, bep20Hashkey: encryptedBep20Key, trc20Address: trc20Account, trc20Hashkey: encryptedTrc20Key }).then((result) => {
      if (result) {
        console.log('User Wallet Address updated');
        return 'User Wallet Address updated';
      }
    }).catch((error) => {
      res.send({ status: 500, error });
    })
  } catch (error) {

  }
}

/**
 * Reset User Password and send to Email or mobile number based on request type 
 * @param {*} req 
 * @param {*} res 
 */
const resetPassword = async (req, res) => {

  const { email, number, password, requestType, otp, time } = req.body;

  let userPassword = password; ///createRandomNumber(10, true, true, true); //generate random password

  let bcryptPassword = bcrypt.hashSync(userPassword, 12);

  UserOtpModel.findOne({ "username": requestType == 'email' ? email : number, "otp": otp }).then(async (result) => {
    if (result) {
      let addMin = requestType == 'email' ? 2 : 1
      if (new Date(result.createdAt).getTime() + addMin * 60000 > new Date(time).getTime()) {
        if (requestType === 'email') {
          userColl.findOneAndUpdate({ username: email }, { passwordHash: bcryptPassword }).then(async (data) => {
            if (data) {
              return res.send({ status: 200, message: 'Your Password has been updated successfully.' })
              // await sendPasswordEmail(email, userPassword, res);
            }
          }).catch((e) => {
            console.log(e);
            return res.send({ status: 401, message: e.message })
          })

        }

        else if (requestType === 'mobile') {
          userColl.findOneAndUpdate({ username: number }, { passwordHash: bcryptPassword }).then(async (data) => {
            if (data) {
              return res.send({ status: 200, message: 'Your Password has been updated successfully.' })
              // await sendSmsPassword(number, userPassword ,res);
            }
          }).catch((e) => {
            console.log(e);
            return res.send({ status: 401, message: e.message })
          })

        }
      }
      else {
        console.log('OTP Expire')
        return res.send({ status: 404, message: 'OTP Expired' })
      }
    }
    else {
      console.log('OTP Not Matched')
      return res.send({ status: 404, message: 'OTP Not Matched' })
    }
  })


}

/**
 * Send Verification OTP based on request type
 * @param {*} req 
 * @param {*} res 
 */
const sendOtp = async (req, res) => {
  const { email, number, dial_code, requestType, resetPassword } = req.body
  //generate 6 digit OTP
  let otp = createRandomNumber(6, true, false, false);

  if (requestType === "email") {
    if (resetPassword === true) {
      userColl.findOne({ username: email }).then(async (result) => {
        if (result) {

          sendEmailOtp(email, otp, res)
        }
        else {
          return res.send({ status: 404, message: 'This Email is not exist' })
        }
      })
    }
    else {
      sendEmailOtp(email, otp, res)
    }
  }
  else if (requestType === "mobile") {
    console.log("=====requestType", requestType)
    if (resetPassword === true) {
      userColl.findOne({ username: number }).then(async (result) => {
        console.log("===result", result);
        if (result) {
          sendMobileOtp(number, otp, dial_code, res);
        }
        else {
          return res.send({ status: 404, message: 'This Phone number is not exist. ' })
        }
      })
    }
    else {
      sendMobileOtp(number, otp, dial_code, res);
    }
  }
}

const sendMobileOtp = (number, otp, dial_code, res) => {
  console.log("===nobu")

  let bobo = { "username": number, "otp": otp };
  console.log(bobo);

  try {
    // userColl.findOne({ number, dial_code }).then(async (result) => {
    //   if (result) {
    //     return res.send({ status: 409, message: "This Phone number is already exist. Please try to login with your existing account or try to create account with different number." });
    //   }
    // })

    UserOtpModel.findOne({ username: number }).then((otpExist) => {
      console.log('i am here');
      console.log(otpExist)
      if (otpExist) {
        console.log('i am here 1');
        UserOtpModel.findOneAndDelete({ username: number }).then((deleteOtp) => {
          if (deleteOtp) {
            console.log('i am here 5');
            UserOtpModel.create(bobo).then(async (result) => {
              if (result) {
                console.log('i am here 6 success');
                await sendSmsOtp(dial_code + '' + number, otp, res);//Send password email to register email 
              }
            }).catch((error) => {
              return res.send({ status: 500, data: error })
            })

          }
        }).catch((error) => {
          console.log(error);
          return res.send({ status: 500, data: error })
        })
      }
      else {
        console.log('i am here 2');
        UserOtpModel.create(bobo).then(async (result) => {
          console.log('i am here3');
          if (result) {
            console.log('i am here 4');
            await sendSmsOtp(dial_code + '' + number, otp, res);//Send password email to register email 
          }
        }).catch((error) => {
          return res.send({ status: 500, data: error })
        })
      }
    }).catch((error) => {
      return res.send({ status: 500, data: error })
    })
  } catch (error) {
    console.log(error)
    return res.send({ status: 500, data: error })
  }

}

const sendEmailOtp = (email, otp, res) => {

  try {
    // userColl.findOne({ username: email }).then(async (result) => {
    //   if (result) {
    //     return res.send({ status: 409, message: "This email is already exist. Please try to login with your existing email or try to create account with new email." });
    //   }
    // })
    UserOtpModel.findOne({ username: email }).then((otpExist) => {
      if (otpExist) {
        UserOtpModel.findOneAndDelete({ username: email }).then((deleteOtp) => {
          if (deleteOtp) {
            UserOtpModel.create({ username: email, otp: otp }).then(async (result) => {
              await sendOtpEmail(email, otp, res); //Send password email to register email 
            }).catch((error) => {
              return res.send({ status: 500, data: error })
            })
          }
        })
      }
      else {
        UserOtpModel.create({ username: email, otp: otp }).then(async (result) => {
          await sendOtpEmail(email, otp, res); //Send password email to register email 
        }).catch((error) => {
          return res.send({ status: 500, data: error })
        })
      }
    }).catch((error) => {
      return res.send({ status: 500, data: error })
    })
  } catch (error) {
    console.log(error)
    return res.send({ status: 500, data: error })
  }

}

/**
 * Enable/Disable 2FA security setting
 * @param {*} req 
 * @param {*} res 
 */
const enableTwoFASecurity = (req, res) => {
  const { userid,email, number, requestType, isEnable, otp, time } = req.body;
  UserOtpModel.findOne({ "username": requestType === "email" ? email : number, "otp": otp }).then(async (otpResult) => {
    console.log("============otpResult",otpResult)
    if (otpResult) {
      let addMin = 1;
      if (new Date(otpResult.createdAt).getTime() + addMin * 60000 > new Date(time).getTime()) {
        if (requestType === "email") {
          userColl.findOneAndUpdate({ _id: userid }, { TwoFA: isEnable === true ? 'enable' : 'disable' }).then(async (data) => {
            if (data) {
              console.log('======update google 2 FA using email')
              // userColl.findOne({ username: email }).then(async (result2) => {
              //   if (result2) {
              //     let msg = isEnable === true ? 'enable' : 'disable';
              //     return res.send({ status: 200, message: 'Your 2FA security is ' + msg + ' now.', user: result2 })
              //   }
              // })
              data.TwoFA = isEnable === true ? 'enable' : 'disable';
              let msg = isEnable === true ? 'enable' : 'disable';
              return res.send({ status: 200, message: 'Your 2FA security is ' + msg + ' now.', user: data })

            }
          }).catch((e) => {
            console.log(e);
            return res.send({ status: 401, message: e.message })
          })
        }
        else {
          userColl.findOneAndUpdate({ _id: userid }, { TwoFA: isEnable === true ? 'enable' : 'disable' }).then(async (data) => {
            if (data) {
              console.log('======update google 2 FA using mobile')
              // userColl.findOne({ number }).then(async (result2) => {
              //   if (result2) {
              //     let msg = isEnable === true ? 'enable' : 'disable';
              //     return res.send({ status: 200, message: 'Your 2FA security is ' + msg + ' now.', user: result2 })
              //   }
              // })
              data.TwoFA = isEnable === true ? 'enable' : 'disable';
              let msg = isEnable === true ? 'enable' : 'disable';
              return res.send({ status: 200, message: 'Your 2FA security is ' + msg + ' now.', user: data })

            }
          }).catch((e) => {
            console.log(e);
            return res.send({ status: 401, message: e.message })
          })
        }
      }
      else {
        console.log('OTP Expire')
        return res.send({ status: 404, message: 'OTP Expired' })
      }
    }
    else {
      console.log('OTP Not Matched')
      return res.send({ status: 404, message: 'OTP Not Matched' })
    }
  })

}

const getDepositAddressByID = (req, res) => {
  const { userid, type } = req.body;
  try {
    userColl.findOne({ _id: userid }).then((data) => {
      if (data) {
        res.send({ status: 200, deposit_address: type === 'bep20' ? data.bep20Address : type === 'erc20' ? data.bep20Address : data.trc20Address })
      }
    }).catch((error) => {
      res.send({ status: 401, message: error })
    })
  } catch (error) {
    console.log(error)
    res.send({ error: error })
  }
}

const userProfile = (req, res) => {
  const id = req.user._id;
  const token = req.headers.authorization;
  try {
    userColl.findOne({ _id: id }).then((user) => {
      // console.log("====user", user)
      if (user) {
        return res.send({ status: 200, id: user._id, auth: true, username: user.username, registerType: user.registerType, number: user.number, dial_code: user.dial_code, email: user.email, access_token: token, secutiryFA: user.TwoFA, kycStatus: user.kycstatus, tradePassword: user.tradingPassword, secret: user.secret });
      }
      else {
        return res.send({ status: 200, data: [] });
      }
    })
  } catch (error) {

  }
}

const setTradingPassword = (req, res) => {
  let { password, oldpassword } = req.body;
  console.log("===========oldpassword",oldpassword)
  try {
    let bcryptPassword = bcrypt.hashSync(password, 12);
    if (oldpassword === '' || oldpassword === undefined) {
      userColl.findOneAndUpdate({ _id: req.user._id }, { tradingPassword: bcryptPassword }).then((result) => {
        if (result) {
          userColl.findOne({ _id: req.user._id }).then((user) => {
            if (user) {
              return res.send({ status: 200, data: user.tradingPassword });
            }
          })
        }
      }).catch((error) => {
        return res.send({ status: 500, error })
      })
    }
    else {
      userColl.findOne({ _id: req.user._id }).then(async (user) => {
        if (user) {
          await bcrypt.compare(oldpassword, user.tradingPassword, async function (err, response) {
            console.log(response)
            if (err) {
              // handle error
              console.log('password not match')
            }
            if (response) {
              // Send JWT
              userColl.findOneAndUpdate({ _id: req.user._id }, { tradingPassword: bcryptPassword }).then((result) => {
                if (result) {
                  userColl.findOne({ _id: req.user._id }).then((user) => {
                    if (user) {
                      return res.send({ status: 200, message: "Trading Password Update successfully.", data: user.tradingPassword });
                    }
                  })
                }
              }).catch((error) => {
                return res.send({ status: 500, error })
              })
            }
            else {
              return res.send({ status: 404, message: "Trading Password Not Matched.", data: {} })
            }
          });
        }
      })

    }

  } catch (error) {
    return res.send({ status: 500, error })

  }
}


/**Update User Email or Number */

const updateUserProfile = (req, res) => {
  let { userid, email, number, requestType, otp, dial_code } = req.body;
  console.log(req.body,'===user profile update ')
  try {
    UserOtpModel.findOne({ "username": requestType === 'email' ? number : email, "otp": otp }).then(async (result) => {
      if (result) {
        if (requestType === 'email') {
          userColl.findOneAndUpdate({ _id: userid }, { email: email }).then(async (result) => {
            if (result) {
              result.email = email
              return res.send({ status: 200, message: "Email Update successfully.", data: result });

            }
            else {
              return res.send({ status: 404, message: 'Username not exist' })
            }
          }).catch((error)=>{
            return res.send({ status: 404, message: 'Email already exist' })
          })
        }
        else {
          userColl.findOneAndUpdate({ _id: userid }, { number: number, dial_code: dial_code }).then(async (result) => {
            if (result) {
              result.number = number
              result.dial_code = dial_code
              return res.send({ status: 200, message: "Number Update successfully.", data: result });

            }
            else {
              return res.send({ status: 404, message: 'Username not exist2' })
            }
          }).catch((error)=>{
            return res.send({ status: 404, message: 'Number already exist' })
          })
        }
      } else {
        console.log("=====otp not matched")
        return res.send({ status: 404, message: 'OTP Not Matched' })

      }
    })
  }
  catch (err) {
    console.log("====error", err)
  }

}

const user2FAVerifyCode = (req, res) => {
  const { secret, token } = req.body;
  console.log(secret, token);
  const { base32, hex } = secret;
  const isVerified = speakeasy.totp.verify({
    secret: base32,
    encoding: "base32",
    token: token
  });

  console.log("isVerified -->", isVerified);

  return res.send({ status: 200, message: isVerified })

}



module.exports = {
  login,
  register,
  sendOtp,
  resetPassword,
  enableTwoFASecurity,
  getDepositAddressByID,
  userProfile,
  setTradingPassword,
  storeWalletAddress,
  updateUserProfile,
  adminLogin,
  user2FAVerifyCode
}