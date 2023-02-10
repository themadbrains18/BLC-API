const { KycModel } = require("../models/kycModel");
const {mediaModel} = require("../models/mediaModel");
const uploadFile =require('../common/media.js');
const fs = require("fs");
const path = require('path');

// ====================================================
/**
 * Store user KYC detail 
 * @param {*} req 
 * @param {*} res 
 */
// ====================================================
const saveKyc = async(req, res) => {
  try {

    //upload KYC proof document files in directory     
    await uploadFile(req, res);
    
    // Save record in DB
    const { country, name, email, phone, doctype, docnumber,telegram, otcfund, sourcefund, isDraft,idfront,idback } = req.body;
    
    let frontExt = idfront.split(';')[0].split('/')[1];
    let backExt = idback.split(';')[0].split('/')[1];

    let frontbase64 = idfront.split(',')[1]
    let backbase64 = idback.split(',')[1]

    //=================remove from directory
    fs.unlink(('./assets/document/'+ req.user._id+"_front."+frontExt),function(err){
      if(err) console.log(err);
      console.log('file deleted successfully');
    }); 

    fs.unlink(('./assets/document/'+ req.user._id+"_back."+backExt),function(err){
      if(err) console.log(err);
      console.log('back file deleted successfully');
    }); 

    //=================convert base64 to buffer
    const frontbuffer = Buffer.from(frontbase64, "base64");
    const backbuffer = Buffer.from(backbase64, "base64");

    //=================write file in directory
    fs.writeFileSync(('./assets/document/'+ req.user._id+"_front."+frontExt), frontbuffer);
    fs.writeFileSync(('./assets/document/'+ req.user._id+"_back."+backExt), backbuffer);

    
    // fs.writeFile(('./assets/document/'+ req.user._id+"_front."+frontExt), frontbase64, 'base64', function(err) {
    //   if(err) return res.send({ status: 500, data: err });
    // });

    // fs.writeFile(('./assets/document/'+ req.user._id+"_back."+backExt), backbase64, 'base64', function(err) {
    //   if(err) return res.send({ status: 500, data: err }); 
    // });
    
    let obj = { userid: req.user._id, country, name, email, phone, doctype, docnumber,telegram, otcfund, sourcefund, isDraft,idfront : req.user._id+"_front."+frontExt,idback:req.user._id+"_back."+backExt }
    console.log(obj,'================')

    KycModel.findOneAndDelete({userid: req.user._id}).then((response)=>{
      console.log('==========', response);
      if(response){
        KycModel.create(obj).then(async(result) => {
          if (result) {
            if(req.files !== undefined && req.files.length>0){
              for(const files of req.files){
                mediaModel.create({userid: req.user._id, type:'pdf', file: files.filename}).then((media)=>{
                  if(media){
                    console.log('create');
                  }
                })
              }
            }
            return res.send({ status: 200, data: result });
          }
        }).catch((error) => {
          console.log('===error', error)
          return res.send({ status: 200, error })
        })
      }
      else{
        KycModel.create(obj).then(async(result) => {
          console.log('here ======================')
          if (result) {
            if(req.files !== undefined && req.files.length>0){
              for(const files of req.files){
                mediaModel.create({userid: req.user._id, type:'pdf', file: files.filename}).then((media)=>{
                  if(media){
                    console.log('create');
                  }
                })
              }
            }
            
            return res.send({ status: 200, data: result });
          }
        }).catch((error) => {
          console.log('===error not exist', error)
          return res.send({ status: 200, error })
        })
      }
    }).catch((err)=>{
      return res.send({ status: 200, err })
    })
    
  } catch (error) {

  }
}

// ===================================================
/**
 * Get user KYC profile
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// ===================================================

const getKyc = (req, res) => {
  
  try {
    KycModel.findOne({ userid: req.user._id }).then(async(result) => {
      if(result){
        let media = await getMedia(req.user._id);
        return res.send({status:200, data: result, media});
      }
      else{
        return res.send({status:200, data : {}});
      }
    })
  } catch (error) {
    return res.send({status:500, error });
  }
}


const draftKycProof = async(req, res) => {
  try {

    await uploadFile(req, res);

    for(const files of req.files){
      mediaModel.create({userid: req.user._id, type:'jpg', file: files.filename}).then((mediares)=>{
        if(mediares){
          console.log('create draft');
        }
      }).catch((error)=>{
        console.log(error);
        return res.send({ status: 500, data: error });
      })
    }
    KycModel.findOne({ userid: req.user._id }).then(async(result) => {
      if(result){
        let media = await getMedia(req.user._id);
        return res.send({status:200, data: result, media});
      }
      else{
        return res.send({status:200, data : {}});
      }
    }).catch((error)=>{
      return res.send({ status: 500, data: error });
    })
  } catch (error) {
    return res.send({ status: 500, data: error });
  }
}

// ===============================================================
/**
 * Get user media file that upload at the time of KYC
 * @param {*} userid 
 * @returns 
 */
// ===============================================================
const getMedia=async(userid)=>{
  let media=[];
  try {
    await mediaModel.find({userid}).then((result)=>{
      if(result){
        media = result;
      }
    })
    return media;  
  } catch (error) {
    
  }
}

module.exports = {
  saveKyc,
  getKyc,
  draftKycProof
}