var cron = require("node-cron")
const { Sequelize, DataTypes, QueryTypes } = require("sequelize")

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mariadb",
  }
)

cron.schedule(
  "* * * * *",
  async () => {
    const now = new Date()

    let minHours = 6
    let maxHours = 24
    if (now.getDay() === 0 || now.getDay() === 6) {
      minHours = 7
      maxHours = 24
    }

    // if (now.getHours() < minHours || now.getHours() > maxHours) return

    try {
      await sequelize.authenticate()

      const year = now.getFullYear()
      const month = ("" + (now.getMonth() + 1)).padStart(2, "0")
      const day = ("" + now.getDate()).padStart(2, "0")
      const hour = ("" + now.getHours()).padStart(2, "0")
      const minute = ("" + now.getMinutes()).padStart(2, "0")

      const timestamp = `${year}-${month}-${day} ${hour}:${minute}`

      for (let club = 1; club < 55; club++) {
        const res = await fetch(
          `https://www.ai-fitness.de/club-checkin-number/${club}/Ai.AiFitnessTld/`
        )
        const visitors = await res.json()
        console.log(club, visitors.countCheckedInCustomer)
        try {
          await sequelize.query(
            `INSERT INTO messung (time,club,checkedIn) VALUES ('${timestamp}',${club},${visitors.countCheckedInCustomer})`,
            {
              type: QueryTypes.INSERT,
            }
          )
        } catch (error) {
          throw error
        }
      }
    } catch (error) {
      throw error
      // console.error("Unable to connect to the database:", error)
    }

  }
)
