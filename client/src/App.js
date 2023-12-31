import React, { useEffect, useState } from "react"

import * as tf from "@tensorflow/tfjs"

import { DayPicker } from "react-day-picker"
import { de } from "date-fns/locale"
import "react-day-picker/dist/style.css"

import axios from "axios"
import Chart from "./Chart"

import "./style.css"
import FormSelect from "react-bootstrap/FormSelect"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Container from "react-bootstrap/Container"

import generatedGitInfo from "./generatedGitInfo.json"

const model = await tf.loadLayersModel("http://lie-bold.de/ai/model/model.json")
// const model = await tf.loadLayersModel(
//   "http://localhost:3000/ai/model/model.json"
// )
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
  const [dateString, setDateString] = useState("")
  useEffect(() => {
    const month = selected.getMonth()
    const day = selected.getDay()

    setDateString(
      selected.getFullYear() +
        "-" +
        ("" + (selected.getMonth() + 1)).padStart(2, 0) +
        "-" +
        ("" + selected.getDate()).padStart(2, 0)
    )

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
        .tensor(input, [input.length, input[0].length])
        .sub(inputMin)
        .div(inputMax.sub(inputMin))
    )
  }, [selected, holidays, dateString])

  // Model Prediction
  const [prediction, setPrediction] = useState([])
  const predict = async () => {
    try {
      const predictions = await model
        .predict(modelInput)
        .mul(outputMax.sub(outputMin))
        .add(outputMin)
        .array()
      setPrediction(predictions)
    } catch (error) {}
  }
  useEffect(() => {
    predict()
    // eslint-disable-next-line
  }, [modelInput])

  // Select club
  const [club, setClub] = useState(1)
  let options = []
  for (let i = 1; i < 55; i++) {
    options.push(
      <option key={i} value={i}>
        Club {i}
      </option>
    )
  }

  // Check Prediction
  const [dateData, setDateData] = useState([])
  const getDateData = async () => {
    const res = await axios.get(
      "https://lie-bold.de/ai/get-date.php?date=" + dateString + "&club=" + club
    )
    setDateData(res.data.data.map((obj) => obj.checkedIn))
  }
  useEffect(() => {
    getDateData()
    // eslint-disable-next-line
  }, [prediction, club])

  return (
    <Container>
      <Chart
        prediction={prediction}
        dates={x}
        dateData={dateData}
        dateString={dateString}
      />
      <Row className="mt-4">
        <Col>
          <FormSelect onChange={(e) => setClub(e.target.value)}>
            {options.map((option) => option)}
          </FormSelect>
          <DayPicker
            required
            mode="single"
            selected={selected}
            onSelect={setSelected}
            locale={de}
          />
        </Col>
      </Row>
      <p style={{ textAlign: "center", color: "grey" }}>
        {generatedGitInfo.gitBranch + "@" + generatedGitInfo.gitCommitHash}
      </p>
    </Container>
  )
}

export default App
