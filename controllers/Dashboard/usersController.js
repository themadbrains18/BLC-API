const { TokenModel } = require('../../models/token.js');
const { userColl } = require('../../models/user.js');
const { UserAssetsModel } = require('../../models/userAssets.js');

const userList = async(req,res)=>{
  const id = req.user._id;
  try {
    let assetsData = await UserAssetsModel.find({}).then((assets) => {
      if(assets){
        return assets;
      }
    }).catch((error)=>{
      console.log(error)
      res.send({status : 500, data : error})  
    })

    let token = await TokenModel.find({}).then((data)=>{
      if(data){
        return data;
      }
    }).catch((error)=>{
      console.log(error)
      res.send({status : 500, data : error})
    })

    // console.log(token,'token list');
    let userToken = '';
    for (const item of token) {
      if (userToken === '') {
        userToken = item.coinName;
      }
      else {
        if (!userToken.includes(item.token)) {
          userToken += ',' + item.coinName;
        }
      }
    }

    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    let url = process.env.PRICECONVERTURL;

    let priceObj = await fetch(url + "fsyms=" + userToken + '&tsyms=USDT&api_key='+process.env.MIN_API_KEY, requestOptions)
      .then(response => response.text())
      .then(result => {
        return JSON.parse(result);
      }).catch(error => console.log('error', error));

    console.log(priceObj, 'price object');  
    userColl.find({}).then(async(users)=>{
      if(users){
        let filnalList = [];
        for (const user of users){
          let assets = assetsData.filter((item)=>{
            return item.userID === user._id.toString()
          })
          let totalHolding = 0;
          for(const asset of assets){
            if(priceObj[asset.token] != undefined){
              totalHolding = parseFloat(totalHolding)  + parseFloat(asset.balance * priceObj[asset.token].USDT)  
            }
          }
          let obj= {
            _id : user._id.toString(),
            'name' : user.username,
            'status' : user.statusType,
            'assets' : assets,
            'holding' : totalHolding,
            'createdAt' : user.createdAt
          }
          filnalList.push(obj);
        }
        console.log(filnalList,"filnal List")
        res.send({status : 200, data : filnalList});
      }
    }).catch((error)=>{
      console.log(error)
      res.send({status : 500, data : error})
    })  
  } catch (error) {
    console.log(error)
    res.send({status : 500, data : error})
  }
  
}

const statusUpdate=(req,res)=>{
  try {
    userColl.findOneAndUpdate({_id : req.body.userid},{statusType : req.body.status}).then(async(user)=>{
      if(user){
        userColl.find({_id : req.body.userid}).then((result)=>{
          if(result){
            res.send({status : 200, data : result})
          }
        }).catch((err)=>{
          res.send({status : 500, data : error});    
        })
      }
    }).catch((error)=>{
      res.send({status : 500, data : error});
    })  
  } catch (error) {
    res.send({status : 500, data : error});
  }
  
} 

module.exports={
  userList,
  statusUpdate
}