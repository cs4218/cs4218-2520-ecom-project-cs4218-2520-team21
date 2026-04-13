// Ariella Thirza Callista A0255876L
// Test was developed with the assistance of AI

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL           = 'http://localhost:6060';
const FILTER_ENDPOINT    = '/api/v1/product/product-filters';
const CATEGORY_ENDPOINT  = '/api/v1/category/get-category';

const PRICE_RANGES = [
  [0,   19  ],
  [20,  39  ],
  [40,  59  ],
  [60,  79  ],
  [80,  99  ],
  [100, 9999],
];

const filterSuccessRate = new Rate('filter_success_rate');
const filterDuration = new Trend('filter_duration', true);
const filterErrors = new Counter('filter_errors');

// Setup

export function setup() {
  const res = http.get(`${BASE_URL}${CATEGORY_ENDPOINT}`);

  if (res.status !== 200) {
    console.error(`[setup] Failed to fetch categories — status=${res.status}`);
    return { categoryIds: [] };
  }

  const body = res.json();
  const categoryIds = Array.isArray(body?.category)
    ? body.category
        .map((c) => c?._id)
        .filter((id) => typeof id === 'string' && id.length > 0)
    : [];

  console.log(`[setup] Loaded ${categoryIds.length} categories`);
  return { categoryIds };
}

// Helpers 

function randomChoice(arr) {
  return arr[randomIntBetween(0, arr.length - 1)];
}

function randomChecked(categoryIds) {
  const shuffled = [...categoryIds].sort(() => Math.random() - 0.5);
  const count = randomIntBetween(0, Math.min(2, shuffled.length));
  return shuffled.slice(0, count);
}

// Filter function

export function filter(data) {
  const categoryIds = Array.isArray(data?.categoryIds) && data.categoryIds.length > 0
    ? data.categoryIds
    : [];

  if (categoryIds.length === 0) {
    console.warn('[filter] No categories available — skipping iteration');
    sleep(5);
    return;
  }

  group('Product Filtering', () => {
    const checked = randomChecked(categoryIds);
    const radio = randomChoice(PRICE_RANGES);

    const payload = JSON.stringify({ checked, radio });

    const res = http.post(
      `${BASE_URL}${FILTER_ENDPOINT}`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: '10s',
      },
    );

    filterDuration.add(res.timings.duration);

    const success = check(res, {
      'filter: status is 200': (r) => r.status === 200,
      'filter: response is JSON': (r) => {
        try { r.json(); return true; } catch (_) { return false; }
      },
      'filter: products array present': (r) => {
        try { return Array.isArray(r.json().products); } catch (_) { return false; }
      },
    });

    filterSuccessRate.add(success);
    if (!success) {
      filterErrors.add(1);
      console.warn(`[filter] FAILED — status=${res.status} checked=${JSON.stringify(checked)} radio=${JSON.stringify(radio)} body=${res.body?.substring(0, 200)}`);
    }

    sleep(randomIntBetween(1, 4));
  });
}