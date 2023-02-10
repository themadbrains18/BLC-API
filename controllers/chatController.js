const {chatModel} = require('../models/chatModel');
const uploadFile =require('../common/media.js');
const {notificationModel} = require('../models/notificationModel');
// ========================================================
/**
 * Save and update chat 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// ========================================================
const saveChat = async(req, res) => {
  try {
    //upload payment recipt    
    await uploadFile(req, res);

    const { postid, sell_userid,orderid,message  } = req.body;
    let chat = [];
    let obj={};

    if(req.files !== undefined && req.files.length>0){
      for(const files of req.files){
        obj = {from : req.user._id, to: sell_userid, message : files.filename }
        chat.push(obj);
      }
    }
    if(message !== ''){
      obj = {from : req.user._id, to: sell_userid, message }
      chat.push(obj);
    }

    chatModel.findOne({orderid : orderid}).then((result)=>{
      if(result){
        let oldchat = result.chat;
        // oldchat.push(obj);
        const newArray = oldchat.concat(chat); 
        // console.log(newArray,'new Array');
        chatModel.findOneAndUpdate({_id : result._id},{chat : newArray}).then((response)=>{
          if(response){
            let notifyObj = {sender : chat[0].from, receiver : chat[0].to, type : 'order',orderid : orderid, message : chat[0].message};
            console.log('=======notify object', notifyObj)
            notificationModel.create(notifyObj).then((notify)=>{
              if(notify){
                console.log('notification record saved');
              }
            })
            return res.send({ status: 200, data: response });
          }
        })
      }
      else{
        
        let createObj = { postid, buy_userid: req.user._id, sell_userid, orderid, chat };
        chatModel.create(createObj).then(async (result) => {
          if (result) {
            let notifyObj = {sender : chat[0].from, receiver : chat[0].to, type : 'order',orderid : orderid, message : chat[0].message};
            console.log('=======notify object', notifyObj)
            notificationModel.create(notifyObj).then((notify)=>{
              if(notify){
                console.log('notification record saved');
              }
            })
            return res.send({ status: 200, data: result });
          }
        }).catch((error) => {
          console.log(error)
          return res.send({ status: 500, error });
        })
      }
    }).catch((error)=>{
      console.log(error)
    return res.send({ status: 500, error });
    })
  } catch (error) {
    console.log(error)
    return res.send({ status: 500, error });
  }
}


// ===================================================
/**
 * Get chat according to order id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// ===================================================

const getChat = (req, res) => {
  try {
    chatModel.findOne({ orderid: req.query.orderid }).then(async(result) => {
      if(result){
        return res.send({status:200, data: result.chat});
      }
      else{
        return res.send({status:200, data : {}});
      }
    })
  } catch (error) {
    return res.send({status:500, error });
  }
}

const getNotification=(req,res) =>{
  try {
    notificationModel.find({ receiver : req.user._id, status : 'active'}).then((data)=>{
      if(data){
        return res.send({status : 200, data : data});
      }
    })
  } catch (error) {
    
  }
}

const changeNotificationStatus=(req,res)=>{
  try {
    notificationModel.findOneAndUpdate({ _id : req.body.id },{status : 'inactive'}).then((data)=>{
      if(data){
        return res.send({status : 200, message : 'Notification status update'});
      }
    })
  } catch (error) {
    
  }
}

const sendMessageByWs=(wss, ws, body)=>{
  try {
    wss.clients.forEach(function e(client) {
      client.send(JSON.stringify({ status: 200, data: body, type: 'chat' }));
    })
  } catch (error) {
    ws.send(JSON.stringify({ status: 500, data: error }))
  }
}


module.exports = {
  saveChat,
  getChat,
  getNotification,
  changeNotificationStatus,
  sendMessageByWs
}