// Paing Khant Kyaw, A0257992J
// Windows (pwsh):
// $env:K6_WEB_DASHBOARD_PERIOD="1s"; $env:K6_WEB_DASHBOARD="true"; $env:K6_WEB_DASHBOARD_EXPORT="reports/braintree-token-load-report.html"; k6 run --summary-export=reports/braintree-token-load-summary.json tests/load/braintree_token_load_test.js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:6060";
const TARGET_VUS = 150;

export const options = {
  scenarios: {
    braintree_token_load: {
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
    http_req_duration: ["p(95)<2500"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/product/braintree/token`, {
    timeout: "30s",
  });

  check(res, {
    "token endpoint status is 200": (r) => r.status === 200,
    "token exists in body": (r) => {
      const body = r.json();
      return (
        typeof body?.clientToken === "string" && body.clientToken.length > 0
      );
    },
  });

  sleep(5);
}
