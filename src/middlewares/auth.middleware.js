const jwt = require("jsonwebtoken")

const validateJWT = (req, res, next) => {
  const token = req.headers["auth"]

  // Check if JWT is valid
  jwt.verify(token, process.env.JWT_KEY, (err, userInfo) => {
    if (err) {
      res.status(403).end()
      return
    }
    next()
  })

}

module.exports = {
  validateJWT
};