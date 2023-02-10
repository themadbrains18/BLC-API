var express =require('express'); 
const {auth} = require('../middleware/index.js');
const {getAssetsList, transferToWallet, getAssetsOverView} = require('../controllers/assetsController')

const assetsRoutes = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

assetsRoutes.get('/asset',auth,getAssetsList)
assetsRoutes.post('/transfer',auth, transferToWallet)
assetsRoutes.get('/overview',auth,getAssetsOverView)

//*******************************************************//
// all routes here!
//*******************************************************//

module.exports = {
  assetsRoutes
}