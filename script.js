/* Wordle PT-BR — script.js
   - 6 tentativas
   - escolhe número de letras (4 a 8)
   - sem anúncios
   - lista de exemplo (expanda conforme quiser)
*/

/* -----------------------------
   Configurações & dados
   ----------------------------- */
const MAX_ATTEMPTS = 6;
const MIN_LETTERS = 4;
const MAX_LETTERS = 8;

/* Exemplo de dicionário (palavras em PT-BR).
   Atenção: para produção, substitua/expanda com um dicionário maior.
   Cada índice contém apenas palavras desse comprimento.
*/
const DICTIONARY = {
  4: ['casa','pulo','maré','luzé','amor','soma','rato','fato','rioa', 'muro'],
  5: ['canto','amigo','porta','brisa','termo','saldo','casal','mundo','nuvem','festa'],
  6: ['jogoça','amável','passar','planta','carroa','saldoa','tomada','viagem','banhar','ganhar'],
  7: ['amarelo','momento','janelas','fortuna','óbvioaa','caminho','estudar','gostoso','proximo','cultura'],
  8: ['palavras','jogadores','montanha','sintetico','comunidade','celebrar','descobrir','iniciaram']
};

/* Observação:
   - Use palavras sem acentos para facilitar comparação (ou normalize as entradas).
   - Aqui demos exemplos; substitua por listas reais sem erros de digitação.
*/

/* -----------------------------
   Estado do jogo
   ----------------------------- */
let wordLength = 5;
let targetWord = '';
let attempt = 0;
let board = []; // array of rows, cada row array de letras ('' vazio)
let isGameOver = false;

/* -----------------------------
   Elementos DOM
   ----------------------------- */
const boardEl = document.getElementById('board');
const messageEl = document.getElementById('message');
const guessInput = document.getElementById('guessInput');
const submitBtn = document.getElementById('submitBtn');
const delBtn = document.getElementById('delBtn');
const newGameBtn = document.getElementById('newGameBtn');
const wordLengthSelect = document.getElementById('wordLength');
const keyboardEl = document.getElementById('keyboard');

/* -----------------------------
   Inicialização
   ----------------------------- */
function initFromUI(){
  wordLength = parseInt(wordLengthSelect.value, 10);
  guessInput.maxLength = wordLength;
  startNewGame();
}

function startNewGame(){
  // Reset
  attempt = 0;
  isGameOver = false;
  board = Array.from({length: MAX_ATTEMPTS}, () => Array.from({length: wordLength}, () => ''));
  targetWord = pickRandomWord(wordLength);
  renderBoard();
  renderKeyboard(); // reset keyboard colors
  message(`Jogo iniciado: ${wordLength} letras — você tem ${MAX_ATTEMPTS} tentativas.`);
  guessInput.value = '';
  guessInput.setAttribute('aria-hidden','false');
  boardEl.setAttribute('aria-hidden','false');
  keyboardEl.setAttribute('aria-hidden','false');
  // console.log('PALAVRA-ALVO:', targetWord); // descomente para debug
}

function pickRandomWord(len){
  const pool = DICTIONARY[len] || [];
  if(pool.length === 0) {
    message(`Sem palavras para ${len} letras. Atualize o dicionário em script.js.`);
    return 'palavra'.slice(0,len);
  }
  return pool[Math.floor(Math.random()*pool.length)].toLowerCase();
}

/* -----------------------------
   Render UI
   ----------------------------- */
function renderBoard(){
  // configure grid columns dinamicamente
  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;
  // But we prefer rows of cells
  for(let r=0;r<MAX_ATTEMPTS;r++){
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.row = r;
    for(let c=0;c<wordLength;c++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.textContent = board[r][c] || '';
      row.appendChild(cell);
    }
    boardEl.appendChild(row);
  }
}

