const form = document.getElementById('transactionForm');
const modal = document.getElementById('transactionModal');
const addBtn = document.getElementById('addBtn');
const closeModal = document.getElementById('closeModal');
const table = document.getElementById('transactionTable');
const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const searchBox = document.getElementById('searchBox');
const themeToggle = document.getElementById('themeToggle');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chart;

// Modal Control
addBtn.onclick = () => modal.style.display = 'flex';
closeModal.onclick = () => modal.style.display = 'none';
window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

// Add Transaction
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('transactionName').value.trim();
  const amount = parseFloat(document.getElementById('transactionAmount').value);
  const type = document.getElementById('transactionType').value;
  const category = document.getElementById('transactionCategory').value;
  const date = document.getElementById('transactionDate').value;

  if (!name || !amount || amount <= 0) return alert('Enter valid details!');

  const transaction = { id: Date.now(), name, amount, type, category, date };
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  form.reset();
  modal.style.display = 'none';
  render();
});

// Render Transactions
function render(filter = '') {
  table.innerHTML = '';
  transactions.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(t => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${t.name}</td>
        <td>${t.category}</td>
        <td class="${t.type}">${t.type}</td>
        <td>${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}</td>
        <td>${t.date}</td>
        <td><button onclick="deleteTx(${t.id})">❌</button></td>`;
      table.appendChild(row);
    });
  updateStats();
  updateChart();
}

// Delete Transaction
function deleteTx(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  render(searchBox.value);
}

// Update Stats
function updateStats() {
  const income = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = income - expense;

  balanceEl.textContent = `$${balance.toFixed(2)}`;
  totalIncomeEl.textContent = `$${income.toFixed(2)}`;
  totalExpenseEl.textContent = `$${expense.toFixed(2)}`;
}

// Chart.js Visualization
function updateChart() {
  const income = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#00e676', '#ff1744'],
        borderWidth: 1
      }]
    },
    options: { plugins: { legend: { labels: { color: '#fff' } } } }
  });
}

// Search
searchBox.addEventListener('input', e => render(e.target.value));

// Theme
themeToggle.onclick = () => {
  document.body.classList.toggle('dark');
  const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', mode);
  themeToggle.textContent = mode === 'dark' ? '☀️' : '🌙';
};

// Load Saved Theme + Data
(function init() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('dark');
  themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙';
  render();
})();
