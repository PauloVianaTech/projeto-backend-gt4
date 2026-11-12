Projeto B — Geração Tech 4.0 Full Cycle

# API de catálogo GT4

API de domínio único para gerenciar catálogo de produtos, com categorias e autenticação administrativa de apoio. Evolução individual do [backend GT3](https://github.com/PauloVianaTech/projeto-backend-gt3), com histórico preservado.

Fluxo principal: cadastrar usuário administrador, autenticar, criar categoria e produto, consultar e atualizar o produto. Sem pedidos, pagamentos ou frontend na entrega.

## Subir a aplicação

Pré-requisitos: Docker Desktop com motor Linux em execução, Docker Compose e Node.js 22.13 ou superior. Depois de obter o repositório, entre em sua pasta e gere a configuração local uma única vez:

```sh
node scripts/setup-local.js
```

Esse comando cria `.env` e `.env.test` com segredos aleatórios; não sobrescreve arquivos existentes. Como alternativa, preencha os arquivos de exemplo manualmente.

Com a configuração pronta, a aplicação sobe com um comando:

```sh
docker compose up --build -d --wait
```

- API: http://localhost:3001
- Saúde do processo: http://localhost:3001/health
- Swagger: http://localhost:3001/api-docs
- Métricas: http://localhost:3001/metrics

O banco da aplicação tem volume persistente e não expõe porta no host. A API é exposta apenas em localhost. Para encerrar sem apagar dados: `docker compose down`.

## Dados e demonstração

```sh
docker compose exec -T api npm run seed
npm ci
npm run demo
```

O seed é idempotente e cria 20 produtos. A demonstração cria um usuário permitido por `ADMIN_EMAILS`, autentica, cadastra categoria e produto, atualiza estoque e valida a consulta com filtro JSONB. Salva os resultados em `docs/validacao-fluxo.json`, sem senha ou token.

A senha demonstrativa fica exclusivamente no arquivo local `.env.demo`, ignorado pelo Git. Para testar operações protegidas no Swagger, autentique em `POST /v1/usuario/token` e use o JWT em Authorize. Não publique arquivos `.env*` preenchidos.

## Testes e cobertura

O banco exclusivo de testes é temporário e usa a porta 5434, separada da aplicação:

```sh
docker compose --profile test up -d --wait db-test
npm ci
npm run lint
npm run test:coverage
```

Os testes recriam tabelas somente no banco local terminado em `_test`. O arquivo `.env.test` gerado pelo setup já corresponde ao serviço `db-test`. Em configuração manual, use o mesmo valor de `TEST_DB_PASSWORD` do `.env`.

Para executar apenas testes unitários, sem banco: `npm run test:unit`.

Cobertura coletada sobre **todos os arquivos `src/**/*.js`**, incluindo inicialização. Mínimos globais exigidos no Jest e no CI:

| Instruções | Ramos | Funções | Linhas |
| --- | --- | --- | --- |
| 75% | 60% | 75% | 75% |

Validação local em 12/11/2026: **47 testes passaram em 5 suítes**. Cobertura: 80,36% de instruções, 66,5% de ramos, 82,85% de funções e 82,43% de linhas. As regras isoladas do domínio tiveram 100% de cobertura. Relatório HTML em `coverage/lcov-report/index.html`; resumo em `docs/qualidade.json`.

## Desempenho

```sh
docker compose --profile performance run --rm k6
```

A imagem k6 está fixada pelo digest da execução validada. O smoke test usa uma pessoa virtual por 30 segundos, com pausa de um segundo. Valida status, formato da listagem, falhas abaixo de 1% e p95 abaixo de 500 ms.

Resultado local em 12/11/2026 com 21 produtos: **30 requisições, 0% de falhas, 60 verificações aprovadas e p95 de 9,05 ms**. Detalhes e limites da medição em [docs/desempenho.md](docs/desempenho.md). Não é teste de capacidade máxima.

## Logs, métrica e SLO

Logs JSON por requisição incluem identificador, método, rota, status e duração. Não registram corpo, senha, JWT ou cabeçalhos de autorização. Consulte com `docker compose logs api`.

O histograma Prometheus `http_request_duration_seconds` expõe duração por método, rota e status em `/metrics`; contador e buckets permitem acompanhar latência e respostas. A meta declarada para a listagem é 99% de respostas sem erro de servidor e 95% abaixo de 500 ms em 30 dias. Essa meta não é comprovada por um smoke test de 30 segundos.

## Design e documentação

Controllers adaptam HTTP, ProductService coordena casos de uso e transações, models encapsulam persistência e `src/domain` contém regras puras. O padrão Service Layer e a alternativa descartada estão justificados no [ADR 0001](docs/adr/0001-evolucao-catalogo.md). A separação demonstra responsabilidade única; os limites da dependência concreta do ORM estão documentados.

- [OpenAPI](docs/openapi.yaml): contrato gerado e também utilizado pelo Swagger. Para atualizar: `npm run docs:export`.
- [Contribuições e origem](CONTRIBUTORS.md).
- [Uso de IA](docs/ia.md).
- [Roteiro de apresentação](docs/apresentacao.md).
- [Estado da entrega](docs/retomada.md).

## Integração contínua e entrega

O workflow `.github/workflows/ci.yml` executa `npm ci`, lint e testes com cobertura, usando um PostgreSQL descartável próprio. Publica o relatório de cobertura como artefato. Os valores de teste no workflow são exclusivos do serviço efêmero de CI.

**Pendente:** publicar este projeto no repositório GT4 e registrar o link da execução verde no GitHub Actions. A validação local não substitui essa evidência.

Para Moodle até 13/11/2026: link do repositório acessível ao professor, link do CI verde, README, `docs/desempenho.md` e `CONTRIBUTORS.md`. Incluir `docs/ia.md` conforme orientação do curso.

## Limitações conhecidas

O foco é uma entrega acadêmica local. Há testes de integração herdados que ainda dependem da sequência de cenários, e a sincronização do Sequelize ainda substitui um processo de migrations versionadas. A triagem anterior do npm audit reportou 30 alertas de dependências, incluindo 6 altos; a correção automática não foi autorizada e não foi aplicada. Nenhuma auditoria de segurança completa é declarada.

## Licença

ISC, preservada da base GT3.
