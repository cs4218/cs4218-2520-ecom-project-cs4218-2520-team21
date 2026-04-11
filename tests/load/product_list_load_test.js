// Paing Khant Kyaw, A0257992J
// Run on Windows (pwsh):
// $env:K6_WEB_DASHBOARD_PERIOD="1s"; $env:K6_WEB_DASHBOARD="true"; $env:K6_WEB_DASHBOARD_EXPORT="reports/product-list-load-report.html"; k6 run --summary-export=reports/product-list-load-summary.json tests/load/product_list_load_test.js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:6060";
const TARGET_VUS = 50;

export const options = {
  scenarios: {
    product_list_load: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "5m", target: TARGET_VUS },
        { duration: "20m", target: TARGET_VUS },
        { duration: "5m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.2"],
  },
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function () {
  const page = randomInt(1, 5);
  const res = http.get(`${BASE_URL}/api/v1/product/product-list/${page}`);

  check(res, {
    "product list endpoint returns 200": (r) => r.status === 200,
  });

  sleep(5);
}
