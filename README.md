<h1 align="center">🏭 ProSim: Simulador de Silo Industrial</h1>

<p align="center">
  <i>Projeto Prático de Lógica de Programação de CLPs (IEC 61131-3) desenvolvido pela <b>Equipe 3</b>.</i>
</p>

---

## 📌 Visão Geral do Projeto

O **ProSim - Silo Simulator** é uma aplicação web interativa que emula o comportamento de um sistema industrial controlado por um Controlador Lógico Programável (CLP). Ele une uma interface visual (IHM) intuitiva com a representação em tempo real do Diagrama Ladder e blocos de função.

O simulador reproduz um processo de envase em esteira:
1. **START:** Aciona o motor e traz uma caixa vazia.
2. **PROXIMIDADE:** Um sensor detecta a caixa e para a esteira.
3. **ENCHIMENTO:** A válvula solenoide abre e despeja o material.
4. **NÍVEL:** Ao atingir 100%, a válvula fecha e o motor despacha a caixa.
5. **FALHA/STOP:** Sistemas de intertravamento interrompem o ciclo.

---

## 🔌 Tabela de I/O (Entradas e Saídas)

### Entradas Digitais (`I:1/xx`)
| Tag | Endereço | Função no Processo | Tipo |
|---|:---:|---|:---:|
| **START** | `I:1/01` | Iniciar o ciclo contínuo. | NO (NA) |
| **STOP** | `I:1/02` | Parar o ciclo / Emergência. | NC (NF) |
| **PROX** | `I:1/03` | Sensor de presença da caixa. | NO (NA) |
| **LEVEL** | `I:1/04` | Sensor de nível alto de produto. | NO (NA) |

### Saídas Digitais (`O:2/xx`)
| Tag | Endereço | Atuador / Indicador | Status IHM |
|---|:---:|---|:---:|
| **MOTOR** | `O:2/00` | Motor da esteira transportadora. | Animação Visual |
| **SOL** | `O:2/01` | Válvula solenóide do silo. | Animação Visual |
| **RUN** | `O:2/02` | Indicador de máquina operando. | Lâmpada Verde |
| **FILL** | `O:2/03` | Indicador de dosagem em andamento.| Lâmpada Amarela |
| **FULL** | `O:2/04` | Indicador de capacidade máxima. | Lâmpada Verde |

---

## 🧠 Arquitetura do CLP e Diagrama Ladder

A simulação é processada localmente em JavaScript utilizando uma arquitetura modular inspirada na norma IEC 61131-3:

- **`OB1 (Main)`**: Controla os *rungs* principais (selo do motor, sinaleiros e condições da solenóide) com um *Scan Time* simulado de 8ms a 11ms.
- **`OB30 (Interrupt)`**: Disparado a cada 5 ciclos (~500ms) para atualizar variáveis de processo.
- **`FC10 (Função Matem.)`**: Conversão térmica *Stateless* de °C para °F: `(C × 9/5) + 32`.
- **`FB20 (Motor Control)`**: Máquina de estados com memória (*Instance DB20*).

---

## 📊 Máquina de Estados (FB20)

O motor é gerenciado por uma máquina de estados internos:

```mermaid
stateDiagram-v2
    [*] --> 0_REPOUSO
    
    0_REPOUSO --> 1_PARTINDO : Comando START
    1_PARTINDO --> 2_RODANDO : Acelerando
    
    2_RODANDO --> 3_PARANDO : Comando STOP ou Ciclo
    3_PARANDO --> 0_REPOUSO : Desacelerando
    
    0_REPOUSO --> 4_FALHA : Alarme
    1_PARTINDO --> 4_FALHA : Alarme
    2_RODANDO --> 4_FALHA : Alarme
    3_PARANDO --> 4_FALHA : Alarme
    
    4_FALHA --> 0_REPOUSO : Reset
