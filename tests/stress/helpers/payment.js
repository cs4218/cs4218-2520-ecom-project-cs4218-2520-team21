// Ariella Thirza Callista A0255876L
// Test was developed with the assistance of AI

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL      = 'http://localhost:6060';
const PAYMENT_NONCE = 'fake-valid-nonce'; // Braintree sandbox test nonce

const TEST_USER = {
  email: 'cs4218@test.com',
  password: 'cs4218@test.com',
};

const ENDPOINTS = {
  login: '/api/v1/auth/login',
  token: '/api/v1/product/braintree/token',
  products: '/api/v1/product/get-product',
  payment: '/api/v1/product/braintree/payment',
};

const paymentSuccessRate = new Rate('payment_success_rate');
const paymentDuration = new Trend('payment_duration', true);
const paymentErrors = new Counter('payment_errors');

// Setup 
// Runs once before any VU starts and its return value is passed as data to every VU
// Logs in and fetches products so VUs don't repeat this per iteration.
// All VUs share the same token and cart — realistic for a single test user.

export function setup() {
  // Step 1: Log in
  const loginRes = http.post(
    `${BASE_URL}${ENDPOINTS.login}`,
    JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password }),
    { headers: { 'Content-Type': 'application/json' }, timeout: '30s' },
  );

  const loginOk = check(loginRes, {
    'setup: login status 200': (r) => r.status === 200,
    'setup: token present':    (r) => {
      try { return typeof r.json().token === 'string'; } catch (_) { return false; }
    },
  });

  if (!loginOk) {
    console.error(`[setup] Login failed — status=${loginRes.status} body=${loginRes.body?.substring(0, 200)}`);
    return { token: null, cart: [] };
  }

  const token = loginRes.json().token;
  console.log('[setup] Login successful');

  // Step 2: Fetch products to build a cart
  const productRes = http.get(
    `${BASE_URL}${ENDPOINTS.products}`,
    { timeout: '30s' },
  );

  let cart = [];
  try {
    const products = productRes.json()?.products || [];
    // Take up to 2 products to simulate a realistic cart
    cart = products.slice(0, 2).map((p) => ({
      _id:   p._id,
      name:  p.name,
      price: Number(p.price) || 0,
    }));
  } catch (e) {
    console.error(`[setup] Failed to parse products: ${e}`);
  }

  if (cart.length === 0) {
    console.warn('[setup] No products found — cart will be empty. Seed products first.');
  } else {
    console.log(`[setup] Cart built with ${cart.length} product(s)`);
  }

  return { token, cart };
}

export function payment (data) {
  const { token, cart } = data;

  // Skip iteration if setup failed
  if (!token || cart.length === 0) {
    console.warn('[payment] Skipping — no token or empty cart from setup');
    sleep(5);
    return;
  }

  const authHeader = { 'Content-Type': 'application/json', authorization: token };

  group('Checkout and Payment', () => {

    // Step 1: Fetch Braintree client token 
    // Mirrors what the frontend does when the cart page loads
    const tokenRes = http.get(
      `${BASE_URL}${ENDPOINTS.token}`,
      { headers: { authorization: token }, timeout: '15s' },
    );

    const tokenOk = check(tokenRes, {
      'payment: braintree token status 200':    (r) => r.status === 200,
      'payment: clientToken present':           (r) => {
        try { return typeof r.json().clientToken === 'string'; } catch (_) { return false; }
      },
    });

    if (!tokenOk) {
      console.warn(`[payment] Failed to get Braintree token — status=${tokenRes.status}`);
      paymentErrors.add(1);
      paymentSuccessRate.add(false);
      return;
    }

    // Simulate user reviewing cart before paying (2–5 seconds)
    sleep(randomIntBetween(2, 5));

    // Step 2: Submit payment 
    const paymentRes = http.post(
      `${BASE_URL}${ENDPOINTS.payment}`,
      JSON.stringify({ nonce: PAYMENT_NONCE, cart }),
      { headers: authHeader, timeout: '30s' },
    );

    paymentDuration.add(paymentRes.timings.duration);

    const success = check(paymentRes, {
      'payment: status 200':       (r) => r.status === 200,
      'payment: ok is true':       (r) => {
        try { return r.json().ok === true; } catch (_) { return false; }
      },
    });

    paymentSuccessRate.add(success);

    if (!success) {
      paymentErrors.add(1);
      console.warn(`[payment] FAILED — status=${paymentRes.status} body=${paymentRes.body?.substring(0, 200)}`);
      console.log(`Response Body: ${paymentRes.body}`);

    }
    // Simulate user being redirected to orders page after payment
    sleep(randomIntBetween(1, 3));
  });
}