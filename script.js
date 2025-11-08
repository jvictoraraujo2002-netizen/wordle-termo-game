const tabuleiro = document.getElementById('tabuleiro');
const inputPalavra = document.getElementById('entradaPalavra');
const btnEnviar = document.getElementById('enviar');
const btnApagar = document.getElementById('apagar');
const btnNovoJogo = document.getElementById('novoJogo');
const selectTamanho = document.getElementById('tamanho');
const mensagem = document.getElementById('mensagem');

let palavraSecreta = '';
let tamanhoPalavra = parseInt(selectTamanho.value);
let maxTentativas = 6;
let tentativas = 0;

const palavras = {
  4: ['CASA', 'DADO', 'GATO', 'BOLA', 'RATO', 'VIDA'],
  5: ['PIANO', 'AMORA', 'CASAL', 'LIVRO', 'PRAIA', 'TORRE'],
  6: ['CARROS', 'FLORES', 'SENHOR', 'CAMERA', 'TIGRES'],
  7: ['AMARELO', 'BRAVURA', 'ESTRADA', 'MENSURA', 'CANTORA'],
  8: ['ANIMALES', 'FANTASIA', 'CADERNOS', 'ABSTRATO', 'MONTANHA']
};

function escolherPalavra() {
  const lista = palavras[tamanhoPalavra];
  const indice = Math.floor(Math.random() * lista.length);
  palavraSecreta = lista[indice].toUpperCase();
}

function criarTabuleiro() {
  tabuleiro.innerHTML = '';
  for (let i = 0; i < maxTentativas; i++) {
    const linha = document.createElement('div');
    linha.classList.add('linha');
    for (let j = 0; j < tamanhoPalavra; j++) {
      const letra = document.createElement('div');
      letra.classList.add('letra');
      linha.appendChild(letra);
    }
    tabuleiro.appendChild(linha);
  }
}

function novoJogo() {
  tentativas = 0;
  tamanhoPalavra = parseInt(selectTamanho.value);
  escolherPalavra();
  criarTabuleiro();
  mensagem.textContent = '';
  inputPalavra.value = '';
  inputPalavra.disabled = false;
  inputPalavra.maxLength = tamanhoPalavra;
}

function verificarPalavra() {
  const tentativa = inputPalavra.value.trim().toUpperCase();
  if (tentativa.length !== tamanhoPalavra) {
    mensagem.textContent = `A palavra deve ter ${tamanhoPalavra} letras.`;
    return;
  }

  const palavraArray = palavraSecreta.split('');
  const tentativaArray = tentativa.split('');
  const linhaAtual = document.querySelectorAll(`.linha:nth-child(${tentativas + 1}) .letra`);

  // Primeira passada: verificar acertos exatos (verde)
  const letrasRestantes = {};
  for (let i = 0; i < tamanhoPalavra; i++) {
    if (tentativaArray[i] === palavraArray[i]) {
      linhaAtual[i].textContent = tentativaArray[i];
      linhaAtual[i].classList.add('correto'); // verde
      palavraArray[i] = null; // marca como usada
    } else {
      const letra = palavraArray[i];
      if (letra) letrasRestantes[letra] = (letrasRestantes[letra] || 0) + 1;
    }
  }

  // Segunda passada: verificar letras corretas mas em posição errada (amarelo)
  for (let i = 0; i < tamanhoPalavra; i++) {
    if (!linhaAtual[i].textContent) linhaAtual[i].textContent = tentativaArray[i];
    if (!linhaAtual[i].classList.contains('correto')) {
      const letra = tentativaArray[i];
      if (letrasRestantes[letra] && letrasRestantes[letra] > 0) {
        linhaAtual[i].classList.add('parcial'); // amarelo
        letrasRestantes[letra]--;
      } else {
        linhaAtual[i].classList.add('incorreto'); // cinza
      }
    }
  }

  tentativas++;

  if (tentativa === palavraSecreta) {
    mensagem.textContent = `🎉 Parabéns! Você acertou a palavra "${palavraSecreta}".`;
    inputPalavra.disabled = true;
  } else if (tentativas >= maxTentativas) {
    mensagem.textContent = `😢 Fim de jogo! A palavra era "${palavraSecreta}".`;
    inputPalavra.disabled = true;
  } else {
    mensagem.textContent = '';
  }

  inputPalavra.value = '';
}

btnEnviar.addEventListener('click', verificarPalavra);
btnApagar.addEventListener('click', () => inputPalavra.value = '');
btnNovoJogo.addEventListener('click', novoJogo);
selectTamanho.addEventListener('change', novoJogo);

// Permitir Enter para enviar
inputPalavra.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') verificarPalavra();
});

novoJogo();
