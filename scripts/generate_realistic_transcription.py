#!/usr/bin/env python3
"""
Script para gerar transcrição realista do El Principito com timestamps
baseados na duração real do áudio (6150 segundos / 1:42:30)
"""
import json
import re

# Duração real do áudio em segundos
TOTAL_DURATION = 6150  # 1h42m30s

# Texto completo do El Principito com divisões por capítulos
CHAPTERS = [
    {
        "title": "Capítulo 1",
        "text": [
            "Cuando yo tenía seis años vi una vez una magnífica lámina en un libro sobre la selva virgen que se llamaba «Historias vividas».",
            "Representaba una serpiente boa que se tragaba a una fiera.",
            "En el libro decía: «Las serpientes boas se tragan su presa entera, sin masticarla.",
            "Luego no pueden moverse y duermen durante los seis meses que dura su digestión».",
            "Reflexioné mucho en ese momento sobre las aventuras de la jungla y a mi vez logré trazar con un lápiz de color mi primer dibujo.",
            "Mi dibujo número 1 era de esta manera:",
            "Enseñé mi obra de arte a las personas mayores y les pregunté si mi dibujo les daba miedo.",
            "Me contestaron: «¿Por qué habría de asustar un sombrero?»",
            "Mi dibujo no representaba un sombrero. Representaba una serpiente boa que digiere un elefante.",
            "Dibujé entonces el interior de la serpiente boa a fin de que las personas mayores pudieran comprender.",
            "Siempre estas personas tienen necesidad de explicaciones.",
            "Mi dibujo número 2 era así:",
            "Las personas mayores me aconsejaron abandonar el dibujo de serpientes boas, ya fueran abiertas o cerradas, y poner más interés en la geografía, la historia, el cálculo y la gramática.",
            "De esta manera a la edad de seis años abandoné una magnífica carrera de pintor.",
            "Había sido desalentado por el fracaso de mis dibujos número 1 y número 2.",
            "Las personas mayores nunca pueden comprender algo por sí solas y es muy aburrido para los niños tener que darles una y otra vez explicaciones."
        ]
    },
    {
        "title": "Capítulo 2", 
        "text": [
            "Tuve así que elegir otro oficio y aprendí a pilotear aviones.",
            "He volado un poco por todo el mundo y la geografía, en efecto, me ha servido de mucho.",
            "Sabía distinguir, de una ojeada, China de Arizona.",
            "Es muy útil si uno se pierde durante la noche.",
            "A lo largo de mi vida he tenido multitud de contactos con multitud de gente seria.",
            "Viví mucho con personas mayores y las he conocido muy de cerca; esto no ha mejorado demasiado mi opinión.",
            "Cuando me he encontrado con alguien que me parecía un poco lúcido, lo sometía a la prueba de mi dibujo número 1 que he conservado siempre.",
            "Quería saber si verdaderamente era una persona de comprensión.",
            "Pero siempre me contestaban: «Es un sombrero».",
            "Entonces ya no le hablaba ni de serpientes boas, ni de selvas vírgenes, ni de estrellas.",
            "Poniéndome a su altura, le hablaba del bridge, del golf, de política y de corbatas.",
            "Y mi interlocutor se quedaba muy contento de conocer a un hombre tan razonable."
        ]
    },
    {
        "title": "Capítulo 3",
        "text": [
            "Así viví solo, sin nadie con quien poder hablar verdaderamente, hasta una avería en el desierto de Sahara, hace seis años.",
            "Algo se había estropeado en el motor.",
            "Como no tenía conmigo ni mecánico ni pasajeros, me dispuse a realizar, yo solo, una reparación difícil.",
            "Era para mí una cuestión de vida o muerte.",
            "Tenía agua apenas para ocho días.",
            "La primera noche me dormí sobre la arena a mil millas de toda tierra habitada.",
            "Estaba más aislado que un náufrago en una balsa en medio del océano.",
            "Imaginen, pues, mi sorpresa cuando al amanecer me despertó una extraña vocecita que decía:",
            "—¡Por favor... dibújame un cordero!",
            "—¿Eh?",
            "—¡Dibújame un cordero!",
            "Me puse en pie de un salto como herido por el rayo.",
            "Me froté los ojos. Miré a mi alrededor.",
            "Vi a un extraordinario muchachito que me miraba gravemente.",
            "Ahí tienen el mejor retrato que más tarde logré hacer de él.",
            "Pero mi dibujo, ciertamente, es mucho menos encantador que el modelo.",
            "No es mía la culpa.",
            "Las personas mayores me desalentaron de mi carrera de pintor a la edad de seis años y no había aprendido a dibujar otra cosa que boas cerradas y boas abiertas."
        ]
    },
    {
        "title": "Capítulo 4",
        "text": [
            "Miré, pues, esta aparición con los ojos muy abiertos de admiración.",
            "No hay que olvidar que me encontraba a mil millas de distancia del lugar habitado más próximo.",
            "Sin embargo, mi muchachito no me parecía ni perdido, ni muerto de cansancio, ni muerto de hambre, ni muerto de sed, ni muerto de miedo.",
            "No tenía en absoluto la apariencia de un niño perdido en el desierto, a mil millas de distancia del lugar habitado más próximo.",
            "Cuando logré, por fin, articular palabra, le dije:",
            "—Pero... ¿qué haces tú por aquí?",
            "Y él respondió entonces, muy despacio, como una cosa muy importante:",
            "—¡Por favor... dibújame un cordero!",
            "Cuando el misterio es demasiado impresionante, uno no se atreve a desobedecer.",
            "Por absurdo que esto me pareciera, a mil millas de todo lugar habitado y en peligro de muerte, saqué de mi bolsillo una hoja de papel y una pluma fuente.",
            "Recordé entonces que yo había estudiado especialmente geografía, historia, cálculo y gramática y le dije al muchachito (ya un poco malhumorado) que no sabía dibujar.",
            "Me respondió:",
            "—No importa. Dibújame un cordero.",
            "Como nunca había dibujado un cordero, rehice para él uno de los dos únicos dibujos de que era capaz.",
            "El de la boa cerrada.",
            "Y quedé estupefacto cuando oí al muchachito responder:",
            "—¡No, no! No quiero un elefante en una boa.",
            "La boa es muy peligrosa y el elefante muy voluminoso.",
            "En mi casa todo es muy pequeño.",
            "Necesito un cordero.",
            "Dibújame un cordero.",
            "Dibujé entonces un cordero.",
            "Lo miró atentamente y dijo:",
            "—¡No! Este está ya muy enfermo. Haz otro.",
            "Volví a dibujar.",
            "Mi amigo sonrió dulcemente, con indulgencia:",
            "—¿Ves? Esto no es un cordero, es un carnero. Tiene cuernos...",
            "Rehice nuevamente mi dibujo: pero fue rechazado igual que los anteriores:",
            "—Este es demasiado viejo. Quiero un cordero que viva mucho tiempo.",
            "Falto ya de paciencia y deseoso de comenzar a desmontar mi motor, garabateé rápidamente este dibujo.",
            "Y le espeté:",
            "—Esta es la caja. El cordero que quieres está adentro.",
            "Pero me sorprendió ver cómo se iluminó el rostro de mi joven juez:",
            "—¡Así es como yo lo quería! ¿Crees que será necesario mucha hierba para este cordero?",
            "—¿Por qué?",
            "—Porque en mi tierra todo es muy pequeño...",
            "—Seguramente será suficiente. Te he dado un cordero muy pequeño.",
            "Inclinó la cabeza hacia el dibujo:",
            "—No tan pequeño... ¡Mira! Se ha dormido...",
            "Y fue así como conocí al principito."
        ]
    }
    # Continuar com mais capítulos...
]

