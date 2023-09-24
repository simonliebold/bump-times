import React from "react"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

let labels = []

for (let i = 60; i < 240; i++) {
  labels.push(i / 10)
}

function Chart(props) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Vorhersage für Besucher",
      },
    },
    scales: {
      y: {
        max: 200,
        min: 0,
      },
      x: {
        ticks: {
          stepSize: 1.0,
        },
      }
    },
  }
  const data = {
    labels,
    datasets: [
      {
        label: "Besucher",
        data: labels.map((label, index) => [label, props.prediction[index]]),
        borderColor: "transparent",
        backgroundColor: "blue",
      },
    ],
  }
  return (
    <div style={{ height: "50vh" }}>
      <Line options={options} data={data} />
    </div>
  )
}

export default Chart
