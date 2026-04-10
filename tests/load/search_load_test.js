// Paing Khant Kyaw, A0257992J
// Run on Windows (pwsh):
// $env:K6_WEB_DASHBOARD_PERIOD="1s"; $env:K6_WEB_DASHBOARD="true"; $env:K6_WEB_DASHBOARD_EXPORT="reports/search-load-report.html"; k6 run --summary-export=reports/search-load-summary.json tests/load/search_load_test.js

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:6060";
const TARGET_VUS = 300;

export const options = {
  scenarios: {
    search_load: {
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
    http_req_duration: ["p(95)<3000"],
  },
};

const SEARCH_KEYWORDS = [
  "book",
  "laptop",
  "phone",
  "shirt",
  "novel",
  "textbook",
  "contract",
  "computer",
  "tshirt",
  "smartphone",
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function () {
  const keyword = SEARCH_KEYWORDS[randomInt(0, SEARCH_KEYWORDS.length - 1)];
  const res = http.get(
    `${BASE_URL}/api/v1/product/search/${encodeURIComponent(keyword)}`,
    {
      timeout: "30s",
    },
  );

  check(res, {
    "search endpoint returns 200": (r) => r.status === 200,
  });

  sleep(5);
}
