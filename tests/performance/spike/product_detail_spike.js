//  Dhruvi Ketan Rathod A0259297J
// Test was developed with the assistance of AI

import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '5s',  target: 20 },  
    { duration: '3s',  target: 300 }, 
    { duration: '10s', target: 300 }, 
    { duration: '5s',  target: 20 },
    { duration: '10s',  target: 20 }  
  ],
   thresholds: {
    'http_req_failed': ['rate<0.05'],   
    'http_req_duration': ['p(95)<2000'],
  },
};

export default function () {
  const BASE_URL = 'http://localhost:6060/api/v1';
  

  const slug = 'smartphone'; 


  let res = http.get(`${BASE_URL}/product/get-product/${slug}`);

  check(res, {
    'product details loaded': (r) => r.status === 200,
    'correct product returned': (r) => r.json('product.slug') === slug,
  });

  const productId = "66db427fdb0119d9234b27f5";
  http.get(`${BASE_URL}/product/product-photo/${productId}`);

  sleep(1);
}