# Las Flores Amarillas

Página para el 21 de septiembre (Día de las Flores Amarillas). Toca el botón y se construye un ramo de flores amarillas.

## Probar en local

```bash
python3 -m http.server 8080
# abre http://localhost:8080
```

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub (público): `https://github.com/new`
2. En esta carpeta:

```bash
git add .
git commit -m "Página Día de las Flores Amarillas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

3. En GitHub: repositorio → **Settings** → **Pages** → en *Source* elige **Deploy from a branch** y la rama `main` (carpeta `/root`).
4. El sitio queda en `https://TU_USUARIO.github.io/TU_REPO`

> Mientras la rama no tenga un `.nojekyll`, GitHub Pages sirve el HTML directo desde la raíz, no hace falta build.