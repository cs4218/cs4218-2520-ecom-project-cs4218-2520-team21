// Paing Khant Kyaw, A0257992J
// Run on Windows (cmd): set K6_WEB_DASHBOARD_PERIOD=1s && set K6_WEB_DASHBOARD=true && k6 run tests/load/category_load_test.js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:6060";

export const options = {
  scenarios: {
    category_load: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "2m", target: 200 },
        { duration: "5m", target: 200 },
        { duration: "2m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.2"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/category/get-category`);

  check(res, {
    "category endpoint returns 200": (r) => r.status === 200,
  });

  sleep(5);
}
