var express =require('express'); 
const {getTransferHistory} = require('../controllers/transferControllers')
const {auth} = require('../middleware/index.js');

const transferRoutes = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

transferRoutes.get('/all',auth, getTransferHistory)


//*******************************************************//
// all routes here!
//*******************************************************//

module.exports = {
    transferRoutes
}