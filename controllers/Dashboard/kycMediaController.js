const { KycModel } = require("../../models/kycModel");
const {mediaModel} = require("../../models/mediaModel");
const { userColl } = require("../../models/user");


// ===================================================
/**
 * Get user KYC profile
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// ===================================================

const getAllKyc = (req, res) => {
  
  try {
    KycModel.find({ }).then(async(result) => {
      if(result){
        let a=[];
        for (const e of result ) {
            var media=  await getMedia(e.userid);
            var obj = e.toObject();
               obj.media = media;
               a.push(obj)
          }
          

        return res.send({status:200, data: a });
      }
      else{
        return res.send({status:200, data : {}});
      }
    }).catch((error)=>{
      return res.send({status:500, error });  
    })
  } catch (error) {
    return res.send({status:500, error });
  }
}


const kycStatusUpdate=(req,res)=>{
  try {
    KycModel.findOneAndUpdate({userid : req.body.userid},{isVerified : req.body.status}).then(async(user)=>{
      if(user){
        userColl.findOneAndUpdate({_id : req.body.userid},{kycstatus : req.body.status}).then(async(userResult)=>{
          if(userResult){
            KycModel.find({userid : req.body.userid}).then((result)=>{
              if(result){
                res.send({status : 200, data : result})
              
              }
            }).catch((err)=>{
              res.send({status : 500, data : err});    
            })
          }
          
        }).catch((err)=>{
          res.send({status : 500, data : err}); 
        })

       
      }
    }).catch((error)=>{
      res.send({status : 500, data : error});
    })  
  } catch (error) {
    res.send({status : 500, data : error});
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
    getAllKyc,
    kycStatusUpdate

}
