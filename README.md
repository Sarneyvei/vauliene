

# 🚀 Galaxy Online IV: Stellar Command

**Documento de Conceito & Visão Geral**

---

## 1. Visão Geral do Projeto

O **Galaxy Online IV (Stellar Command)** é um jogo de estratégia espacial em 3D desenvolvido para rodar diretamente no navegador. O projeto nasce como um sucessor espiritual do clássico *Galaxy Online II*, combinando o charme e a nostalgia dos jogos de web dos anos 2000/2010 com tecnologias web modernas, gráficos tridimensionais e uma arquitetura altamente expansível.

> ⚠️ **Nota de Propriedade Intelectual:** Este é um projeto 100% original e independente. Toda a propriedade intelectual, modelos 3D, efeitos sonoros e código-fonte são desenvolvidos do zero, sem o uso de assets do jogo original.

---

## 2. Produto Mínimo Viável (MVP)

O foco inicial do desenvolvimento é validar a experiência central do jogador (*core loop*) por meio de uma versão leve, estável e funcional.

### O Ciclo Principal de Gameplay

O fluxo contínuo de progressão do jogador é estruturado nas seguintes etapas:

1. **Autenticação:** Acesso seguro à conta do jogador.
2. **Desenvolvimento:** Visualização do planeta inicial em 3D e construção de infraestrutura.
3. **Coleta & Produção:** Extração contínua de recursos e fabricação de naves no estaleiro.
4. **Organização Militar:** Designação de comandantes para a criação e gestão de frotas.
5. **Combate Espacial:** Navegação pelo mapa galáctico, engajamento em batalhas animadas e obtenção de recompensas.
6. **Persistência:** Salvamento automático de todo o progresso no servidor.

---

## 3. Compatibilidade e Plataformas

Projetado para ser **100% acessível via navegador**, o jogo elimina a necessidade de downloads, instalações ou lojas de aplicativos.

* **Sistemas Suportados:** Windows, macOS, Linux, Android e iOS.
* **Interface Adaptativa:** Design totalmente responsivo, ajustando layouts, HUDs e controles para monitores, notebooks, tablets e smartphones.

---

## 4. Arquitetura Técnica

A infraestrutura foi planejada para garantir alta performance e escalabilidade:

* **Frontend (Interface & 3D):** Desenvolvido em **React** e **TypeScript**, utilizando **WebGL/WebGPU (Three.js)** para renderização fluida da interface do usuário (HUD) e dos cenários 3D no navegador.
* **Backend (Regras de Negócio):** API dedicada para gerenciar autenticação, cálculo de recursos, estado das frotas, lógica de combate e progresso de missões.
* **Banco de Dados (Persistência):** Armazenamento seguro de contas, edifícios, frota, inventário e histórico de jogo.

---

## 5. Identidade Visual e Estética

O visual do jogo adota o estilo **Sci-Fi Militar Futurista**. A interface faz o jogador se sentir dentro de um centro de comando espacial:

* Cores escuras e sóbrias.
* Elementos holográficos em tons neon.
* Mapas estelares interativos.
* Iluminação suave e modelos 3D detalhados.

---

## 6. Sistemas de Jogo

### Economia e Recursos

A economia do jogo baseia-se em quatro recursos primários. A produção e o consumo ocorrem em tempo real, mantendo a progressão mesmo quando o jogador estiver desconectado.

* **Metal:** Matéria-prima essencial para a expansão de edifícios e estruturação de naves.
* **Cristal:** Utilizado em pesquisas tecnológicas e componentes de alta precisão.
* **Gás:** Combustível para propulsão de frotas e energização de sistemas avançados.
* **Energia:** Mantém a infraestrutura planetária operando em capacidade máxima.

### Estruturas Iniciais (Planeta)

* **Centro de Comando:** O núcleo administrativo do planeta.
* **Extratores:** Mina de Metal, Mina de Cristal e Extrator de Gás.
* **Usina de Energia:** Fornecedora de energia para os demais edifícios.
* **Estaleiro:** Linha de montagem para a fabricação das naves espaciais.

### Frota Inicial

* **Caça:** Unidade rápida e barata, ideal para reconhecimento e ataques ágeis.
* **Fragata:** Nave intermediária com equilíbrio entre poder ofensivo e blindagem.
* **Cruzador:** Unidade pesada, lenta, mas equipada com alto poder de destruição.

### Sistema de Comandantes

Liderando as frotas, o MVP contará com **3 comandantes únicos**:

* **Atributos:** Ataque, Defesa, Comando, Engenharia e Exploração.
* **Evolução:** Sistema de nível e experiência (XP).
* **Especialização:** Habilidades passivas e ativas que alteram o desempenho das frotas em combate.

---

## 7. Exploração e Combate

### Estrutura do Sistema Solar

No MVP, o mapa galáctico conterá **1 Sistema Solar**, composto por:

* **1 Planeta do Jogador** (Base Principal)
* **2 Planetas Neutros** (Para exploração e coleta de recursos)
* **1 Planeta Inimigo** (Para testes do sistema de combate)

### Fluxo de Batalha Espacial

1. **Preparação:** O jogador seleciona a composição da frota e atribui um Comandante.
2. **Processamento:** O servidor calcula o resultado com base no poder das naves, atributos do comandante e bônus táticos.
3. **Animação:** O navegador exibe uma representação visual em 3D da batalha.
4. **Relatório:** Exibição do resumo final contendo resultado (*Vitória/Derrota*), baixas sofridas, experiência acumulada e recursos saqueados.

---

## 8. Cronograma de Desenvolvimento (Roadmap)

```
[ FASE 1: MVP ] ───────► [ FASE 2: AJUSTES ] ───────► [ FASE 3: EXPANSÃO ]
 Core Gameplay            Desempenho & Mobile         PvP, Alianças & Galáxia

```

* **Fase 1 (MVP):** Autenticação, planeta 3D, ciclo de recursos, 5 edifícios, 3 comandantes, 3 classes de naves, combate básico e missões iniciais.
* **Fase 2 (Testes & Otimização):** Ajustes de responsividade móvel, estabilização de taxa de quadros (FPS) e sincronização de dados em tempo real.
* **Fase 3 (Expansão):** Árvores de tecnologia avançadas, sistema de alianças/guildas, mercado entre jogadores, combates PvP e expansão para múltiplos sistemas solares.
