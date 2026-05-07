/**
 * main.js
 * Simulador CLP — Entry point
 * Equipe 3 · v1.0.0
 *
 * Responsabilidades:
 *  - Navegação entre abas (OB / FC / FB / DB)
 *  - Sistema de log compartilhado
 *  - Inicialização da UI
 */

// ============================================================
// Navegação
// ============================================================
function switchTab(tabName, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  if (btn) btn.classList.add('active');
  if (tabName === 'db') updateDBDisplay();
}

// ============================================================
// Sistema de Log
// ============================================================
function addLogLine(logId, tag, msg, type = '') {
  const log = document.getElementById(logId);
  if (!log) return;

  const d = new Date();
  const ts = d.toLocaleTimeString('pt-BR', { hour12: false }) +
    '.' + String(d.getMilliseconds()).padStart(3, '0');

  const typeClass = {
    'ok': 'tag-ok', 'err': 'tag-err', 'warn': 'tag-warn',
    'ob1': 'tag-ob1', 'ob30': 'tag-ob30', 'ob100': 'tag-ob100'
  }[type] || 'tag-ok';

  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span class="log-ts">${ts}</span><span class="log-tag ${typeClass}">${tag}</span><span class="log-msg">${msg}</span>`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
  if (log.children.length > 120) log.removeChild(log.firstChild);
}

function clearLog(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}

// ============================================================
// Init
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  // Inicializa FC display
  calcFC('25');

  // Inicializa FB display
  window._fbStateOverride = 0;
  updateFBUI();

  // Inicializa DB display
  updateDBDisplay();

  // Log inicial
  addLogLine('ob-log', 'SYS', 'Simulador CLP iniciado · clique em INICIAR para começar', 'ok');
  addLogLine('fb-log', 'SYS', 'FB20 instanciado · DB20_MotorInstance pronto', 'ok');

  // Stop button disabled initially
  document.getElementById('stop-btn').disabled = true;
});