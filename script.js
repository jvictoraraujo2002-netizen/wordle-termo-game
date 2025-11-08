// ==============================
// WORDLE em Português BR
// ==============================

let palavraCerta = "";
let tamanhoPalavra = 5;
let tentativasRestantes = 6;
let palavras = {};
let jogoAtivo = false;

// Seletores
const tabuleiro = document.getElementById("tabuleiro");
const teclado = document.getElementById("teclado");
const seletorTamanho = document.getElementById("tamanho");
const mensagem = document.getElementById("mensagem");

// ==============================
// Carregar lista de palavras do arquivo externo
// ==============================
async function carregarPalavras() {
  try {
    const resposta = await fetch("palavras.json");
    palavras = await resposta.json();
    iniciarJogo();
  } catch (erro) {
    console.error("Erro ao carregar palavras.json:", erro);
    mensagem.textContent = "Erro ao carregar palavras.";
  }
}

// ==============================
// Inicialização do jogo
// ==============================
function iniciarJogo() {
  tamanhoPalavra = parseInt(seletorTamanho.value);
  const lista = palavras[tamanhoPalavra];
  if (!lista) {
    mensagem.textContent = "Sem palavras desse tamanho!";
    return;
  }

  palavraCerta = lista[Math.floor(Math.random() * lista.length)].toUpperCase();
  tentativasRestantes = 6;
  jogoAtivo = true;
  mensagem.textContent = "";
  tabuleiro.innerHTML = "";
  gerarTabuleiro();
}

// ==============================
// Gerar o tabuleiro
// ==============================
function gerarTabuleiro() {
  for (let i = 0; i < tentativasRestantes; i++) {
    const linha = document.createElement("div");
    linha.classList.add("linha");
    for (let j = 0; j < tamanhoPalavra; j++) {
      const celula = document.createElement("div");
      celula.classList.add("celula");
      linha.appendChild(celula);
    }
    tabuleiro.appendChild(linha);
  }
}

// ==============================
// Criar teclado virtual
// ==============================
const letras = "QWERTYUIOPASDFGHJKLZXCVBNM";
function criarTeclado() {
  teclado.innerHTML = "";
  letras.split("").forEach((letra) => {
    const tecla = document.createElement("button");
    tecla.textContent = letra;
    tecla.classList.add("tecla");
    tecla.addEventListener("click", () => inserirLetra(letra));
    teclado.appendChild(tecla);
  });
  const del = document.createElement("button");
  del.textContent = "⌫";
  del.classList.add("tecla");
  del.addEventListener("click", apagarLetra);
  teclado.appendChild(del);

  const enter = document.createElement("button");
  enter.textContent = "⏎";
  enter.classList.add("tecla");
  enter.addEventListener("click", verificarPalavra);
  teclado.appendChild(enter);
}

// ==============================
// Inserir letra
// ==============================
let linhaAtual = 0;
let colunaAtual = 0;

function inserirLetra(letra) {
  if (!jogoAtivo) return;
  const linha = tabuleiro.children[linhaAtual];
  if (colunaAtual < tamanhoPalavra) {
    const celula = linha.children[colunaAtual];
    celula.textContent = letra;
    celula.classList.add("preenchida");
    colunaAtual++;
  }
}

function apagarLetra() {
  if (!jogoAtivo) return;
  const linha = tabuleiro.children[linhaAtual];
  if (colunaAtual > 0) {
    colunaAtual--;
    const celula = linha.children[colunaAtual];
    celula.textContent = "";
    celula.classList.remove("preenchida");
  }
}

// ==============================
// Verificar tentativa
// ==============================
function verificarPalavra() {
  if (!jogoAtivo) return;
  const linha = tabuleiro.children[linhaAtual];
  const tentativa = Array.from(linha.children)
    .map((c) => c.textContent)
    .join("");

  if (tentativa.length < tamanhoPalavra) {
    mensagem.textContent = "Palavra incompleta!";
    return;
  }

  const tentativaUpper = tentativa.toUpperCase();
  const corretaArray = palavraCerta.split("");
  const tentativaArray = tentativaUpper.split("");

  // Verificação de acertos
  tentativaArray.forEach((letra, i) => {
    const celula = linha.children[i];
    if (letra === corretaArray[i]) {
      celula.classList.add("certa");
    } else if (corretaArray.includes(letra)) {
      celula.classList.add("parcial");
    } else {
      celula.classList.add("errada");
    }
  });

  if (tentativaUpper === palavraCerta) {
    mensagem.textContent = "🎉 Parabéns! Você acertou!";
    jogoAtivo = false;
    return;
  }

  linhaAtual++;
  colunaAtual = 0;

  if (linhaAtual === tentativasRestantes) {
    mensagem.textContent = `❌ Fim de jogo! A palavra era ${palavraCerta}.`;
    jogoAtivo = false;
  }
}

// ==============================
// Eventos e inicialização
// ==============================
seletorTamanho.addEventListener("change", iniciarJogo);
document.addEventListener("keydown", (e) => {
  if (!jogoAtivo) return;
  if (/^[a-zA-Z]$/.test(e.key)) inserirLetra(e.key.toUpperCase());
  if (e.key === "Backspace") apagarLetra();
  if (e.key === "Enter") verificarPalavra();
});

criarTeclado();
carregarPalavras();
