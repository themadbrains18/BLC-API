var express =require('express'); 
const {getAllKyc, kycStatusUpdate } = require('../../controllers/Dashboard/kycMediaController') 
const {auth} = require('../../middleware/index');

const kycMediaRoutes = express.Router();

kycMediaRoutes.get('/all',auth,getAllKyc)
kycMediaRoutes.post('/kycupdate',auth, kycStatusUpdate)

module.exports = {
    kycMediaRoutes
  }