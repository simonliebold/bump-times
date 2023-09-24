import React, { useEffect, useState } from "react"

import * as tf from "@tensorflow/tfjs"

import { DayPicker } from "react-day-picker"
import { de } from "date-fns/locale"
import "react-day-picker/dist/style.css"

import axios from "axios"

const model = await tf.loadLayersModel("http://localhost:3000/model/model.json")

function App() {
  // Date Selection
  const [selected, setSelected] = useState(new Date())
  useEffect(() => {}, [selected])

  // Holidays
  const [holidays, setHolidays] = useState([])
  const getHolidays = async () => {
    const res = await axios.get(
      "https://feiertage-api.de/api/?jahr=2023&nur_land=NW"
    )
    setHolidays(Object.values(res.data).map((obj) => obj.datum))
  }
  useEffect(() => {
    getHolidays()
  }, [])

  // Model Input
  const [modelInput, setModelInput] = useState([])
  useEffect(() => {
    const month = selected.getMonth()
    const day = selected.getDay()

    const dateString = selected.toJSON().split("T")[0]

    const holiday =
      day === 0 ||
      day === 6 ||
      holidays.find((element) => element === dateString) !== undefined
        ? 1
        : 0

    const days = [
      day === 1 ? 1 : 0,
      day === 2 ? 1 : 0,
      day === 3 ? 1 : 0,
      day === 4 ? 1 : 0,
      day === 5 ? 1 : 0,
      day === 6 ? 1 : 0,
      day === 0 ? 1 : 0,
    ]

    const months = [
      month === 0 ? 1 : 0,
      month === 1 ? 1 : 0,
      month === 2 ? 1 : 0,
      month === 3 ? 1 : 0,
      month === 4 ? 1 : 0,
      month === 5 ? 1 : 0,
      month === 6 ? 1 : 0,
      month === 7 ? 1 : 0,
      month === 8 ? 1 : 0,
      month === 9 ? 1 : 0,
      month === 10 ? 1 : 0,
      month === 11 ? 1 : 0,
    ]

    let input = []
    for (let uhrzeit = 60; uhrzeit < 240; uhrzeit++) {
      input.push([uhrzeit / 10, holiday, ...days, ...months])
    }
    setModelInput(input)
  }, [selected, holidays])

  return (
    <>
      <DayPicker
        required
        mode="single"
        selected={selected}
        onSelect={setSelected}
        locale={de}
      />
    </>
  )
}

export default App
