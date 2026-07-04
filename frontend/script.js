import { classifyMessages } from './api.js';
import { renderCharts, resizeCharts } from './charts.js';
import { maxMessages, starterMessages } from './constants.js';
import { createResultsTable } from './table.js';

const messageInputEl = document.getElementById('messageInput');
const addMessageEl = document.getElementById('addMessage');
const messageListEl = document.getElementById('messageList');
const messageCountEl = document.getElementById('messageCount');
const classifyEl = document.getElementById('classify');
const statusEl = document.getElementById('status');
const tableEl = document.getElementById('resultsTable');
const resultsListEl = document.getElementById('resultsList');
const loadingOverlayEl = document.getElementById('loadingOverlay');
const themeSelectEl = document.getElementById('themeSelect');
let messages = [...starterMessages];
let resultRows = [];
let totalRows = 0;
let resultsTable;

function applyTheme(theme, refreshLayout = true) {
  const nextTheme = ['light', 'dark'].includes(theme) ? theme : 'dark';

  document.body.dataset.theme = nextTheme;
  document.body.classList.toggle('light', nextTheme === 'light');
  document.body.classList.toggle('dark', nextTheme === 'dark');
  themeSelectEl.value = nextTheme;
  localStorage.setItem('classifier-theme', nextTheme);

  if (!refreshLayout) return;

  requestAnimationFrame(() => {
    resultsTable?.redraw();
    renderCharts(resultRows);
    resizeCharts();
  });
}

function updateStatus(visibleRows) {
  const rowCount = visibleRows ?? resultsTable?.displayedRows() ?? 0;

  statusEl.textContent = totalRows
    ? `Showing ${rowCount} of ${totalRows}`
    : 'Ready';
}

function setLoading(isLoading) {
  loadingOverlayEl.hidden = !isLoading;
  classifyEl.disabled = isLoading;
}

function renderResultsList(rows = []) {
  resultsListEl.replaceChildren(...rows.map((row) => {
    const item = document.createElement('li');
    const message = document.createElement('strong');
    const values = [
      row.category,
      `Confidence ${Number(row.confidence).toFixed(2)}`,
      row.billing ? 'Billing' : 'No billing',
      row.needed_human ? 'Human' : 'Auto',
      row.priority,
    ];

    message.textContent = row.message;
    item.appendChild(message);
    values.forEach((value) => {
      const span = document.createElement('span');

      span.textContent = value;
      item.appendChild(span);
    });
    return item;
  }));
}

function renderMessages() {
  messageListEl.replaceChildren(...messages.map((message, index) => {
    const item = document.createElement('li');
    const text = document.createElement('span');
    const remove = document.createElement('button');

    text.textContent = message;
    remove.type = 'button';
    remove.className = 'small border';
    remove.textContent = 'Remove';
    remove.dataset.index = index;
    remove.ariaLabel = `Remove message ${index + 1}`;
    item.appendChild(text);
    item.appendChild(remove);
    return item;
  }));
  messageCountEl.textContent = `${messages.length} / ${maxMessages} messages`;
  addMessageEl.disabled = messages.length >= maxMessages;
  messageInputEl.disabled = messages.length >= maxMessages;
}

applyTheme(localStorage.getItem('classifier-theme') || 'dark', false);
renderMessages();
resultsTable = createResultsTable(tableEl, updateStatus);

function addMessages(raw) {
  const incoming = raw
    .split(/\r?\n/)
    .map((message) => message.trim())
    .filter(Boolean);

  if (!incoming.length) return;

  const slots = maxMessages - messages.length;
  messages.push(...incoming.slice(0, slots));
  messageInputEl.value = '';
  renderMessages();

  if (incoming.length > slots) {
    statusEl.textContent = `Only ${maxMessages} messages allowed. Extra messages ignored.`;
  }
}

addMessageEl.addEventListener('click', () => addMessages(messageInputEl.value));

messageInputEl.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;

  event.preventDefault();
  addMessages(messageInputEl.value);
});

messageInputEl.addEventListener('paste', (event) => {
  const text = event.clipboardData.getData('text');

  if (!text.includes('\n')) return;

  event.preventDefault();
  addMessages(text);
});

messageListEl.addEventListener('click', (event) => {
  if (event.target.tagName !== 'BUTTON') return;

  messages.splice(Number(event.target.dataset.index), 1);
  renderMessages();
});

classifyEl.addEventListener('click', async () => {

  if (!messages.length) {
    totalRows = 0;
    resultRows = [];
    resultsTable.clearRows();
    renderResultsList();
    renderCharts();
    statusEl.textContent = 'Add at least one message.';
    return;
  }

  totalRows = 0;
  resultRows = [];
  resultsTable.clearRows();
  renderResultsList();
  renderCharts();
  setLoading(true);
  statusEl.textContent = `Classifying ${messages.length} messages...`;

  try {
    const data = await classifyMessages(messages);
    const rows = data.results || [];

    resultRows = rows;
    totalRows = rows.length;
    resultsTable.setRows(rows);
    renderResultsList(rows);
    renderCharts(rows);
  } catch (error) {
    totalRows = 0;
    resultRows = [];
    resultsTable.clearRows();
    renderResultsList();
    renderCharts();
    statusEl.textContent = error.retryable ? error.message : `Error: ${error.message}`;
  } finally {
    setLoading(false);
  }
});

themeSelectEl.addEventListener('change', () => applyTheme(themeSelectEl.value));

renderCharts();
window.addEventListener('resize', () => requestAnimationFrame(resizeCharts));
