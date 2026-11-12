# Estado da entrega — 12/11/2026

Pasta: D:\Programação\geracao-tech-4\projeto-backend-gt4.

## Concluído e validado localmente
Docker/WSL funcionando. API e bancos isolados saudáveis. Lint passou, 47 testes passaram em cinco suítes. Cobertura global (todo src): 80,36% de instruções, 66,5% de ramos, 82,85% de funções e 82,43% de linhas. Mínimos: 75/60/75/75.

Fluxo de cadastro, login, categoria, produto, atualização e filtro JSONB passou contra a API em container. Métrica Prometheus e logs JSON conferidos. Smoke k6: 30 requisições, 0% de falhas, 60 checks aprovados e p95 9,05 ms.

Configurações .env, .env.test e .env.demo estão ignoradas pelo Git. A base GT3 original permanece separada.

## Ainda necessário
- Criar ou identificar repositório remoto GT4, publicar os commits e obter CI verde.
- Incluir link da execução verde no README e na entrega do Moodle até 13/11/2026.
- O professor precisa ter acesso ao repositório.
- Revisar o roteiro de apresentação e compreender as decisões; apresentação opcional ao vivo em 16/11 ou vídeo no prazo de entrega.

## Limitações registradas
Testes herdados parcialmente encadeados; sync do Sequelize em lugar de migrations. Triagem anterior de dependências: 30 alertas, incluindo 6 altos; correção automática não autorizada. Nenhuma aplicação forçada de audit fix foi realizada.

A entrega não está concluída enquanto faltarem publicação e evidência do CI remoto.