function message(txt, timeout=4000){
  messageEl.textContent = txt;
  if(timeout>0){
    clearTimeout(messageEl._timeout);
    messageEl._timeout = setTimeout(()=> {
      // only clear if not game over
      if(!isGameOver) messageEl.textContent = '';
    }, timeout);
  }
}

function renderKeyboard(){
  // keyboard basic set (letters a-z)
  const keys = "qwertyuiopasdfghjklçzxcvbnm".toUpperCase().split('');
  keyboardEl.innerHTML = '';
  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'key';
    btn.textContent = k;
    btn.dataset.letter = k;
    btn.addEventListener('click', ()=> insertLetter(k));
    keyboardEl.appendChild(btn);
  });
}

/* -----------------------------
   Interações & lógica
   ----------------------------- */
submitBtn.addEventListener('click', onSubmit);
delBtn.addEventListener('click', onDelete);
newGameBtn.addEventListener('click', initFromUI);
wordLengthSelect.addEventListener('change', ()=> {
  // adjust maxlength and placeholder
  wordLength = parseInt(wordLengthSelect.value, 10);
  guessInput.maxLength = wordLength;
  guessInput.placeholder = `Digite ${wordLength} letras`;
});

guessInput.addEventListener('keydown', (e)=>{
  if(isGameOver) return;
  const key = e.key;
  if(key === 'Enter'){ e.preventDefault(); onSubmit(); return; }
  if(key === 'Backspace'){ return; } // allow default deleting
  // prevent non letters
  if(key.length === 1 && !/^[a-zA-ZçÇáÁàÀâÂãÃéÉêÊíÍóÓôÔõÕúÚüÜñÑ]$/.test(key)){
    e.preventDefault();
  }
});

/* Inserir letra via teclado na tela virtual (apenas adiciona ao input) */
function insertLetter(letter){
  if(isGameOver) return;
  letter = letter.toLowerCase();
  const cur = guessInput.value || '';
  if(cur.length < wordLength){
    guessInput.value = cur + letter;
    guessInput.focus();
  }
}

function onDelete(){
  if(isGameOver) return;
  guessInput.value = (guessInput.value || '').slice(0, -1);
  guessInput.focus();
}

function onSubmit(){
  if(isGameOver) return;
  const raw = (guessInput.value || '').trim().toLowerCase();
  if(raw.length !== wordLength){
    message(`A palavra precisa ter ${wordLength} letras.`, 2500);
    return;
  }
  if(!isValidWord(raw)){
    message('Palavra não encontrada no dicionário (exemplo).', 3000);
    return;
  }

  // Coloca no tabuleiro
  board[attempt] = raw.split('');
  animateAndEvaluateRow(attempt, raw);
  attempt++;
  guessInput.value = '';

  if(!isGameOver && attempt >= MAX_ATTEMPTS){
    isGameOver = true;
    message(`Fim de jogo — palavras acabaram. A palavra era: ${targetWord.toUpperCase()}`, 10000);
    revealKeyboard(); // final coloring
  }
}

/* Checa se a palavra existe no dicionário (apenas no pool do mesmo comprimento) */
function isValidWord(w){
  const pool = DICTIONARY[w.length] || [];
  return pool.includes(w);
}

