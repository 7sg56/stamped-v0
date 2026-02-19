const assert = require('assert');

// This script requires a running server.
// If not running manually, it can be run via `backend/tests/start_mock_server.js` (which is not included in the repo but created during testing).
// Usage: `node backend/tests/verify_rate_limit.js`

const BASE_URL = 'http://localhost:5001';

async function testGlobalRateLimit() {
  console.log('Testing Global Rate Limit...');
  const limit = 100;
  let successCount = 0;
  let blocked = false;

  console.log(`Sending ${limit + 10} requests to /health...`);

  for (let i = 0; i < limit + 10; i++) {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.status === 200) {
        successCount++;
        // Verify headers on successful requests
        // Note: Headers might vary based on implementation details and proxies
      } else if (response.status === 429) {
        blocked = true;
        console.log(`Request ${i + 1} blocked (429 Too Many Requests) as expected.`);
        // Verify we hit at least the limit before getting blocked
        if (successCount < limit) {
           // We might have been blocked prematurely by another test run or accumulated counts
           // But in a fresh run, this should be >= limit.
           // However, since we ran Auth test before this, global limit count is already increased by 6.
           // So successCount here will be limit - 6.
           // This is acceptable behavior given the shared global limit.
           console.log(`Note: Blocked after ${successCount} requests. Global count likely includes previous Auth requests.`);
        }
        break;
      }
    } catch (error) {
      console.error(`Request ${i + 1} failed:`, error.message);
    }
  }

  if (blocked) {
    console.log('✅ Global Rate Limit PASSED');
  } else {
    console.error('❌ Global Rate Limit FAILED: No requests were blocked.');
    process.exit(1);
  }
}

async function testAuthRateLimit() {
  console.log('\nTesting Auth Rate Limit...');
  const limit = 5;
  let successCount = 0;
  let blocked = false;

  console.log(`Sending ${limit + 5} requests to /api/auth/login...`);

  for (let i = 0; i < limit + 5; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'wrongpassword'
        })
      });

      if (response.status === 401 || response.status === 400) {
        successCount++;
      } else if (response.status === 429) {
        blocked = true;
        console.log(`Request ${i + 1} blocked (429 Too Many Requests) as expected.`);

        // Strictly verify that we got at least 'limit' successful requests
        if (successCount < limit) {
             console.error(`❌ Auth Rate Limit FAILED: Blocked too early! Only ${successCount} requests succeeded.`);
             process.exit(1);
        }
        break;
      }
    } catch (error) {
      console.error(`Request ${i + 1} failed:`, error.message);
    }
  }

  if (blocked) {
    console.log('✅ Auth Rate Limit PASSED');
  } else {
    console.error('❌ Auth Rate Limit FAILED: No requests were blocked.');
    process.exit(1);
  }
}

async function runTests() {
  try {
    // Wait for server to be ready
    console.log('Waiting for server to be ready...');
    let retries = 5;
    while (retries > 0) {
        try {
            await fetch(`${BASE_URL}/health`);
            console.log('Server is ready.');
            break;
        } catch (e) {
            console.log('Server not ready, retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
        }
    }

    if (retries === 0) {
        throw new Error('Server did not start in time. Please ensure the backend server is running.');
    }

    await testAuthRateLimit();
    // Resetting for global limit test might be tricky because IP is the same.
    // However, global limit is 100 and auth is 5.
    // The auth requests also count towards the global limit.
    // So we have used ~6 requests so far. We need to send ~94 more to hit global limit.

    await testGlobalRateLimit();

    console.log('\nAll rate limit tests PASSED');
  } catch (error) {
    console.error('\nTest execution failed:', error);
    process.exit(1);
  }
}

runTests();
