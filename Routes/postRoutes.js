var express =require('express'); 
const {auth} = require('../middleware/index.js');
const {savePost,getUserPost,getAllPost,postCancel,updaetePost, getLowestPrice} = require('../controllers/postController')

const postRoute = express.Router();

//*******************************************************//
// all routes here!
//*******************************************************//

postRoute.post('/save',auth, savePost);
postRoute.get('/getPost',auth, getUserPost);
postRoute.get('/all',getAllPost);
postRoute.post('/cancel',auth,postCancel);
postRoute.post('/update',updaetePost);
postRoute.get('/lowestPrice/:token', getLowestPrice)

//*******************************************************//
// all routes here!
//*******************************************************//

module.exports = {
  postRoute
}