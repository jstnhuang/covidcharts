import { LitElement, css, html } from 'lit-element';

class ChartJsChart extends LitElement {
	updated(changedProps) {
    var ctx = this.shadowRoot.getElementById('chart');
    if (ctx) {
      new Chart(ctx, this.config);
    }
  }
  static get properties() {
    return {
      config: Object
    }
  }
  static get styles() {
    return css`
      canvas {
        display: block;
      }
    `;
  }
  render() {
    return html`
      <canvas id="chart"></canvas>
    `;
  }
}

customElements.define('chartjs-chart', ChartJsChart);
