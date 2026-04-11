//  Dhruvi Ketan Rathod A0259297J
// Test was developed with the assistance of AI

import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '5s',  target: 20 }, 
    { duration: '3s',  target: 400 }, 
    { duration: '10s', target: 400 }, 
    { duration: '5s',  target: 20 },  
    { duration: '20s', target: 20 }  
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'],
    'http_req_failed': ['rate<0.02'], 
  },
};

export default function () {
  let responses = http.batch([
    ['GET', "http://localhost:6060/api/v1/category/get-category"],
    ['GET', "http://localhost:6060/api/v1/product/product-count"],
    ['GET', "http://localhost:6060/api/v1/product/product-list/1"],
  ]);

  
  check(responses, {
    'Categories API works': (res) => res[0].status === 200,
    'Product Count API works': (res) => res[1].status === 200,
    'Product List API works': (res) => res[2].status === 200,
  });

  sleep(1); 
}