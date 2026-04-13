/**
 * Soak / endurance test for the CS4218 e-commerce REST API (read-heavy).
 *
 * Design (see k6 docs via MCP):
 * - Executor: constant-vus (`using-k6/scenarios/executors/constant-vus`) — fixed VUs for a set duration (soak).
 * - Thresholds: http_req_* + request tags (`using-k6/thresholds`), plus group_duration per `group()` name.
 * - HTTP params: timeout + tags (`javascript-api/k6-http/params`).
 *
 * Env:
 *   BASE_URL      — default http://localhost:6060
 *   API_PREFIX    — default /api/v1
 *   VUS           — default 20
 *   DURATION      — default 1h (e.g. 1h, 12h)
 *   HTTP_TIMEOUT  — per-request timeout (default 60s, same as k6 default)
 *
 * Usage (local):
 *   k6 run k6/scripts/soak-endurance-test.js
 *   k6 run -e DURATION=12h k6/scripts/soak-endurance-test.js
 *
 * k6 Grafana Cloud (remote load generators):
 *   Cloud cannot reach http://localhost or 127.0.0.1 (blocked). Set BASE_URL to a public API URL, e.g.:
 *     k6 cloud run -e BASE_URL=https://your-api.example.com k6/scripts/soak-endurance-test.js
 *   Or in Grafana: Testing & synthetics → Performance → Settings → Environment variables → BASE_URL.
 *   To keep hitting localhost while streaming results to Grafana:
 *     k6 cloud run --local-execution k6/scripts/soak-endurance-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const browseTrend = new Trend('flow_browse_ms');
const searchTrend = new Trend('flow_search_ms');
const categoryTrend = new Trend('flow_category_ms');
const detailTrend = new Trend('flow_detail_related_ms');

const checkFailRate = new Rate('checks_failed');

const BASE_URL = 'http://localhost:6060';
const API_PREFIX = '/api/v1';
const VUS = 100;
const DURATION = '24h';
const HTTP_TIMEOUT = '60s';

const httpParams = {
  timeout: HTTP_TIMEOUT,
  headers: { 'User-Agent': 'k6-soak-ecommerce/1.0' },
  tags: { project: 'ecommerce-soak' },
};

function api(path) {
  return `${BASE_URL}${API_PREFIX}${path}`;
}

function thinkTime() {
  sleep(Math.random() * 5 + 1);
}

function recordCheck(res, checks) {
  const ok = check(res, checks);
  checkFailRate.add(!ok);
  return ok;
}

function categoryId(product) {
  const c = product.category;
  if (!c) return null;
  if (typeof c === 'string') return c;
  if (typeof c === 'object' && c._id !== undefined) return String(c._id);
  return String(c);
}

export const options = {
  scenarios: {
    soak: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
      gracefulStop: '30s',
    },
  },
  // Thresholds calibrated from a local 2m run: VUS=5, BASE_URL=http://localhost:6060
  // (k6 summary p95). ~20–25% headroom added. Re-run after deploy or load changes:
  //   k6 run -e DURATION=2m -e VUS=5 k6/scripts/soak-endurance-test.js
  // Tag thresholds: sub-metrics for http_req_duration when requests use Params.tags.
  // Group thresholds: time per group() including think time (group_duration).
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
    checks: ['rate>0.85'],
    'http_req_duration{flow:browse}': ['p(95)<600'],
    'http_req_duration{flow:search}': ['p(95)<400'],
    'http_req_duration{flow:category}': ['p(95)<1700'],
    'http_req_duration{flow:detail}': ['p(95)<500'],
    'group_duration{group:::browse}': ['p(95)<14000'],
    'group_duration{group:::search}': ['p(95)<400'],
    'group_duration{group:::category}': ['p(95)<15000'],
    'group_duration{group:::detail_related}': ['p(95)<12500'],
  },
};

export function setup() {
  const res = http.get(api('/category/get-category'), httpParams);
  if (res.status !== 200) {
    return { categorySlugs: [] };
  }
  let body;
  try {
    body = res.json();
  } catch {
    return { categorySlugs: [] };
  }
  const cats = body.category || [];
  const slugs = cats.map((c) => c.slug).filter(Boolean);
  return { categorySlugs: slugs };
}

function flowBrowse() {
  group('browse', () => {
    let res = http.get(api('/product/get-product'), {
      ...httpParams,
      tags: { ...httpParams.tags, flow: 'browse', name: 'get-product' },
    });
    browseTrend.add(res.timings.duration);
    recordCheck(res, {
      'browse status 200': (r) => r.status === 200,
      'browse has products array': (r) => {
        try {
          const j = r.json();
          return j.success === true && Array.isArray(j.products);
        } catch {
          return false;
        }
      },
    });
    thinkTime();

    res = http.get(api('/product/product-count'), {
      ...httpParams,
      tags: { ...httpParams.tags, flow: 'browse', name: 'product-count' },
    });
    browseTrend.add(res.timings.duration);
    recordCheck(res, {
      'count status 200': (r) => r.status === 200,
      'count has total': (r) => {
        try {
          const j = r.json();
          return j.success === true && typeof j.total === 'number';
        } catch {
          return false;
        }
      },
    });
    thinkTime();

    const page = Math.floor(Math.random() * 5) + 1;
    res = http.get(api(`/product/product-list/${page}`), {
      ...httpParams,
      tags: { ...httpParams.tags, flow: 'browse', name: 'product-list' },
    });
    browseTrend.add(res.timings.duration);
    recordCheck(res, {
      'list status 200': (r) => r.status === 200,
      'list has products': (r) => {
        try {
          const j = r.json();
          return j.success === true && Array.isArray(j.products);
        } catch {
          return false;
        }
      },
    });
  });
}

const SEARCH_KEYWORDS = ['book', 'laptop', 'phone', 'shirt', 'test', 'product'];

function flowSearch() {
  group('search', () => {
    const kw = SEARCH_KEYWORDS[Math.floor(Math.random() * SEARCH_KEYWORDS.length)];
    const res = http.get(api(`/product/search/${encodeURIComponent(kw)}`), {
      ...httpParams,
      tags: { ...httpParams.tags, flow: 'search', name: 'search' },
    });
    searchTrend.add(res.timings.duration);
    recordCheck(res, {
      'search status 200': (r) => r.status === 200,
      'search is array': (r) => {
        try {
          return Array.isArray(r.json());
        } catch {
          return false;
        }
      },
    });
  });
}

function flowCategory(data) {
  const setupSlugs = data && data.categorySlugs ? data.categorySlugs : [];
  group('category', () => {
    let res = http.get(api('/category/get-category'), {
      ...httpParams,
      tags: { ...httpParams.tags, flow: 'category', name: 'get-category' },
    });
    categoryTrend.add(res.timings.duration);
    recordCheck(res, {
      'cat list status 200': (r) => r.status === 200,
    });
    thinkTime();

    let slug =
      setupSlugs.length > 0
        ? setupSlugs[Math.floor(Math.random() * setupSlugs.length)]
        : null;

    if (!slug) {
      try {
        const j = res.json();
        const cats = j.category || [];
        if (cats.length > 0) {
          slug = cats[Math.floor(Math.random() * cats.length)].slug;
        }
      } catch {
        /* ignore */
      }
    }

    if (slug) {
      res = http.get(api(`/category/single-category/${encodeURIComponent(slug)}`), {
        ...httpParams,
        tags: { ...httpParams.tags, flow: 'category', name: 'single-category' },
      });
      categoryTrend.add(res.timings.duration);
      recordCheck(res, {
        'single cat status 200': (r) => r.status === 200,
      });
      thinkTime();

      res = http.get(api(`/product/product-category/${encodeURIComponent(slug)}`), {
        ...httpParams,
        tags: { ...httpParams.tags, flow: 'category', name: 'product-category' },
      });
      categoryTrend.add(res.timings.duration);
      recordCheck(res, {
        'prod by cat status 200': (r) => r.status === 200,
      });
    }
  });
}

