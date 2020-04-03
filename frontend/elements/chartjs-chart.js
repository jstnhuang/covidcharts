import { LitElement, css, html } from 'lit-element';

import {DATA_INDICES} from '../data/data_indices.js';

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
    var datasets = [];
    
    if (Object.keys(this.data).length === 1) {
      datasets = ["positive", "hospitalized", "deaths", "totalTestResults",
        "positiveIncrease", "hospitalizedIncrease", "deathIncrease",
        "positivePerTest", "deathsPerPositive", "deathsPerHospitalized",
        "deathsPerTest", "newCasesVsTotalCases", "newCasesVsTotalDeaths",
        "newDeathsVsTotalDeaths"];
    } else {
      datasets = ["positive", "positivePerCapita", "hospitalized",
        "hospitalizedPerCapita", "deaths", "deathsPerCapita",
        "totalTestResults", "testsPerCapita", "positiveIncrease",
        "hospitalizedIncrease", "deathIncrease", "positivePerTest",
        "deathsPerPositive", "deathsPerHospitalized", "deathsPerTest",
        "newCasesVsTotalCases", "newCasesVsTotalDeaths",
        "newDeathsVsTotalDeaths"];
    }
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
    } else if (codeName === "hospitalizedPerCapita") {
      return "Total hospitalized per 10,000";
    } else if (codeName === "deathIncrease") {
      return "# daily deaths";
    } else if (codeName === "positivePerTest") {
      return "Total confirmed cases / total tests";
    } else if (codeName === "positivePerCapita") {
      return "Total confirmed cases per 10,000";
    } else if (codeName === "deathsPerPositive") {
      return "Total deaths / total confirmed cases";
    } else if (codeName === "deathsPerCapita") {
      return "Total deaths per 10,000";
    } else if (codeName === "deathsPerHospitalized") {
      return "Total deaths / total hospitalized";
    } else if (codeName === "deathsPerTest") {
      return "Total deaths / total tests";
    } else if (codeName === "testsPerCapita") {
      return "Tests conducted per 10,000";
    } else if (codeName === "newCasesVsTotalCases") {
      return "New cases vs. total cases";
    } else if (codeName === "newCasesVsTotalDeaths") {
      return "New cases vs. total deaths";
    } else if (codeName === "newDeathsVsTotalDeaths") {
      return "New deaths vs. total deaths";
    }
  }

  toggleUseLogScale() {
    this.useLogScale = !this.useLogScale;
  }

  updateChart() {
    if (this.data.length == 0) {
      return;
    }

    if (this.dataset.indexOf("Vs") === -1) {
      this.updateTimeChart();
    } else {
      this.updateCountChart();
    }
  }

  updateCountChart() {
    // Chart of new cases vs (total cases or total deaths)
    var xField = "";
    var yField = "";
    if (this.dataset === "newCasesVsTotalCases") {
      xField = "positive";
      yField = "positiveIncrease";
    } else if (this.dataset == "newCasesVsTotalDeaths") {
      xField = "deaths";
      yField = "positiveIncrease";
    } else if (this.dataset == "newDeathsVsTotalDeaths") {
      xField = "deaths";
      yField = "deathIncrease";
    }

    var maxX = null;
    var maxDataValsSize = 0;

    var localityData = [];
    for (let [locality, dataset] of Object.entries(this.data)) {
      var dataVals = [];
      for (const datum of dataset) {
        // Update maxX
        if (maxX === null || datum[DATA_INDICES[xField]] > maxX) {
          maxX = datum[""];
        }
        
        dataVals.push({
          x: datum[DATA_INDICES[xField]],
          y: datum[DATA_INDICES[yField]]
        });
      }
      if (dataVals.length > maxDataValsSize) {
        maxDataValsSize = dataVals.length;
      }
      dataVals.locality = locality;
      localityData.push(dataVals);
    }

    var stepSize = maxX / Math.min(maxDataValsSize, 20);

    // Output config
    var chartConfig = {
      type: 'line',
      data: {
        datasets: []
      },
      options: {
        spanGaps: false,
        scales: {
          xAxes: [{
            ticks: {
              beginAtZero: true,
              max: maxX,
              stepSize: stepSize
            },
            type: this.useLogScale ? 'logarithmic' : 'linear'
          }],
          yAxes: [{
            ticks: {beginAtZero: true},
            type: this.useLogScale ? 'logarithmic' : 'linear'
          }]
        }
      }
    };

    // Add datasets
    for (var localityIndex in localityData) {
      var dataVals = localityData[localityIndex];
      var locality = dataVals.locality;
      chartConfig.data.datasets.push({
        data: dataVals,
        fill: false,
        label: locality,
        lineTension: 0
      });
    }

    if (this.chart) {
      Object.assign(this.chartConfig.options, chartConfig.options);
      Object.assign(this.chartConfig.data, chartConfig.data);
      this.chart.update();
    } else {
      this.chartConfig = chartConfig;
      var ctx = this.shadowRoot.getElementById('chart');
      if (ctx) {
        this.chart = new Chart(ctx, this.chartConfig);
      }
    }

  }

  updateTimeChart() {
    // Y-axis
    var localityData = [];

    var latestDay = null;
    var dateLabelSet = {}
    var isPerCapita = this.dataset.endsWith("PerCapita");
    for (let [locality, dataset] of Object.entries(this.data)) {
      var dataVals = [];
      for (const datum of dataset) {
        // Update latest day seen in all the datasets
        if (latestDay === null || datum[DATA_INDICES["days"]] > latestDay) {
          latestDay = datum[DATA_INDICES["days"]];
        }

        // Add to the date labels
        dateLabelSet[datum[DATA_INDICES["label"]]] = 1;

        if (isPerCapita) {
          var lnDataType = "ln" + this.dataset[0].toUpperCase() + this.dataset.slice(1);
          var val = datum[DATA_INDICES[lnDataType]];
          if (val === 0 || val === NaN) {
            val = null;
          }
          if (val !== null) {
            val = 10000 * Math.exp(val);
            dataVals.push({
              x: datum[DATA_INDICES["days"]],
              y: val
            });
          }
        } else {
          var y = datum[DATA_INDICES[this.dataset]];
          if (!this.useLogScale || (this.useLogScale && y > 0)) {
            dataVals.push({
              x: datum[DATA_INDICES["days"]],
              y: datum[DATA_INDICES[this.dataset]]
            });
          }
        }
      }
      dataVals.locality = locality;
      localityData.push(dataVals);
    }

    // X-axis
    var dateLabels = Object.keys(dateLabelSet).sort();

    // Output config
    var chartConfig = {
      type: 'line',
      data: {
        datasets: []
      },
      options: {
        spanGaps: false,
        scales: {
          xAxes: [{
            ticks: {
              beginAtZero: true,
              stepSize: dateLabels.length / 30,
              max: latestDay,
              maxTicksLimit: 30,
              callback: function(value, index, values) {
                return dateLabels[Math.round(value)];
              }
            },
            type: 'linear',
          }],
          yAxes: [{
            ticks: {beginAtZero: true},
            type: this.useLogScale ? 'logarithmic' : 'linear'
          }]
        }
      }
    };

    // Add datasets
    for (var localityIndex in localityData) {
      var dataVals = localityData[localityIndex];
      var locality = dataVals.locality;
      var hue = Math.round(300 / localityData.length * localityIndex);
      var sat = '';
      if (localityIndex % 3 == 0) {
        sat = '25%';
      } else if (localityIndex % 3 == 0) {
        sat = '50%';
      } else {
        sat = '75%';
      }
      var color = 'hsla(' + hue + ', ' + sat + ', 60%, 50%)';
      if (localityData.length == 1) {
        color = 'rgba(0, 0, 0, 0.25)';
      }
      chartConfig.data.datasets.push({
        borderColor: color,
        data: dataVals,
        fill: localityData.length === 1,
        label: locality,
        lineTension: 0
      });
    }

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
