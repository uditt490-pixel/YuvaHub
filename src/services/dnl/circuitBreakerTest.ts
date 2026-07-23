import { DNLDispatcher } from './scheduler';
import { DevpostAdapter } from './adapters/DevpostAdapter';

async function testCircuitBreaker() {
  console.log('--- Circuit Breaker Manual Test ---');
  
  // We don't need a real DB connection for this test as the HTTP fetch happens before DB insertion
  const mockDb = { collection: () => ({ insertOne: () => {}, find: () => ({ toArray: () => [] }) }) };
  const dispatcher = new DNLDispatcher(mockDb);
  const adapter = new DevpostAdapter();
  
  dispatcher.registerAdapter(adapter);

  // An endpoint that is guaranteed to fail or refuse connection
  const badUrl = 'http://localhost:9999/refused-endpoint';

  console.log(`Starting repeated requests to a failing endpoint: ${badUrl}\n`);

  for (let i = 1; i <= 6; i++) {
    console.log(`\nAttempt ${i}:`);
    
    // We intentionally ignore errors in the test script loop
    await dispatcher.runScrape(adapter, badUrl).catch(() => {});
    
    // Small delay between requests
    await new Promise(res => setTimeout(res, 500));
  }
  
  console.log('\nNotice how after consecutive failures, the CircuitBreaker logs that it is OPEN.');
  console.log('Subsequent requests in this state will instantly use the fallback without waiting for the fetch timeout.');
}

testCircuitBreaker().catch(console.error);
