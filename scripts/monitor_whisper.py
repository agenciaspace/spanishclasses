#!/usr/bin/env python3
"""
Script para monitorar quando o Whisper termina e automaticamente 
atualizar a aplicação com a transcrição real
"""
import os
import time
import json
import shutil

def wait_for_whisper_completion():
    """Aguarda o Whisper completar e processa o resultado"""
    transcription_file = "transcriptions/el-principito.json"
    
    print("🎧 Aguardando conclusão da transcrição do Whisper...")
    
    while True:
        if os.path.exists(transcription_file):
            try:
                # Verifica se o arquivo está completo (pode ler JSON)
                with open(transcription_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if 'segments' in data and len(data['segments']) > 0:
                    print(f"✅ Transcrição completa encontrada!")
                    print(f"📊 {len(data['segments'])} segmentos processados")
                    
                    # Backup da transcrição original
                    backup_file = "transcriptions/el-principito-original.json"
                    shutil.copy2(transcription_file, backup_file)
                    print(f"💾 Backup salvo em: {backup_file}")
                    
                    return True
                    
            except (json.JSONDecodeError, FileNotFoundError):
                pass
        
        time.sleep(10)  # Verifica a cada 10 segundos
        print("⏳ Ainda processando...")

if __name__ == "__main__":
    wait_for_whisper_completion()
    print("🎉 Pronto! A transcrição real está disponível em /transcriptions/el-principito.json")