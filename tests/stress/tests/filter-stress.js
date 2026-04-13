// Ariella Thirza Callista A0255876L
// Test was developed with the assistance of AI

import { filter, setup } from "../helpers/filter.js";
export { setup };

export const options = {
  stages: [
    { duration: '2m', target: 60 },  
    { duration: '3m', target: 60 },  

    { duration: '2m', target: 80 },  
    { duration: '3m', target: 80 }, 

    { duration: '2m', target: 100 }, 
    { duration: '3m', target: 100 }, 

    { duration: '2m', target: 120 }, 
    { duration: '3m', target: 120 }, 

    { duration: '2m', target: 150 }, 
    { duration: '5m', target: 150 }, 

    { duration: '5m', target: 0 },   // Recovery phase 
  ],

  thresholds: {
    http_req_failed:     ['rate<0.05'],
    filter_success_rate: ['rate>0.97'],
    filter_duration: ['p(95)<1500', 'p(99)<3000'],
  },
};

export default function (data) {
  filter(data)
}