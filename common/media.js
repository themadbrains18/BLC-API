const util = require("util");
var multer = require('multer');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file.mimetype,' mime type 1')
    if (file.mimetype === 'image/gif' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      cb(null, './assets/document');
    }
    else{
      cb(null, './assets/statement');
    }
    
  },
  filename: (req, file, cb) => {
    var filetype = '';
    console.log(file.mimetype,' mime type 2')
    if (file.mimetype === "image/gif") {
      filetype = 'gif';
    }
    else if (file.mimetype === "image/png") {
      filetype = 'png';
    }
    else if (file.mimetype === "image/jpg") {
      filetype = 'jpg';
    }
     else if (file.mimetype === "image/jpeg") {
      filetype = 'jpeg';
    }
    else if(file.mimetype === "application/pdf"){
      filetype = 'pdf';
    }
    cb(null,   req.user._id+'_' + Date.now() + '.' + filetype);
  }
});

let uploadFile = multer({ storage: storage, limits: { fieldSize: 25 * 1024 * 1024 } }).array('files');

let uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware