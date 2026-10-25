# Amazon Clone — React + TypeScript

Recriação da loja da Amazon Brasil feita como projeto de portfólio. Interface em português, preços em reais e
fluxo de compra completo: busca, página de produto, carrinho, login, checkout e histórico de pedidos.

> Projeto sem fins comerciais, não afiliado à Amazon.com, Inc. Login, pagamento e pedidos são simulados e
> ficam apenas no navegador.

## Funcionalidades

- **Home** com carrossel de banners automático, cards de categoria e faixas de produtos com rolagem horizontal
- **Busca com sugestões** enquanto digita (navegação pelo teclado) e sinônimos em português
  ("celular", "tênis", "relógio"...) sobre um catálogo em inglês
- **Resultados com filtros** de departamento, avaliação, faixa de preço, marca e ofertas, além de ordenação e
  paginação — tudo refletido na URL, então os links podem ser compartilhados
- **Página de produto** com galeria, preço com desconto, parcelamento, caixa de compra, avaliações com
  distribuição de estrelas e produtos relacionados
- **Carrinho** com controle de quantidade, barra de progresso para frete grátis e recomendações
- **Checkout** com validação de formulário, máscaras de CEP/telefone e preenchimento automático do endereço pela
  API **ViaCEP**
- **Pedidos** salvos com opção de "comprar novamente"
- Histórico de produtos vistos recentemente, menu lateral de departamentos e layout responsivo (desktop e mobile)

## Tecnologias

- React 19 + TypeScript
- React Router (rotas e estado de filtros na URL)
- Vite
- Context API + `localStorage` para carrinho, usuário e pedidos
- CSS puro com variáveis (sem framework)
- APIs públicas: [DummyJSON](https://dummyjson.com) (produtos) e [ViaCEP](https://viacep.com.br) (endereços)

## Como rodar

**Só para ver:** dê dois cliques no `index.html`. Ele abre a versão pronta que fica em `dist/index.html`
(um arquivo único, que funciona direto do disco, sem instalar nada).

**Para mexer no código:**

```bash
npm install
npm run dev
```

Acesse http://localhost:5173. Depois de mudar o código, rode `npm run build` para atualizar a versão em `dist/`.

> **Atenção:** o Vite não funciona se o caminho da pasta tiver o caractere `#` (por exemplo `D:\#projeto\...`).
> Se for o caso, renomeie a pasta antes de rodar.

Para gerar a versão de produção:

```bash
npm run build
```

## Deploy

O projeto já inclui `vercel.json` para que as rotas funcionem ao recarregar a página. Basta importar o
repositório na [Vercel](https://vercel.com) — o build é detectado automaticamente (`npm run build`, pasta `dist`).

## Estrutura

```
src/
├── components/   Header, Footer, menu lateral, cards e faixas de produto
├── pages/        Home, Busca, Produto, Carrinho, Checkout, Pedidos, Login
├── lib/          API, busca, formatação (R$, datas) e hooks
├── styles/       CSS base, layout e páginas
└── store.tsx     Estado global (carrinho, usuário, pedidos)
```
