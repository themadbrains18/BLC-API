var express =require('express'); 
const {auth} = require('../../middleware/index');
const { userList, statusUpdate } = require('../../controllers/Dashboard/usersController') 

const userRoutes = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

userRoutes.get('/all',auth, userList)
userRoutes.post('/update', auth , statusUpdate)


module.exports = {
  userRoutes
}