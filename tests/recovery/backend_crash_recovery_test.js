// Paing Khat Kyaw, A0257992J
// Should be tested after running pm2 server in the background to work
// npm run pm2:server
// command to test (windows): set K6_WEB_DASHBOARD_PERIOD=1s && set K6_WEB_DASHBOARD=true && k6 run tests/recovery/backend_crash_recovery_test.js
// $env:K6_WEB_DASHBOARD_PERIOD="1s"; $env:K6_WEB_DASHBOARD="true"; $env:K6_WEB_DASHBOARD_EXPORT="reports/backend-crash-recovery-report.html"; k6 run --summary-export=reports/backend-crash-recovery-summary.json tests/recovery/backend_crash_recovery_test.js

import http from "k6/http";
import { check, sleep } from "k6";
import exec from "k6/execution";

const BASE_URL = "http://localhost:6060";
const CRASH_TOKEN = "recover-test-token";
const CRASH_SCHEDULE_MS = [300000, 720000, 1200000];

const triggeredCrashes = new Set();

export const options = {
  scenarios: {
    recovery: {
      executor: "constant-vus",
      vus: 100,
      duration: "30m",
    },
  },
  stages: undefined,
  thresholds: {
    http_req_failed: ["rate<0.5"],
  },
};

export function setup() {
  return {
    crashTriggered: false,
    crashStatus: null,
    crashBody: null,
  };
}

function maybeTriggerScheduledCrash() {
  if (__VU !== 1) return;

  const elapsedMs = exec.instance.currentTestRunDuration;

  for (const scheduleMs of CRASH_SCHEDULE_MS) {
    if (elapsedMs >= scheduleMs && !triggeredCrashes.has(scheduleMs)) {
      const crashRes = http.post(`${BASE_URL}/test/crash`, null, {
        headers: {
          "x-crash-token": CRASH_TOKEN,
        },
      });

      triggeredCrashes.add(scheduleMs);
      console.log(
        `Scheduled crash at ${Math.round(
          scheduleMs / 1000,
        )}s -> status ${crashRes.status}`,
      );
    }
  }
}

export default function () {
  maybeTriggerScheduledCrash();

  const res = http.get(`${BASE_URL}/`);

  check(res, {
    "backend responds with 200": (r) => r.status === 200,
    "root page is returned": (r) =>
      r.body && r.body.includes("Welcome to ecommerce app"),
  });

  sleep(2);
}
