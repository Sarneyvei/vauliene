# Galaxy Online IV — fechar a Fase 1 (MVP jogável)

O jogo já tem conta, login, planeta 3D, recursos em tempo real, 6 construções, estaleiro, frotas, mapa estelar, batalha com relatório e 5 missões. Faltam partes do briefing original: algumas abas, a tela inicial completa, a seção de atualizações e a validação do ciclo completo.

## 1. Tela inicial completa
- Título GALAXY ONLINE IV com a frase "A nova geração da estratégia espacial."
- Os cinco botões pedidos: ENTRAR, CRIAR CONTA, NOTÍCIAS, ATUALIZAÇÕES, SOBRE O JOGO.
- Nova página "Sobre o jogo" com o conceito, o ciclo de jogo e os requisitos.

## 2. Abas que ainda faltam no painel
Hoje existem: Planeta, Construções, Estaleiro, Frotas, Mapa, Batalhas, Missões, Ajustes.
Serão acrescentadas:
- **Visão Geral** — resumo do comandante, nível/experiência, recursos, produção por hora, obras e naves em andamento, frotas em viagem e próxima missão.
- **Comandantes** — os 3 comandantes com retrato, nível, experiência, os cinco atributos e a habilidade especial, mostrando a qual frota cada um está ligado.
- **Relatórios** — histórico de batalhas e explorações (a aba Batalhas passa a ser Relatórios).
- **Notícias** — as notícias e atualizações dentro do jogo, sem precisar sair do painel.
- **Tecnologia** — tela estruturada com a árvore prevista, marcada claramente como "Em desenvolvimento" (nada fictício clicável).
- **Configurações** — Ajustes renomeado, com nome do planeta e Qualidade gráfica Baixa/Média/Alta realmente aplicada ao 3D.

## 3. Seção Atualizações
Página de atualizações listando versão, novidades, comandantes, planetas, eventos, correções e manutenção, alimentada pelas notícias do servidor (as mesmas que o administrador poderá publicar).

## 4. Desempenho em celular
A escolha de Qualidade gráfica passa a controlar de verdade a cena 3D: menos estrelas e partículas, resolução de render menor e controles mais leves no modo Baixa; detecção automática de tela pequena para começar em Média.

## 5. Validar o ciclo completo
Teste automatizado ponta a ponta: entrar → receber recompensa da 1ª missão → construir mina e usina → construir 5 caças → formar frota → enviar a um planeta neutro e ao planeta inimigo → conferir vitória/derrota, perdas, experiência e recursos obtidos → confirmar que as missões concluem. Corrigir o que aparecer.

## Detalhes técnicos
- Frontend: novas rotas `src/routes/sobre.tsx` e `src/routes/atualizacoes.tsx`; novos componentes em `src/components/game/` para Visão Geral, Comandantes, Relatórios, Notícias e Tecnologia, consumidos por `src/routes/_authenticated/jogo.tsx` (que hoje concentra tudo e será dividido).
- Qualidade gráfica: já persistida em `profiles.graphics_quality` via `updateSettings`; passar o valor como prop para `PlanetScene`/`GalaxyScene` e derivar contagem de estrelas, `dpr` e sombras.
- Nenhuma mudança de esquema é necessária; as tabelas `news`, `battles`, `commanders` e `profiles` já cobrem as novas telas. Nenhuma nova regra de jogo no cliente — as abas só leem o estado devolvido por `getGameState`.
- `head()` próprio em cada rota nova (título e descrição específicos).
- Verificação: `bunx tsgo --noEmit`, log de build e Playwright em 1280px e 390px.
