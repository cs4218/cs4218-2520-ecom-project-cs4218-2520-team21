// Ariella Thirza Callista A0255876L
// Test was developed with the assistance of AI
/**
 *
 * CLEANUP:
 *  node tests/stress/helpers/delete-test-orders.js
 * 
 */


import { payment, setup } from '../helpers/payment.js'

export { setup }

export const options = {
  // v4
  stages: [
    { duration: '2m', target: 50 },  // Baseline: Warm up the payment gateway
    { duration: '3m', target: 50 },  

    { duration: '2m', target: 100 }, // The "Signup" breaking point
    { duration: '3m', target: 100 }, 

    { duration: '2m', target: 150 }, // Critical Zone: Watch for latency spikes here
    { duration: '3m', target: 150 },

    { duration: '2m', target: 200 }, // Likely "Max" stress for this infrastructure
    { duration: '3m', target: 200 },

    { duration: '5m', target: 0   }, // Recovery: Can it clear the order queue?
  ],
  // ver 3 (higher vu count)
  // stages: [
  //   { duration: '3m',  target: 30 },  // Quick ramp to your previous "safe" max
  //   { duration: '5m',  target: 30 },  // Hold to establish a baseline
    
  //   { duration: '5m',  target: 60 },  // Ramp to 60 VUs (2x your previous test)
  //   { duration: '10m', target: 60 },  // HOLD: Look for "The Elbow" in latency
    
  //   { duration: '5m',  target: 100 }, // Ramp to 100 VUs (The "Breaking Point" attempt)
  //   { duration: '10m', target: 100 }, // HOLD: This is where we expect failures
    
  //   { duration: '5m',  target: 0 },   // Recovery: Can it self-heal?
  // ],
  // ver 2
  // stages: [
  //   { duration: '2m',  target: 10 }, // Ramp to 10
  //   { duration: '5m',  target: 10 }, // HOLD at 10 (Warm-up stability)
    
  //   { duration: '3m',  target: 20 }, // Ramp to 20
  //   { duration: '10m', target: 20 }, // HOLD at 20 (Sustain 2x load)
    
  //   { duration: '3m',  target: 30 }, // Ramp to 40
  //   { duration: '10m', target: 30 }, // HOLD at 40 (Sustain 4x load - The Stressor)
    
  //   { duration: '5m',  target: 0  }, // Recovery
  // ],
  thresholds: {
    http_req_failed:     ['rate<0.05'],
    payment_success_rate: ['rate>0.95'],
    // Payment involves an external sandbox API call so allow higher latency
    payment_duration:    ['p(95)<8000', 'p(99)<15000'],
  },
};


export default function(data) {
  payment(data)
}

