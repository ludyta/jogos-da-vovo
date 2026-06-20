# 🌸 Jogos da Vovó

App de jogos gratuito, seguro e sem anúncios feito com carinho para a vovó!

## 🎮 Jogos incluídos

| Jogo | Descrição |
|------|-----------|
| 🔢 **Sudoku** | 3 níveis de dificuldade (Fácil, Médio, Difícil) com dicas |
| 🔍 **Caça-Palavras** | 4 temas: Animais, Flores, Culinária, Família |
| 🧠 **Jogo da Memória** | Encontre os pares de emojis |
| ⭕ **Jogo da Velha** | Contra o computador com IA |
| 🔴 **Dama** | Jogue contra o computador |
| 📝 **Palavras Cruzadas** | Vários puzzles em português |
| 🃏 **Paciência** | Klondike Solitaire clássico |

## 🔒 100% Seguro

- ✅ Sem anúncios
- ✅ Sem compras dentro do app
- ✅ Funciona sem internet
- ✅ Sem coleta de dados
- ✅ Fonte grande e botões fáceis de tocar

---

## 📱 Como gerar o APK para Android

### Opção A — Mais fácil: usar o GitHub + Buildship (sem computador)

1. Crie uma conta gratuita em https://github.com
2. Crie um repositório novo chamado `jogos-da-vovo`
3. Faça upload de todos os arquivos desta pasta
4. Acesse https://buildship.app (gratuito para projetos pessoais)
5. Conecte seu repositório GitHub
6. Configure: **Framework = Capacitor**, **Android = Yes**
7. Baixe o APK gerado e instale no celular!

### Opção B — No computador (Windows/Mac/Linux)

#### Pré-requisitos

1. **Node.js** — baixe em https://nodejs.org (versão LTS)
2. **Android Studio** — baixe em https://developer.android.com/studio
3. **Java JDK 17+** — vem junto com o Android Studio

#### Passo a passo

```bash
# 1. Entre na pasta do projeto
cd jogos-da-vovo

# 2. Instale as dependências
npm install

# 3. Adicione a plataforma Android
npx cap add android

# 4. Sincronize os arquivos
npx cap sync android

# 5. Abra no Android Studio
npx cap open android
```

#### No Android Studio:

1. Espere o Gradle terminar de baixar (pode demorar na primeira vez)
2. Menu **Build → Generate Signed Bundle / APK**
3. Escolha **APK**
4. Clique em **Create new...** para criar uma chave de assinatura
5. Preencha os campos (anote a senha!)
6. Escolha **release**
7. Clique em **Finish**
8. O APK estará em: `android/app/release/app-release.apk`

#### Instalar no celular:

1. Copie o arquivo `app-release.apk` para o celular (cabo USB ou WhatsApp)
2. No celular, vá em **Configurações → Segurança**
3. Ative **"Instalar de fontes desconhecidas"** (ou "Instalar apps desconhecidos")
4. Abra o arquivo APK no celular e instale
5. Pronto! 🎉

### Opção C — Testar no navegador (sem instalar nada)

Basta abrir o arquivo `index.html` no navegador do celular ou computador!
Funciona perfeitamente como Progressive Web App (PWA).

---

## 📁 Estrutura do projeto

```
jogos-da-vovo/
├── index.html              # App principal
├── src/
│   └── games/
│       ├── sudoku.js       # Lógica do Sudoku
│       ├── cacapalavras.js # Lógica do Caça-Palavras
│       ├── memoria.js      # Lógica da Memória
│       ├── velha.js        # Lógica do Jogo da Velha
│       ├── dama.js         # Lógica da Dama
│       ├── cruzadas.js     # Lógica das Palavras Cruzadas
│       └── paciencia.js    # Lógica da Paciência
├── package.json
├── capacitor.config.json
└── README.md
```

---

## 💝 Feito com amor

Este app foi criado especialmente para que a vovó possa jogar com segurança,
sem risco de cair em golpes de propagandas enganosas de outros apps.

Se quiser adicionar mais jogos ou temas, é só pedir! 🌸
