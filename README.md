# SCADA Silos — Dashboard de Monitoramento em Tempo Real

> Dashboard web inspirado no Grafana para monitoramento de silos de arroz, com dados ao vivo, gauges de ocupação e gráficos de fluxo por minuto.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chartdotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)

---

## 📸 Preview

| Topbar + KPIs | Gauges de Silos | Análise Acumulada |
|---|---|---|
| Barra sticky com status ao vivo, relógio e controles | 8 gauges SVG com cores dinâmicas por ocupação | Gráfico de área acumulada + rosca de distribuição |

---

## 🚀 Como usar

### Versão Standalone (mais simples)

Baixe o arquivo `scada-silos-standalone.html` e abra direto no navegador — sem instalar nada, sem servidor, sem dependências locais.

```bash
# Basta abrir no navegador
open scada-silos-standalone.html
```

### Versão Modularizada

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/scada-silos.git
cd scada-silos

# Abra o index.html com um servidor local (necessário para carregar os módulos CSS/JS)
npx serve .
# ou
python -m http.server 8080
```

Acesse `file:///C:/Users/matheus_schneider150/Documents/blocos/BLOCOS-PROGRAMACAO/SIMULADOR%20DE%20SACAS/scada_silos.html` no navegador.

---

## ✨ Funcionalidades

- **Dashboard ao vivo** — dados atualizados automaticamente a cada ~3 segundos
- **KPIs em tempo real** — total de sacas, peso em toneladas, ritmo (sacas/min) e último registro
- **8 Gauges SVG** — arco de 220° com cores dinâmicas: verde (ok) → laranja (atenção) → vermelho (crítico)
- **4 Gráficos interativos** via Chart.js:
  - Linha de fluxo por minuto — Silo A
  - Linha de fluxo por minuto — Silo B
  - Barras de produção comparativa
  - Área acumulada + rosca de distribuição %
- **Seções colapsáveis** — estilo Grafana (clique no cabeçalho da seção)
- **Tabela de log** com os últimos 14 registros em tempo real
- **Controles** — Pausar/Iniciar simulação e Resetar dados
- **Tema escuro** inspirado no Grafana/VMware vSphere

---

## 🏗️ Arquitetura dos Módulos JS

O projeto segue um padrão **unidirecional simples** sem frameworks:

```
Simulator → Store → (Charts + UI)
               ↑
           addSaca()
```

| Módulo | Responsabilidade |
|--------|-----------------|
| `store.js` | Estado global. Toda escrita passa por `Store.addSaca()`. Emite eventos reativos. |
| `simulator.js` | Gera sacas aleatórias via `setInterval`. Em produção: substituir por `fetch()` ao backend. |
| `charts.js` | Encapsula Chart.js. Expõe apenas `Charts.initAll()` e `Charts.update(snapshot)`. |
| `ui.js` | Escreve no DOM — nunca lê estado diretamente. Inclui o renderizador de gauges SVG. |
| `app.js` | Bootstrap. Único arquivo que conhece todos os módulos e faz a ligação. |

---

## 🔌 Integração com Backend Python

Para usar com dados reais do seu script Python, substitua o simulador por uma chamada à API:

**1. No Python, exporte um JSON a cada ciclo:**

```python
import json
from datetime import datetime

def salvar_json(registros: list):
    with open('data/dados_silo.json', 'w') as f:
        json.dump({
            "ultima_atualizacao": datetime.now().isoformat(),
            "registros": registros  # lista de {hora, silo, qty, peso}
        }, f)
```

**2. Em `simulator.js`, descomente e adapte o bloco `fetchFromAPI()`:**

```javascript
async function fetchFromAPI() {
  try {
    const res  = await fetch('./data/dados_silo.json');
    const data = await res.json();
    // Processe os novos registros e chame Store.addSaca(silo, qty, peso)
  } catch (e) {
    console.warn('API indisponível, usando simulador.');
  }
}
```

---

## ⚙️ Configurações do Simulador

Todas as configurações ficam em `js/simulator.js`:

```javascript
const config = {
  probSiloA:  0.52,   // probabilidade de cair no Silo A (0.0 a 1.0)
  pesoKg:     50,     // peso de cada saca em kg
  intervalMs: 2800,   // intervalo entre sacas em milissegundos
};
```

---

## 🎨 Design System

O tema é controlado inteiramente por variáveis CSS em `css/variables.css`:

| Variável | Valor | Uso |
|----------|-------|-----|
| `--bg-canvas` | `#0d0d0d` | Fundo geral |
| `--bg-panel`  | `#141414` | Cards/painéis |
| `--green`     | `#73bf69` | Silo A / status OK |
| `--blue`      | `#5794f2` | Silo B |
| `--orange`    | `#ff9830` | Alerta / atenção |
| `--red`       | `#f2495c` | Crítico |
| `--font-mono` | `Share Tech Mono` | Valores numéricos |
| `--font-ui`   | `Barlow` | Interface geral |

---

## 🛠️ Tecnologias

- **HTML5 / CSS3 / JavaScript ES6+** — sem frameworks, sem build step
- **[Chart.js 4.4](https://www.chartjs.org/)** — gráficos de linha, barra, área e rosca
- **SVG nativo** — gauges em arco desenhados manualmente
- **Google Fonts** — Share Tech Mono + Barlow
- **Python 3** (script original) — `pandas`, `plotly`, `csv`

---

## 📋 Roadmap

- [ ] Integração com API REST / WebSocket
- [ ] Exportar relatório CSV pelo browser
- [ ] Modo multi-turno (manhã / tarde / noite)
- [ ] Alertas por e-mail quando gauge > 80%
- [ ] Deploy com servidor Flask/FastAPI + frontend


<div align="center">
  Feito com 🌾 para automação industrial agrícola
</div>
