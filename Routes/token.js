var express =require('express'); 
const {getTokenList, getTokenNetwork, newTokenListing, updateToken, deleteToken,topGainer} = require('../controllers/tokenController') 



const tokenRoutes = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

tokenRoutes.get('/tokenlist',getTokenList);
tokenRoutes.post('/networklist',getTokenNetwork)
tokenRoutes.get('/topgainer', topGainer)

//=============================================//
// dashboard side routes
//=============================================//

tokenRoutes.post('/token-listing',newTokenListing)
tokenRoutes.patch('/token-listing/:tokenId', updateToken)
tokenRoutes.delete('/token-listing/:tokenId', deleteToken)


// updateToken

//*******************************************************//
// all routes here!
//*******************************************************//


module.exports = {
  tokenRoutes
}