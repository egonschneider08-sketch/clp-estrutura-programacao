import csv
import time
import random
from datetime import datetime
import os

# Nome do arquivo que o Power BI vai ler
arquivo_csv = 'dados_silo_arroz.csv'

# Verifica se o arquivo já existe para não duplicar o cabeçalho
arquivo_existe = os.path.isfile(arquivo_csv)

print("Iniciando simulação do Silo... (Pressione Ctrl+C para parar)")

with open(arquivo_csv, mode='a', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)

    # Escreve o cabeçalho se o arquivo for novo
    if not arquivo_existe:
        writer.writerow(['DataHora', 'Silo', 'Quantidade', 'Peso_Kg'])

    try:
        while True:
            # Simula o tempo que demora para sair uma saca (ex: entre 2 e 5 segundos)
            tempo_espera = random.randint(2, 5)
            time.sleep(tempo_espera)

            # Pega o momento exato em que a saca passou
            agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            silo_id = random.choice(['Silo_A', 'Silo_B']) # Simula 2 silos operando
            peso_saca = 50 # Saca padrão de 50kg

            # Grava a linha no CSV
            writer.writerow([agora, silo_id, 1, peso_saca])
            file.flush() # Força a gravação imediata no disco

            print(f"[SENSOR] Saca de 50kg detectada no {silo_id} às {agora}")

    except KeyboardInterrupt:
        print("\nSimulação encerrada.")