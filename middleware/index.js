const jwt = require('jsonwebtoken')
const jwtDecode = require('jwt-decode')

const auth = async (req,res,next)=>{
    const  token  = req.headers.authorization
    try {
        // const token = req.header('Authorization');

        jwt.verify(token, process.env.TOKENSECRET, async function (err, decoded) {
          if (err) {
            return res.send({ status: 404, data: 'unauthorized user' });
          }
          else{
            req.user = jwtDecode(token);
            next();
          }
        })
    } catch (error) {
        res.status(400).send({"message" : "You are not unauthorized user. Please provide unauthorized KEY."})
    }
  }

module.exports={auth}