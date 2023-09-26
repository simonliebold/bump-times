const express = require("express")
const app = express()

require("dotenv").config()

const { Sequelize } = require("sequelize")

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mariadb",
  }
)

app.get("/", (req, res) => {
  res.send("Hello, world!")
})

app.listen(3000, async () => {
  console.log("Server listening on port 3000")
  try {
    await sequelize.authenticate()
    console.log("Connection has been established successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
})
