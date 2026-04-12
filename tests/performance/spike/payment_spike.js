//  Dhruvi Ketan Rathod A0259297J
// Test was developed with the assistance of AI

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s',  target: 20 },   
    { duration: '5s',  target: 300 },  
    { duration: '10s', target: 300 },
    { duration: '5s',  target: 20 }, 
    { duration: '20s',  target: 20 } 
  ],
  thresholds: {
    'http_req_failed': ['rate<0.05'],    
    'http_req_duration': ['p(95)<4000'],
  },
};

export default function () {
  const BASE_URL = 'http://localhost:6060/api/v1';


  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'cs4218@test.com',
    password: 'cs4218@test.com',
  }), { headers: { 'Content-Type': 'application/json' } });

  const token = loginRes.json('token'); 

  
  const paymentPayload = JSON.stringify({
    nonce: "fake-valid-nonce",
    cart: [{ _id: "66db427fdb0119d9234b27ed", price: 100 }],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token, 
    },
  };

  const res = http.post(`${BASE_URL}/product/braintree/payment`, paymentPayload, params);

  check(res, {
    'payment successful': (r) => r.status === 200,
  });

  sleep(1);
}