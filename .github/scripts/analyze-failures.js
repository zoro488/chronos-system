const fs = require('fs');

const testResultsPath = process.argv[2] || 'test-results.json';
const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));

const failures = testResults.testResults
  .flatMap(suite =>
    suite.assertionResults
      .filter(test => test.status === 'failed')
      .map(test => ({
        suite: suite.name,
        test: test.title,
        error: test.failureMessages.join('\n')
      }))
  );

console.log(JSON.stringify(failures, null, 2));
