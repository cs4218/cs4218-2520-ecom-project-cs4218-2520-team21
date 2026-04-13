// Ariella Thirza Callista A0255876L
// Test was developed with the assistance of AI

/**
 *
 * CLEANUP:
 *  node tests/stress/helpers/delete-test-signups.js
 * 
 */


import { signup } from '../helpers/signup.js'

export const options = {
  stages: [
    { duration: '2m', target: 50 }, 
    { duration: '3m', target: 50 },  

    { duration: '2m', target: 100 }, 
    { duration: '3m', target: 100 }, 

    { duration: '2m', target: 200 }, 
    { duration: '3m', target: 200 }, 

    { duration: '2m', target: 400 }, 
    { duration: '5m', target: 400 }, 

    { duration: '5m', target: 0 },   
  ],
  
  thresholds: {
    http_req_failed:     ['rate<0.05'],
    signup_success_rate: ['rate>0.95'],
    signup_duration:     ['p(95)<3000', 'p(99)<5000'],
  },
};

export default function() {
  signup()
}