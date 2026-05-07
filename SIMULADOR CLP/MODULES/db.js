/**
 * modules/db.js
 * Data Blocks — DB1_GlobalData e DB20_MotorInstance
 * Equipe 3 · CLP Simulator v1.0.0
 *
 * DB1: Global DB — compartilhado entre todos os blocos
 * DB20: Instance DB — memória exclusiva do FB20
 */

// ============================================================
// DB1_GlobalData — Global DB
// ============================================================
const DB1 = {
  // Processo
  rTemperatura_SP: 25.0,
  rTemperatura_PV: 25.0,
  rFahrenheit: 77.0,
  rPressao_PV: 0.0,
  rErro: 0.0,
  rErroAcumulado: 0.0,
  rSaidaControle: 0.0,
  // Status
  xSistemaHabilitado: false,
  xModoManual: true,
  xAlarmeCritico: false,
  iCodigoAlarme: 0,
  // Diagnóstico
  iCiclosOB1: 0,
  iCiclosOB30: 0
};

// ============================================================
// DB Display Renderer
// ============================================================
function updateDBDisplay() {
  const fbState = window._fbStateOverride !== undefined ? window._fbStateOverride : 0;
  const db20 = FB20 ? FB20.getDB20() : {};
  const stateNames = ['REPOUSO','PARTINDO','RODANDO','PARANDO','FALHA'];

  // Global DB
  const globalEl = document.getElementById('db-global');
  if (globalEl) {
    globalEl.innerHTML = renderDBRows([
      { name: 'xSistemaHabilitado', val: DB1.xSistemaHabilitado, comment: 'Habilitação geral' },
      { name: 'xModoManual', val: DB1.xModoManual, comment: 'TRUE=manual, FALSE=auto' },
      { name: 'xAlarmeCritico', val: DB1.xAlarmeCritico, comment: 'Alarme ativo' },
      { name: 'rTemperatura_SP', val: DB1.rTemperatura_SP.toFixed(1), type: 'num', unit: '°C', comment: 'Setpoint' },
      { name: 'rTemperatura_PV', val: DB1.rTemperatura_PV.toFixed(1), type: 'num', unit: '°C', comment: 'Valor lido' },
      { name: 'rFahrenheit', val: DB1.rFahrenheit.toFixed(1), type: 'num', unit: '°F', comment: '← FC10 output' },
      { name: 'rErro', val: (DB1.rErro || 0).toFixed(1), type: 'num', unit: '°C', comment: 'SP - PV' },
      { name: 'iCiclosOB1', val: DB1.iCiclosOB1, type: 'num', comment: 'Scan counter' },
      { name: 'iCiclosOB30', val: DB1.iCiclosOB30, type: 'num', comment: '500ms counter' },
    ]);
  }

  // Instance DB
  const instanceEl = document.getElementById('db-instance');
  if (instanceEl) {
    const contatora = fbState === 1 || fbState === 2;
    const rodando = fbState === 2;
    const falha = fbState === 4;
    instanceEl.innerHTML = renderDBRows([
      { name: '// gerado automaticamente pelo FB20', comment: '', isComment: true },
      { name: 'iEstadoInterno', val: fbState, type: 'num', comment: stateNames[fbState] },
      { name: 'xContatora', val: contatora, comment: 'Saída Q0.0' },
      { name: 'xMotorRodando', val: rodando, comment: 'Status operação' },
      { name: 'xFalhaAtiva', val: falha, comment: 'Alarme motor' },
      { name: 'iContadorFalhas', val: db20.iContadorFalhas || 0, type: 'num', comment: 'Histórico' },
    ]);
  }

  // Nav pulse on DB tab
  const navPulseOb = document.getElementById('nav-ob-pulse');
  if (navPulseOb) navPulseOb.className = 'nav-pulse' + (OBRuntime && OBRuntime.isRunning() ? ' on' : '');
  const navPulseFb = document.getElementById('nav-fb-pulse');
  if (navPulseFb) navPulseFb.className = 'nav-pulse' + (fbState === 4 ? ' on' : '');
}

function renderDBRows(rows) {
  return rows.map(row => {
    if (row.isComment) {
      return `<div class="db-row"><span style="color:var(--text3);font-size:11px;font-style:italic">${row.name}</span></div>`;
    }
    const valHtml = typeof row.val === 'boolean'
      ? `<span class="db-varval ${row.val ? 'db-true' : 'db-false'}">${row.val ? 'TRUE' : 'FALSE'}</span>`
      : `<span class="db-varval db-num">${row.val}${row.unit ? ' <span style="color:var(--text3);font-size:10px">'+row.unit+'</span>' : ''}</span>`;

    return `<div class="db-row">
      <span class="db-varname">${row.name}</span>
      <span class="db-sep">:=</span>
      ${valHtml}
      ${row.comment ? `<span class="db-comment">// ${row.comment}</span>` : ''}
    </div>`;
  }).join('');
}