/**
 * modules/ob.js
 * Organization Blocks — OB1, OB30, OB100
 * Equipe 3 · CLP Simulator v1.0.0
 *
 * OB100: Executado 1x na inicialização
 * OB1:   Ciclo principal contínuo (~300ms na simulação)
 * OB30:  Interrupção cíclica a cada 500ms (a cada ~2 ciclos OB1)
 */

const OBRuntime = (() => {

  let _cycleInterval = null;
  let _cycleCount = 0;
  let _ob30Counter = 0;
  let _running = false;

  function ob100_startup() {
    // Inicializa DB1 com estado seguro
    DB1.xSistemaHabilitado = false;
    DB1.xModoManual = true;
    DB1.xAlarmeCritico = false;
    DB1.iCiclosOB1 = 0;
    DB1.iCiclosOB30 = 0;
    DB1.rTemperatura_SP = 25.0;
    DB1.rErroAcumulado = 0.0;

    pulseOB('ob100');
    addLogLine('ob-log', 'OB100', 'Sistema inicializado · DBs zerados · modo MANUAL', 'ok');
    document.getElementById('led-ob100').classList.add('on');
    document.getElementById('exec-ob100').textContent = 'Executado 1x';
    setTimeout(() => document.getElementById('led-ob100').classList.remove('on'), 400);
  }

  function ob1_main() {
    _cycleCount++;
    DB1.iCiclosOB1 = _cycleCount;
    DB1.xSistemaHabilitado = true;

    // Chama FB20 (simulado — UI já gerencia estado)
    const fbState = window._fbStateOverride !== undefined ? window._fbStateOverride : 0;
    DB1.xAlarmeCritico = fbState === 4;

    pulseOB('ob1');
    document.getElementById('led-ob1').classList.add('on');
    document.getElementById('exec-ob1').textContent = 'Ciclo #' + _cycleCount;
    document.getElementById('hdr-cycles').textContent = _cycleCount;
    setTimeout(() => document.getElementById('led-ob1').classList.remove('on'), 120);

    if (_cycleCount % 4 === 0) {
      addLogLine('ob-log', 'OB1', 'Ciclo #' + _cycleCount + ' · estado motor: ' + ['REPOUSO','PARTINDO','RODANDO','PARANDO','FALHA'][fbState], 'ob1');
    }
  }

  function ob30_cyclicInt() {
    DB1.iCiclosOB30++;

    // Lê entrada analógica (simulada pelo slider)
    const celsius = parseFloat(document.getElementById('celsius-slider').value);
    DB1.rTemperatura_PV = celsius;

    // Chama FC10
    const { rFahrenheit } = FC10.execute(celsius);
    DB1.rFahrenheit = rFahrenheit;
    DB1.rErro = DB1.rTemperatura_SP - celsius;

    pulseOB('ob30');
    document.getElementById('led-ob30').classList.add('on');
    document.getElementById('exec-ob30').textContent = 'OB30 #' + DB1.iCiclosOB30;
    setTimeout(() => document.getElementById('led-ob30').classList.remove('on'), 150);

    addLogLine('ob-log', 'OB30', 'FC10 executada → ' + celsius.toFixed(1) + '°C = ' + rFahrenheit + '°F · SP=' + DB1.rTemperatura_SP.toFixed(1), 'ob30');

    updateDBDisplay();
  }

  function start() {
    if (_running) return;
    _running = true;

    ob100_startup();

    _cycleInterval = setInterval(() => {
      ob1_main();
      _ob30Counter++;
      if (_ob30Counter >= 2) {
        _ob30Counter = 0;
        ob30_cyclicInt();
      }
      // Update FC tab if visible
      calcFC(document.getElementById('celsius-slider').value);
    }, 300);

    // Update header
    document.getElementById('hdr-run-dot').classList.add('running');
    document.getElementById('hdr-run-label').textContent = 'RUN';
    document.getElementById('run-btn').disabled = true;
    document.getElementById('stop-btn').disabled = false;
  }

  function stop() {
    if (!_running) return;
    _running = false;
    clearInterval(_cycleInterval);
    _cycleInterval = null;

    document.getElementById('hdr-run-dot').classList.remove('running');
    document.getElementById('hdr-run-label').textContent = 'STOP';
    document.getElementById('run-btn').disabled = false;
    document.getElementById('stop-btn').disabled = true;

    addLogLine('ob-log', 'SYS', 'Simulação pausada · ciclos: ' + _cycleCount, 'warn');
  }

  function isRunning() { return _running; }

  return { start, stop, isRunning };
})();

function pulseOB(which) {
  const card = document.getElementById('obc-' + which);
  if (!card) return;
  card.classList.add('pulsing');
  setTimeout(() => card.classList.remove('pulsing'), 350);
}

function toggleRun() { OBRuntime.start(); }
function stopSim() { OBRuntime.stop(); }