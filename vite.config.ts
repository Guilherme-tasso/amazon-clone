import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Coloca o JS e o CSS do build dentro do dist/index.html, para ele abrir com dois cliques
// (o navegador bloqueia <script type="module" src> em file://, mas aceita código inline).
// Também tira o redirecionamento para dist/ que existe só no index.html da raiz.
function arquivoUnico(): Plugin {
  let outDir = 'dist';
  return {
    name: 'arquivo-unico',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const htmlPath = join(outDir, 'index.html');
      const embutidos: string[] = [];
      const ler = (src: string) => {
        const arquivo = join(outDir, src.replace(/^\.\//, ''));
        embutidos.push(arquivo);
        return readFileSync(arquivo, 'utf8');
      };
      const html = readFileSync(htmlPath, 'utf8')
        .replace(/<script id="abrir-build">[\s\S]*?<\/script>\s*/, '')
        .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, (_, src) =>
          `<script type="module">${ler(src).replace(/<\/script/gi, '<\\/script')}</script>`)
        .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g, (_, href) => `<style>${ler(href)}</style>`);
      writeFileSync(htmlPath, html);
      embutidos.forEach((arquivo) => rmSync(arquivo));
      const assets = join(outDir, 'assets');
      if (readdirSync(assets).length === 0) rmSync(assets, { recursive: true });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), arquivoUnico()],
});
