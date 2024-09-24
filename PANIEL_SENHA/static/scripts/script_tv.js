let ultimoPacienteChamado = null;
let intervaloDeFala = null;
let tentativasDeFala = 0;
const maxTentativas = 3;

// Função para atualizar o atendimento atual
function atualizarAtendimentoAtual() {
    fetch('http://127.0.0.1:5000/get-atendimento-atual')
        .then(response => response.json())
        .then(atendimentoAtual => {
            const attendanceSection = document.getElementById('current-attendance');
            
            if (atendimentoAtual && (atendimentoAtual.nome !== ultimoPacienteChamado)) {
                // Atualizar nome, guichê, tipo de atendimento
                document.getElementById('current-name').textContent = atendimentoAtual.nome || 'Nenhum';
                document.getElementById('current-guiche').textContent = atendimentoAtual.guiche || 'Nenhum';
                document.getElementById('current-type').textContent = atendimentoAtual.tipo || 'Nenhum';

                // Aplicar classe de visibilidade suave
                attendanceSection.classList.remove('fade-out');
                attendanceSection.classList.add('fade-in');
                
                // Atualizar o último paciente chamado
                ultimoPacienteChamado = atendimentoAtual.nome;
                
                // Resetar tentativas e cancelar intervalo anterior
                tentativasDeFala = 0;
                clearInterval(intervaloDeFala);

                // Chamar o nome do paciente
                falarNome(atendimentoAtual.nome, atendimentoAtual.guiche);
                
                // Definir intervalo para repetir o anúncio
                intervaloDeFala = setInterval(() => {
                    tentativasDeFala++;
                    if (tentativasDeFala < maxTentativas) {
                        falarNome(atendimentoAtual.nome, atendimentoAtual.guiche);
                    } else {
                        clearInterval(intervaloDeFala);
                    }
                }, 10000); // 10 segundos
            } else if (!atendimentoAtual) {
                // Ocultar a seção se não houver paciente
                attendanceSection.classList.remove('fade-in');
                attendanceSection.classList.add('fade-out');
                ultimoPacienteChamado = null;
                clearInterval(intervaloDeFala);
            }
        })
        .catch(error => console.error('Erro ao obter atendimento atual:', error));
}

// Função para falar o nome do paciente e o guichê
function falarNome(nome, guiche) {
    const mensagem = `Por favor, ${nome}, dirija-se ao guichê ${guiche}.`;
    const utterance = new SpeechSynthesisUtterance(mensagem);
    speechSynthesis.speak(utterance);
}

// Função para atualizar a hora e o tempo
function atualizarHoraETempo() {
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${horas}:${minutos}:${segundos}`;

    // Exemplo de tempo estático
    document.getElementById('current-weather').textContent = "25°C - Céu limpo";
}

// Atualizar atendimento atual a cada 5 segundos
setInterval(atualizarAtendimentoAtual, 5000);

// Atualizar a hora a cada segundo
setInterval(atualizarHoraETempo, 1000);

// Atualizar as informações ao carregar a página
window.onload = function () {
    atualizarAtendimentoAtual();
    atualizarHoraETempo();
};
