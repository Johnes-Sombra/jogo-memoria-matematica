document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const nameModal = document.getElementById('nameModal');
    const player1NameInput = document.getElementById('player1Name');
    const player2NameInput = document.getElementById('player2Name');
    const startGameBtn = document.getElementById('startGameBtn');
    const changeNamesBtn = document.getElementById('changeNamesBtn');
    const gameBoard = document.getElementById('gameBoard');
    const player1Element = document.getElementById('player1');
    const player2Element = document.getElementById('player2');
    const player1Display = document.getElementById('player1Display');
    const player2Display = document.getElementById('player2Display');
    const player1Header = document.getElementById('player1Header');
    const player2Header = document.getElementById('player2Header');
    const player1ScoreElement = player1Element.querySelector('.player-score');
    const player2ScoreElement = player2Element.querySelector('.player-score');
    const scoreTableBody = document.getElementById('scoreTableBody');
    const messageElement = document.getElementById('message');
    const restartBtn = document.getElementById('restartBtn');
    const rulesBtn = document.getElementById('rulesBtn');

    // Estado do jogo
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let currentPlayer = 1;
    let scores = { 1: 0, 2: 0 };
    let gameActive = true;
    let playerNames = { 1: 'Jogador 1', 2: 'Jogador 2' };
    let gameHistory = [];
    const MAX_HISTORY = 10;

    // Perguntas e respostas de matemática
    const mathQuestions = [
        { question: "8 + 5", answer: "13" },
        { question: "12 - 7", answer: "5" },
        { question: "6 × 4", answer: "24" },
        { question: "512 - 128", answer: "386" },
        { question: "9²", answer: "81" },
        { question: "√64", answer: "8" },
        { question: "128 - 64", answer: "64" },
        { question: "7 × 8", answer: "56" },
        { question: "45 ÷ 9", answer: "5" },
        { question: "11 + 14", answer: "25" },
        { question: "20 - 13", answer: "7" },
        { question: "1024 - 512", answer: "512" },
        { question: "√144", answer: "12" },
        { question: "5 × 7", answer: "35" },
        // Cards adicionais para desempate
        { question: "18 ÷ 6", answer: "3" },
        { question: "32 + 8", answer: "40" },
        { question: "√81", answer: "9" }
    ];

    // Inicializar o jogo
    function initGame() {
        // Mostrar modal para inserir nomes
        showNameModal();
    }

    // Mostrar modal de nomes
    function showNameModal() {
        nameModal.style.display = 'flex';
        player1NameInput.value = playerNames[1];
        player2NameInput.value = playerNames[2];
        player1NameInput.focus();
    }

    // Iniciar jogo com os nomes fornecidos
    function startGameWithNames() {
        const name1 = player1NameInput.value.trim() || 'Jogador 1';
        const name2 = player2NameInput.value.trim() || 'Jogador 2';
        
        playerNames[1] = name1;
        playerNames[2] = name2;
        
        player1Display.textContent = name1;
        player2Display.textContent = name2;
        player1Header.textContent = name1;
        player2Header.textContent = name2;
        
        nameModal.style.display = 'none';
        
        // Limpar tabuleiro
        gameBoard.innerHTML = '';
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        currentPlayer = 1;
        scores = { 1: 0, 2: 0 };
        gameActive = true;
        
        // Atualizar interface
        player1ScoreElement.textContent = '0';
        player2ScoreElement.textContent = '0';
        player1Element.classList.add('active');
        player2Element.classList.remove('active');
        messageElement.textContent = `${playerNames[1]}, é sua vez!`;

        // Criar pares de cartas
        const cardPairs = [...mathQuestions];
        
        // Embaralhar as cartas
        shuffleArray(cardPairs);
        
        // Criar cartas
        cardPairs.forEach((item, index) => {
            // Carta com pergunta (vermelho)
            createCard('question', item.question, index);
            
            // Carta com resposta (verde)
            createCard('answer', item.answer, index + cardPairs.length);
        });
        
        // Embaralhar as cartas no tabuleiro
        shuffleCards();
    }

    // Adicionar resultado ao histórico
    function addToHistory(winner) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const gameResult = {
            id: Date.now(),
            date: dateStr,
            time: timeStr,
            player1: playerNames[1],
            player2: playerNames[2],
            score1: scores[1],
            score2: scores[2],
            winner: winner
        };
        
        // Adicionar ao início do array
        gameHistory.unshift(gameResult);
        
        // Manter apenas os últimos MAX_HISTORY jogos
        if (gameHistory.length > MAX_HISTORY) {
            gameHistory.pop(); // Remove o jogo mais antigo
        }
        
        updateScoreTable();
    }

    // Atualizar tabela de pontuação
    function updateScoreTable() {
        scoreTableBody.innerHTML = '';
        
        if (gameHistory.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="4" style="color: #666; font-style: italic;">Nenhum jogo registrado ainda</td>`;
            scoreTableBody.appendChild(emptyRow);
            return;
        }
        
        gameHistory.forEach((game, index) => {
            const row = document.createElement('tr');
            
            // Data/Hora
            const datetimeCell = document.createElement('td');
            datetimeCell.textContent = `${game.date} ${game.time}`;
            
            // Pontuação Jogador 1
            const score1Cell = document.createElement('td');
            score1Cell.textContent = game.score1;
            if (game.winner === 1) {
                score1Cell.className = 'win';
            } else if (game.winner === 2) {
                score1Cell.className = 'loss';
            }
            
            // Pontuação Jogador 2
            const score2Cell = document.createElement('td');
            score2Cell.textContent = game.score2;
            if (game.winner === 2) {
                score2Cell.className = 'win';
            } else if (game.winner === 1) {
                score2Cell.className = 'loss';
            }
            
            // Resultado
            const resultCell = document.createElement('td');
            let resultText = '';
            let resultClass = '';
            
            if (game.winner === 1) {
                resultText = `${game.player1} venceu`;
                resultClass = 'win';
            } else if (game.winner === 2) {
                resultText = `${game.player2} venceu`;
                resultClass = 'win';
            } else {
                resultText = 'Empate';
                resultClass = 'draw';
            }
            
            resultCell.textContent = resultText;
            resultCell.className = resultClass;
            
            row.appendChild(datetimeCell);
            row.appendChild(score1Cell);
            row.appendChild(score2Cell);
            row.appendChild(resultCell);
            
            scoreTableBody.appendChild(row);
        });
    }

    // Criar uma carta
    function createCard(type, content, id) {
        const card = document.createElement('div');
        card.className = `card ${type}`;
        card.dataset.id = id;
        card.dataset.type = type;
        card.dataset.content = content;
        
        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = type === 'question' ? '?' : 'R';
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = content;
        
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        
        card.addEventListener('click', () => flipCard(card));
        
        cards.push(card);
    }

    // Embaralhar as cartas no tabuleiro
    function shuffleCards() {
        shuffleArray(cards);
        cards.forEach(card => {
            gameBoard.appendChild(card);
        });
    }

    // Embaralhar array (algoritmo Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Virar uma carta
    function flipCard(card) {
        if (!gameActive || card.classList.contains('flipped') || flippedCards.length >= 2) {
            return;
        }
        
        card.classList.add('flipped');
        flippedCards.push(card);
        
        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }

    // Verificar se as cartas viradas formam um par
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        
        const hasQuestion = card1.classList.contains('question') || card2.classList.contains('question');
        const hasAnswer = card1.classList.contains('answer') || card2.classList.contains('answer');
        
        if (!hasQuestion || !hasAnswer) {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                switchPlayer();
                messageElement.textContent = `Par inválido! ${playerNames[currentPlayer]}, é sua vez!`;
            }, 1000);
            return;
        }
        
        const questionCard = card1.classList.contains('question') ? card1 : card2;
        const answerCard = card1.classList.contains('answer') ? card1 : card2;
        
        const questionContent = questionCard.dataset.content;
        const answerContent = answerCard.dataset.content;
        
        const question = mathQuestions.find(q => q.question === questionContent);
        
        if (question && question.answer === answerContent) {
            setTimeout(() => {
                questionCard.classList.add('match');
                answerCard.classList.add('match');
                
                scores[currentPlayer]++;
                updateScores();
                
                flippedCards = [];
                
                matchedPairs++;
                if (matchedPairs === mathQuestions.length) {
                    endGame();
                } else {
                    messageElement.textContent = `Par encontrado! ${playerNames[currentPlayer]}, continue jogando!`;
                }
            }, 500);
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                switchPlayer();
            }, 1000);
        }
    }

    // Trocar de jogador
    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        
        player1Element.classList.toggle('active');
        player2Element.classList.toggle('active');
        
        messageElement.textContent = `${playerNames[currentPlayer]}, é sua vez!`;
    }

    // Atualizar pontuações na interface
    function updateScores() {
        player1ScoreElement.textContent = scores[1];
        player2ScoreElement.textContent = scores[2];
    }

    // Finalizar o jogo
    function endGame() {
        gameActive = false;
        
        let winner;
        let winnerMessage;
        
        if (scores[1] > scores[2]) {
            winner = 1;
            winnerMessage = `${playerNames[1]} venceu!`;
        } else if (scores[2] > scores[1]) {
            winner = 2;
            winnerMessage = `${playerNames[2]} venceu!`;
        } else {
            winner = 0; // Empate
            winnerMessage = "Empate!";
        }
        
        messageElement.textContent = `Fim de jogo! ${winnerMessage}`;
        
        // Adicionar ao histórico
        addToHistory(winner);
    }

    // Mostrar regras do jogo
    function showRules() {
        alert(`REGRAS DO JOGO DA MEMÓRIA MATEMÁTICA:

1. O jogo é para dois jogadores que se alternam.
2. Cada jogador vira duas cartas por vez.
3. Se as cartas formarem um par (pergunta vermelha e resposta verde correta), o jogador ganha um ponto e joga novamente.
4. Se virar duas perguntas ou duas respostas, perde a vez.
5. Se não formarem um par correto, as cartas são viradas de volta e é a vez do próximo jogador.
6. O jogo termina quando todos os pares forem encontrados.
7. Vence o jogador com mais pontos.

HISTÓRICO:
• São mantidos os últimos 10 jogos
• A tabela mostra data, pontuação e resultado de cada jogo
• Verde: Vitória
• Vermelho: Derrota  
• Amarelo: Empate

BOA SORTE!`);
    }

    // Event Listeners
    startGameBtn.addEventListener('click', startGameWithNames);
    restartBtn.addEventListener('click', startGameWithNames);
    changeNamesBtn.addEventListener('click', showNameModal);
    rulesBtn.addEventListener('click', showRules);

    // Permitir iniciar com Enter
    player1NameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            player2NameInput.focus();
        }
    });

    player2NameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGameWithNames();
        }
    });

    // Inicializar o jogo e a tabela
    initGame();
    updateScoreTable();
});