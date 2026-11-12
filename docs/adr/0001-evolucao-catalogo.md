# ADR 0001: evoluir o catálogo do GT3 para o Projeto B

Status: aceita.

## Contexto
Entrega individual até 13/11/2026. A API GT3 já implementa produtos, categorias e autenticação com Express, Sequelize e PostgreSQL.

## Decisão
Reaproveitar a API e seu histórico, mantendo o catálogo como domínio da entrega. Autenticação dá suporte às operações administrativas. Usar uma aplicação e um PostgreSQL, com execução via Compose. Não adicionar pedidos ou pagamentos.

## Alternativa descartada
Criar uma API de agendamento do zero exigiria implementar e validar outro domínio no prazo disponível. Migrar de ORM também não contribui diretamente para os requisitos.

## Consequências
Preservamos conhecimento e código aproveitável. Precisamos corrigir problemas herdados e acrescentar testes unitários, CI, observabilidade, documentação e medições. O projeto original permanece separado.

## Padrão aplicado
Service Layer: ProductService centraliza os casos de uso do catálogo; ProductController adapta HTTP e os models encapsulam persistência. Regras puras de imagens e paginação ficam em src/domain para permitir testes sem banco. A alternativa de colocar regras nas rotas misturaria responsabilidades. Os models ainda são dependências concretas do serviço; a entrega não reivindica inversão de dependência completa. Não adicionamos Repository apenas para duplicar a interface do ORM.
