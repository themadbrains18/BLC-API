var express =require('express'); 
const {auth} = require('../middleware/index.js');
const {saveKyc,getKyc,draftKycProof} = require('../controllers/kycController')


const kycRoute = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

kycRoute.post('/save', auth, saveKyc)
kycRoute.get('/getKyc', auth, getKyc)
kycRoute.post('/draft',auth,draftKycProof)

//*******************************************************//
// all routes here!
//*******************************************************//

module.exports = {
  kycRoute
}