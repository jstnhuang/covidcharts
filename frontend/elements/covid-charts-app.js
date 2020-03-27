import './chartjs-chart.js'

import {css, html, LitElement} from 'lit-element';

import {generateUsaDaily} from '../modules/chartgen.js';

class CovidChartsApp extends LitElement {
  constructor() {
    super();
    this.usaUseLog = false;
    this.usaDaily = generateUsaDaily(this.usaUseLog);
  }
  static get properties() { return {usaUseLog : Boolean}; }
  static get styles() {
    return css `
      chartjs-chart {
        display: block;
      }
    `;
  }
  render() {
    return html `
      <h1>COVID-19 Charts</h1>

      <h2>United States</h2>
      ${this.usaUseLog
        ? html`Showing log scale <button @click="${this.toggleUsaUseLog}">Use linear scale</button>`
        : html`Showing linear scale <button @click="${this.toggleUsaUseLog}">Use log scale</button>`}

      <chartjs-chart .config="${this.usaDaily}"></chartjs-chart>

      <h2>About the data</h2>
      <p>
        All the data shown here is from
        <a href="https://covidtracking.com/">The COVID Tracking Project</a>.
      </p>
    `;
  }

  // Custom methods ------------------------------------------------------------
  toggleUsaUseLog() {
    this.usaUseLog = !this.usaUseLog;
    this.usaDaily = generateUsaDaily(this.usaUseLog);
  }
}

customElements.define('covid-charts-app', CovidChartsApp);
