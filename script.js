// ============================
// WORDLE em Português BR
// ============================

let palavras = {};
let palavraCerta = "";
let tamanhoPalavra = 5;
let tentativasRestantes = 6;
let linhaAtual = 0;
let jogoAtivo = false;

// Elementos
const tabuleiro = document.getElementById("tabuleiro");
const seletorTamanho = document.getElementById("tamanho");
const botaoNovo = document.getElementById("novoJogo");
const entrada = document.getElementById("entradaPalavra");
const enviar = document.getElementById("enviar");
const apagar = document.getElementById("apagar");
const mensagem = document.getElementById("mensagem");

// ============================
// Carregar lista de palavras
// ============================
async function carregarPalavras() {
  try {
    const resp = await fetch("palavras.json");
    palavras = await resp.json();
    iniciarJogo();
  } catch (e) {
    mensagem.textContent = "Erro ao carregar lista de palavras.";
    console.error(e);
  }
}

// ============================
// Iniciar jogo
// ============================
function iniciarJogo() {
  tamanhoPalavra = parseInt(seletorTamanho.value);
  const lista = palavras[tamanhoPalavra];

  if (!lista) {
    mensagem.textContent = "Sem palavras desse tamanho!";
    return;
  }

  palavraCerta = lista[Math.floor(Math.random() * lista.length)].toUpperCase();
  tentativasRestantes = 6;
  linhaAtual = 0;
  jogoAtivo = true;
  mensagem.textContent = "";
  entrada.value = "";
  entrada.maxLength = tamanhoPalavra;

  gerarTabuleiro();
}

// ============================
// Gerar tabuleiro
// ============================
function gerarTabuleiro() {
  tabuleiro.innerHTML = "";
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

// ============================
// Verificar tentativa
// ============================
function verificarPalavra() {
  if (!jogoAtivo) return;
  const tentativa = entrada.value.trim().toUpperCase();

  if (tentativa.length !== tamanhoPalavra) {
    mensagem.textContent = "A palavra deve ter " + tamanhoPalavra + " letras.";
    return;
  }

  const linha = tabuleiro.children[linhaAtual];
  const corretaArray = palavraCerta.split("");
  const tentativaArray = tentativa.split("");

  tentativaArray.forEach((letra, i) => {
    const celula = linha.children[i];
    celula.textContent = letra;

    if (letra === corretaArray[i]) {
      celula.classList.add("certa");
    } else if (corretaArray.includes(letra)) {
      celula.classList.add("parcial");
    } else {
      celula.classList.add("errada");
    }
  });

  if (tentativa === palavraCerta) {
    mensagem.textContent = "🎉 Parabéns! Você acertou!";
    jogoAtivo = false;
    return;
  }

  linhaAtual++;
  entrada.value = "";

  if (linhaAtual === tentativasRestantes) {
    mensagem.textContent = `❌ Fim de jogo! A palavra era ${palavraCerta}.`;
    jogoAtivo = false;
  }
}

// ============================
// Eventos
// ============================
enviar.addEventListener("click", verificarPalavra);
apagar.addEventListener("click", () => (entrada.value = ""));
botaoNovo.addEventListener("click", iniciarJogo);
seletorTamanho.addEventListener("change", iniciarJogo);

entrada.addEventListener("keydown", (e) => {
  if (e.key === "Enter") verificarPalavra();
});

// ============================
carregarPalavras();
