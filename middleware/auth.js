const { User } = require('./../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = async function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    
    //check if the user is not found
    const user = await User.findById(decoded._id);
    if (!user) return res.status(400).send('Invalid token.');

    req.user = decoded;
    next();
  }
  catch (ex) {
    res.status(400).send('Invalid token.');
  }
}