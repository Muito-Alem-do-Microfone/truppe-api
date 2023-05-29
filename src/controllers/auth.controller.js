const db = require("../models")
const User = db.users

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Please provide email and password");
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).send("Authentication failed");
    }

    const isSame = await bcrypt.compare(password, user.password);

    if (!isSame) {
      return res.status(401).send("Authentication failed");
    }
 
    const token = jwt.sign({ id: user.id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });

    res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true })
    console.log("user", JSON.stringify(user, null, 2))
    console.log(token)

    return res.status(201).send({user, token})
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal server error");
  }
};

module.exports = {
  login
};