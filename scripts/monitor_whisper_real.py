#!/usr/bin/env python3
"""
Script para monitorar o progresso real do Whisper Small
"""
import os
import time
import subprocess
import json

def check_whisper_process():
    """Verifica se o processo Whisper está rodando"""
    try:
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        return 'whisper' in result.stdout and 'small' in result.stdout
    except:
        return False

def get_file_size(filepath):
    """Obtém o tamanho do arquivo se existir"""
    try:
        return os.path.getsize(filepath)
    except:
        return 0

def main():
    transcription_file = "transcriptions/el-principito.json"
    original_size = get_file_size(transcription_file)
    
    print("🎧 Monitorando Whisper Small em tempo real...")
    print(f"📊 Tamanho original: {original_size} bytes")
    
    last_size = original_size
    stable_count = 0
    
    while True:
        is_running = check_whisper_process()
        current_size = get_file_size(transcription_file)
        
        if current_size != last_size:
            print(f"📈 Arquivo atualizado: {current_size} bytes (+{current_size - last_size})")
            last_size = current_size
            stable_count = 0
        elif not is_running and current_size > original_size:
            stable_count += 1
            if stable_count >= 3:
                print("✅ Whisper completou! Arquivo estável e processo terminado.")
                break
        elif is_running:
            print(f"⏳ Processando... (arquivo: {current_size} bytes)")
            stable_count = 0
        else:
            stable_count += 1
            
        time.sleep(10)
    
    print(f"🎉 Transcrição Small finalizada! Tamanho final: {current_size} bytes")
    
    # Verificar qualidade
    try:
        with open(transcription_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"📊 {len(data['segments'])} segmentos processados")
        
        # Mostrar primeiros segmentos para verificar qualidade
        print("\n🔍 Primeiros segmentos:")
        for i, segment in enumerate(data['segments'][:3]):
            print(f"  {i+1}. {segment['text'].strip()}")
            
    except Exception as e:
        print(f"⚠️ Erro ao analisar arquivo: {e}")

if __name__ == "__main__":
    main()