# Bianchi Engenharia

Site institucional estático da Bianchi Engenharia: página inicial, sobre a empresa e a equipe, e projetos com galeria.

HTML e CSS escritos à mão, sem frameworks e sem CDN. Tudo o que o site usa está em `assets/`:

- `assets/estilo.css`: cores, tipografia e layout (fonte Archivo, variável, em `assets/fontes/`)
- `assets/site.js`: menu no celular e visor de fotos das páginas de projeto
- `assets/img/`: fotos em WebP, em duas larguras (800 e 1600 px)

As pastas `css/`, `js/`, `vendor/`, `fonts/`, `arquivos/` e as páginas `projetos/projeto4.html` a `projeto9.html`
são da versão antiga do site e não vão para o servidor (veja `.dockerignore`).

## Rodando localmente

```bash
python3 -m http.server 8000
```

e acesse http://localhost:8000/portfolio.html.

## Publicando na VPS

```bash
bash deploy.sh 200.141.22.95
```

Sobe um nginx com o site em https://bianchi.kldstudio.com.br (HTTPS automático pelo Traefik).
