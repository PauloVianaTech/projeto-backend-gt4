# Roteiro de apresentação — 10 minutos

## 1 minuto: problema e escopo
API de catálogo para operações administrativas e consulta pública. Projeto B individual. Base do GT3 reaproveitada; o trabalho GT4 acrescenta execução reproduzível, evidências de qualidade, operação e desempenho.

## 3 minutos: demonstrar
1. Mostrar `docker compose ps`: API e bancos saudáveis.
2. Abrir `/api-docs`, apontar consulta pública e proteção por JWT.
3. Rodar `npm run demo`: cadastro, login, categoria, produto, atualização e filtro.
4. Mostrar `docs/validacao-fluxo.json`, que registra resultados sem credenciais.

Se a demonstração já criou a conta, usa a senha guardada apenas em `.env.demo`. Evitar repetir cadastro mais de três vezes em uma hora por causa do rate limiter; se necessário, reiniciar somente a API para nova sessão local.

## 3 minutos: decisão técnica
Explicar ADR 0001: evoluir o catálogo em vez de iniciar outro domínio. Explicar Service Layer: controller traduz HTTP, service coordena transações, model faz persistência, regras puras são testáveis sem banco. Explicar commit do filtro: JSON_CONTAINS era MySQL; agora JSONB no PostgreSQL, com testes reais.

## 3 minutos: números e melhorias
Mostrar CI verde quando publicado, 47 testes e cobertura global. Mostrar `/metrics`, logs JSON e o SLO declarado. Apresentar o smoke test: 30 requisições, zero falhas e p95 9,05 ms. Explicar que o teste curto não comprova disponibilidade por 30 dias.

Melhorias futuras: eliminar encadeamento dos testes herdados, adotar migrations, completar triagem de dependências e testar maior volume. Ler e compreender ProductService, productRules e o ADR antes de apresentar; IA e prompts relevantes estão em docs/ia.md.
