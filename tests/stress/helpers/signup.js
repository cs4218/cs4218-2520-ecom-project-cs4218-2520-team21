// Ariella Thirza Callista A0255876L
// Test was developed with the assistance of AI

/**
 * Each iteration registers a unique user. Run the cleanup
 * script after testing to remove all seeded accounts.
 *
 * CLEANUP:
 *  node tests/stress/helpers/delete-test-signups.js
 * 
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL        = 'http://localhost:6060';
const SIGNUP_ENDPOINT = '/api/v1/auth/register';

const signupSuccessRate = new Rate('signup_success_rate');
const signupDuration = new Trend('signup_duration', true);
const signupErrors = new Counter('signup_errors');

function uniqueEmail() {
  return `k6_${randomString(8)}_${Date.now()}@loadtest.invalid`;
}

export function signup () {
  group('User Sign-Up', () => {
    const payload = JSON.stringify({
      name: `LoadTest User ${randomString(4)}`,
      email: uniqueEmail(),
      password: 'Password123!',
      phone: `+65${randomIntBetween(80000000, 99999999)}`,
      address: '123 Load Test Street, Singapore',
      DOB: '1990-01-01',
      answer: 'loadtest',
    });

    const res = http.post(
      `${BASE_URL}${SIGNUP_ENDPOINT}`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: '10s',
      },
    );

    signupDuration.add(res.timings.duration);

    const success = check(res, {
      'signup: status is 201': (r) => r.status === 201,
      'signup: success is true': (r) => {
        try { return r.json().success === true; } catch (_) { return false; }
      },
      'signup: response has user data': (r) => {
        try { return r.json().user !== undefined; } catch (_) { return false; }
      },
    });

    signupSuccessRate.add(success);
    if (!success) {
      signupErrors.add(1);
      console.warn(`[signup] FAILED — status=${res.status} body=${res.body?.substring(0, 200)}`);
    }

    sleep(randomIntBetween(1, 3));
  });
}