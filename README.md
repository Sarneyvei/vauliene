# Stellar Command

PROJETO: GALAXY ONLINE IV

1. CONCEITO

Crie um jogo de estratégia espacial 3D para navegador chamado Galaxy Online IV.

O projeto é uma continuação espiritual/nova interpretação de um antigo jogo de estratégia espacial chamado Galaxy Online II, buscando recuperar a sensação de nostalgia de jogos de navegador da era dos anos 2000/2010, porém com tecnologia moderna, gráficos 3D e uma arquitetura preparada para expansão.

IMPORTANTE: o projeto deve ser uma obra nova e independente. Não copiar código-fonte, arquivos, modelos 3D, imagens, músicas, textos, mapas, personagens ou outros ativos proprietários do jogo original. Usar apenas conceitos gerais de gênero e referências de gameplay como inspiração.

2. OBJETIVO DA PRIMEIRA VERSÃO

Não tente criar o jogo completo inicialmente.

Desenvolva primeiro um MVP jogável, pequeno e funcional, que permita testar:

criação de conta;

login;

criação de um comandante;

visualização do planeta;

construção básica;

produção de recursos;

visualização da frota;

comandante;

mapa espacial simples;

navegação básica;

uma batalha espacial simples;

sistema de missões;

interface responsiva;

salvamento dos dados.

O projeto deverá ser desenvolvido de forma modular para que novos planetas, comandantes, naves, tecnologias, edifícios, recursos e sistemas possam ser adicionados posteriormente sem necessidade de reescrever o núcleo do jogo.

3. PLATAFORMAS

O jogo deverá funcionar diretamente no navegador.

Prioridade:

PC/Windows

Android

iPhone/iPad

Não exigir instalação de aplicativo.

O jogador deverá conseguir acessar o jogo pelo navegador e fazer login.

A interface deve se adaptar automaticamente a:

monitor;

notebook;

tablet;

celular.

4. TECNOLOGIA

Criar uma arquitetura moderna para jogo web 3D.

Preferencialmente utilizar:

TypeScript;

React;

WebGL/WebGPU;

Three.js ou tecnologia equivalente para o ambiente 3D;

backend com API;

banco de dados;

autenticação segura;

arquitetura modular.

Separar claramente:

FRONTEND

Interface, HUD, menus, mapa, planeta, animações e renderização 3D.

BACKEND

Contas, jogadores, recursos, construções, comandantes, frotas, missões, batalhas e progresso.

BANCO DE DADOS

Guardar permanentemente:

jogadores;

planetas;

recursos;

edifícios;

comandantes;

naves;

frotas;

tecnologias;

missões;

batalhas;

inventário;

progresso.

5. IDENTIDADE VISUAL

Criar uma estética de ficção científica espacial.

Estilo:

futurista;

tecnológico;

militar espacial;

exploração galáctica;

interface semelhante a um centro de comando.

Evitar aparência excessivamente infantil.

A interface deve transmitir a sensação de estar controlando uma civilização espacial.

Usar:

painéis escuros;

hologramas;

mapas estelares;

planetas 3D;

naves espaciais;

efeitos de iluminação;

pequenas animações;

informações claramente organizadas.

A interface deve funcionar muito bem em telas pequenas.

6. TELA INICIAL

Criar uma tela inicial com:

GALAXY ONLINE IV

Subtítulo:

A nova geração da estratégia espacial.

Botões:

ENTRAR

CRIAR CONTA

NOTÍCIAS

ATUALIZAÇÕES

SOBRE O JOGO

Criar uma área de notícias/atualizações que posteriormente poderá ser alimentada pelo administrador.

7. LOGIN

Criar sistema de autenticação.

Campos:

usuário ou e-mail;

senha.

Botões:

Entrar;

Criar conta;

Recuperar senha.

Após o login, levar o jogador diretamente ao painel principal.

8. PRIMEIRO PLANETA

Na primeira versão haverá apenas 1 planeta inicial.

O planeta deve possuir visual 3D.

O jogador poderá visualizar:

planeta;

atmosfera;

superfície;

edifícios;

centro de comando;

instalações;

frota estacionada.

Não criar dezenas de planetas inicialmente.

