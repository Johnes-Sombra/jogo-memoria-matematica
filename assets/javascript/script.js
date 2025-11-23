document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const gameBoard = document.getElementById('gameBoard');
    const player1Element = document.getElementById('player1');
    const player2Element = document.getElementById('player2');
    const player1ScoreElement = player1Element.querySelector('.player-score');
    const player2ScoreElement = player2Element.querySelector('.player-score');
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

    // Perguntas e respostas de matemática
    const mathQuestions = [
        { question: "8 + 5", answer: "13" },
        { question: "12 - 7", answer: "5" },
        { question: "6 × 4", answer: "24" },
        { question: "15 ÷ 3", answer: "5" },
        { question: "9²", answer: "81" },
        { question: "√64", answer: "8" },
        { question: "1/2 + 1/4", answer: "3/4" },
        { question: "7 × 8", answer: "56" },
        { question: "45 ÷ 9", answer: "5" },
        { question: "11 + 14", answer: "25" },
        { question: "20 - 13", answer: "7" },
        { question: "3/4 - 1/2", answer: "1/4" },
        { question: "√144", answer: "12" },
        { question: "5 × 7", answer: "35" },
        // Cards adicionais para desempate
        { question: "18 ÷ 6", answer: "3" },
        { question: "9 + 16", answer: "25" },
        { question: "√81", answer: "9" }
    ];

    // Inicializar o jogo
    function initGame() {
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
        messageElement.textContent = 'Jogador 1, é sua vez!';

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

    // Criar uma carta
    function createCard(type, content, id) {
        const card = document.createElement('div');
        card.className = `card ${type}`; // Adiciona classe específica para o tipo
        card.dataset.id = id;
        card.dataset.type = type;
        card.dataset.content = content;
        
        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        // Mostra o conteúdo diretamente na frente (visível)
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
        // Embaralhar array de cartas
        shuffleArray(cards);
        
        // Adicionar cartas ao tabuleiro
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
        // Verificar se o jogo está ativo, se a carta já está virada ou se já temos 2 cartas viradas
        if (!gameActive || card.classList.contains('flipped') || flippedCards.length >= 2) {
            return;
        }
        
        // Virar a carta
        card.classList.add('flipped');
        flippedCards.push(card);
        
        // Verificar se temos duas cartas viradas
        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }

    // Verificar se as cartas viradas formam um par
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        
        // Verificar se temos uma pergunta e uma resposta
        const hasQuestion = card1.classList.contains('question') || card2.classList.contains('question');
        const hasAnswer = card1.classList.contains('answer') || card2.classList.contains('answer');
        
        if (!hasQuestion || !hasAnswer) {
            // Não é um par válido (duas perguntas ou duas respostas)
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                switchPlayer();
                messageElement.textContent = `Par inválido! Jogador ${currentPlayer}, é sua vez!`;
            }, 1000);
            return;
        }
        
        // Encontrar qual é a pergunta e qual é a resposta
        const questionCard = card1.classList.contains('question') ? card1 : card2;
        const answerCard = card1.classList.contains('answer') ? card1 : card2;
        
        const questionContent = questionCard.dataset.content;
        const answerContent = answerCard.dataset.content;
        
        // Verificar se é um par válido
        const question = mathQuestions.find(q => q.question === questionContent);
        
        if (question && question.answer === answerContent) {
            // Par encontrado!
            setTimeout(() => {
                questionCard.classList.add('match');
                answerCard.classList.add('match');
                
                // Atualizar pontuação
                scores[currentPlayer]++;
                updateScores();
                
                // Limpar cartas viradas
                flippedCards = [];
                
                // Verificar se o jogo terminou
                matchedPairs++;
                if (matchedPairs === mathQuestions.length) {
                    endGame();
                } else {
                    // Manter a vez do mesmo jogador
                    messageElement.textContent = `Par encontrado! Jogador ${currentPlayer}, continue jogando!`;
                }
            }, 500);
        } else {
            // Par não encontrado
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                
                // Limpar cartas viradas
                flippedCards = [];
                
                // Trocar jogador
                switchPlayer();
            }, 1000);
        }
    }

    // Trocar de jogador
    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        
        // Atualizar interface
        player1Element.classList.toggle('active');
        player2Element.classList.toggle('active');
        
        messageElement.textContent = `Jogador ${currentPlayer}, é sua vez!`;
    }

    // Atualizar pontuações na interface
    function updateScores() {
        player1ScoreElement.textContent = scores[1];
        player2ScoreElement.textContent = scores[2];
    }

    // Finalizar o jogo
    function endGame() {
        gameActive = false;
        
        let winnerMessage;
        if (scores[1] > scores[2]) {
            winnerMessage = "Jogador 1 venceu!";
        } else if (scores[2] > scores[1]) {
            winnerMessage = "Jogador 2 venceu!";
        } else {
            winnerMessage = "Empate!";
        }
        
        messageElement.textContent = `Fim de jogo! ${winnerMessage}`;
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

CORES DAS CARTAS:
• Vermelho: Perguntas (mostra "?")
• Verde: Respostas (mostra "R")

BOA SORTE!`);
    }

    // Event Listeners
    restartBtn.addEventListener('click', initGame);
    rulesBtn.addEventListener('click', showRules);

    // Iniciar o jogo
    initGame();
});