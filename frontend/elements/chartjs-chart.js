import { LitElement, css, html } from 'lit-element';

class ChartJsChart extends LitElement {
  constructor() {
    super();
    this.dataset = "positive";
    this.useLogScale = false;
  }

	updated(changedProps) {
    this.updateChart()
  }

  static get properties() {
    return {
      data: Object,
      dataset: String,
      useLogScale: Boolean
    }
  }

  static get styles() {
    return css`
      canvas {
        display: block;
      }
      select {
        display: inline-block;
        margin-right: 20px;
      }
    `;
  }

  // Rendering -----------------------------------------------------------------
  get renderDataOptions() {
    var datasets = ["positive", "hospitalized", "deaths", "totalTestResults",
      "positiveIncrease", "hospitalizedIncrease", "deathIncrease",
      "positivePerTest", "deathsPerPositive", "deathsPerHospitalized",
      "deathsPerTest"];
    return html`
      <label for="data">Data:</label>
      <select id="data" @change=${this.changeData}>
        ${datasets.map(d => html`
          <option value="${d}">${this.datasetName(d)}</option>
        `)}
      </select>
    `;
  }

  get renderScaleButton() {
    return html`
      ${this.useLogScale
        ? html`Showing log scale <button @click="${this.toggleUseLogScale}">Use linear scale</button>`
        : html`Showing linear scale <button @click="${this.toggleUseLogScale}">Use log scale</button>`}
    `;
  }

  render() {
    return html`
      ${this.renderDataOptions}
      ${this.renderScaleButton}
      <canvas id="chart"></canvas>
    `;
  }

  // Custom methods ------------------------------------------------------------
  changeData(evt) {
    this.dataset = evt.target.value;
    this.updateChart();
  }

  datasetName(codeName) {
    if (codeName === "positive") {
      return "Total confirmed cases";
    } else if (codeName === "hospitalized") {
      return "Total hospitalized"
    } else if (codeName === "deaths") {
      return "Total deaths";
    } else if (codeName === "totalTestResults") {
      return "Total tests conducted";
    } else if (codeName === "positiveIncrease") {
      return "# daily cases";
    } else if (codeName === "hospitalizedIncrease") {
      return "# daily hospitalized";
    } else if (codeName === "deathIncrease") {
      return "# daily deaths";
    } else if (codeName === "positivePerTest") {
      return "Total confirmed cases / total tests";
    } else if (codeName === "positivePerCapita") {
      return "Total Confirmed cases per capita";
    } else if (codeName === "deathsPerPositive") {
      return "Total deaths / total confirmed cases";
    } else if (codeName === "deathsPerCapita") {
      return "Total deaths per capita";
    } else if (codeName === "deathsPerHospitalized") {
      return "Total deaths / total hospitalized";
    } else if (codeName === "deathsPerTest") {
      return "Total deaths / total tests";
    } else if (codeName === "testsPerCapita") {
      return "Tests conducted per capita";
    }
  }

  toggleUseLogScale() {
    this.useLogScale = !this.useLogScale;
  }

  updateChart() {
    if (this.data.length == 0) {
      return;
    }

    // Y-axis
    var dataVals = [];

    for (const datum of this.data) {
      if (this.dataset.endsWith("PerCapita")) {
        var lnDataType = "ln" + this.dataset[0].toUpperCase() + this.dataset.slice(1);
        var val = datum[lnDataType];
        if (val !== null) {
          val = Math.exp(val);
        }
        dataVals.push({
          x: datum["days"],
          y: val ? val : NaN
        });
      } else {
        dataVals.push({
          x: datum["days"],
          y: datum[this.dataset]
        });
      }
    }

    var dateLabels = this.data.map(function(datum) {
      return datum['label'];
    });
    var latestDay = this.data[this.data.length-1]['days']

    var chartConfig = {
      type: 'line',
      data: {
        datasets: [{
          data: dataVals,
          label: this.datasetName(this.dataset),
          lineTension: 0
        }],
        labels: dateLabels
      },
      options: {
        spanGaps: false,
        scales: {
          xAxes: [{
            ticks: {
              beginAtZero: true,
              stepSize: 1,
              min: 0,
              max: latestDay
            }
          }],
          yAxes: [{
            ticks: {beginAtZero: true, min: 0},
            type: this.useLogScale ? 'logarithmic' : 'linear'
          }]
        }
      }
    };

    // Output config
    if (this.chart) {
      Object.assign(this.chartConfig.options, chartConfig.options);
      Object.assign(this.chartConfig.data, chartConfig.data);
      this.chart.update()
    } else {
      this.chartConfig = chartConfig;
      var ctx = this.shadowRoot.getElementById('chart');
      if (ctx) {
        this.chart = new Chart(ctx, this.chartConfig);
      }
    }
  }
}

customElements.define('chartjs-chart', ChartJsChart);
