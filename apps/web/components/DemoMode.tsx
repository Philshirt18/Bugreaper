'use client';

import { useState } from 'react';
import { Play, Code, Bug, Info } from 'lucide-react';

const DEMO_PROJECTS = [
  {
    id: 'todo-app',
    name: 'Todo App (JavaScript)',
    language: 'javascript',
    description: '5 common bugs: null checks, disabled button, event handling',
    code: `function addTodo() {
  const input = document.getElementById('todo-input');
  const button = document.getElementById('add-button');
  
  // BUG 1: Button stays disabled forever
  button.disabled = true;
  button.setAttribute('disabled', 'disabled');
  
  // BUG 2: No null check
  if (input.value.trim()) {
    const todo = {
      id: Date.now(),
      text: input.value,
      completed: false
    };
    
    todos.push(todo);
    input.value = '';
    renderTodos();
  }
  
  // BUG 3: event is undefined
  event.preventDefault();
}

function deleteTodo(id) {
  // BUG 4: Modifying array while iterating
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
      todos.splice(i, 1);
    }
  }
  renderTodos();
}

// BUG 5: Memory leak - event listener never removed
function setupTodoList() {
  const addButton = document.getElementById('add-button');
  addButton.addEventListener('click', addTodo);
}`,
    bugs: [
      'Button disabled permanently',
      'Missing null check on input',
      'Undefined event variable',
      'Array modification during iteration',
      'Memory leak from event listener'
    ]
  },
  {
    id: 'async-fetch',
    name: 'API Fetcher (TypeScript)',
    language: 'typescript',
    description: '4 async/await bugs and error handling issues',
    code: `async function fetchUserData(userId: string) {
  // BUG 1: No error handling
  const response = await fetch(\`/api/users/\${userId}\`);
  const data = await response.json();
  
  // BUG 2: Not checking response.ok
  return data;
}

async function loadAllUsers() {
  const userIds = ['1', '2', '3', '4', '5'];
  const users = [];
  
  // BUG 3: Sequential instead of parallel
  for (const id of userIds) {
    const user = await fetchUserData(id);
    users.push(user);
  }
  
  return users;
}

// BUG 4: Race condition
let cache = null;
async function getCachedData() {
  if (!cache) {
    cache = await fetchUserData('1');
  }
  return cache;
}`,
    bugs: [
      'No try-catch error handling',
      'Not checking response.ok status',
      'Sequential API calls (should be parallel)',
      'Race condition in cache logic'
    ]
  },
  {
    id: 'react-hooks',
    name: 'React Component (TypeScript)',
    language: 'typescript',
    description: '3 React hooks bugs',
    code: `function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // BUG 1: Missing dependency array
  useEffect(() => {
    setLoading(true);
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  });
  
  // BUG 2: Stale closure
  const handleClick = () => {
    setTimeout(() => {
      console.log('User:', user);
    }, 3000);
  };
  
  // BUG 3: Object in dependency array
  const config = { theme: 'dark' };
  useEffect(() => {
    applyTheme(config);
  }, [config]);
  
  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}`,
    bugs: [
      'Missing useEffect dependency array',
      'Stale closure in setTimeout',
      'Object reference in dependency array'
    ]
  },
  {
    id: 'python-bugs',
    name: 'Data Processor (Python)',
    language: 'python',
    description: '4 Python bugs: mutable defaults, exception handling',
    code: `def process_items(items, config={}):
    # BUG 1: Mutable default argument
    config['processed'] = True
    results = []
    
    for item in items:
        # BUG 2: Bare except
        try:
            result = transform(item)
            results.append(result)
        except:
            pass
    
    return results

def calculate_average(numbers):
    # BUG 3: No zero division check
    total = sum(numbers)
    return total / len(numbers)

# BUG 4: Resource not closed
def read_file(filename):
    file = open(filename, 'r')
    data = file.read()
    return data`,
    bugs: [
      'Mutable default argument',
      'Bare except clause',
      'No zero division check',
      'File resource not closed'
    ]
  }
];

interface DemoModeProps {
  onSelectDemo: (code: string, language: string) => void;
}

export default function DemoMode({ onSelectDemo }: DemoModeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const handleSelectDemo = (demo: typeof DEMO_PROJECTS[0]) => {
    setSelectedDemo(demo.id);
    onSelectDemo(demo.code, demo.language);
    setTimeout(() => {
      setIsOpen(false);
      setSelectedDemo(null);
    }, 500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center gap-2"
      >
        <Play className="w-5 h-5" />
        Try Demo
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-green-500/30">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Demo Mode</h2>
                  <p className="text-green-100">Try BugReaper with pre-loaded buggy code</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEMO_PROJECTS.map((demo) => (
                  <div
                    key={demo.id}
                    className={`bg-gray-800 rounded-lg p-5 border-2 transition-all cursor-pointer hover:border-green-500/50 ${
                      selectedDemo === demo.id
                        ? 'border-green-500 bg-gray-700'
                        : 'border-gray-700'
                    }`}
                    onClick={() => handleSelectDemo(demo)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-green-400" />
                        <h3 className="font-bold text-white">{demo.name}</h3>
                      </div>
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {demo.language}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-4">{demo.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Bug className="w-4 h-4 text-red-400" />
                        <span className="font-semibold">{demo.bugs.length} Bugs to Fix:</span>
                      </div>
                      <ul className="space-y-1 ml-6">
                        {demo.bugs.map((bug, idx) => (
                          <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                            <span className="text-red-400">•</span>
                            <span>{bug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectDemo(demo);
                      }}
                    >
                      Load This Demo
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold text-blue-400 mb-1">How to use:</p>
                    <ol className="space-y-1 ml-4">
                      <li>1. Select a demo project above</li>
                      <li>2. Click "Auto-Detect & Fix" to see AI find all bugs</li>
                      <li>3. Review the fixes and confidence scores</li>
                      <li>4. Apply fixes with one click!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
