import React, { useEffect, useState } from "react"

import * as tf from "@tensorflow/tfjs"

import { DayPicker } from "react-day-picker"
import { de } from "date-fns/locale"
import "react-day-picker/dist/style.css"

import axios from "axios"
import Chart from "./Chart"

import "./style.css"

const model = await tf.loadLayersModel("http://localhost:3000/model/model.json")
const outputMax = tf.tensor(240, [1, 1]).max()
const outputMin = tf.tensor(0, [1, 1]).min()
const inputMax = tf.tensor(23.983333587646484, [1, 1]).max()
const inputMin = tf.tensor(0, [1, 1]).min()

function App() {
  const [x, setX] = useState([])

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

    let stundeMin = 6
    let stundeMax = 24

    if (holiday === 1) {
      stundeMin = 7
      stundeMax = 23
    }

    let input = []
    let labels = []
    for (let stunde = stundeMin; stunde < stundeMax; stunde++) {
      for (let minute = 0; minute < 60; minute++) {
        labels.push(
          ("" + stunde).padStart(2, 0) + ":" + ("" + minute).padStart(2, 0)
        )
        input.push([
          parseFloat(stunde + minute / 60),
          holiday,
          ...days,
          ...months,
        ])
      }
    }

    setX(labels)
    setModelInput(
      tf
        .tensor2d(input, [input.length, input[0].length])
        .sub(inputMin)
        .div(inputMax.sub(inputMin))
    )
  }, [selected, holidays])

  // Model Prediction
  const [prediction, setPrediction] = useState([])
  const predict = async () => {
    const predictions = await model
      .predict(modelInput)
      .mul(outputMax.sub(outputMin))
      .add(outputMin)
      .array()
    setPrediction(predictions)
  }
  useEffect(() => {
    predict()
    // eslint-disable-next-line
  }, [modelInput])

  // Check Prediction
  const [dateData, setDateData] = useState([])
  const getDateData = async () => {
    const res = await axios.get(
      "https://lie-bold.de/ai/get-date.php?date=" +
        selected.getFullYear() +
        "-" +
        (selected.getMonth() + 1) +
        "-" +
        selected.getDate()
    )
    setDateData(res.data.data.map((obj) => obj.checkedIn))
  }
  useEffect(() => {
    getDateData()
    // eslint-disable-next-line
  }, [prediction])

  return (
    <>
      <Chart
        prediction={prediction}
        dates={x}
        dateData={dateData}
        datum={
          selected.getFullYear() +
          "-" +
          (selected.getMonth() + 1) +
          "-" +
          selected.getDate()
        }
      />
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
