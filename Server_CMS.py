import http.server
import socketserver
import cgi
import os
import subprocess
import webbrowser
import urllib.parse
import shutil
import glob

PORT = 8000
DIRECTORY = os.getcwd()

def read_projects():
    projects = {}
    if os.path.exists('Info Immagini.txt'):
        with open('Info Immagini.txt', 'r', encoding='utf-8') as f:
            for line in f:
                if '->' in line:
                    parts = line.split('->')
                    projects[parts[0].strip()] = parts[1].strip()
    return projects

def write_projects(projects):
    with open('Info Immagini.txt', 'w', encoding='utf-8') as f:
        for p, c in projects.items():
            f.write(f"{p} -> {c}\n")

def push_to_git(message):
    subprocess.run(['git', 'pull'])
    subprocess.run(['git', 'add', '.'])
    subprocess.run(['git', 'commit', '-m', message])
    subprocess.run(['git', 'push'])

class CMSHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/admin' or self.path == '/':
            query_components = urllib.parse.parse_qs(parsed_path.query)
            edit_title = query_components.get('edit', [''])[0]
            
            projects = read_projects()
            categories = set(projects.values())
            categories.update(["Visual Identity", "Motion Design", "Book Design", "Illustration"])
            
            edit_desc = ""
            edit_cat = ""
            is_edit = False
            if edit_title and edit_title in projects:
                is_edit = True
                edit_cat = projects[edit_title]
                desc_path = os.path.join('progetti', edit_title, 'testo.txt')
                if os.path.exists(desc_path):
                    with open(desc_path, 'r', encoding='utf-8') as f:
                        edit_desc = f.read()

            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            
            # Generate Category Options
            cat_options = ""
            for c in sorted(categories):
                selected = "selected" if c == edit_cat else ""
                cat_options += f'<option value="{c}" {selected}>{c}</option>'
                
            # Generate Projects List
            proj_list = ""
            for p, c in projects.items():
                proj_list += f'''
                <li class="list-group-item d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-xl-center gap-2">
                  <div class="pe-2 text-wrap" style="word-break: break-word;">
                      <strong>{p}</strong> <span class="badge bg-secondary ms-xl-2 mt-2 mt-xl-0 text-wrap">{c}</span>
                  </div>
                  <div class="d-flex gap-2 flex-shrink-0 mt-2 mt-xl-0">
                      <a href="/admin?edit={urllib.parse.quote(p)}" class="btn btn-sm btn-outline-dark">Modifica</a>
                      <form action="/delete" method="POST" class="d-inline" onsubmit="return confirm('Vuoi davvero eliminare questo progetto? L\\'azione cancellerà file e testi irrimediabilmente.');">
                          <input type="hidden" name="title" value="{p}">
                          <button type="submit" class="btn btn-sm btn-danger">Elimina</button>
                      </form>
                  </div>
                </li>
                '''
            
            form_title = f"Modifica Progetto: <i>{edit_title}</i>" if is_edit else "Aggiungi un Nuovo Progetto"
            submit_btn = "SALVA MODIFICHE E PUBBLICA!" if is_edit else "CARICA E PUBBLICA ONLINE!"
            file_required = "" if is_edit else "required"
            read_only_title = "readonly" if is_edit else ""

            html = f"""
            <!DOCTYPE html>
            <html lang="it">
            <head>
                <meta charset="UTF-8">
                <title>Portfolio CMS Locale</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="bg-light p-4" style="background-color: #f8f9fa;">
                <div class="row w-100 mx-auto gap-4 gap-md-0" style="max-width: 1300px;">
                    
                    <!-- LATO AGGIUNTA / MODIFICA -->
                    <div class="col-lg-7 mb-4">
                        <div class="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-light">
                            <div class="text-center mb-5">
                                <h2 class="fw-bold m-0">{form_title}</h2>
                                <p class="text-muted mt-2">Il progetto verrà caricato o aggiornato nel sito.</p>
                                {"<a href='/admin' class='btn btn-sm btn-warning mt-2'>Annulla Modifica e Torna ad Aggiungi Nuovo</a>" if is_edit else ""}
                            </div>
                            
                            <form action="/upload" method="POST" enctype="multipart/form-data">
                                <input type="hidden" name="is_edit" value="{"1" if is_edit else "0"}">
                                
                                <div class="mb-4">
                                    <label class="form-label fw-bold">Titolo Progetto</label>
                                    <input type="text" name="title" class="form-control form-control-lg bg-light" value="{edit_title}" required {read_only_title}>
                                    {'<small class="text-muted">Per cambiare il titolo devi eliminare il progetto e ricrearlo.</small>' if is_edit else ''}
                                </div>
                                
                                <div class="mb-4">
                                    <label class="form-label fw-bold">Categoria</label>
                                    <select name="category" class="form-select form-select-lg bg-light mb-2">
                                        {cat_options}
                                    </select>
                                    <input type="text" name="custom_category" class="form-control" placeholder="...oppure scrivi qui una Nuova Categoria (es. Wayfinding Design)">
                                </div>
                                
                                <div class="mb-4 p-3 border rounded border-secondary-subtle">
                                    <label class="form-label fw-bold">1. File Principale (Copertina)</label>
                                    <input type="file" name="main_file" class="form-control" accept="image/*,video/mp4" {file_required}>
                                    {'<small class="text-muted d-block mt-1">Leva vuoto se non vuoi cambiare foto/video attuale.</small>' if is_edit else ''}
                                </div>

                                <div class="mb-4">
                                    <label class="form-label fw-bold">2. Testo Aggiuntivo (Mostrato nella Modale)</label>
                                    <textarea name="description" class="form-control bg-light" rows="5">{edit_desc}</textarea>
                                </div>

                                <div class="mb-5 p-3 border rounded border-secondary-subtle">
                                    <label class="form-label fw-bold">3. Aggiungi ALTRI Media (Foto/Video Extra nel popup)</label>
                                    <input type="file" name="extra_files" class="form-control" accept="image/*,video/mp4" multiple>
                                    {'<small class="text-muted d-block mt-1">Caricando nuovi extra cancellerai quelli precedenti di questo progetto.</small>' if is_edit else ''}
                                </div>

                                <button type="submit" class="btn btn-dark w-100 py-3 fw-bold rounded-pill" onclick="this.innerHTML='Operazione in corso... Attendi il temine del caricamento!'">{submit_btn}</button>
                            </form>
                        </div>
                    </div>
                    
                    <!-- LATO LISTA PROGETTI -->
                    <div class="col-lg-5">
                        <div class="bg-white p-4 rounded-4 shadow-sm border border-light sticky-top" style="top: 20px;">
                            <h4 class="fw-bold mb-4">Progetti Esistenti</h4>
                            <ul class="list-group list-group-flush border rounded">
                                {proj_list if proj_list else "<li class='list-group-item text-muted text-center'>Nessun progetto trovato.</li>"}
                            </ul>
                        </div>
                    </div>
                    
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
                
                title = form.getvalue('title').strip()
                category = form.getvalue('category').strip()
                custom_category = form.getvalue('custom_category', '').strip()
                description = form.getvalue('description', '')
                is_edit = form.getvalue('is_edit') == '1'
                
                # Use custom category if provided
                if custom_category:
                    category = custom_category

                main_fileitem = form['main_file']
                
                # 1. Update Map
                projects = read_projects()
                projects[title] = category
                write_projects(projects)
                
                # 2. Maintain or Copy Main File
                if main_fileitem.filename:
                    # If edit, we probably want to delete the old main file first to avoid dupes of different extension.
                    if is_edit:
                        for f in glob.glob(f"immagini/{title}.*"):
                            os.remove(f)
                    ext = os.path.splitext(main_fileitem.filename)[1]
                    dest_main = os.path.join('immagini', title + ext)
                    with open(dest_main, 'wb') as f:
                        f.write(main_fileitem.file.read())
                
                # 3. Create or Update Progetti Folder
                proj_dir = os.path.join('progetti', title)
                os.makedirs(proj_dir, exist_ok=True)
                
                with open(os.path.join(proj_dir, 'testo.txt'), 'w', encoding='utf-8') as f:
                    f.write(description)
                    
                # 4. Handle Extra Files
                if 'extra_files' in form and form['extra_files'].filename:
                    # If editing and we selected new files, maybe delete old 1.jpg, 2.mp4 ?
                    if is_edit:
                        for f in os.listdir(proj_dir):
                            if f != 'testo.txt':
                                os.remove(os.path.join(proj_dir, f))
                                
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
                            
                # Push git
                push_to_git(f"CMS: {'Modificato' if is_edit else 'Aggiunto'} progetto {title}")
                
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(f"""
                    <div style='font-family:sans-serif; text-align:center; padding: 50px;'>
                       <h2 style='color:#198754;'>Successo!</h2>
                       <p>Progetto '{title}' salvato su GitHub!</p>
                       <script>setTimeout(function(){{ window.location.href='/admin'; }}, 2000);</script>
                    </div>
                """.encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(f"Error: {e}".encode())

        elif self.path == '/delete':
            try:
                form = cgi.FieldStorage(
                    fp=self.rfile,
                    headers=self.headers,
                    environ={'REQUEST_METHOD': 'POST', 'CONTENT_TYPE': self.headers['Content-Type']}
                )
                title = form.getvalue('title')
                
                # Update map
                projects = read_projects()
                if title in projects:
                    del projects[title]
                    write_projects(projects)
                    
                # Delete main imagery
                for f in glob.glob(f"immagini/{title}.*"):
                    os.remove(f)
                    
                # Delete folder
                proj_dir = os.path.join('progetti', title)
                if os.path.exists(proj_dir):
                    shutil.rmtree(proj_dir)
                    
                # Git
                push_to_git(f"CMS: Eliminato progetto {title}")
                
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(f"""
                    <div style='font-family:sans-serif; text-align:center; padding: 50px;'>
                       <h2 style='color:#dc3545;'>Eliminato!</h2>
                       <p>Progetto '{title}' rimosso con successo.</p>
                       <script>setTimeout(function(){{ window.location.href='/admin'; }}, 1500);</script>
                    </div>
                """.encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(f"Error: {e}".encode())


with socketserver.TCPServer(("127.0.0.1", PORT), CMSHandler) as httpd:
    print(f"CMS Locale Attivo! Apri il browser a: http://127.0.0.1:{PORT}/admin")
    webbrowser.open(f"http://127.0.0.1:{PORT}/admin")
    httpd.serve_forever()
