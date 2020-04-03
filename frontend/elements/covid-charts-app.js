import './chartjs-chart.js'

import {css, html, LitElement} from 'lit-element';

import {us_daily} from '../data/us_daily.js';
import {states_daily} from '../data/states_daily.js';

class CovidChartsApp extends LitElement {
  constructor() {
    super();
  }
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
      <chartjs-chart .data="${us_daily}"></chartjs-chart>

      <h2>State Data</h2>
      <chartjs-chart .data="${states_daily}"></chartjs-chart>

      <h2>About the data</h2>
      <p>
        All the data shown here is from
        <a href="https://covidtracking.com/">The COVID Tracking Project</a>.
      </p>
    `;
  }

}

customElements.define('covid-charts-app', CovidChartsApp);
