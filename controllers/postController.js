const { postModel } = require("../models/postModel");
const { UserAssetsModel } = require("../models/userAssets");
const { userColl } = require('../models/user');
const { TokenModel } = require('../models/token');
const {paymentModel}= require('../models/paymentModel');
const {userPaymentModel} = require('../models/usersPaymentModel');

// =====================================================
/**
 * Save user post that create by user to sell currency
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// =====================================================
const savePost = async (req, res) => {
  console.log(req.body);
  try {
    const { token, currency, price, quantity, min_limit,max_limit, p_method, type,payment_time,remarks,auto_reply } = req.body;
    let obj = { userid: req.user._id, token, currency, price, quantity, total_qty:quantity, min_limit,max_limit, p_method, type,payment_time,remarks,auto_reply };

    // ==================================
      /** Manage User Assets Balance */
    // ==================================
    let fundFlag = false
    let userAssets = await UserAssetsModel.find({ userID: req.user._id, token_id : token })

    let mainBalance = userAssets.filter((e) => { return e.walletType === 'main_wallet' })
    let trading_wallet = userAssets.filter((e) => { return e.walletType === 'trading_wallet' })
    let funding_account = userAssets.filter((e) => { return e.walletType === 'funding_account' })

    mainBalance = parseFloat(mainBalance[0]?.balance) > 0 ? parseFloat(mainBalance[0]?.balance) : 0
    trading_wallet = parseFloat(trading_wallet[0]?.balance) > 0 ? parseFloat(trading_wallet[0]?.balance) : 0
    funding_account = parseFloat(funding_account[0]?.balance) > 0 ? parseFloat(funding_account[0]?.balance) : 0

    if (quantity <= (mainBalance)) {
      fundFlag=true;
      await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "main_wallet", token_id: token }, { balance: (mainBalance - quantity) })
    } else if (quantity <= (mainBalance + trading_wallet)) {
      fundFlag=true;
      await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "main_wallet", token_id: token }, { balance: 0 })
      await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "trading_wallet", token_id: token }, { balance: ((mainBalance + trading_wallet) - quantity) })
    } else if (quantity <= (mainBalance + trading_wallet + funding_account)) {
      fundFlag=true;
      await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "main_wallet", token_id: token }, { balance: 0 })
      await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "trading_wallet", token_id: token }, { balance: 0 })
      await UserAssetsModel.updateOne({ userID: req.user._id, walletType: "funding_wallet", token_id: token }, { balance: ((mainBalance + trading_wallet + funding_account) - quantity ) })
    }

    if(fundFlag === true){
      postModel.create(obj).then((result) => {
        if (result) {
          return res.send({ status: 200, data: result });
        }
      }).catch((error) => {
        console.log(error);
        return res.send({ status: 500, message: error })
      })
    }
    else{
      return res.send({ status: 500, message: 'You have an unsufficient balance' });
    }
    

  } catch (error) {

  }
}

// =====================================================
/**
 * Get user post that created by user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// =====================================================

const getUserPost = (req, res) => {
  try {

    postModel.find({ userid: req.user._id }).then((result) => {
      if (result) {
        return res.send({ status: 200, data: result });
      }
    }).catch((error) => {
      return res.send({ status: 500, message: error })
    })

  } catch (error) {
    return res.send({ status: 500, message: error })
  }
}

// ==========================================================
/**
 * Get all Post created by users 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// ==========================================================

const getAllPost=async (req,res)=>{
  try {
    let userList = await userColl.find().then((users)=>{
      if(users){
        return users;
      }
    })
    let tokenList = await TokenModel.find().then((token)=>{
      if(token){
        return token;
      }
    })

    // Payment list All
    let pm = await paymentModel.find().then((p_method)=>{
      if(p_method){
        return p_method;
      }
    })

    // user created payment method
    let upm = await userPaymentModel.find().then((upmethod)=>{
      if(upmethod){
        return upmethod
      }
    })

    await postModel.find().then(async(result) => {
      if (result) {
        let allPosts=[];
        
        for(const post of result){
          let pmethod =[];

          let user = userList.filter((item)=>{
            return item._id.toString() === post.userid;
          })

          let token = tokenList.filter((item)=>{
            return item._id.toString() === post.token;
          })

          for(const d of JSON.parse(post.p_method)){
            let upmdata = upm.filter((item)=>{
              return item._id.toString() === d._id
            })
            if(upmdata.length>0){
              let pmData = pm.filter((pmitem)=>{
                return pmitem._id.toString() === upmdata[0].pmid
              })
              pmethod.push(pmData[0]);
            }
            
          }
          user = {email : user[0].email, number : user[0].number, username : user[0].username};
          token = token.length>0? token[0].coinName : '';
          allPosts.push({post ,user, token, pmethod });
        }
        return res.send({ status: 200, data: allPosts });
      }
    }).catch((error) => {
      console.log(error)
      return res.send({ status: 500, message: error })
    })
  } catch (error) {
    console.log(error)
    return res.send({ status: 500, message: error })
  }
}

// ====================================================
/**
 * Post cancle request by user owner and manage currecy quantity 
 * @param {*} req 
 * @param {*} res 
 */
// ====================================================

const postCancel = async(req,res)=>{
  try {
    const {postid} = req.body;
    // let userAssets = await UserAssetsModel.find({ userID: req.user._id, token_id : token })
    postModel.findOne({userid:req.user._id, _id:postid}).then(async(result)=>{
      if(result){
        let balance = result.quantity;
        let userAssets = await UserAssetsModel.find({ userID: req.user._id, token_id : result.token })

        let mainBalance = userAssets.filter((e) => { return e.walletType === 'main_wallet' })
        mainBalance = parseFloat(mainBalance[0]?.balance)
        
        await UserAssetsModel.findOneAndUpdate({userID: req.user._id, token_id:result.token, walletType:"main_wallet"},{ balance: mainBalance + balance }).then((updateasset)=>{
          if(updateasset){
            postModel.findOneAndDelete({_id:postid}).then((response)=>{
              if(response){
                res.send({status : 200, data: response});
              }
            })
          }
        }).catch((error)=>{
          res.send({status:500, message : error});
        })
      }
    })
  } catch (error) {
    
  }
}

const updaetePost=(req,res)=>{
  try {
    const {postid, qty} = req.body;
    postModel.findOne({_id: postid}).then((result)=>{
      if(result){
        postModel.findOneAndUpdate({_id: postid},{quantity: (result.quantity-qty)}).then((result2)=>{
          if(result2){
            res.send({status: 200, data: result2});
          }
          else{
            res.send({status: 200, data: result2});
          }
        }).catch((error)=>{
          res.send({status : 500, message : error});
        })
      }
    })
    
  } catch (error) {
    
  }
}

const getLowestPrice=(req,res)=>{
  
  const { token } = req.params 
  console.log(token)
  try {
    postModel.find({token : token}).sort({ "price": 1 }).limit(1).then((result)=>{
      if(result){
         return res.send({status : 200, data : result});
      }
    })  
  } catch (error) {
    return res.send({status : 500, data : error});
  }
  
}


module.exports = {
  savePost,
  getUserPost,
  getAllPost,
  postCancel,
  updaetePost,
  getLowestPrice
}