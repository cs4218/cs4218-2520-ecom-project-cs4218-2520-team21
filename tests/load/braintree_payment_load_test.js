// Paing Khant Kyaw, A0257992J
// $env:K6_WEB_DASHBOARD_PERIOD="1s"; $env:K6_WEB_DASHBOARD="true"; $env:K6_WEB_DASHBOARD_EXPORT="reports/braintree-payment-load-report.html"; k6 run --summary-export=reports/braintree-payment-load-summary.json tests/load/braintree_payment_load_test.js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:6060";
const TARGET_VUS = 10;
const AUTH_TOKEN = __ENV.AUTH_TOKEN || "";
const TEST_EMAIL = "testing@gmail.com";
const TEST_PASSWORD = "1234qwer";
const PAYMENT_NONCE = __ENV.PAYMENT_NONCE || "fake-valid-nonce";

export const options = {
  scenarios: {
    braintree_payment_load: {
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
    http_req_failed: ["rate<0.3"],
    http_req_duration: ["p(95)<5000"],
  },
};

function resolveAuthToken() {
  if (AUTH_TOKEN) return AUTH_TOKEN;
  if (!TEST_EMAIL || !TEST_PASSWORD) return "";

  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    {
      headers: { "Content-Type": "application/json" },
      timeout: "30s",
    },
  );

  if (loginRes.status !== 200) return "";
  const body = loginRes.json();
  return typeof body?.token === "string" ? body.token : "";
}

function buildCartPayload() {
  const productRes = http.get(`${BASE_URL}/api/v1/product/get-product`, {
    timeout: "30s",
  });
  if (productRes.status !== 200) return [];

  const body = productRes.json();
  const products = Array.isArray(body?.products) ? body.products : [];
  return products.slice(0, 2).map((p) => ({
    _id: p._id,
    name: p.name,
    price: Number(p.price) || 0,
  }));
}

export function setup() {
  const token = resolveAuthToken();
  const cart = buildCartPayload();

  return { token, cart };
}

export default function (data) {
  if (!data?.token || !Array.isArray(data?.cart) || data.cart.length === 0) {
    sleep(2);
    return;
  }

  const res = http.post(
    `${BASE_URL}/api/v1/product/braintree/payment`,
    JSON.stringify({
      nonce: PAYMENT_NONCE,
      cart: data.cart,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        authorization: data.token,
      },
      timeout: "30s",
    },
  );

  check(res, {
    "payment endpoint returns success": (r) => r.status === 200,
    "payment response has ok=true": (r) => {
      const body = r.json();
      return body?.ok === true;
    },
  });

  sleep(5);
}
