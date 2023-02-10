var express = require('express')
const generator = require('generate-password');
const mailer = require('express-mailer');
const path = require('path');
var Web3 = require("web3");
const TronWeb = require('tronweb');
const nodemailer = require('nodemailer');
const { SMTP_SECURE, smtp_host, smtp_password, smtp_port, smtp_user } = require('../config/dbconfig.js');

var app = express();

app.set('views', path.dirname('../') + '/views');
app.set('view engine', 'jade');

/**
 * Generate random number
 * @returns 
 */
const createRandomNumber = (length, numbers, lowercase, uppercase) => {
  return generator.generate({
    length: length,
    numbers: true,
    lowercase: lowercase,
    uppercase: uppercase
  })
}

/**
 * setup mailer setting
 */

if (smtp_user == '') {
  mailer.extend(app, {
    from: smtp_user,
    host: smtp_host,
    secureConnection: SMTP_SECURE,
    port: smtp_port,
    transportMethod: 'SMTP'
  });
} else {
  mailer.extend(app, {
    from: smtp_user,
    host: smtp_host,
    secureConnection: SMTP_SECURE,
    port: smtp_port,
    transportMethod: 'SMTP',
    auth: {
      user: smtp_user,
      pass: smtp_password
    }
  });
}

/**
 * send user random password by mail
 * @param {*} email 
 * @param {*} password 
 */



const sendPasswordEmail = async (email, password, response, data) => {
  try {
    await app.mailer.send('password', {
      to: email,
      subject: `Prime Experia Exchange Account Password`,
      data: { email: email, password: password }
    }, (err) => {
      if (err) {
        console.log(err)
        return response.send({ status: 200, message: err.message });
      }
      return response.send({ status: 200, message: 'Password Email has been sent', data });
    });
  } catch (error) {
    return error.message;
  }

}



/**
 * send email verification OTP
 * @param {*} email 
 * @param {*} password 
 * @gmail.com

 */

const sendOtpEmail = async (email, Otp, response, isReturn) => {
  try {
    await app.mailer.send('otp', {
      to: email,
      subject: `Prime Experia Exchange One Time Password`,
      data: { email: email, otp: Otp }
    }, (err) => {
      if (err) {
        console.log(err)
        return response.send({ status: 200, message: err.message });
      }
      if(isReturn){
        return {status:200, message:Otp};
      }
      else{
        return response.send({ status: 200, message: 'OTP Email has been sent', "otp": Otp });
      }
    });
  } catch (error) {
    return error.message;
  }
}

/**
 * Send SMS OTP
 */

const sendSmsOtp = async (number, Otp, response, isReturn) => {
  try {
    let message = 'Dear User, Your OTP is ' + Otp + ' Never share this OTP with anyone, this OTP expire in two minutes. More Info: https://stackoverflow.com/ From mlmsig'
    let url = 'http://sms.gniwebsolutions.com/submitsms.jsp?user=' + process.env.SMSUSER + '&key=' + process.env.SMSKEY + '&mobile=' + number + '&senderid=' + process.env.SMSSENDERID + '&message=' + message + '&accusage=' + process.env.ACCUSAGE;
    console.log(url);


    await fetch(url).then(response => response.text())
      .then(result => {
        if (isReturn) {
          return { status: 200, message: Otp };
        }
        else {
          return response.send({ status: 200, message: 'OTP has been sent', "otp": Otp });
        }

      })
      .catch(error => console.log('error', error));
  } catch (error) {
    return error.message;
  }
}

/**
 * Send SMS Password
 */

const sendSmsPassword = async (number, password, response) => {
  try {
    let message = 'Dear User, Your OTP is ' + password + ' Never share this OTP with anyone, this OTP expire in two minutes. More Info: https://stackoverflow.com/ From mlmsig'
    let url = 'http://sms.gniwebsolutions.com/submitsms.jsp?user=' + process.env.SMSUSER + '&key=' + process.env.SMSKEY + '&mobile=' + number + '&senderid=' + process.env.SMSSENDERID + '&message=' + message + '&accusage=' + process.env.ACCUSAGE;

    await fetch(url).then(response => response.text())
      .then(result => {
        return response.send({ status: 200, message: 'Password has been sent', "password": password });
      })
      .catch(error => console.log('error', error));
  } catch (error) {
    return error.message;
  }
}

/**
 * generate BEP20 wallet address
 */

const generateBEP20Address = (provider) => {
  var web3 = new Web3(provider); // your geth
  var account = web3.eth.accounts.create();

  return account;
}

/**
 * generate TRC20 wallet address
 */

const generateTRC20Address = (provider) => {

  // const fullNode = 'https://api.shasta.trongrid.io';
  // const solidityNode = 'https://api.shasta.trongrid.io';
  // const eventServer = 'https://api.shasta.trongrid.io';
  // const privateKey = '0fbb0e32bef95d4598af8d8e9a61c65c7f7f91e5ece66b24dc2708112a6dfef3';
  // const tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);
  const HttpProvider = TronWeb.providers.HttpProvider;
  const fullNode = new HttpProvider('https://api.trongrid.io');
  const solidityNode = new HttpProvider('https://api.trongrid.io');
  const eventServer = new HttpProvider("https://api.trongrid.io");
  const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
  // create new account
  const account = tronWeb.createAccount();

  return account;
}

module.exports = {
  createRandomNumber,
  sendPasswordEmail,
  sendOtpEmail,
  sendSmsOtp,
  sendSmsPassword,
  generateBEP20Address,
  generateTRC20Address
}


// ;( async() => {
//   await sendPasswordEmail('baljeet.boldertechno@gmail.com','adakjdghsa#23165','200', {email : 'xyz@gmail.com', 'password' : 'aajgadshgsa'})
//   console.log('working....')
// })().catch((err) => {
// console.log(err)
// }) 
