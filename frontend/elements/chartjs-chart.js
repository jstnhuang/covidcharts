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
    var datasets = ["positive", "deaths", "totalTestResults", "positivePerTest",
      "deathsPerPositive"];
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
      return "Confirmed cases";
    } else if (codeName === "deaths") {
      return "Deaths";
    } else if (codeName === "totalTestResults") {
      return "Tests conducted";
    } else if (codeName === "positivePerTest") {
      return "Confirmed cases per test conducted";
    } else if (codeName === "positivePerCapita") {
      return "Confirmed cases per capita";
    } else if (codeName === "deathsPerPositive") {
      return "Deaths per confirmed case";
    } else if (codeName === "deathsPerCapita") {
      return "Deaths per capita";
    } else if (codeName === "testsPerCapita") {
      return "Tests conducted per capita";
    }
  }

  toggleUseLogScale() {
    this.useLogScale = !this.useLogScale;
    this.updateChart();
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
          y: val
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

    // Output config
    this.chartConfig = {
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
        spanGaps: true,
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
            ticks: {beginAtZero: true},
            type: this.useLogScale ? 'logarithmic' : 'linear'
          }]
        }
      }
    };
    var ctx = this.shadowRoot.getElementById('chart');
    if (ctx) {
      delete this.chart;
      this.chart = new Chart(ctx, this.chartConfig);
    }
  }
}

customElements.define('chartjs-chart', ChartJsChart);