/* Avalia e anima a linha */
function animateAndEvaluateRow(rowIndex, guess){
  const rowEl = boardEl.querySelector(`.row[data-row="${rowIndex}"]`);
  if(!rowEl) return;
  const guessArr = guess.split('');
  const targetArr = targetWord.split('');
  const result = new Array(wordLength).fill('absent');

  // Primeiro passe: acertos exatos
  for(let i=0;i<wordLength;i++){
    if(guessArr[i] === targetArr[i]){
      result[i] = 'correct';
      targetArr[i] = null; // consumido
    }
  }
  // Segundo passe: presentes em outra posição
  for(let i=0;i<wordLength;i++){
    if(result[i] === 'correct') continue;
    const idx = targetArr.indexOf(guessArr[i]);
    if(idx !== -1){
      result[i] = 'present';
      targetArr[idx] = null; // consumido
    }
  }

  // Aplicar classes com pequeno delay tipo "flip"
  const cells = Array.from(rowEl.querySelectorAll('.cell'));
  cells.forEach((cell,i)=>{
    cell.textContent = guessArr[i].toUpperCase();
    cell.classList.add('filled');
    setTimeout(()=>{
      cell.classList.add('flip'); // trigger
      setTimeout(()=>{
        cell.classList.remove('flip');
        cell.classList.add(result[i]);
      }, 130);
    }, i * 200);
  });

  // Atualiza teclado
  setTimeout(()=> updateKeyboard(guessArr, result), wordLength * 200 + 120);

  // Verifica vitória
  if(result.every(r => r === 'correct')){
    isGameOver = true;
    setTimeout(()=> message(`Parabéns! Você acertou: ${guess.toUpperCase()}`, 700), 300*wordLength);
  }
}

/* Atualiza cores do teclado (prioriza correct > present > absent) */
function updateKeyboard(letters, results){
  letters.forEach((ltr,i)=>{
    const key = keyboardEl.querySelector(`.key[data-letter="${ltr.toUpperCase()}"]`);
    if(!key) return;
    // prioridade: correct > present > absent
    if(results[i] === 'correct'){
      key.style.background = ''; // deixar consistente com board
      key.classList.add('correct');
      key.classList.remove('present','absent');
      key.style.background = ''; // styles controlled via classes, but we rely on inline for simplicity
      key.style.border = '2px solid rgba(0,0,0,0.2)';
      key.style.background = 'linear-gradient(90deg, #24c281, #16a76b)';
      key.style.color = '#071710';
    } else if(results[i] === 'present'){
      if(!key.classList.contains('correct')){
        key.classList.add('present');
        key.classList.remove('absent');
        key.style.background = 'linear-gradient(90deg, #e3b84b, #c58f2b)';
        key.style.color = '#071205';
      }
    } else {
      if(!key.classList.contains('correct') && !key.classList.contains('present')){
        key.classList.add('absent');
        key.style.background = 'linear-gradient(90deg, #2b3440, #141920)';
        key.style.color = '#778391';
      }
    }
  });
}

function revealKeyboard(){
  // Marca teclado conforme estado do tabuleiro (apenas para mostrar)
  for(let r=0;r<=attempt-1;r++){
    const row = board[r].join('');
    if(!row) continue;
    const guessArr = row.split('');
    // recompute result (same logic as antes)
    const targetArr = targetWord.split('');
    const result = new Array(wordLength).fill('absent');
    for(let i=0;i<wordLength;i++){
      if(guessArr[i] === targetArr[i]){
        result[i] = 'correct';
        targetArr[i] = null;
      }
    }
    for(let i=0;i<wordLength;i++){
      if(result[i] === 'correct') continue;
      const idx = targetArr.indexOf(guessArr[i]);
      if(idx!==-1){
        result[i] = 'present';
        targetArr[idx] = null;
      }
    }
    updateKeyboard(guessArr, result);
  }
}

/* -----------------------------
   Inicial: ligar UI
   ----------------------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  renderKeyboard();
  wordLengthSelect.value = '5';
  initFromUI();

  // Teclado físico: permite digitar normalmente
  document.addEventListener('keydown', (e)=>{
    if(isGameOver) return;
    const key = e.key;
    if(key === 'Enter'){ e.preventDefault(); onSubmit(); return; }
    if(key === 'Backspace'){ return; } // default action deletes input
    if(key.length === 1 && /^[a-zA-ZçÇÀ-ÿ]$/.test(key)){
      // For mobile/inputs, send char into input
      // Only add if input shorter than allowed
      if((guessInput.value || '').length < wordLength){
        guessInput.value += key.toLowerCase();
      }
    }
  });
});
