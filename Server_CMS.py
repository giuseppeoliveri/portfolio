import http.server
import socketserver
import cgi
import os
import subprocess
import webbrowser

PORT = 8000
DIRECTORY = os.getcwd()

class CMSHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_GET(self):
        if self.path == '/admin' or self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            html = """
            <!DOCTYPE html>
            <html lang="it">
            <head>
                <meta charset="UTF-8">
                <title>Portfolio CMS Locale</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="bg-light p-5" style="background-color: #f8f9fa;">
                <div class="container bg-white p-5 rounded-4 shadow-sm" style="max-width: 600px; border: 1px solid #eee;">
                    <div class="text-center mb-5">
                        <h2 class="fw-bold m-0">Aggiungi un Progetto</h2>
                        <p class="text-muted">Il progetto verrà caricato automaticamente nel sito.</p>
                    </div>
                    
                    <form action="/upload" method="POST" enctype="multipart/form-data">
                        <!-- NOME -->
                        <div class="mb-4">
                            <label class="form-label fw-bold">Titolo Progetto</label>
                            <input type="text" name="title" class="form-control form-control-lg bg-light" required placeholder="Es. Nome Cliente">
                        </div>
                        
                        <!-- CATEGORIA -->
                        <div class="mb-4">
                            <label class="form-label fw-bold">Categoria</label>
                            <select name="category" class="form-select form-select-lg bg-light">
                                <option value="Visual Identity">Visual Identity</option>
                                <option value="Motion Design">Motion Design</option>
                                <option value="Book Design">Book Design</option>
                                <option value="Illustration">Illustration</option>
                                <option value="Altro">Altro (Uncategorized)</option>
                            </select>
                        </div>
                        
                        <!-- IMMAGINE PRINCIPALE GIGANTE -->
                        <div class="mb-4 p-3 border rounded border-secondary-subtle">
                            <label class="form-label fw-bold">1. File Principale (La copertina della Card e Main Page)</label>
                            <input type="file" name="main_file" class="form-control" accept="image/*,video/mp4" required>
                        </div>

                        <!-- TESTO EXTRA -->
                        <div class="mb-4">
                            <label class="form-label fw-bold">2. Testo Aggiuntivo (Mostrato quando selezioni la Card)</label>
                            <textarea name="description" class="form-control bg-light" rows="3" placeholder="Descrivi il progetto..."></textarea>
                        </div>

                        <!-- FILES EXTRA -->
                        <div class="mb-5 p-3 border rounded border-secondary-subtle">
                            <label class="form-label fw-bold">3. Immagini/Video Extra (Da mostrare insieme al testo)</label>
                            <input type="file" name="extra_files" class="form-control" accept="image/*,video/mp4" multiple>
                            <small class="text-muted d-block mt-1">Puoi selezionarne anche più di uno assieme (Tieni premuto Shift o Cmd/Ctrl).</small>
                        </div>

                        <button type="submit" class="btn btn-dark w-100 py-3 fw-bold rounded-pill" onclick="this.innerHTML='Caricamento in corso... Manda tutto online!'">PUBBLICA ONLINE!</button>
                    </form>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/upload':
            try:
                form = cgi.FieldStorage(
                    fp=self.rfile,
                    headers=self.headers,
                    environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': self.headers['Content-Type']}
                )
                
                title = form.getvalue('title')
                category = form.getvalue('category')
                description = form.getvalue('description', '')
                
                main_fileitem = form['main_file']
                
                # 1. Save Main File
                if main_fileitem.filename:
                    ext = os.path.splitext(main_fileitem.filename)[1]
                    dest_main = os.path.join('immagini', title + ext)
                    with open(dest_main, 'wb') as f:
                        f.write(main_fileitem.file.read())
                
                # 2. Update Info Immagini.txt
                with open('Info Immagini.txt', 'a', encoding='utf-8') as f:
                    f.write(f"\\n{title} -> {category}\\n")
                    
                # 3. Handle Extra Files & Text inside "progetti/"
                proj_dir = os.path.join('progetti', title)
                os.makedirs(proj_dir, exist_ok=True)
                
                with open(os.path.join(proj_dir, 'testo.txt'), 'w', encoding='utf-8') as f:
                    f.write(description)
                    
                # Store extras
                if 'extra_files' in form:
                    items = form['extra_files']
                    if not isinstance(items, list):
                        items = [items]
                    index = 1
                    for item in items:
                        if hasattr(item, 'filename') and item.filename:
                            ext = os.path.splitext(item.filename)[1]
                            dest = os.path.join(proj_dir, f"{index}{ext}")
                            with open(dest, 'wb') as f:
                                f.write(item.file.read())
                            index += 1
                            
                # 4. Git Pubblicazione in Backup
                subprocess.run(['git', 'pull'])
                subprocess.run(['git', 'add', '.'])
                subprocess.run(['git', 'commit', '-m', f"CMS: Nuovo Progetto -> {title}"])
                subprocess.run(['git', 'push'])
                
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(f"""
                    <div style='font-family:sans-serif; text-align:center; padding: 50px;'>
                       <h2 style='color:#198754;'>Completato con Successo!</h2>
                       <p>Il Progetto '{title}' è stato caricato su GitHub correttamente e sarà online entro un minuto!</p>
                       <p><a href='/admin' style='color:#000; font-weight:bold;'>Aggiungi un nuovo progetto</a> oppure chiudi questa pagina.</p>
                    </div>
                """.encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(f"<h1>Errore:</h1><p>{str(e)}</p>".encode())

with socketserver.TCPServer(("", PORT), CMSHandler) as httpd:
    print(f"CMS Locale Attivo! Apri il browser a: http://localhost:{PORT}/admin")
    webbrowser.open(f"http://localhost:{PORT}/admin")
    httpd.serve_forever()
