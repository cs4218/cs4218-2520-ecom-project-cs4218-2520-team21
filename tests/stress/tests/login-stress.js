// Ariella Thirza Callista A0255876L
// Test was developed with the assistance of AI
/**
 *
 * Uses a pre-seeded pool of 200 test users via SharedArray so
 * each VU uses a unique account — avoids DB caching skew and
 * per-account rate limiting.
 *
 * PREREQUISITES:
 *   1. Run seed script first (from project root dir):
 *      node tests/stress/helpers/seed-test-users.js
 *   2. Ensure test.users.json is in helpers dir
 *
 * CLEANUP:
 *  node tests/stress/helpers/delete-test-users.js
 * 
 */

import { login } from '../helpers/login.js';

export const options = {
  // v4
  stages: [
    { duration: '2m',  target: 100 },  // Baseline (Your Signup limit)
    { duration: '3m',  target: 100 },  

    { duration: '2m',  target: 200 },  // First real test of Login capacity
    { duration: '5m',  target: 200 },  

    { duration: '2m',  target: 300 },  // Likely the "Danger Zone"
    { duration: '5m',  target: 300 },

    { duration: '2m',  target: 400 },  // Extreme Peak
    { duration: '5m',  target: 400 },

    { duration: '5m',  target: 0   },  // Recovery
  ],
  // // v3
  // stages: [
  //   { duration: '3m',  target: 50  },  // warm-up
  //   { duration: '3m',  target: 300 },  // ramp up
  //   { duration: '10m', target: 300 },  // sustain at 150
  //   { duration: '3m',  target: 400 },  // ramp up to peak
  //   { duration: '10m', target: 400 },  // sustain at peak
  //   { duration: '3m',  target: 600 },  // ramp up to peak
  //   { duration: '10m', target: 600 },  // sustain at peak
  //   { duration: '5m',  target: 0   },  // recovery
  // ],

  thresholds: {
    http_req_failed:     ['rate<0.05'],
    login_success_rate: ['rate>0.98'],
    login_duration:     ['p(95)<1500', 'p(99)<3000'],
  },
};

export default function () {
  login()
}