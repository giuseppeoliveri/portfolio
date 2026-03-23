import re

content = """
      <div class="carousel-inner">
        <div class="carousel-item active">
          <video src="immagini/Aria Auditorium Mascotte.mp4" class="d-block w-100" style="background-color: #000;" muted playsinline autoplay loop></video>
        </div>
        <div class="carousel-item">
          <video src="immagini/Palazzo Strozzi Firenze - Metti una stella a cena.mp4" class="d-block w-100" style="background-color: #000;" muted playsinline autoplay loop></video>
        </div>
        <div class="carousel-item">
          <img src="immagini/Museo della Natura e dell’Uomo - Padova.jpeg" class="d-block w-100" style="background-color: #000; object-fit: contain; max-height: 100%;">
        </div>
      </div>
"""

def update_index_html_remove(content, title):
    # Dobbiamo togliere il blocco div che contiene il file di questo title.
    # Pattern: match exactly one <div class="carousel-item"> ... </div> containing the title.
    # we can just find the start of the title, then find the nearest preceding <div class="carousel-item, and nearest proceeding </div>.
    idx = content.find(f"immagini/{title}.")
    if idx == -1: return content
    
    start = content.rfind('<div class="carousel-item"', 0, idx)
    end = content.find('</div>', idx)
    if start != -1 and end != -1:
        # We also want to remove leading spaces before start
        leading_space_start = content.rfind('\n', 0, start)
        if leading_space_start != -1 and content[leading_space_start+1:start].isspace():
            start = leading_space_start
        # remove up to end + 6
        content = content[:start] + content[end+6:]
    return content

print(update_index_html_remove(content, "Palazzo Strozzi Firenze - Metti una stella a cena"))
