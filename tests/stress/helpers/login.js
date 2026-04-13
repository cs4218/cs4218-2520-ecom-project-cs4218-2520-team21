// Ariella Thirza Callista A0255876L
// Test was developed with the assistance of AI

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL       = 'http://localhost:6060';
const LOGIN_ENDPOINT = '/api/v1/auth/login';

// Loaded once, shared across all VUs — each VU gets a unique user
const users = new SharedArray('users', function () {
  return JSON.parse(open('../helpers/test.users.json'));
});

const loginSuccessRate = new Rate('login_success_rate');
const loginDuration    = new Trend('login_duration', true);
const loginErrors      = new Counter('login_errors');

// login

export function login () {
  // Each VU consistently uses the same unique user across iterations
  const user = users[(__VU - 1) % users.length];

  group('User Login', () => {
    const res = http.post(
      `${BASE_URL}${LOGIN_ENDPOINT}`,
      JSON.stringify({ email: user.email, password: user.password }),
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: '10s',
      },
    );

    loginDuration.add(res.timings.duration);

    const success = check(res, {
      'login: status is 200':   (r) => r.status === 200,
      'login: success is true': (r) => {
        try { return r.json().success === true; } catch (_) { return false; }
      },
      'login: token present':   (r) => {
        try { return typeof r.json().token === 'string'; } catch (_) { return false; }
      },
    });

    loginSuccessRate.add(success);
    if (!success) {
      loginErrors.add(1);
      console.warn(`[login] FAILED — email=${user.email} status=${res.status} body=${res.body?.substring(0, 200)}`);
    }

    // Simulate user think time after logging in
    sleep(randomIntBetween(1, 3));
  });
}