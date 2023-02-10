var express =require('express'); 
const { createTokenList, getAllTokens, updateToken, getTokenByid, tokenStatusUpdate } = require('../../controllers/Dashboard/tokensController') 
const {auth} = require('../../middleware/index');
const { getAllCoins } = require('../../controllers/Dashboard/tokenController') 
const tokensRoutes = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//
tokensRoutes.get('/coin', getAllCoins)
tokensRoutes.post('/create', createTokenList)
tokensRoutes.get('/all', getAllTokens)
tokensRoutes.put('/update/:id', updateToken)
tokensRoutes.post('/tokenupdate', tokenStatusUpdate)
tokensRoutes.get('/:id', getTokenByid)


module.exports = {
    tokensRoutes
}