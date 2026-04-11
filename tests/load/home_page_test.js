// Paing Khat Kyaw, A0257992J
// command to test (windows):
// $env:K6_WEB_DASHBOARD_PERIOD="1s"; $env:K6_WEB_DASHBOARD="true"; $env:K6_WEB_DASHBOARD_EXPORT="reports/home-page-load-report.html"; k6 run --summary-export=reports/home-page-load-summary.json tests/load/home_page_test.js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:6060";
const TARGET_VUS = 50;

export const options = {
  scenarios: {
    stepped_home_page_load: {
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

export function setup() {
  const categoryRes = http.get(`${BASE_URL}/api/v1/category/get-category`);

  const ok = check(categoryRes, {
    "category endpoint returns 200": (r) => r.status === 200,
  });

  if (!ok) {
    return { categoryIds: [] };
  }

  const body = categoryRes.json();
  const categoryIds = Array.isArray(body?.category)
    ? body.category
        .map((item) => item?._id)
        .filter((id) => typeof id === "string" && id.length > 0)
    : [];

  return { categoryIds };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function (data) {
  const categoryIds = Array.isArray(data?.categoryIds) ? data.categoryIds : [];
  const doFilter = Math.random() < 0.75;

  if (doFilter && categoryIds.length > 0) {
    const pickedId = categoryIds[randomInt(0, categoryIds.length - 1)];

    const filterRes = http.post(
      `${BASE_URL}/api/v1/product/product-filters`,
      JSON.stringify({
        checked: [pickedId],
        radio: [],
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    check(filterRes, {
      "filter endpoint returns success status": (r) => r.status === 200,
    });
  } else {
    const page = randomInt(1, 5);
    const listRes = http.get(`${BASE_URL}/api/v1/product/product-list/${page}`);

    check(listRes, {
      "product list endpoint returns success status": (r) => r.status === 200,
    });
  }

  sleep(5);
}
