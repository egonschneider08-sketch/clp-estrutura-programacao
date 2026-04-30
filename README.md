# Arquitetura do Projeto CLP — Equipe 3

## Diagrama de Chamadas

```
INICIALIZAÇÃO
└── OB100_Startup
        └── Inicializa DB1_GlobalData (estado seguro)

CICLO PRINCIPAL (a cada scan ~10ms)
└── OB1_Main
        ├── Lê DB1_GlobalData (status do sistema)
        ├── Chama FB20_ControleMotor (DB20_MotorInstance)
        │       ├── Máquina de estados interna (STATIC vars)
        │       ├── Temporizadores TON internos
        │       └── Escreve saídas digitais (Q0.0, Q0.1, Q0.2)
        └── Consolida alarmes → DB1_GlobalData

INTERRUPÇÃO CÍCLICA (a cada 500ms)
└── OB30_CyclicInt
        ├── Lê entradas analógicas (IW64, IW66)
        ├── Chama FC10_Calculo (STATELESS)
        │       ├── Converte ADC → EU
        │       ├── Calcula erro SP - PV
        │       └── Aplica ganho Kp + saturação
        └── Grava resultados em DB1_GlobalData
```

## Fluxo de Dados

```
[Sensor Temperatura]
        │ (4-20mA → 0-27648 ADC)
        ▼
    IW64 (Entrada Analógica)
        │
        ▼
  OB30 → FC10_Calculo
        │  ├── rValor_EU (temperatura em °C)
        │  ├── rErro (SP - PV)
        │  └── rSaidaControle (0-100%)
        ▼
  DB1_GlobalData
        │  (disponível para OB1, HMI, SCADA)
        ▼
  QW80 (Saída Analógica) → [Atuador: válvula/inversor]

[Botão Partida]
        │ (I0.0)
        ▼
  OB1 → FB20_ControleMotor → DB20_MotorInstance (memória)
        │  ├── Máquina de estados (0-4)
        │  ├── Timer de partida (tonPartida)
        │  └── Contador de falhas (iContadorFalhas)
        ▼
  Q0.0 (Contatora) / Q0.1 (Falha) / Q0.2 (Rodando)
```

## Máquina de Estados — FB20

```
         xPartida (borda↑)
  ┌──────────────────────────────┐
  │    AND NOT xFalhaInterna     │
  ▼                              │
[0: REPOUSO] ─────────────────► [1: PARTINDO]
     ▲                               │
     │                               ├─ xSensorRotacao=TRUE → [2: RODANDO]
     │                               ├─ tonPartida.Q (timeout) → [4: FALHA]
     │                               └─ NOT xParada → [3: PARANDO]
     │
     │        NOT xParada
[2: RODANDO] ──────────────────► [3: PARANDO]
     │                               │
     ├─ xFalhaTermica → [4: FALHA]   └─ NOT xSensorRotacao → [0: REPOUSO]
     └─ xSemRotacao → [4: FALHA]
                                 [4: FALHA]
                                     │
                                     └─ xReset↑ AND tonReengage.Q AND xFalhaTermica
                                             → [0: REPOUSO]
```

## Convenção de Código

| Prefixo | Tipo          | Exemplo             |
|---------|---------------|---------------------|
| `x`     | BOOL          | `xMotorRodando`     |
| `r`     | REAL          | `rTemperatura_PV`   |
| `i`     | INT           | `iEstado`           |
| `di`    | DINT          | `diCiclosOB1`       |
| `t`     | TIME          | `tTempoPartida`     |
| `dt`    | DATE_AND_TIME | `dtInicializacao`   |
| `ton`   | TON timer     | `tonPartida`        |
| `c`     | CONSTANT      | `cRODANDO`          |

role de bomba"

# Tags de versão para cada release de produção
git tag -a v1.0.0 -m "Release inicial — 1 motor, 1 loop de temperatura"
```
