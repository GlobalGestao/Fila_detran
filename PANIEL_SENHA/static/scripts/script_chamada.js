document.addEventListener('DOMContentLoaded', () => {
    // Função para obter e renderizar os pacientes na fila
    function carregarPacientes() {
        fetch('http://127.0.0.1:8000/get-fila')
            .then(response => response.json())
            .then(pacientes => {
                const listaFila = document.getElementById('lista-fila');
                listaFila.innerHTML = ''; // Limpar a tabela antes de atualizar

                pacientes.forEach(paciente => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${paciente.nome}</td>
                        <td>${paciente.tipo_atendimento}</td>
                        <td>
                            <select class="guiche-selecionado">
                                <option value="1">Guichê 1</option>
                                <option value="2">Guichê 2</option>
                                <option value="3">Guichê 3</option>
                                <option value="4">Guichê 4</option>
                            </select>
                        </td>
                        <td>
                            <button class="chamar-btn">Chamar</button>
                            <button class="delete-btn">Deletar</button>
                        </td>
                    `;

                    listaFila.appendChild(row);

                    // Evento para chamar o paciente
                    row.querySelector('.chamar-btn').addEventListener('click', () => {
                        const guicheSelecionado = row.querySelector('.guiche-selecionado').value;
                        chamarPaciente(paciente.nome, guicheSelecionado);
                    });

                    // Evento para deletar o paciente
                    row.querySelector('.delete-btn').addEventListener('click', () => {
                        deletarPaciente(paciente.nome);
                    });
                });
            })
            .catch(error => console.error('Erro ao carregar pacientes:', error));
    }

    // Função para chamar o paciente
    function chamarPaciente(nome, guiche) {
        fetch('http://127.0.0.1:8000/chamar-paciente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, guiche: guiche })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                carregarPacientes();
            })
            .catch(error => console.error('Erro ao chamar paciente:', error));
    }

    // Função para deletar o paciente
    function deletarPaciente(nome) {
        fetch('http://127.0.0.1:8000/deletar-paciente', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                carregarPacientes();
            })
            .catch(error => console.error('Erro ao deletar paciente:', error));
    }

    // Carregar pacientes na inicialização
    carregarPacientes();
});
