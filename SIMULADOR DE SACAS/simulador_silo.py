import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import time
import random
from datetime import datetime
import os

arquivo_csv = 'dados_silo_arroz.csv'

def gerar_dashboard_html():
    # 1. Carrega os dados
    if not os.path.exists(arquivo_csv): return
    df = pd.read_csv(arquivo_csv, sep=';')
    
    # 2. Cria Gráfico de Barras (Silo A vs Silo B)
    fig_barras = px.bar(df.groupby('Silo').sum().reset_index(), 
                        x='Silo', y='Quantidade', 
                        color='Silo', title="Produção por Silo",
                        color_discrete_map={'Silo_A': '#22c55e', 'Silo_B': '#38bdf8'},
                        template="plotly_dark")

    # 3. Cria Gráfico de Linha (Fluxo de tempo)
    # Agrupamos por minuto para o gráfico não ficar poluído
    df['Minuto'] = pd.to_datetime(df['DataHora']).dt.strftime('%H:%M')
    fluxo_tempo = df.groupby('Minuto').sum().reset_index()
    fig_linha = px.line(fluxo_tempo, x='Minuto', y='Quantidade', 
                        title="Ritmo de Saída (por minuto)",
                        template="plotly_dark", markers=True)
    fig_linha.update_traces(line_color='#facc15')

    # 4. Monta o HTML Final
    html_content = f"""
    <html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="5"> 
        <title>SCADA - Monitoramento de Silos</title>
        <style>
            body {{ background-color: #0f172a; color: white; font-family: sans-serif; margin: 0; padding: 20px; }}
            .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }}
            .kpi-container {{ display: flex; gap: 20px; margin-bottom: 20px; }}
            .kpi {{ background: #1e293b; padding: 20px; border-radius: 10px; border-left: 5px solid #22c55e; flex: 1; }}
            .kpi h2 {{ margin: 0; font-size: 14px; color: #94a3b8; }}
            .kpi p {{ margin: 5px 0 0; font-size: 32px; font-weight: bold; }}
            h1 {{ color: #22c55e; margin-bottom: 30px; }}
        </style>
    </head>
    <body>
        <h1>📊 Sistema de Monitoramento - Silos de Arroz</h1>
        
        <div class="kpi-container">
            <div class="kpi">
                <h2>TOTAL DE SACAS</h2>
                <p>{df['Quantidade'].sum()} un</p>
            </div>
            <div class="kpi" style="border-left-color: #facc15;">
                <h2>PESO TOTAL</h2>
                <p>{df['Peso_Kg'].sum() / 1000:.2f} Ton</p>
            </div>
            <div class="kpi" style="border-left-color: #38bdf8;">
                <h2>ÚLTIMO REGISTRO</h2>
                <p>{df['DataHora'].iloc[-1].split()[-1]}</p>
            </div>
        </div>

        <div class="grid">
            <div>{fig_barras.to_html(full_html=False, include_plotlyjs='cdn')}</div>
            <div>{fig_linha.to_html(full_html=False, include_plotlyjs='cdn')}</div>
        </div>
        
        <p style="text-align:center; color: #475569;">Atualizando automaticamente a cada 5 segundos...</p>
    </body>
    </html>
    """
    
    with open("dashboard_silo.html", "w", encoding="utf-8") as f:
        f.write(html_content)

# --- LOOP PRINCIPAL (SIMULADOR + SITE) ---
print("🚀 Sistema Iniciado! Abra o arquivo 'dashboard_silo.html' no seu navegador.")

if not os.path.exists(arquivo_csv):
    with open(arquivo_csv, 'w') as f: f.write("DataHora;Silo;Quantidade;Peso_Kg\n")

try:
    while True:
        # 1. Simula saca passando (Sensor)
        agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        silo = random.choice(['Silo_A', 'Silo_B'])
        with open(arquivo_csv, 'a') as f:
            f.write(f"{agora};{silo};1;50\n")
        
        # 2. Gera o HTML atualizado
        gerar_dashboard_html()
        
        print(f"Saca registrada: {silo} às {agora.split()[-1]} - HTML Atualizado!")
        
        # Espera 3 segundos para a próxima saca
        time.sleep(3)
        
except KeyboardInterrupt:
    print("\nSistema parado.")