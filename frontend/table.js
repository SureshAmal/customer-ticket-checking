import { categoryValues, priorityValues } from './constants.js';
import { label } from './renderers.js';

const billingValues = ['Billing', 'No billing'];
const humanValues = ['Human', 'Auto'];

function filterAttrs(field, title) {
  return {
    id: `filter-${field}`,
    name: `filter-${field}`,
    'aria-label': `${title} filter`,
  };
}

function enumFilter(field, title, values, labels = {}) {
  return function buildFilter(_cell, _onRendered, success) {
    const select = document.createElement('select');

    Object.entries(filterAttrs(field, title)).forEach(([key, value]) => {
      select.setAttribute(key, value);
    });
    select.appendChild(new Option('All', ''));
    values.forEach((value) => select.appendChild(new Option(labels[value] || value, value)));
    select.addEventListener('change', () => success(select.value));
    return select;
  };
}

function normalizeRows(rows) {
  return rows.map((row, index) => ({
    ...row,
    id: index + 1,
    confidence: Number(row.confidence) || 0,
    billingText: row.billing ? billingValues[0] : billingValues[1],
    humanText: row.needed_human ? humanValues[0] : humanValues[1],
  }));
}

function visibleRows(table) {
  return table.getRows('active').length;
}

function pill(value, tone) {
  return label(value, tone);
}

export function createResultsTable(tableEl, onRowsVisible) {
  let built = false;
  let pendingRows = null;

  const table = new Tabulator(tableEl, {
    data: [],
    height: '100%',
    layout: 'fitColumns',
    pagination: false,
    reactiveData: false,
    rowHeight: 42,
    selectableRows: false,
    virtualDom: true,
    placeholder: 'No rows to show',
    headerFilterLiveFilterDelay: 180,
    columns: [
      {
        title: 'Message',
        field: 'message',
        minWidth: 280,
        widthGrow: 3,
        sorter: 'string',
        headerFilter: 'input',
        headerFilterParams: {
          elementAttributes: filterAttrs('message', 'Message'),
        },
      },
      {
        title: 'Category',
        field: 'category',
        minWidth: 150,
        sorter: 'string',
        headerFilter: enumFilter('category', 'Category', categoryValues),
        headerFilterFunc: '=',
        formatter: (cell) => pill(cell.getValue()),
      },
      {
        title: 'Confidence',
        field: 'confidence',
        minWidth: 120,
        sorter: 'number',
        hozAlign: 'center',
        headerFilter: 'number',
        headerFilterFunc: '>=',
        headerFilterPlaceholder: 'Min',
        headerFilterParams: {
          elementAttributes: filterAttrs('confidence', 'Confidence'),
        },
        formatter: (cell) => pill(Number(cell.getValue()).toFixed(2), 'confidence'),
      },
      {
        title: 'Billing',
        field: 'billingText',
        minWidth: 120,
        sorter: 'string',
        hozAlign: 'center',
        headerFilter: enumFilter('billing', 'Billing', billingValues),
        headerFilterFunc: '=',
        formatter: (cell) => pill(cell.getValue(), cell.getValue() === billingValues[0] ? 'yes' : 'no'),
      },
      {
        title: 'Human',
        field: 'humanText',
        minWidth: 110,
        sorter: 'string',
        hozAlign: 'center',
        headerFilter: enumFilter('human', 'Human', humanValues),
        headerFilterFunc: '=',
        formatter: (cell) => pill(cell.getValue(), cell.getValue() === humanValues[0] ? 'yes' : 'no'),
      },
      {
        title: 'Priority',
        field: 'priority',
        minWidth: 100,
        sorter: 'string',
        hozAlign: 'center',
        headerFilter: enumFilter('priority', 'Priority', priorityValues),
        headerFilterFunc: '=',
        formatter: (cell) => pill(cell.getValue(), String(cell.getValue()).toLowerCase()),
      },
    ],
  });

  table.on('dataFiltered', (_filters, rows) => onRowsVisible(rows.length));
  table.on('tableBuilt', () => {
    built = true;
    table.redraw(true);

    if (pendingRows) {
      table.setData(pendingRows).then(() => onRowsVisible(visibleRows(table)));
      pendingRows = null;
    }
  });

  return {
    clearRows() {
      pendingRows = null;
      if (!built) {
        onRowsVisible(0);
        return;
      }

      table.clearFilter(true);
      table.setData([]);
      onRowsVisible(0);
    },
    displayedRows() {
      if (!built) return 0;

      return visibleRows(table);
    },
    redraw() {
      if (!built) return;

      table.redraw(true);
    },
    setRows(rows) {
      const nextRows = normalizeRows(rows);

      if (!built) {
        pendingRows = nextRows;
        return;
      }

      table.setData(nextRows).then(() => onRowsVisible(visibleRows(table)));
    },
  };
}
