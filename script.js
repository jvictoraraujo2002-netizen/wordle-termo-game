let palavraSecreta = "";
let tamanho = 5;
let tentativas = 6;
let tentativaAtual = 0;
let listaPalavras = [];
let jogoAtivo = true;

async function carregarPalavras() {
  try {
    const resposta = await fetch("palavras.json");
    listaPalavras = await resposta.json();
  } catch (erro) {
    console.error("Erro ao carregar palavras.json:", erro);
    listaPalavras = ["AMORA", "CASAS", "LIVRO", "FLORE", "TEMPO"];
  }
}

async function iniciarJogo() {
  // Aguarda o carregamento das palavras antes de criar o tabuleiro
  if (listaPalavras.length === 0) {
    await carregarPalavras();
  }

  tamanho = parseInt(document.getElementById("tamanho").value);
  palavraSecreta = gerarPalavraAleatoria(tamanho).toUpperCase();
  tentativaAtual = 0;
  jogoAtivo = true;

  console.log("Palavra secreta:", palavraSecreta); // útil para teste

  const tabuleiro = document.getElementById("tabuleiro");
  tabuleiro.innerHTML = "";
  document.getElementById("mensagem").textContent = "";

  for (let i = 0; i < tentativas; i++) {
    const linha = document.createElement("div");
    linha.classList.add("linha");
    for (let j = 0; j < tamanho; j++) {
      const celula = document.createElement("div");
      celula.classList.add("celula");
      linha.appendChild(celula);
    }
    tabuleiro.appendChild(linha);
  }
}

function gerarPalavraAleatoria(tam) {
  const palavrasFiltradas = listaPalavras.filter(p => p.length === tam);
  if (palavrasFiltradas.length === 0) {
    return "TESTE"; // fallback
  }
  return palavrasFiltradas[Math.floor(Math.random() * palavrasFiltradas.length)];
}

function verificarPalavra() {
  if (!jogoAtivo) return;

  const entrada = document.getElementById("entradaPalavra");
  const palavra = entrada.value.toUpperCase().trim();
  const mensagem = document.getElementById("mensagem");

  if (palavra.length !== tamanho) {
    mensagem.textContent = `A palavra deve ter ${tamanho} letras.`;
    return;
  }

  const linha = document.querySelectorAll(".linha")[tentativaAtual];
  const letras = linha.querySelectorAll(".celula");

  const palavraArray = palavraSecreta.split("");
  const resultado = Array(tamanho).fill("");

  // Primeira verificação: letras corretas (verde)
  for (let i = 0; i < tamanho; i++) {
    letras[i].textContent = palavra[i];
    if (palavra[i] === palavraArray[i]) {
      resultado[i] = "correto";
      palavraArray[i] = null;
    }
  }

  // Segunda verificação: letras existentes (amarelo)
  for (let i = 0; i < tamanho; i++) {
    if (resultado[i] === "") {
      const index = palavraArray.indexOf(palavra[i]);
      if (index !== -1) {
        resultado[i] = "existe";
        palavraArray[index] = null;
      } else {
        resultado[i] = "errado";
      }
    }
  }

  // Aplicar cores
  for (let i = 0; i < tamanho; i++) {
    letras[i].classList.remove("correto", "existe", "errado");
    letras[i].classList.add(resultado[i]);
  }

  tentativaAtual++;

  if (resultado.every(r => r === "correto")) {
    mensagem.innerHTML = "🎉 <b>Parabéns! Você acertou!</b>";
    jogoAtivo = false;
  } else if (tentativaAtual >= tentativas) {
    mensagem.innerHTML = `❌ Fim de jogo! A palavra era <b>${palavraSecreta}</b>.`;
    jogoAtivo = false;
  }

  entrada.value = "";
}

document.getElementById("enviar").addEventListener("click", verificarPalavra);
document.getElementById("apagar").addEventListener("click", () => {
  document.getElementById("entradaPalavra").value = "";
});
document.getElementById("novoJogo").addEventListener("click", iniciarJogo);
document.getElementById("tamanho").addEventListener("change", iniciarJogo);

// Espera o DOM carregar antes de iniciar o jogo
window.addEventListener("DOMContentLoaded", iniciarJogo);
