<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Helper Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #062b1d;
      --panel-bg: rgba(255, 255, 255, 0.85);
      --border: rgba(6, 43, 29, 0.1);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(circle at top left, #baf7cf, #5ccf96, #1c8f4e);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
    }

    .app-shell {
      width: min(1100px, 100%);
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }

    .panel {
      background: var(--panel-bg);
      backdrop-filter: blur(8px);
      border-radius: 18px;
      padding: 24px;
      border: 1px solid var(--border);
      box-shadow: 0 15px 35px rgba(12, 68, 43, 0.15);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    h2 {
      margin: 0;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    input, textarea, button {
      font: inherit;
    }

    textarea, input {
      width: 100%;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.9);
      resize: none;
      outline: none;
      transition: border 0.2s ease;
    }

    textarea:focus, input:focus {
      border-color: #1c8f4e;
    }

    button {
      border: none;
      padding: 10px 14px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    button:active {
      transform: translateY(1px);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    .primary-btn {
      background: #1c8f4e;
      color: white;
      box-shadow: 0 10px 20px rgba(28, 143, 78, 0.25);
    }

    .secondary-btn {
      background: rgba(28, 143, 78, 0.1);
      color: #1c8f4e;
      box-shadow: inset 0 0 0 1px rgba(28, 143, 78, 0.4);
    }

    .calculator-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .calc-display {
      grid-column: span 4;
      text-align: right;
      font-size: 1.5rem;
      padding: 16px;
      border-radius: 14px;
      background: rgba(0, 0, 0, 0.75);
      color: white;
      min-height: 64px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .calc-btn {
      padding: 16px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid var(--border);
      font-weight: 600;
      font-size: 1rem;
    }

    .calc-btn.operator { color: #1c8f4e; }
    .calc-btn.equal {
      grid-column: span 2;
      background: #1c8f4e;
      color: white;
      border: none;
      box-shadow: 0 12px 20px rgba(28, 143, 78, 0.3);
    }

    .notes-area {
      flex-grow: 1;
      min-height: 180px;
    }

    .notes-actions,
    .todo-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .todo-input-row {
      display: flex;
      gap: 10px;
    }

    .todo-input-row input {
      flex-grow: 1;
    }

    .todo-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid var(--border);
    }

    .todo-item.completed span {
      text-decoration: line-through;
      color: rgba(6, 43, 29, 0.5);
    }

    .empty-state {
      font-size: 0.95rem;
      color: rgba(6, 43, 29, 0.6);
      text-align: center;
      padding: 20px;
      border: 1px dashed var(--border);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.6);
    }

    @media (max-width: 600px) {
      body { padding: 20px 14px; }
      .panel { padding: 18px; }
      .calc-display { font-size: 1.2rem; }
    }
  </style>
</head>
<body>
  <main class="app-shell">
    <section class="panel" id="calculator">
      <h2>🧮 Calculator</h2>
      <div class="calculator-grid">
        <div class="calc-display" id="calcDisplay">0</div>
        <button class="calc-btn secondary-btn" data-action="clear">C</button>
        <button class="calc-btn secondary-btn" data-action="delete">⌫</button>
        <button class="calc-btn secondary-btn" data-action="percent">%</button>
        <button class="calc-btn operator" data-value="/">÷</button>

        <button class="calc-btn" data-value="7">7</button>
        <button class="calc-btn" data-value="8">8</button>
        <button class="calc-btn" data-value="9">9</button>
        <button class="calc-btn operator" data-value="*">×</button>

        <button class="calc-btn" data-value="4">4</button>
        <button class="calc-btn" data-value="5">5</button>
        <button class="calc-btn" data-value="6">6</button>
        <button class="calc-btn operator" data-value="-">−</button>

        <button class="calc-btn" data-value="1">1</button>
        <button class="calc-btn" data-value="2">2</button>
        <button class="calc-btn" data-value="3">3</button>
        <button class="calc-btn operator" data-value="+">+</button>

        <button class="calc-btn" data-value="0">0</button>
        <button class="calc-btn" data-value=".">.</button>
        <button class="calc-btn equal" data-action="equals">=</button>
      </div>
    </section>

    <section class="panel" id="notes">
      <h2>📝 Notes</h2>
      <textarea class="notes-area" id="notesArea" placeholder="Jot your thoughts here..."></textarea>
      <div class="notes-actions">
        <button class="primary-btn" id="saveNotes">Save</button>
        <button class="secondary-btn" id="clearNotes">Clear</button>
      </div>
      <small id="noteStatus"></small>
    </section>

    <section class="panel" id="todo">
      <h2>✅ To-Do List</h2>
      <div class="todo-input-row">
        <input type="text" id="todoInput" placeholder="Add a new task" />
        <button class="primary-btn" id="addTodo">Add</button>
      </div>
      <ul class="todo-list" id="todoList"></ul>
      <div class="empty-state" id="todoEmpty">Nothing here yet. Add your first task!</div>
    </section>
  </main>

  <script>
    // Calculator logic
    (function setupCalculator() {
      const display = document.getElementById('calcDisplay');
      const grid = document.querySelector('.calculator-grid');
      let current = '0';

      function updateDisplay(value) {
        display.textContent = value;
      }

      function appendValue(value) {
        if (current === '0' && value !== '.') {
          current = value;
        } else {
          const lastChar = current.slice(-1);
          const isOperator = /[+\-*/]/.test(value);
          const lastIsOperator = /[+\-*/]/.test(lastChar);
          current = (lastIsOperator && isOperator)
            ? current.slice(0, -1) + value
            : current + value;
        }
        updateDisplay(current);
      }

      function evaluateExpression() {
        try {
          const sanitized = current.replace(/[^0-9+\-*/.]/g, '');
          const result = Function('return ' + sanitized)();
          current = result.toString();
          updateDisplay(current);
        } catch (err) {
          current = 'Error';
          updateDisplay(current);
          setTimeout(() => { current = '0'; updateDisplay(current); }, 1000);
        }
      }

      grid.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        const action = target.dataset.action;
        const value = target.dataset.value;

        if (action === 'clear') {
          current = '0';
          updateDisplay(current);
        } else if (action === 'delete') {
          current = current.length > 1 ? current.slice(0, -1) : '0';
          updateDisplay(current);
        } else if (action === 'percent') {
          current = (parseFloat(current) / 100).toString();
          updateDisplay(current);
        } else if (action === 'equals') {
          evaluateExpression();
        } else if (value) {
          if (value === '.' && current.includes('.') && /[+\-*/]/.test(current.slice(-1))) {
            return;
          }
          appendValue(value);
        }
      });
    })();

    // Notes logic with localStorage
    (function setupNotes() {
      const textarea = document.getElementById('notesArea');
      const saveBtn = document.getElementById('saveNotes');
      const clearBtn = document.getElementById('clearNotes');
      const status = document.getElementById('noteStatus');
      const STORAGE_KEY = 'helperHubNotes';

      textarea.value = localStorage.getItem(STORAGE_KEY) || '';

      function showStatus(message) {
        status.textContent = message;
        setTimeout(() => (status.textContent = ''), 2000);
      }

      saveBtn.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, textarea.value.trim());
        showStatus('Saved ✔');
      });

      clearBtn.addEventListener('click', () => {
        textarea.value = '';
        localStorage.removeItem(STORAGE_KEY);
        showStatus('Cleared');
      });
    })();

    // To-do list logic with localStorage
    (function setupTodos() {
      const input = document.getElementById('todoInput');
      const addBtn = document.getElementById('addTodo');
      const list = document.getElementById('todoList');
      const emptyState = document.getElementById('todoEmpty');
      const STORAGE_KEY = 'helperHubTodos';

      let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

      function persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      }

      function render() {
        list.innerHTML = '';
        if (!todos.length) {
          emptyState.style.display = 'block';
          return;
        }
        emptyState.style.display = 'none';
        todos.forEach((todo, index) => {
          const item = document.createElement('li');
          item.className = 'todo-item' + (todo.done ? ' completed' : '');

          const label = document.createElement('span');
          label.textContent = todo.text;

          const actionGroup = document.createElement('div');
          actionGroup.style.display = 'flex';
          actionGroup.style.gap = '8px';

          const toggleBtn = document.createElement('button');
          toggleBtn.textContent = todo.done ? 'Undo' : 'Done';
          toggleBtn.className = 'secondary-btn';
          toggleBtn.addEventListener('click', () => {
            todos[index].done = !todos[index].done;
            persist();
            render();
          });

          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.className = 'secondary-btn';
          deleteBtn.addEventListener('click', () => {
            todos.splice(index, 1);
            persist();
            render();
          });

          actionGroup.appendChild(toggleBtn);
          actionGroup.appendChild(deleteBtn);
          item.appendChild(label);
          item.appendChild(actionGroup);
          list.appendChild(item);
        });
      }

      function addTodo() {
        const text = input.value.trim();
        if (!text) return;
        todos.push({ text, done: false });
        input.value = '';
        persist();
        render();
      }

      addBtn.addEventListener('click', addTodo);
      input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') addTodo();
      });

      render();
    })();
  </script>
</body>
</html>