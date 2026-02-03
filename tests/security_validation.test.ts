
import { POST } from '../src/app/api/calculate/route';
import { NextRequest } from 'next/server';

// To run this test:
// NEXT_PUBLIC_MAPBOX_TOKEN=pk.fake_token npx tsx tests/security_validation.test.ts

// Mock process.env
// Note: This must be set before running the script if imports rely on it.
// See command above.

async function test() {
  console.log("Running security validation test...");

  // Case 1: Input too long
  const longString = 'A'.repeat(500);
  const req1 = new NextRequest('http://localhost/api/calculate', {
    method: 'POST',
    body: JSON.stringify({
      startAddress: longString,
      endAddress: 'Cochem',
      pickupTime: '12:00',
    }),
  });

  try {
    const res1 = await POST(req1);
    const data1 = await res1.json();
    console.log("Test 1 (Long Input) Result:", data1);
    if (data1.message && data1.message.includes("too long")) {
        console.log("✅ Test 1 Passed: Input rejected as too long.");
    } else {
        console.log("❌ Test 1 Failed: Unexpected message.");
    }
  } catch (e) {
    console.log("❌ Test 1 Exception:", e);
  }

  // Case 2: Invalid Time
  const req2 = new NextRequest('http://localhost/api/calculate', {
    method: 'POST',
    body: JSON.stringify({
      startAddress: 'Cochem',
      endAddress: 'Berlin',
      pickupTime: '25:00',
    }),
  });

  try {
    const res2 = await POST(req2);
    const data2 = await res2.json();
    console.log("Test 2 (Invalid Time) Result:", data2);
    if (data2.message && data2.message.includes("Invalid time")) {
        console.log("✅ Test 2 Passed: Input rejected as invalid time.");
    } else {
        console.log("❌ Test 2 Failed: Unexpected message.");
    }
  } catch (e) {
    console.log("❌ Test 2 Exception:", e);
  }

  // Case 3: Origin Validation
  try {
      // Create a request with a malicious Origin
      const req3 = new NextRequest('http://localhost/api/calculate', {
          method: 'POST',
          headers: {
              'origin': 'http://evil.com',
              'content-type': 'application/json'
          },
          body: JSON.stringify({
              startAddress: 'Cochem',
              endAddress: 'Berlin',
              pickupTime: '12:00'
          })
      });

      const res3 = await POST(req3);
      if (res3.status === 403) {
           console.log("✅ Test 3 Passed: Origin check blocked invalid origin.");
      } else {
           const data = await res3.json();
           console.log("❌ Test 3 Failed: Expected 403, got", res3.status, data);
      }
  } catch (e) {
      // In the current broken environment, this might catch the mapbox crash
      console.log("❌ Test 3 Exception:", e);
  }

  // Case 4: Valid Origin
  try {
      const req4 = new NextRequest('http://localhost/api/calculate', {
          method: 'POST',
          headers: {
              'origin': 'http://localhost', // Matches request URL origin
              'content-type': 'application/json'
          },
          body: JSON.stringify({
              startAddress: 'Cochem',
              endAddress: 'Berlin',
              pickupTime: '12:00'
          })
      });

      const res4 = await POST(req4);
      if (res4.status !== 403) {
           console.log("✅ Test 4 Passed: Valid origin allowed.");
      } else {
           console.log("❌ Test 4 Failed: Valid origin blocked.");
      }
  } catch (e) {
      console.log("❌ Test 4 Exception:", e);
  }
}

test();
