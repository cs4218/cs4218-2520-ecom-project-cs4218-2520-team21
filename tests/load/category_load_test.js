// Paing Khant Kyaw, A0257992J
// Run on Windows (pwsh):
// $env:K6_WEB_DASHBOARD_PERIOD="1s"; $env:K6_WEB_DASHBOARD="true"; $env:K6_WEB_DASHBOARD_EXPORT="reports/category-load-report.html"; k6 run --summary-export=reports/category-load-summary.json tests/load/category_load_test.js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:6060";
const TARGET_VUS = 300;

export const options = {
  scenarios: {
    category_load: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "10m", target: TARGET_VUS },
        { duration: "20m", target: TARGET_VUS },
        { duration: "10m", target: 0 },
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
