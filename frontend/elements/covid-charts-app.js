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

      <h2>About</h2>
      <p>
        This page shows visualizations of data from
        <a href="https://covidtracking.com/">The COVID Tracking Project</a>.
        The data may be incorrect or incomplete. This visualization has not been
        validated and should not be used to make projections or to do modeling.
      </p>
      <p>
        Code available on <a href="https://github.com/jstnhuang/covidcharts">GitHub</a>.
      </p>
    `;
  }

}

customElements.define('covid-charts-app', CovidChartsApp);
