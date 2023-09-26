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

for (let stunde = 6; stunde < 24; stunde++) {
  for (let minute = 0; minute < 60; minute++) {
    labels.push(
      ("" + stunde).padStart(2, 0) + ":" + ("" + minute).padStart(2, 0)
    )
  }
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
        text: new Date(props.dateString).toLocaleDateString("de-DE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    },
    scales: {
      y: {
        max: 200,
        min: 0,
      },
      x: {
        ticks: {
          callback: function(val, index) {
            return parseInt(this.getLabelForValue(val).split(":")[0] )
          },
          // autoSkip: true,
          maxTicksLimit: 18,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Vorhersage",
        data: props.dates.map((date, index) => [date, props.prediction[index]]),
        borderColor: "rgb(0, 0, 255, 0.25)",
        backgroundColor: "transparent",
        borderDash: [5, 5],
        borderRadius: 100,
      },
      {
        label: "Messung",
        data: props.dates.map((date, index) => [date, props.dateData[index]]),
        borderColor: "blue",
        backgroundColor: "transparent",
        borderWidth: 2,
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