function flowDetailRelated() {
  group('detail_related', () => {
    const resList = http.get(api('/product/get-product'), {
      ...httpParams,
      tags: { ...httpParams.tags, flow: 'detail', name: 'get-product' },
    });
    detailTrend.add(resList.timings.duration);
    recordCheck(resList, {
      'detail list status 200': (r) => r.status === 200,
    });

    let product;
    try {
      const j = resList.json();
      if (j.products && j.products.length > 0) {
        product = j.products[Math.floor(Math.random() * j.products.length)];
      }
    } catch {
      /* ignore */
    }

    if (!product || !product.slug) {
      return;
    }

    thinkTime();

    let res = http.get(api(`/product/get-product/${encodeURIComponent(product.slug)}`), {
      ...httpParams,
      tags: { ...httpParams.tags, flow: 'detail', name: 'get-product-slug' },
    });
    detailTrend.add(res.timings.duration);
    recordCheck(res, {
      'single product status 200': (r) => r.status === 200,
    });

    const pid = product._id ? String(product._id) : null;
    const cid = categoryId(product);
    if (pid && cid) {
      thinkTime();
      res = http.get(
        api(`/product/related-product/${encodeURIComponent(pid)}/${encodeURIComponent(cid)}`),
        {
          ...httpParams,
          tags: { ...httpParams.tags, flow: 'detail', name: 'related-product' },
        }
      );
      detailTrend.add(res.timings.duration);
      recordCheck(res, {
        'related status 200': (r) => r.status === 200,
      });
    }
  });
}

export default function (data) {
  const r = Math.random();
  if (r < 0.45) {
    flowBrowse();
  } else if (r < 0.7) {
    flowSearch();
  } else if (r < 0.9) {
    flowCategory(data);
  } else {
    flowDetailRelated();
  }
  thinkTime();
}
