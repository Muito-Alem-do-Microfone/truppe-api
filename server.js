const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

const app = express()
dotenv.config()

var corsOptions = {
  origin: "http://localhost:8081"
}

app.use(cors(corsOptions))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

const db = require("./app/models")
db.sequelize.sync({ force: false , alter : true })
  .then(() => {
    console.log("Synced db.")
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message)
  })

// Routes
require("./app/routes/user.routes")(app)
require("./app/routes/auth.routes")(app)
require("./app/routes/instrument.routes")(app)
require("./app/routes/group.routes")(app)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
});