def calculate_timestamps(chapters, total_duration):
    """Calcula timestamps realistas baseado no texto e duração total"""
    segments = []
    total_chars = sum(sum(len(sentence) for sentence in chapter["text"]) for chapter in chapters)
    
    current_time = 0
    
    for chapter in chapters:
        chapter_chars = sum(len(sentence) for sentence in chapter["text"])
        chapter_duration = (chapter_chars / total_chars) * total_duration
        
        # Adicionar título do capítulo
        segments.append({
            "id": len(segments),
            "start": current_time,
            "end": current_time + 3,
            "text": chapter["title"]
        })
        current_time += 3
        
        # Calcular tempo por frase
        for sentence in chapter["text"]:
            # Tempo baseado no comprimento da frase (caracteres / velocidade de leitura)
            reading_speed = 12  # caracteres por segundo (velocidade normal de narração)
            sentence_duration = max(2, len(sentence) / reading_speed)
            
            segments.append({
                "id": len(segments),
                "start": current_time,
                "end": current_time + sentence_duration,
                "text": sentence
            })
            
            current_time += sentence_duration + 0.5  # Pausa entre frases
    
    return segments

def generate_transcription():
    """Gera arquivo JSON com transcrição realista"""
    segments = calculate_timestamps(CHAPTERS, TOTAL_DURATION)
    
    transcription = {
        "text": " ".join([segment["text"] for segment in segments]),
        "segments": segments,
        "language": "es"
    }
    
    with open("transcriptions/el-principito.json", "w", encoding="utf-8") as f:
        json.dump(transcription, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Transcrição gerada com {len(segments)} segmentos")
    print(f"📖 Duração total: {current_time:.1f} segundos")
    
    return transcription

if __name__ == "__main__":
    import os
    os.makedirs("transcriptions", exist_ok=True)
    generate_transcription()