import { CATEGORIES } from "../const.js";

export function getPieChartData(rawData) {
  const LABELS = CATEGORIES;

  const BACKGROUND_COLOR = [
    "#6BC2B8", // Turquoise Pastel
    "#E6B8CA", // Rose Poudré
    "#AED9E0", // Bleu Ciel
    "#FFCBA4", // Oranger Doux
    "#D3D3E6", // Lavande Claire
    "#98FF98", // Vert Menthe
  ];
  // init
  let pieDataCount = {};
  LABELS.forEach((valeur) => {
    pieDataCount[valeur] = 0;
  });

  //console.log(pieDataCount);

  // counter
  rawData.forEach((laureate) => {
    //console.log(laureate.category);
    pieDataCount[laureate.category] = pieDataCount[laureate.category] + 1;
  });

  //console.log(pieDataCount);

  // construire le dataset
  let dataset = Object.values(pieDataCount);

  //console.log(dataset);

  // objet pour le pie
  let pieData = {
    labels: LABELS,
    datasets: [
      {
        data: dataset,
        backgroundColor: BACKGROUND_COLOR,
      },
    ],
  };

  return pieData;
}

export function renderPieChart(pieData, pieDOM) {
  let ctx = document.getElementById(pieDOM).getContext("2d");

  let myPieChart = new Chart(ctx, {
    type: "pie",
    data: pieData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          /*
          formatter: (value, ctx) => {
            //console.log(value);
            //console.log(ctx2.chart.data.datasets[0].data);
            const data_points = ctx.chart.data.datasets[0].data;

            function total_sum(total, data_point) {
              return total + parseInt(data_point);
            }

            const total_value = data_points.reduce(total_sum, 0);
            console.log(total_value);
            const percentage_value = ((value / total_value) * 100).toFixed(1);

            return `${percentage_value} %`;
          },
          */
          color: "#000",
        },
        title: {},
      },
    },
    plugins: [ChartDataLabels],
  });

  return myPieChart;
}