A arquitetura deverá permitir adicionar posteriormente:

planetas;

luas;

sistemas solares;

estações espaciais;

colônias;

mundos inimigos.

9. RECURSOS

Começar com apenas quatro recursos:

Metal

Cristal

Gás

Energia

Cada recurso deverá possuir:

quantidade atual;

capacidade máxima;

produção por hora;

consumo por hora.

Exemplo:

Metal:
10.000 / 50.000

Produção:
+250/h

O sistema deverá funcionar baseado em tempo real, inclusive quando o jogador estiver desconectado.

10. CONSTRUÇÕES

Criar inicialmente apenas alguns edifícios.

Centro de Comando

Edifício principal.

Mina de Metal

Produz metal.

Mina de Cristal

Produz cristal.

Extrator de Gás

Produz gás.

Usina de Energia

Produz energia.

Estaleiro

Permite construir naves.

Cada edifício deverá possuir níveis.

Exemplo:

Centro de Comando
Nível 1

Custo:

Metal: 1.000
Cristal: 500
Gás: 100

Tempo:

30 segundos.

Criar sistema de construção baseado em filas.

11. COMANDANTES

Começar com apenas 3 comandantes.

Cada comandante deverá possuir:

nome;

retrato;

nível;

experiência;

atributos;

habilidade especial;

frota associada.

Exemplo de atributos:

Ataque

Defesa

Comando

Engenharia

Exploração

Criar um sistema que permita adicionar dezenas ou centenas de comandantes posteriormente.

12. NAVES

Começar com somente 3 tipos de nave.

Caça

Rápido e barato.

Fragata

Equilibrada.

Cruzador

Mais lento, porém poderoso.

Cada nave deve possuir:

ataque;

defesa;

vida;

velocidade;

capacidade;

custo de construção.

Não criar dezenas de modelos nesta primeira versão.

13. FROTAS

Criar sistema básico de frota.

O jogador poderá:

criar uma frota;

dar nome à frota;

adicionar naves;

selecionar comandante;

enviar frota;

retornar frota.

Exemplo:

Frota Alfa

Comandante:
Comandante Orion

Naves:

10 Caças
5 Fragatas
2 Cruzadores

14. MAPA GALÁCTICO

Criar um mapa espacial 3D simples.

Na primeira versão utilizar apenas:

1 sistema solar;

1 planeta do jogador;

2 planetas neutros;

1 planeta inimigo.

O jogador poderá clicar nos objetos.

Ao selecionar um planeta mostrar:

nome;

distância;

proprietário;

status;

botão "Enviar Frota".

Posteriormente o sistema deverá suportar centenas ou milhares de sistemas.

15. BATALHA

Criar uma batalha espacial simples.

Não criar inicialmente um sistema extremamente complexo.

A batalha deverá considerar:

quantidade de naves;

ataque;

defesa;

comandante;

bônus;

resultado.

Mostrar uma pequena animação 3D da batalha.

Ao final:

VITÓRIA

ou

DERROTA

Mostrar:

naves enviadas;

naves perdidas;

experiência recebida;

recursos obtidos.

16. MISSÕES

Criar inicialmente 5 missões.

Exemplos:

Primeiros Passos

Construa o Centro de Comando.

Expansão

Construa uma Mina de Metal.

Primeira Frota

Construa 5 Caças.

Exploração

Envie uma frota para um planeta neutro.

Primeiro Combate

Vença sua primeira batalha.

Cada missão deve conceder recompensas.

17. ABAS PRINCIPAIS

Criar uma interface principal com abas:

VISÃO GERAL

PLANETA

CONSTRUÇÕES

ESTALEIRO

FROTAS

COMANDANTES

MAPA GALÁCTICO

MISSÕES

TECNOLOGIA

RELATÓRIOS

NOTÍCIAS

CONFIGURAÇÕES

Algumas abas podem inicialmente mostrar "Em desenvolvimento", mas a estrutura deve existir.

18. SISTEMA DE NOTÍCIAS E ATUALIZAÇÕES

Criar uma seção chamada:

ATUALIZAÇÕES

Ela deverá permitir posteriormente publicar:

