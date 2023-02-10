var express =require('express'); 
const {auth} = require('../middleware/index.js');
const {login,register,sendOtp, resetPassword, enableTwoFASecurity,getDepositAddressByID,userProfile, setTradingPassword,storeWalletAddress,
  updateUserProfile,adminLogin, user2FAVerifyCode } = require('../controllers/userController.js') 

const routes = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

routes.post('/login',login)
routes.post('/admin-login',adminLogin)
routes.post('/register',register)
routes.post('/resetpassword',resetPassword)
routes.post('/enableTwoFA',enableTwoFASecurity)
routes.post('/otp',sendOtp)
routes.post('/deposit_address',getDepositAddressByID)
routes.get('/session',auth, userProfile)
routes.post('/tradingpassword', auth, setTradingPassword);
routes.post('/wallet',storeWalletAddress);
routes.post('/update_user', updateUserProfile)
routes.post('/verify2fa', user2FAVerifyCode)

//*******************************************************//
// all routes here!
//*******************************************************//

module.exports = {
  routes
}