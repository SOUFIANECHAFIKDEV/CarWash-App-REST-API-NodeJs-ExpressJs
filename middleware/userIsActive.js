const { User } = require('./../models/user');

module.exports = async function (req, res, next) {
  //check if the user is not found
  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).send('Invalid token.');

  if (!user.isActive) return res.status(403).send('Access denied ,User account is not active.');

  next();
}