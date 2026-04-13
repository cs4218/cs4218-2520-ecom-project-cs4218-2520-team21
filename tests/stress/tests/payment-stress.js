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
    { duration: '2m', target: 50 },
    { duration: '3m', target: 50 },  

    { duration: '2m', target: 100 },
    { duration: '3m', target: 100 }, 

    { duration: '2m', target: 150 },
    { duration: '3m', target: 150 },

    { duration: '2m', target: 200 }, 
    { duration: '3m', target: 200 },

    { duration: '5m', target: 0   }, // Recovery
  ],

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

