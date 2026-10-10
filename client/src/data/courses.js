// src/data/courses.js
// Add new courses by pushing objects into this array.

export const COURSES = [
  {
    slug: 'python-programming',
    title: 'Python Programming for Beginners',
    category: 'Programming Languages',
    categorySlug: 'development',
    level: 'Beginner',
    weeks: 6,
    modulesCount: 8,
    rating: 4.8,
    reviewsCount: 3241,
    enrolledCount: 48200,
    description:
      'Go from zero to writing real Python scripts. Learn variables, control flow, functions, file I/O, and build three mini-projects you can put on your portfolio.',
    badge: 'Rise Originals',
    trending: true,
    instructors: [
      { initials: 'AS', name: 'Ananya Sharma', role: 'Senior Software Engineer, ex-Google', color: '#2563eb' },
      { initials: 'RK', name: 'Rahul Kapoor', role: 'Python Educator & Open-Source Contributor', color: '#7c3aed' },
      { initials: 'MD', name: 'Meera Desai', role: 'Data Engineer at Infosys', color: '#059669' },
    ],
    learnOutcomes: [
      'Write clean, idiomatic Python 3 programs from scratch',
      'Use data structures: lists, dicts, sets, and tuples effectively',
      'Build file-processing scripts and automate repetitive tasks',
      'Handle exceptions and write defensive, robust code',
      'Consume REST APIs with the requests library',
      'Package and publish a reusable Python module',
      'Write unit tests with pytest and follow TDD basics',
      'Understand OOP: classes, inheritance, and dunder methods',
    ],
    skills: [
      'Python 3', 'OOP', 'File I/O', 'REST APIs', 'pytest',
      'Data Structures', 'Automation', 'Scripting', 'Git', 'VS Code',
    ],
    syllabus: [
      {
        module: 'Module 1: Python Foundations',
        lessons: [
          { title: 'Setting up Python & VS Code', type: 'video', duration: '12 min' },
          { title: 'Variables, Data Types & Operators', type: 'video', duration: '24 min' },
          { title: 'Interactive Exercises: Types', type: 'lab', duration: '20 min' },
          { title: 'Reading: Python Style Guide (PEP 8)', type: 'reading', duration: '10 min' },
          { title: 'Quiz: Foundations Check', type: 'quiz', duration: '10 min' },
        ],
        totalDuration: '1h 16min',
      },
      {
        module: 'Module 2: Control Flow & Functions',
        lessons: [
          { title: 'if / elif / else & Truthiness', type: 'video', duration: '18 min' },
          { title: 'for & while Loops in Depth', type: 'video', duration: '22 min' },
          { title: 'Defining and Calling Functions', type: 'video', duration: '20 min' },
          { title: 'Lab: FizzBuzz & Beyond', type: 'lab', duration: '25 min' },
          { title: 'Quiz: Control Flow', type: 'quiz', duration: '10 min' },
        ],
        totalDuration: '1h 35min',
      },
      {
        module: 'Module 3: Data Structures Deep Dive',
        lessons: [
          { title: 'Lists: Slicing, Comprehensions & Sorting', type: 'video', duration: '28 min' },
          { title: 'Dictionaries & Sets', type: 'video', duration: '22 min' },
          { title: 'Tuples & When to Use Them', type: 'video', duration: '14 min' },
          { title: 'Lab: Student Grade Calculator', type: 'lab', duration: '30 min' },
        ],
        totalDuration: '1h 34min',
      },
      {
        module: 'Module 4: File I/O & Error Handling',
        lessons: [
          { title: 'Reading & Writing Files', type: 'video', duration: '20 min' },
          { title: 'CSV & JSON Processing', type: 'video', duration: '24 min' },
          { title: 'try / except / finally', type: 'video', duration: '18 min' },
          { title: 'Lab: Log File Analyser', type: 'lab', duration: '35 min' },
          { title: 'Quiz: File & Error Handling', type: 'quiz', duration: '10 min' },
        ],
        totalDuration: '1h 47min',
      },
      {
        module: 'Module 5: Object-Oriented Programming',
        lessons: [
          { title: 'Classes, Attributes & Methods', type: 'video', duration: '26 min' },
          { title: 'Inheritance & Polymorphism', type: 'video', duration: '22 min' },
          { title: 'Dunder Methods & Operator Overloading', type: 'video', duration: '18 min' },
          { title: 'Lab: Build a Bank Account Class', type: 'lab', duration: '40 min' },
        ],
        totalDuration: '1h 46min',
      },
      {
        module: 'Module 6: Working with APIs',
        lessons: [
          { title: 'HTTP Basics & the requests Library', type: 'video', duration: '20 min' },
          { title: 'Parsing JSON Responses', type: 'video', duration: '16 min' },
          { title: 'Lab: Weather CLI App', type: 'project', duration: '45 min' },
          { title: 'Reading: Rate Limiting & Auth Headers', type: 'reading', duration: '8 min' },
        ],
        totalDuration: '1h 29min',
      },
      {
        module: 'Module 7: Testing with pytest',
        lessons: [
          { title: 'Why Testing Matters', type: 'video', duration: '10 min' },
          { title: 'Writing Your First Tests', type: 'video', duration: '20 min' },
          { title: 'Fixtures & Parameterisation', type: 'video', duration: '18 min' },
          { title: 'Lab: Test the Bank Account Module', type: 'lab', duration: '30 min' },
        ],
        totalDuration: '1h 18min',
      },
      {
        module: 'Module 8: Capstone Project',
        lessons: [
          { title: 'Project Brief & Planning', type: 'reading', duration: '10 min' },
          { title: 'Build a Personal Finance Tracker CLI', type: 'project', duration: '90 min' },
          { title: 'Code Review Walkthrough', type: 'video', duration: '20 min' },
          { title: 'Final Assessment', type: 'quiz', duration: '20 min' },
        ],
        totalDuration: '2h 20min',
      },
    ],
    faqs: [
      { q: 'Do I need prior programming experience?', a: 'No. This course is designed for absolute beginners. We start from installing Python and build up step by step.' },
      { q: 'What Python version is used?', a: 'Python 3.11+. All code is compatible with Python 3.8 and above.' },
      { q: 'Is there a certificate on completion?', a: 'Yes. You earn a Rise-verified certificate that you can share on LinkedIn or attach to job applications.' },
      { q: 'How long do I have access?', a: 'Lifetime access once enrolled. You can revisit lessons and labs at any time.' },
      { q: 'Are the labs browser-based?', a: 'Yes. All labs run in Rise Cloud IDE — no local setup required, though we show you how to set up VS Code too.' },
    ],
    related: ['data-structures-algorithms', 'full-stack-web-development', 'sql-databases'],
  },

  {
    slug: 'data-structures-algorithms',
    title: 'Data Structures & Algorithms Masterclass',
    category: 'Computer Science',
    categorySlug: 'development',
    level: 'Intermediate',
    weeks: 10,
    modulesCount: 12,
    rating: 4.9,
    reviewsCount: 5814,
    enrolledCount: 71500,
    description:
      'Master the DSA concepts that appear in top tech interviews at FAANG and beyond. Covers arrays, trees, graphs, dynamic programming, and complexity analysis with 120+ practice problems.',
    badge: 'Rise Originals',
    trending: true,
    instructors: [
      { initials: 'VN', name: 'Vikram Nair', role: 'Staff Engineer at Amazon, IIT Bombay', color: '#dc2626' },
      { initials: 'PS', name: 'Priya Subramaniam', role: 'Competitive Programmer, ACM ICPC Finalist', color: '#d97706' },
    ],
    learnOutcomes: [
      'Analyse time and space complexity using Big O notation',
      'Implement and traverse arrays, linked lists, stacks, and queues',
      'Build and query BSTs, heaps, and tries from scratch',
      'Solve graph problems using BFS, DFS, Dijkstra, and Kruskal',
      'Apply dynamic programming to classic optimisation problems',
      'Recognise common patterns: sliding window, two pointers, backtracking',
      'Crack coding interview rounds with structured problem-solving',
      'Write clean, well-commented solutions accepted on LeetCode',
    ],
    skills: [
      'Big O Notation', 'Arrays', 'Linked Lists', 'Trees', 'Graphs',
      'Dynamic Programming', 'Sorting', 'Binary Search', 'Recursion', 'Hash Maps',
    ],
    syllabus: [
      {
        module: 'Module 1: Complexity & Arrays',
        lessons: [
          { title: 'Big O Notation Explained', type: 'video', duration: '22 min' },
          { title: 'Arrays: Access, Search, Insert & Delete', type: 'video', duration: '28 min' },
          { title: 'Two Pointers & Sliding Window Patterns', type: 'video', duration: '30 min' },
          { title: 'Lab: 20 Array Problems', type: 'lab', duration: '60 min' },
          { title: 'Quiz: Complexity Check', type: 'quiz', duration: '15 min' },
        ],
        totalDuration: '2h 35min',
      },
      {
        module: 'Module 2: Linked Lists',
        lessons: [
          { title: 'Singly & Doubly Linked Lists', type: 'video', duration: '26 min' },
          { title: 'Reversal, Cycle Detection (Floyd)', type: 'video', duration: '24 min' },
          { title: 'Lab: Merge & Sort Linked Lists', type: 'lab', duration: '45 min' },
        ],
        totalDuration: '1h 35min',
      },
      {
        module: 'Module 3: Stacks & Queues',
        lessons: [
          { title: 'Stack Implementation & Applications', type: 'video', duration: '20 min' },
          { title: 'Monotonic Stack Patterns', type: 'video', duration: '22 min' },
          { title: 'Queue, Deque & Priority Queue', type: 'video', duration: '18 min' },
          { title: 'Lab: Valid Parentheses & Next Greater Element', type: 'lab', duration: '40 min' },
        ],
        totalDuration: '1h 40min',
      },
      {
        module: 'Module 4: Binary Trees & BSTs',
        lessons: [
          { title: 'Binary Tree Traversals (BFS/DFS)', type: 'video', duration: '30 min' },
          { title: 'BST: Insert, Delete, Search', type: 'video', duration: '28 min' },
          { title: 'Height, Diameter & Path Sum Problems', type: 'video', duration: '24 min' },
          { title: 'Lab: 15 Tree Problems', type: 'lab', duration: '60 min' },
        ],
        totalDuration: '2h 22min',
      },
      {
        module: 'Module 5: Heaps & Priority Queues',
        lessons: [
          { title: 'Min-Heap & Max-Heap', type: 'video', duration: '22 min' },
          { title: 'Heap Sort & Kth Largest', type: 'video', duration: '20 min' },
          { title: 'Lab: Top K Frequent Elements', type: 'lab', duration: '35 min' },
        ],
        totalDuration: '1h 17min',
      },
      {
        module: 'Module 6: Graphs — BFS & DFS',
        lessons: [
          { title: 'Graph Representations', type: 'video', duration: '20 min' },
          { title: 'BFS: Level Order & Shortest Path', type: 'video', duration: '28 min' },
          { title: 'DFS: Cycle Detection & Topological Sort', type: 'video', duration: '26 min' },
          { title: 'Lab: Islands, Clone Graph', type: 'lab', duration: '50 min' },
        ],
        totalDuration: '2h 04min',
      },
      {
        module: 'Module 7: Shortest Paths & MST',
        lessons: [
          { title: "Dijkstra's Algorithm", type: 'video', duration: '28 min' },
          { title: 'Bellman-Ford & Negative Weights', type: 'video', duration: '20 min' },
          { title: "Kruskal's & Prim's MST", type: 'video', duration: '22 min' },
          { title: 'Lab: Network Delay & Cheapest Flights', type: 'lab', duration: '45 min' },
        ],
        totalDuration: '1h 55min',
      },
      {
        module: 'Module 8: Sorting & Searching',
        lessons: [
          { title: 'Merge Sort, Quick Sort & Stability', type: 'video', duration: '30 min' },
          { title: 'Binary Search & Its Variants', type: 'video', duration: '26 min' },
          { title: 'Lab: Search in Rotated Array, Find Peak', type: 'lab', duration: '40 min' },
        ],
        totalDuration: '1h 36min',
      },
      {
        module: 'Module 9: Dynamic Programming I',
        lessons: [
          { title: 'Memoisation vs Tabulation', type: 'video', duration: '24 min' },
          { title: 'Fibonacci, Climbing Stairs, Coin Change', type: 'video', duration: '28 min' },
          { title: 'Longest Common Subsequence', type: 'video', duration: '22 min' },
          { title: 'Lab: 0/1 Knapsack & Subset Sum', type: 'lab', duration: '55 min' },
        ],
        totalDuration: '2h 09min',
      },
      {
        module: 'Module 10: Dynamic Programming II',
        lessons: [
          { title: 'Matrix DP & Edit Distance', type: 'video', duration: '26 min' },
          { title: 'Interval DP & Burst Balloons', type: 'video', duration: '24 min' },
          { title: 'Lab: Unique Paths & Buy-Sell Stock Series', type: 'lab', duration: '50 min' },
        ],
        totalDuration: '1h 40min',
      },
      {
        module: 'Module 11: Backtracking & Tries',
        lessons: [
          { title: 'Backtracking Framework', type: 'video', duration: '22 min' },
          { title: 'Permutations, Combinations & N-Queens', type: 'video', duration: '26 min' },
          { title: 'Trie: Insert, Search & Prefix', type: 'video', duration: '20 min' },
          { title: 'Lab: Word Search II', type: 'lab', duration: '45 min' },
        ],
        totalDuration: '1h 53min',
      },
      {
        module: 'Module 12: Mock Interviews & Capstone',
        lessons: [
          { title: 'Interview Strategy & Problem Breakdown', type: 'reading', duration: '15 min' },
          { title: 'Mock Interview Session 1 (recorded)', type: 'video', duration: '45 min' },
          { title: 'Mock Interview Session 2 (recorded)', type: 'video', duration: '45 min' },
          { title: 'Final Assessment: 5 Mixed Problems', type: 'quiz', duration: '60 min' },
        ],
        totalDuration: '2h 45min',
      },
    ],
    faqs: [
      { q: 'What language are the examples in?', a: 'Python. All code snippets use Python 3 but we explain the logic so you can translate to Java, C++, or JavaScript.' },
      { q: 'Is this enough to crack FAANG interviews?', a: "It covers the core DSA curriculum used at top tech interviews. Pair it with consistent LeetCode practice for best results." },
      { q: 'What prerequisite knowledge do I need?', a: "Basic programming in any language (variables, loops, functions). If you're new to Python, take our Python Programming course first." },
      { q: 'How many practice problems are included?', a: '120+ curated problems with editorial solutions and video walkthroughs for each.' },
    ],
    related: ['python-programming', 'full-stack-web-development', 'sql-databases'],
  },

  {
    slug: 'full-stack-web-development',
    title: 'Full-Stack Web Development with React & Node.js',
    category: 'Web Development',
    categorySlug: 'development',
    level: 'Intermediate',
    weeks: 14,
    modulesCount: 16,
    rating: 4.7,
    reviewsCount: 7892,
    enrolledCount: 103400,
    description:
      'Build and deploy production-ready web applications from front to back. Master React 19, Node.js/Express, REST APIs, MySQL, JWT auth, and deploy to the cloud — all in one cohesive path.',
    badge: 'Rise Originals',
    trending: false,
    instructors: [
      { initials: 'SA', name: 'Siddharth Agarwal', role: 'Principal Engineer at Flipkart', color: '#2563eb' },
      { initials: 'NG', name: 'Nisha Gupta', role: 'React Core Contributor, 8 yrs experience', color: '#9333ea' },
      { initials: 'AK', name: 'Aarav Kumar', role: 'DevOps & Cloud Architect at TCS', color: '#0891b2' },
    ],
    learnOutcomes: [
      'Build responsive, accessible UIs with React 19 and hooks',
      'Manage global state with Context API and Zustand',
      'Design and build RESTful APIs with Node.js and Express',
      'Model and query relational data with MySQL and Sequelize ORM',
      'Implement JWT authentication and role-based access control',
      'Write integration tests with Supertest and Vitest',
      'Containerise apps with Docker and deploy to Render or Railway',
      'Apply CI/CD pipelines with GitHub Actions for automated deployments',
    ],
    skills: [
      'React 19', 'Node.js', 'Express', 'MySQL', 'REST APIs',
      'JWT', 'Docker', 'GitHub Actions', 'Vitest', 'Vite',
    ],
    syllabus: [
      {
        module: 'Module 1: HTML & CSS Mastery',
        lessons: [
          { title: 'Semantic HTML5 & Accessibility', type: 'video', duration: '22 min' },
          { title: 'Flexbox & CSS Grid in Depth', type: 'video', duration: '30 min' },
          { title: 'CSS Custom Properties & Animations', type: 'video', duration: '20 min' },
          { title: 'Lab: Build a Responsive Landing Page', type: 'lab', duration: '60 min' },
        ],
        totalDuration: '2h 12min',
      },
      {
        module: 'Module 2: JavaScript ES2024 Essentials',
        lessons: [
          { title: 'Closures, Scope & Hoisting', type: 'video', duration: '24 min' },
          { title: 'Promises, async/await & Error Handling', type: 'video', duration: '26 min' },
          { title: 'Modules, Destructuring & Spread', type: 'video', duration: '20 min' },
          { title: 'Lab: Build a Fetch-based Weather App', type: 'lab', duration: '45 min' },
        ],
        totalDuration: '1h 55min',
      },
      {
        module: 'Module 3: React Fundamentals',
        lessons: [
          { title: 'JSX, Components & Props', type: 'video', duration: '28 min' },
          { title: 'useState, useEffect & Event Handling', type: 'video', duration: '30 min' },
          { title: 'Lists, Keys & Conditional Rendering', type: 'video', duration: '18 min' },
          { title: 'Lab: Task Manager App', type: 'lab', duration: '50 min' },
          { title: 'Quiz: React Foundations', type: 'quiz', duration: '15 min' },
        ],
        totalDuration: '2h 21min',
      },
      {
        module: 'Module 4: Advanced React Patterns',
        lessons: [
          { title: 'useReducer, useContext & Custom Hooks', type: 'video', duration: '32 min' },
          { title: 'Performance: memo, useMemo, useCallback', type: 'video', duration: '26 min' },
          { title: 'React Router v7 & Nested Routes', type: 'video', duration: '24 min' },
          { title: 'Lab: Multi-page Blog SPA', type: 'lab', duration: '60 min' },
        ],
        totalDuration: '2h 22min',
      },
      {
        module: 'Module 5: Node.js & Express',
        lessons: [
          { title: 'Node.js Event Loop & Modules', type: 'video', duration: '22 min' },
          { title: 'Express: Routing, Middleware & Error Handling', type: 'video', duration: '30 min' },
          { title: 'Building a REST API', type: 'video', duration: '28 min' },
          { title: 'Lab: Blog API — CRUD Endpoints', type: 'lab', duration: '55 min' },
        ],
        totalDuration: '2h 15min',
      },
      {
        module: 'Module 6: MySQL & Data Modelling',
        lessons: [
          { title: 'Relational Modelling & Normalisation', type: 'video', duration: '24 min' },
          { title: 'SQL: Joins, Subqueries & Indexes', type: 'video', duration: '30 min' },
          { title: 'Sequelize ORM: Models, Migrations & Associations', type: 'video', duration: '26 min' },
          { title: 'Lab: Schema Design for an E-commerce App', type: 'lab', duration: '50 min' },
        ],
        totalDuration: '2h 10min',
      },
      {
        module: 'Module 7: Authentication & Security',
        lessons: [
          { title: 'Password Hashing with bcrypt', type: 'video', duration: '18 min' },
          { title: 'JWT: Signing, Verifying & Refresh Tokens', type: 'video', duration: '26 min' },
          { title: 'Role-Based Access Control', type: 'video', duration: '20 min' },
          { title: 'Lab: Auth System from Scratch', type: 'lab', duration: '60 min' },
        ],
        totalDuration: '2h 04min',
      },
      {
        module: 'Module 8–16: Capstone Project',
        lessons: [
          { title: 'Capstone Brief: SaaS Dashboard', type: 'reading', duration: '15 min' },
          { title: 'Planning, Wireframing & ERD', type: 'video', duration: '30 min' },
          { title: 'Build — Backend (weeks 1-2)', type: 'project', duration: '180 min' },
          { title: 'Build — Frontend (weeks 3-4)', type: 'project', duration: '180 min' },
          { title: 'Code Review & Peer Feedback', type: 'video', duration: '45 min' },
          { title: 'Final Assessment & Certificate', type: 'quiz', duration: '30 min' },
        ],
        totalDuration: '8h+',
      },
    ],
    faqs: [
      { q: 'Do I need to know HTML/CSS before starting?', a: 'Module 1 covers HTML & CSS from scratch, so complete beginners are welcome. If you already know the basics, you can move quickly through it.' },
      { q: 'Which database is used?', a: 'MySQL 8.0. The skills transfer to PostgreSQL and other relational databases.' },
      { q: 'Will I build real projects?', a: 'Yes. You build a Task Manager, a Blog SPA, an E-commerce app, and a full capstone SaaS Dashboard — all deployable to the web.' },
      { q: 'Is Docker required?', a: 'Docker is covered later but the earlier modules do not depend on it. You can install Docker Desktop for free.' },
    ],
    related: ['python-programming', 'data-structures-algorithms', 'sql-databases'],
  },

  {
    slug: 'sql-databases',
    title: 'SQL & Databases with MySQL',
    category: 'Databases',
    categorySlug: 'data',
    level: 'Beginner',
    weeks: 5,
    modulesCount: 7,
    rating: 4.6,
    reviewsCount: 4109,
    enrolledCount: 56700,
    description:
      'Learn to design, query, and optimise relational databases using MySQL. From basic SELECT statements to advanced indexing and stored procedures — the database skills every developer needs.',
    badge: 'Rise Originals',
    trending: false,
    instructors: [
      { initials: 'TM', name: 'Tanvi Mehta', role: 'Database Administrator, 10 yrs at Oracle India', color: '#dc2626' },
      { initials: 'KR', name: 'Karan Reddy', role: 'Data Platform Engineer at PhonePe', color: '#0891b2' },
    ],
    learnOutcomes: [
      'Write and optimise SELECT queries with WHERE, GROUP BY, and HAVING',
      'Use all JOIN types to combine data from multiple tables',
      'Design normalised schemas using 1NF, 2NF, and 3NF principles',
      'Enforce data integrity with constraints, foreign keys, and transactions',
      'Speed up queries using indexes and the EXPLAIN plan',
      'Write stored procedures, functions, and triggers in MySQL',
      'Back up and restore databases safely',
      'Connect MySQL to a Node.js or Python application',
    ],
    skills: [
      'MySQL 8.0', 'SQL', 'Schema Design', 'Indexing', 'Transactions',
      'Stored Procedures', 'Joins', 'Aggregation', 'Normalisation', 'Backup & Restore',
    ],
    syllabus: [
      {
        module: 'Module 1: Relational Model & Setup',
        lessons: [
          { title: 'What is a Relational Database?', type: 'video', duration: '14 min' },
          { title: 'Installing MySQL & Workbench', type: 'video', duration: '16 min' },
          { title: 'Your First Database & Table', type: 'video', duration: '20 min' },
          { title: 'Lab: Create a Library Database', type: 'lab', duration: '30 min' },
        ],
        totalDuration: '1h 20min',
      },
      {
        module: 'Module 2: Querying Data — SELECT',
        lessons: [
          { title: 'SELECT, WHERE & Filtering', type: 'video', duration: '22 min' },
          { title: 'Sorting, LIMIT & OFFSET', type: 'video', duration: '14 min' },
          { title: 'Aggregate Functions & GROUP BY', type: 'video', duration: '20 min' },
          { title: 'HAVING, Subqueries & Aliases', type: 'video', duration: '18 min' },
          { title: 'Lab: 25 Query Challenges', type: 'lab', duration: '45 min' },
          { title: 'Quiz: SELECT Mastery', type: 'quiz', duration: '10 min' },
        ],
        totalDuration: '2h 09min',
      },
      {
        module: 'Module 3: JOINs & Relationships',
        lessons: [
          { title: 'INNER, LEFT, RIGHT & FULL JOINs', type: 'video', duration: '28 min' },
          { title: 'Self-Joins & Cross Joins', type: 'video', duration: '16 min' },
          { title: 'Foreign Keys & Referential Integrity', type: 'video', duration: '18 min' },
          { title: 'Lab: E-commerce Query Challenges', type: 'lab', duration: '50 min' },
        ],
        totalDuration: '1h 52min',
      },
      {
        module: 'Module 4: Schema Design & Normalisation',
        lessons: [
          { title: '1NF, 2NF & 3NF with Examples', type: 'video', duration: '28 min' },
          { title: 'ER Diagrams & MySQL Workbench Modeller', type: 'video', duration: '22 min' },
          { title: 'Lab: Design a Hospital Management Schema', type: 'lab', duration: '50 min' },
          { title: 'Reading: When to Denormalise', type: 'reading', duration: '10 min' },
        ],
        totalDuration: '1h 50min',
      },
      {
        module: 'Module 5: Performance & Indexing',
        lessons: [
          { title: 'How MySQL Executes Queries', type: 'video', duration: '20 min' },
          { title: 'Creating & Using Indexes', type: 'video', duration: '22 min' },
          { title: 'EXPLAIN Plan & Query Optimisation', type: 'video', duration: '24 min' },
          { title: 'Lab: Optimise a Slow Query', type: 'lab', duration: '40 min' },
          { title: 'Quiz: Indexing & Performance', type: 'quiz', duration: '10 min' },
        ],
        totalDuration: '1h 56min',
      },
      {
        module: 'Module 6: Transactions, Procedures & Triggers',
        lessons: [
          { title: 'ACID Properties & Transactions', type: 'video', duration: '22 min' },
          { title: 'Stored Procedures & Functions', type: 'video', duration: '26 min' },
          { title: 'Triggers & Events', type: 'video', duration: '20 min' },
          { title: 'Lab: Inventory Management System', type: 'project', duration: '55 min' },
        ],
        totalDuration: '2h 03min',
      },
      {
        module: 'Module 7: Capstone & Real-World Integration',
        lessons: [
          { title: 'Backup, Restore & User Permissions', type: 'video', duration: '18 min' },
          { title: 'Connecting MySQL to Node.js with mysql2', type: 'video', duration: '24 min' },
          { title: 'Capstone: School Management Database', type: 'project', duration: '75 min' },
          { title: 'Final Assessment', type: 'quiz', duration: '15 min' },
        ],
        totalDuration: '2h 12min',
      },
    ],
    faqs: [
      { q: 'Which version of MySQL is used?', a: 'MySQL 8.0. The concepts apply to MySQL 5.7 and most other relational databases (PostgreSQL, SQLite, MariaDB).' },
      { q: 'Is MySQL Workbench required?', a: 'We use Workbench for visual schema design, but you can use DBeaver, TablePlus, or the command-line client.' },
      { q: 'Will I learn NoSQL as well?', a: 'This course focuses on relational databases. We offer a separate MongoDB & NoSQL course on Rise.' },
      { q: 'How is this course useful for developers?', a: "Every backend developer works with databases. You'll finish able to design schemas, write complex queries, and optimise slow APIs." },
    ],
    related: ['python-programming', 'data-structures-algorithms', 'full-stack-web-development'],
  },
];

export function getCourseBySlug(slug) {
  return COURSES.find((c) => c.slug === slug) ?? null;
}

export function getRelatedCourses(slugs) {
  return slugs.map((s) => COURSES.find((c) => c.slug === s)).filter(Boolean);
}
