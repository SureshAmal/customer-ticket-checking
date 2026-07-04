import { categoryValues, priorityValues } from './constants.js';

const chartEls = [
  document.getElementById('categoryChart'),
  document.getElementById('priorityChart'),
  document.getElementById('flagsChart'),
];

const charts = chartEls.map((el) => (el ? echarts.init(el, null, { renderer: 'canvas' }) : null));

function countBy(rows, key, values) {
  const counts = Object.fromEntries(values.map((value) => [value, 0]));

  rows.forEach((row) => {
    counts[row[key]] = (counts[row[key]] || 0) + 1;
  });
  return counts;
}

function theme() {
  const styles = getComputedStyle(document.body);

  return {
    text: styles.getPropertyValue('--on-surface').trim() || '#e6e0e9',
    grid: styles.getPropertyValue('--outline-variant').trim() || '#49454f',
    primary: styles.getPropertyValue('--primary').trim() || '#d0bcff',
    secondary: styles.getPropertyValue('--secondary').trim() || '#ccc2dc',
    tertiary: styles.getPropertyValue('--tertiary').trim() || '#efb8c8',
    surface: styles.getPropertyValue('--surface-container').trim() || '#211f26',
  };
}

function baseOption(title) {
  const colors = theme();

  return {
    backgroundColor: 'transparent',
    title: {
      text: title,
      left: 8,
      top: 8,
      textStyle: { color: colors.text, fontSize: 13, fontWeight: 700 },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: colors.surface,
      borderColor: colors.grid,
      textStyle: { color: colors.text },
    },
    textStyle: { color: colors.text },
  };
}

function axisStyle() {
  const colors = theme();

  return {
    axisLabel: { color: colors.text, fontSize: 11 },
    axisLine: { lineStyle: { color: colors.grid } },
    splitLine: { lineStyle: { color: colors.grid } },
  };
}

export function renderCharts(rows = []) {
  const colors = theme();
  const categoryCounts = countBy(rows, 'category', categoryValues);
  const priorityCounts = countBy(rows, 'priority', priorityValues);
  const flagCounts = {
    Human: rows.filter((row) => row.needed_human).length,
    Auto: rows.filter((row) => !row.needed_human).length,
    Billing: rows.filter((row) => row.billing).length,
    'No billing': rows.filter((row) => !row.billing).length,
  };

  charts[0]?.setOption({
    ...baseOption('Category'),
    color: [colors.primary],
    grid: { top: 48, right: 12, bottom: 28, left: 34 },
    xAxis: { type: 'category', data: Object.keys(categoryCounts), ...axisStyle() },
    yAxis: { type: 'value', minInterval: 1, ...axisStyle() },
    series: [{ type: 'bar', data: Object.values(categoryCounts), barMaxWidth: 28 }],
  }, true);

  charts[1]?.setOption({
    ...baseOption('Priority'),
    color: ['#ffb4ab', '#ffd8a8', '#bdd2ee', '#bed8c8'],
    legend: { bottom: 4, textStyle: { color: colors.text, fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '48%'],
      data: Object.entries(priorityCounts).map(([name, value]) => ({ name, value })),
      label: { color: colors.text, fontSize: 11 },
    }],
  }, true);

  charts[2]?.setOption({
    ...baseOption('Routing'),
    color: [colors.secondary],
    grid: { top: 48, right: 14, bottom: 24, left: 74 },
    xAxis: { type: 'value', minInterval: 1, ...axisStyle() },
    yAxis: { type: 'category', data: Object.keys(flagCounts), ...axisStyle() },
    series: [{ type: 'bar', data: Object.values(flagCounts), barMaxWidth: 18 }],
  }, true);
}

export function resizeCharts() {
  charts.forEach((chart) => chart?.resize());
}
