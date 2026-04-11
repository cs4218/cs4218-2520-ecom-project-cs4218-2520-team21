//  Dhruvi Ketan Rathod A0259297J
// Test was developed with the assistance of AI

import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const users = new SharedArray('users', function () {
  return JSON.parse(open('test.users.json'));
});

export const options = {
  stages: [
    { duration: '5s',  target: 20 },  
    { duration: '5s',  target: 400 },
    { duration: '10s', target: 400 }, 
    { duration: '10s',  target: 20 }, 
    { duration: '30s', target: 20 }
  ],
  thresholds: {
    'http_req_failed': ['rate<0.05'],    
    'http_req_duration': ['p(95)<3000'], 
  },
};

export default function () {
  const user = users[__VU % users.length];

  const url = 'http://localhost:6060/api/v1/auth/login';
  const payload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'login success': (r) => r.json().success === true,
    'token generated': (r) => r.json().token !== undefined,
  });

  sleep(1);
}

