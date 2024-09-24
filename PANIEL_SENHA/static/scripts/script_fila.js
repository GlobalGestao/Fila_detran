document.getElementById('convencional-btn').addEventListener('click', () => {
    adicionarPaciente("Convencional");
    getFila();  // Atualiza a fila após adicionar o paciente
});

document.getElementById('prioridade-btn').addEventListener('click', () => {
    adicionarPaciente("Prioridade");
    getFila();  // Atualiza a fila após adicionar o paciente
});

// Função para adicionar um paciente
async function adicionarPaciente(tipo) {
    const nome = document.getElementById('nome').value.trim();
    const notification = document.getElementById('notification');

    if (nome === "") {
        alert("Por favor, insira um nome.");
        return;
    }

    // Enviar dados para a API
    try {
        const response = await fetch('http://127.0.0.1:8000/adicionar-paciente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome: nome, tipo: tipo }),
        });

        if (!response.ok) {
            throw new Error('Erro ao adicionar paciente');
        }

        const result = await response.json();
        notification.textContent = result.message;
        notification.classList.remove('hidden');
        notification.classList.add('visible');

        setTimeout(() => {
            notification.classList.remove('visible');
            notification.classList.add('hidden');
        }, 3000);

        // Limpar o campo de entrada
        document.getElementById('nome').value = '';
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar paciente');
    }
}

// Função para buscar a contagem de pacientes na fila
async function getFila() {
    try {
        const response = await fetch('http://127.0.0.1:8000/get-fila', { method: 'GET' });
        const pacientes = await response.json();
        document.getElementById('pacientes-na-frente').textContent = pacientes.length;
    } catch (error) {
        console.error('Erro ao buscar a fila:', error);
    }
}

// Atualiza a fila ao carregar a página
window.onload = function() {
    getFila();
};
