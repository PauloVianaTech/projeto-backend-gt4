# Desempenho e SLO

## Meta declarada
Para GET /v1/produto/pesquisa, em janela de 30 dias: pelo menos 99% de respostas com status abaixo de 500 e 95% em menos de 500 ms. São metas; ainda não há evidência de cumprimento em produção.

O histograma `http_request_duration_seconds` em `/metrics` registra duração, rota, método e status. Seu contador e buckets permitem apurar disponibilidade e proporção abaixo de 0,5 s. Requisições sem resposta não são registradas; monitoramento externo é necessário para disponibilidade completa.

Exemplo de fração de respostas rápidas em uma janela de 30 dias no Prometheus:

```promql
sum(increase(http_request_duration_seconds_bucket{route="/v1/produto/pesquisa",le="0.5"}[30d]))
/
sum(increase(http_request_duration_seconds_count{route="/v1/produto/pesquisa"}[30d]))
```

## Ambiente e método

Execução em 12/11/2026 no Windows 10 com Docker Desktop/WSL2, API Node.js 22 em container e PostgreSQL 18 Alpine. Cliente k6 v2.3.0, Linux/amd64. Comunicação pela rede interna do Compose, sem passagem por internet, proxy ou TLS. Banco com 21 produtos: 20 do seed e um demonstrativo. Não foram limpos caches do PostgreSQL/SO e o fluxo demonstrativo havia sido executado antes.

Uma pessoa virtual por 30 segundos; pausa de um segundo por iteração para respeitar o limite da API de 120 requisições a cada 15 minutos por IP. Endpoint: GET /v1/produto/pesquisa?limit=12. Verifica status 200 e lista com total inteiro; thresholds: falhas abaixo de 1%, p95 abaixo de 500 ms e 100% de checks aprovados.

```sh
docker compose --profile performance run --rm k6
```

Se repetir muitas vezes em 15 minutos, aguarde a janela do rate limiter ou reinicie somente a API para uma nova sessão local. Não desabilitamos esse limite para obter o resultado.

## Resultado medido

| Indicador | Resultado |
| --- | --- |
| Requisições | 30 |
| Falhas HTTP | 0% |
| Checks | 60 aprovados, 0 falhas |
| Média | 6,48 ms |
| Mediana | 6,22 ms |
| p95 | 9,05 ms |
| Máximo | 14,60 ms |

Todos os thresholds passaram e o processo k6 terminou com código 0. O resumo bruto está em [k6-summary.json](k6-summary.json). Os campos booleanos internos de thresholds nesse formato legado indicam falha; `false` corresponde a nenhuma falha. A taxa `http_req_failed.value` é 0 e `checks.value` é 1.

## Interpretação e limites

A consulta respondeu abaixo da meta nesta execução curta. Isso não comprova um SLO de 30 dias nem estima capacidade máxima: são apenas 30 amostras, com baixa concorrência e banco pequeno. Não houve experimento de otimização antes/depois nem gargalo demonstrado; esses artefatos são exigências do projeto A, não reivindicações deste B.

A correção de JSON_CONTAINS para JSONB foi de compatibilidade funcional com PostgreSQL, validada em integração, e não uma otimização de latência demonstrada.
