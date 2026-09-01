import { QuizQuestion } from '../types.js';

/**
 * Question bank for skill assessments.
 * Dynamic generator produces randomized, unique question sets to prevent cheating via shared answer keys.
 */
const SKILL_QUESTION_BANK: Record<string, QuizQuestion[]> = {
  React: [
    {
      id: 'react_q1',
      question: 'What is the primary purpose of React.useMemo hook?',
      options: [
        'To cache expensive calculation results between re-renders',
        'To create a mutable ref that persists across renders',
        'To run side effects asynchronously after DOM paint',
        'To manage global state across component trees'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'react_q2',
      question: 'Which lifecycle event does useEffect with an empty dependency array [] simulate in a functional component?',
      options: [
        'componentDidMount only',
        'componentDidUpdate only',
        'shouldComponentUpdate',
        'componentWillUnmount only'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'react_q3',
      question: 'Why should keys provided to list items in React be unique among siblings?',
      options: [
        'They help React identify which items have changed, been added, or been removed',
        'They automatically sort elements alphabetically in the DOM',
        'They prevent CSS selector collision',
        'They bind event listeners to the underlying synthetic event system'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'react_q4',
      question: 'What does React.forwardRef allow a component to do?',
      options: [
        'Pass a ref down to a child DOM element or component',
        'Forward state changes to a parent component',
        'Defer rendering until idle callback',
        'Memoize component props automatically'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'react_q5',
      question: 'In React 18 Concurrent Rendering, which hook allows deferring non-urgent state updates?',
      options: [
        'useDeferredValue',
        'useId',
        'useInsertionEffect',
        'useSyncExternalStore'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'react_q6',
      question: 'What happens when state is updated with the exact same value in React?',
      options: [
        'React bails out without re-rendering children or firing effects',
        'React throws a runtime warning in development',
        'React triggers a forced full-tree re-render',
        'React resets component internal ref values'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'react_q7',
      question: 'Which pattern avoids prop drilling by sharing data across the tree without explicit prop passing?',
      options: [
        'Context API (useContext)',
        'Higher Order Component wrapper',
        'Render Props pattern',
        'Custom hook delegation'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'react_q8',
      question: 'What is the purpose of StrictMode in React development mode?',
      options: [
        'It double-invokes component renders and effects to detect unexpected side effects',
        'It blocks network requests failing CORS',
        'It enforces strict TypeScript types on JSX props',
        'It converts class components into functional components'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'react_q9',
      question: 'How should side effects (e.g. data fetching or subscriptions) be cleaned up in useEffect?',
      options: [
        'By returning a cleanup function from the effect callback',
        'By calling process.nextTick() inside the callback',
        'By passing null as the second argument to useEffect',
        'By invoking unmountComponentAtNode()'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'react_q10',
      question: 'What is the main benefit of React Server Components (RSC)?',
      options: [
        'They execute exclusively on the server and send zero JS bundle size to the client for those components',
        'They run WebAssembly binaries inside client workers',
        'They replace REST APIs with raw SQL query bindings inside JSX',
        'They automatically compile React code into native C++ binaries'
      ],
      correctOptionIndex: 0
    }
  ],
  Node: [
    {
      id: 'node_q1',
      question: 'Which phase of the Node.js Event Loop executes timers (setTimeout / setInterval)?',
      options: [
        'Timers phase',
        'Pending callbacks phase',
        'Poll phase',
        'Check phase (setImmediate)'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'node_q2',
      question: 'What is the key difference between setImmediate() and process.nextTick()?',
      options: [
        'process.nextTick() fires immediately after the current operation before continuing the event loop',
        'setImmediate() executes before microtasks',
        'process.nextTick() is limited to HTTP requests only',
        'setImmediate() blocks thread execution synchronously'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'node_q3',
      question: 'Which core module provides worker thread support for CPU-intensive JavaScript tasks?',
      options: [
        'worker_threads',
        'cluster',
        'child_process',
        'async_hooks'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'node_q4',
      question: 'How does backpressure handling work in Node.js streams?',
      options: [
        'When a writable stream buffer is full, write() returns false, signalling the readable stream to pause',
        'By dropping dropped chunks when network latency exceeds 500ms',
        'By spawning background thread workers automatically',
        'By throwing a StreamOverflowException error'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'node_q5',
      question: 'What library underpins Node.js asynchronous I/O and event loop abstraction?',
      options: [
        'libuv',
        'V8',
        'OpenSSL',
        'c-ares'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'node_q6',
      question: 'Which Node.js cluster feature allows sharing server TCP ports across multiple worker processes?',
      options: [
        'cluster.fork()',
        'thread.spawn()',
        'net.createMaster()',
        'ipc.connect()'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'node_q7',
      question: 'Why should JSON.parse() be used cautiously with large payloads on the main thread?',
      options: [
        'It is synchronous and blocks the single-threaded event loop during parsing',
        'It converts string values into binary buffers',
        'It automatically leaks memory in garbage collection',
        'It executes remote code asynchronously'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'node_q8',
      question: 'What is the purpose of AsyncLocalStorage in Node.js?',
      options: [
        'To store execution context (like request IDs or trace headers) across asynchronous call chains',
        'To replace Redis for persistent key-value caching',
        'To write data to local disk storage asynchronously',
        'To manage browser localStorage tokens'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'node_q9',
      question: 'How does Node.js handle unhandled promise rejections by default in modern Node.js versions?',
      options: [
        'It terminates the process with a non-zero exit code',
        'It silently ignores the rejection',
        'It automatically restarts the process on port 3000',
        'It converts the rejection into an HTTP 200 response'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'node_q10',
      question: 'Which Express middleware method properly forwards uncaught errors to error handlers?',
      options: [
        'Calling next(err)',
        'Calling res.end(err)',
        'Throwing inside asynchronous callbacks without try-catch',
        'Returning Error object from res.json()'
      ],
      correctOptionIndex: 0
    }
  ],
  Python: [
    {
      id: 'py_q1',
      question: 'What is the Global Interpreter Lock (GIL) in CPython?',
      options: [
        'A mutex that prevents multiple native threads from executing Python bytecodes at once',
        'A security sandbox restricting file system access',
        'A compiler optimization flag for loop unrolling',
        'A database lock engine for SQLite'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'py_q2',
      question: 'Which built-in Python function returns an iterator that yields tuples of index and item?',
      options: [
        'enumerate()',
        'zip()',
        'map()',
        'filter()'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'py_q3',
      question: 'What is a decorator in Python?',
      options: [
        'A callable object that takes a function as argument and returns a modified function wrapper',
        'A class inheritance keyword',
        'A type hint annotation for docstrings',
        'A garbage collection finalizer'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'py_q4',
      question: 'How do Python generators yield items without loading the entire dataset into memory?',
      options: [
        'By using the yield keyword to pause execution and lazily produce values on demand',
        'By caching results into temporary swap files',
        'By running multithreaded worker subprocesses',
        'By compiling list comprehensions into C structs'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'py_q5',
      question: 'What is the difference between __str__ and __repr__ dunder methods?',
      options: [
        '__str__ is intended for readable user output, whereas __repr__ is for unambiguous developer representation',
        '__repr__ converts string to bytes',
        '__str__ is called by json.dumps() exclusively',
        '__repr__ cannot return string types'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'py_q6',
      question: 'Which asyncio primitive is used to run multiple coroutines concurrently and gather their results?',
      options: [
        'asyncio.gather()',
        'asyncio.lock()',
        'asyncio.queue()',
        'asyncio.sleep()'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'py_q7',
      question: 'How does Python handle memory management and object cleanup?',
      options: [
        'Via reference counting supplemented by a cyclic garbage collector',
        'Via manual malloc and free pointers',
        'Via mark-and-sweep GC only',
        'Via stack allocation exclusively'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'py_q8',
      question: 'What does *args and **kwargs unpack in function definitions?',
      options: [
        '*args unpacks positional arguments as a tuple, and **kwargs unpacks keyword arguments as a dict',
        '*args unpacks dictionaries and **kwargs unpacks lists',
        '*args defines return types and **kwargs defines parameter defaults',
        '*args handles exceptions and **kwargs handles threads'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'py_q9',
      question: 'What is a context manager in Python (used with the "with" statement)?',
      options: [
        'An object defining __enter__ and __exit__ methods to manage resource allocation and cleanup',
        'A thread safety wrapper for global variables',
        'A database connection pool configuration',
        'A package virtual environment manager'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'py_q10',
      question: 'What is the time complexity of looking up a key in a Python dictionary (dict) on average?',
      options: [
        'O(1)',
        'O(log N)',
        'O(N)',
        'O(N log N)'
      ],
      correctOptionIndex: 0
    }
  ]
};

export class SkillQuizEngine {
  /**
   * Generates a randomized, unique question set (10 questions) for the specified skill.
   */
  public static generateQuestions(skillName: string): QuizQuestion[] {
    const canonicalSkill = Object.keys(SKILL_QUESTION_BANK).find(
      (k) => k.toLowerCase() === skillName.toLowerCase()
    ) || 'React';

    const baseQuestions = SKILL_QUESTION_BANK[canonicalSkill] || SKILL_QUESTION_BANK['React'];

    // Randomize option order for each question to guarantee unique question sets
    return baseQuestions.map((q, idx) => {
      const originalOptions = [...q.options];
      const correctAnswerText = originalOptions[q.correctOptionIndex];

      // Shuffle options
      const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);
      const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);

      return {
        id: `${q.id}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        question: q.question,
        options: shuffledOptions,
        correctOptionIndex: newCorrectIndex,
      };
    });
  }

  /**
   * Evaluates user answers and returns scoring breakdown.
   */
  public static evaluateQuiz(
    skillName: string,
    questions: QuizQuestion[],
    answers: { questionId: string; selectedOptionIndex: number }[]
  ): { passed: boolean; scorePercent: number; correctCount: number; totalQuestions: number } {
    const totalQuestions = questions.length;
    let correctCount = 0;

    answers.forEach((ans) => {
      const q = questions.find((item) => item.id === ans.questionId);
      if (q && q.correctOptionIndex === ans.selectedOptionIndex) {
        correctCount += 1;
      }
    });

    const scorePercent = Math.round((correctCount / (totalQuestions || 1)) * 100);
    const passed = scorePercent >= 80;

    return {
      passed,
      scorePercent,
      correctCount,
      totalQuestions,
    };
  }
}
