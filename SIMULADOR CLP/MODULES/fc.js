/**
 * modules/fc.js
 * FC10_Calculo_Temperatura — Conversão Celsius → Fahrenheit
 * Equipe 3 · CLP Simulator v1.0.0
 *
 * FC = STATELESS: sem memória entre chamadas.
 * Resultado depende exclusivamente do parâmetro de entrada.
 */

const FC10 = (() => {

  /**
   * Executa a conversão de temperatura.
   * Equivalente SCL: rFahrenheit := (rCelsius * 9.0 / 5.0) + 32.0;
   * @param {number} rCelsius - Temperatura em graus Celsius
   * @returns {{ rFahrenheit: number }} Saída da FC
   */
  function execute(rCelsius) {
    const rFahrenheit = (rCelsius * 9.0 / 5.0) + 32.0;
    return { rFahrenheit: parseFloat(rFahrenheit.toFixed(1)) };
  }

  return { execute };
})();

// UI binding
function calcFC(val) {
  const celsius = parseFloat(val);
  const { rFahrenheit } = FC10.execute(celsius);

  document.getElementById('fc-celsius-val').textContent = celsius.toFixed(1) + ' °C';
  document.getElementById('fc-fahr-val').textContent = rFahrenheit.toFixed(1);

  // Gauge visual
  const pct = (celsius + 40) / 190; // range -40..150 → 0..1
  document.getElementById('gauge-fill').style.width = (pct * 100).toFixed(1) + '%';
  document.getElementById('gauge-thumb').style.left = (pct * 100).toFixed(1) + '%';

  // Update global DB
  if (window.DB1) {
    DB1.rTemperatura_PV = celsius;
    DB1.rFahrenheit = rFahrenheit;
    updateDBDisplay();
  }
}