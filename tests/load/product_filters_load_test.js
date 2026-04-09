// Paing Khant Kyaw, A0257992J
// Run on Windows (cmd): set K6_WEB_DASHBOARD_PERIOD=1s && set K6_WEB_DASHBOARD=true && k6 run tests/load/product_filters_load_test.js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:6060";

export const options = {
  scenarios: {
    product_filters_load: {
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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function setup() {
  const categoryRes = http.get(`${BASE_URL}/api/v1/category/get-category`);
  if (categoryRes.status !== 200) {
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

export default function (data) {
  const categoryIds = Array.isArray(data?.categoryIds) ? data.categoryIds : [];
  if (categoryIds.length === 0) {
    sleep(5);
    return;
  }

  const pickedId = categoryIds[randomInt(0, categoryIds.length - 1)];
  const res = http.post(
    `${BASE_URL}/api/v1/product/product-filters`,
    JSON.stringify({ checked: [pickedId], radio: [] }),
    { headers: { "Content-Type": "application/json" } },
  );

  check(res, {
    "product filters endpoint returns 200": (r) => r.status === 200,
  });

  sleep(5);
}
