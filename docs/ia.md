# Uso de IA

Assistente: Codex.

## Solicitações relevantes
- Analisar os requisitos dos projetos A e B publicados pelo professor.
- Comparar o backend GT3 com o sistema de quadras para escolher uma base viável.
- Continuar o Projeto B do GT4 a partir do backend GT3.

## Uso nesta etapa
Inspeção do código existente e preparação de Dockerfile, Compose, documentação inicial e decisão de reaproveitamento. A execução com Docker ainda precisa ser validada no ambiente.

## Responsabilidade do autor
Revisar o código, executar os comandos documentados e compreender as decisões antes da entrega.

## Implementação assistida em 11/11/2026
Preparados Compose, testes de regras do catálogo, workflow de CI, lint, logs JSON, histograma HTTP, SLO, OpenAPI exportada e smoke test k6. Lint passou; 23 testes unitários passaram com 100% de cobertura nas regras isoladas. Integração, CI remoto e desempenho real ainda não validados. O instalador do Docker solicitou reinicialização do Windows.

## Validação e correções em 12/11/2026
- Corrigir o filtro de opções herdado para PostgreSQL e verificar filtros e rollback em testes de integração.
- Conferir os nomes de campos documentados contra o contrato implementado.
- Validar o fluxo autenticado real no container e executar k6 com 21 produtos.
- Ampliar a cobertura de regras isoladas para todos os arquivos src e declarar mínimos globais.

Resultado: lint e 47 testes aprovados; cobertura de linhas 82,43% e ramos 66,5%. Smoke k6 com 30 requisições, zero falhas e p95 9,05 ms. Os números foram obtidos por execução, não estimados. Posteriormente, o projeto foi publicado e a execução remota 43164568035 confirmou instalação, lint e 47 testes aprovados.
