#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path
from html import escape

def load_segments(json_file):
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    # Whisper JSON geralmente tem "segments"
    return data.get("segments", [])

def normalize_capitulo(text):
    """Transforma 'capitulo 1' em 'Capítulo 1'."""
    text = text.strip().capitalize()
    return text.replace("capitulo", "Capítulo").replace("í", "í")

def export_html(segments, out_file, audio_path):
    capitulo_re = re.compile(r"^cap[ií]tulo\s+(\d+|[a-záéíóú]+)", re.IGNORECASE)

    story = []
    toc = []
    chapter_counter = 0

    # Cabeçalho HTML
    story.append(f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>El Principito</title>
<style>
body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }}
h1,h2 {{ color: #c55; }}
.line {{ margin: 8px 0; }}
.line.highlight {{ background: #ffff99; }}
.word {{ border-bottom: 1px dotted gray; cursor: help; }}
#toc {{ background: #f4f4f4; padding: 10px; border-radius: 6px; }}
</style>
</head>
<body>

<h1>El Principito</h1>

<audio id="player" controls>
  <source src="{audio_path}" type="audio/mp4">
</audio>

<h2>Sumário</h2>
<ul id="toc">
""")

    body_parts = []

    for seg in segments:
        text = escape(seg.get("text", "").strip())
        start = seg.get("start", 0)
        end = seg.get("end", 0)

        m = capitulo_re.match(text.lower())
        if m:
            chapter_counter += 1
            chap_id = f"capitulo_{chapter_counter}"
            cap_title = normalize_capitulo(text)
            toc.append(f"<li><a href='#{chap_id}'>{cap_title}</a></li>")
            body_parts.append(f"<h2 id='{chap_id}'>{cap_title}</h2>")
        else:
            body_parts.append(
                f"<p class='line' data-start='{start}' data-end='{end}'>{text}</p>"
            )

    story.extend(toc)
    story.append("</ul>")
    story.extend(body_parts)

    # Script JS
    story.append("""
<script>
const audio = document.getElementById("player");
const lines = document.querySelectorAll(".line");

audio.addEventListener("timeupdate", () => {
  const current = audio.currentTime;
  lines.forEach(line => {
    const start = parseFloat(line.dataset.start);
    const end = parseFloat(line.dataset.end);
    if (current >= start && current <= end) {
      line.classList.add("highlight");
      line.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      line.classList.remove("highlight");
    }
  });
});
</script>
</body></html>
""")

    Path(out_file).write_text("\n".join(story), encoding="utf-8")
    print(f"✅ HTML gerado em {out_file}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Uso: python3 transcript2html_sync.py input.json output.html audio/El-Principito.m4a")
        sys.exit(1)

    in_file = Path(sys.argv[1])
    out_file = Path(sys.argv[2])
    audio_path = sys.argv[3]

    segments = load_segments(in_file)
    export_html(segments, out_file, audio_path)

