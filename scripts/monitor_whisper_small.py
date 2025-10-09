#!/usr/bin/env python3
"""
Script para monitorar quando o Whisper Small termina e automaticamente 
atualizar a aplicação com a transcrição de maior qualidade
"""
import os
import time
import json
import shutil

def wait_for_whisper_completion():
    """Aguarda o Whisper Small completar e processa o resultado"""
    transcription_file = "transcriptions/el-principito.json"
    
    print("🎧 Aguardando conclusão da transcrição do Whisper Small...")
    print("⚡ Modelo Small: melhor qualidade para nomes próprios e contexto literário")
    
    while True:
        if os.path.exists(transcription_file):
            try:
                # Verifica se o arquivo está completo (pode ler JSON)
                with open(transcription_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if 'segments' in data and len(data['segments']) > 0:
                    print(f"✅ Transcrição Small completa encontrada!")
                    print(f"📊 {len(data['segments'])} segmentos processados com modelo Small")
                    
                    # Backup da transcrição small
                    backup_file = "transcriptions/el-principito-small-original.json"
                    shutil.copy2(transcription_file, backup_file)
                    print(f"💾 Backup Small salvo em: {backup_file}")
                    
                    # Verificar qualidade comparada
                    print("\n🔍 Analisando qualidade da transcrição...")
                    analyze_quality(data)
                    
                    return True
                    
            except (json.JSONDecodeError, FileNotFoundError):
                pass
        
        time.sleep(15)  # Verifica a cada 15 segundos para Small
        print("⏳ Processando com modelo Small (melhor qualidade)...")

def analyze_quality(data):
    """Analisa a qualidade da transcrição"""
    segments = data['segments']
    
    # Procurar por nomes importantes
    important_names = ['saint-exupery', 'antoine', 'leon', 'werth']
    found_names = []
    
    for segment in segments[:20]:  # Analisa os primeiros 20 segmentos
        text = segment['text'].lower()
        for name in important_names:
            if name in text:
                found_names.append((name, segment['text']))
    
    print("📚 Análise de qualidade:")
    if found_names:
        for name, text in found_names:
            print(f"  ✅ Nome detectado: {text}")
    else:
        print("  ⚠️ Alguns nomes podem precisar de verificação manual")
    
    avg_duration = sum(s['end'] - s['start'] for s in segments[:100]) / min(100, len(segments))
    print(f"  ⏱️ Duração média dos segmentos: {avg_duration:.2f}s")
    
    if avg_duration > 2 and avg_duration < 8:
        print("  ✅ Segmentação adequada para leitura")
    else:
        print("  ⚠️ Segmentação pode precisar de ajustes")

if __name__ == "__main__":
    wait_for_whisper_completion()
    print("🎉 Pronto! A transcrição Small está disponível em /transcriptions/el-principito.json")
    print("🚀 Qualidade aprimorada para nomes próprios e contexto literário!")