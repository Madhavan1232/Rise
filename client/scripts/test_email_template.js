// client/scripts/test_email_template.js
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require(join(__dirname, '..', '..', 'server', 'scripts', 'test_email_template.js'));
