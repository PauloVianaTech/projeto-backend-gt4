import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate==1'],
  },
};
export default function () {
  const response = http.get(`${__ENV.BASE_URL || 'http://127.0.0.1:3001'}/v1/produto/pesquisa?limit=12`);
  check(response, {
    'status 200': r => r.status === 200,
    'contrato da listagem': r => {
      try { const body = r.json(); return Array.isArray(body.data) && Number.isInteger(body.total); }
      catch { return false; }
    },
  });
  sleep(1);
}