versão do jogo;

novidades;

novos comandantes;

novos planetas;

eventos;

correções;

manutenção.

Exemplo:

VERSION 0.1.0
Galaxy Online IV — Primeiro teste público.

19. ADMINISTRAÇÃO

Criar uma estrutura administrativa separada.

O administrador deverá futuramente conseguir:

criar comandantes;

criar naves;

criar planetas;

alterar recursos;

criar missões;

publicar notícias;

criar eventos;

visualizar jogadores;

bloquear jogadores;

corrigir dados.

Não é necessário desenvolver todo o painel administrativo agora, mas a arquitetura do backend deve estar preparada para isso.

20. SALVAMENTO

Tudo que o jogador fizer deverá ser salvo no servidor.

Exemplos:

recursos;

construções;

níveis;

comandante;

frota;

naves;

missões;

experiência;

progresso.

Não depender apenas do armazenamento local do navegador.

21. SISTEMA OFFLINE

Quando o jogador fechar o navegador, o jogo deverá continuar calculando:

produção de recursos;

construções;

pesquisas;

viagens;

missões temporizadas.

Quando retornar ao jogo, calcular o tempo transcorrido e atualizar o estado.

22. PERFORMANCE

O jogo deverá ser otimizado para computadores e celulares intermediários.

Não utilizar gráficos 3D excessivamente pesados.

Utilizar:

carregamento sob demanda;

modelos otimizados;

compressão;

gerenciamento de memória;

redução de partículas em dispositivos móveis;

níveis de detalhe quando necessário.

Criar uma opção:

Qualidade gráfica

Baixa

Média

Alta

23. ARQUITETURA PARA FUTURO

Desde o primeiro dia, deixar o projeto preparado para receber:

dezenas de planetas;

centenas de comandantes;

dezenas de tipos de naves;

árvores tecnológicas;

alianças;

comércio;

diplomacia;

guerras;

PvP;

eventos;

ranking;

chat;

sistema de conquistas;

exploração;

colonização;

luas;

estações espaciais;

sistemas solares;

galáxias;

economia;

mercado entre jogadores.

Porém, NÃO implementar tudo agora.

Primeiro criar uma base sólida e funcional.

24. IMPORTANTE: DESENVOLVIMENTO POR ETAPAS

Dividir o desenvolvimento em fases.

FASE 1 — PROTÓTIPO

Criar:

tela inicial;

login;

planeta 3D;

recursos;

5 edifícios;

3 comandantes;

3 naves;

frota;

mapa;

batalha simples;

missões;

salvamento.

FASE 2 — TESTE

Testar:

PC;

Android;

iPhone;

diferentes resoluções;

desempenho;

salvamento;

sincronização.

FASE 3 — EXPANSÃO

Somente depois dos testes adicionar:

mais planetas;

mais comandantes;

mais naves;

tecnologias;

exploração;

economia;

alianças;

PvP.

25. REGRA PRINCIPAL DO PROJETO

Não tente criar um jogo gigantesco imediatamente.

Criar primeiro uma versão pequena, bonita, estável e realmente jogável.

O objetivo inicial é que um jogador consiga:

LOGIN → PLANETA → CONSTRUIR → PRODUZIR RECURSOS → CRIAR NAVES → FORMAR FROTA → ENVIAR FROTA → BATALHAR → RECEBER RECOMPENSA → EVOLUIR.

Esse ciclo deverá ser divertido e funcional antes de adicionar novos sistemas.

26. ENTREGA INICIAL

Ao terminar a primeira etapa, entregar:

projeto funcionando;

banco de dados configurado;

frontend;

backend;

sistema de login;

ambiente 3D;

sistema de recursos;

construções;

comandantes;

naves;

frotas;

mapa;

batalha;

missões;

salvamento;

sistema de atualizações.

Não gerar funcionalidades fictícias apenas para preencher a interface.

Tudo que aparecer como funcional deverá realmente funcionar.

Comece agora pela FASE 1 — MVP, criando primeiro a arquitetura do projeto e depois implementando cada sistema de forma incremental.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://stellar-conquest-nexus.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e1b47743-28ee-4421-8925-55a2bd1edc39).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
