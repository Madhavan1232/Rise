// scripts/test_email_template.js
// Root runner that forwards execution to server/scripts/test_email_template.js
const path = require('path');

// Execute server script
require(path.join(__dirname, '..', 'server', 'scripts', 'test_email_template.js'));
