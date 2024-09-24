from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import psycopg2

app = Flask(__name__, template_folder='../templates',static_folder='../static')

CORS(app, resources={r"/*": {"origins": "*"}})  # Ajuste de CORS
socketio = SocketIO(app)

@app.route('/fila')
def fila():
    return render_template('fila/fila.html')

@app.route('/chamada')
def chamada():
    return render_template('Chamada/chamada.html')

@app.route('/paniel_tv')
def paniel_tv():
    return render_template('Paniel_Tv/paniel_tv.html')

@app.route('/')
def menu():
    try:
        return render_template('menu.html')  # Renderiza o template do menu
    except Exception as e:
        print(f"Erro ao renderizar menu: {e}")
        return "Erro ao carregar o menu", 500


def get_db_connection():
    conn = psycopg2.connect(
        host='sorrowfully-harmless-stonechat.data-1.use1.tembo.io',
        database='postgres',
        user='postgres',
        password='CzyHzLKHFiAt9RVx',  
        port='5432'
    )
    return conn

@app.route('/adicionar-paciente', methods=['POST'])
def adicionar_paciente():
    data = request.json
    nome = data.get('nome')
    tipo = data.get('tipo')

    if not nome or not tipo:
        return jsonify({'message': 'Nome e tipo são obrigatórios!'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO fila_pacientes (nome, tipo_atendimento, status) VALUES (%s, %s, %s)',
        (nome, tipo, 'aguardando')
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Paciente adicionado com sucesso!'}), 201

@app.route('/get-fila', methods=['GET'])
def get_fila():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT nome, tipo_atendimento, status FROM fila_pacientes')  # Retorna todos os pacientes
    pacientes = cursor.fetchall()
    cursor.close()
    conn.close()

    lista_pacientes = [{'nome': paciente[0], 'tipo_atendimento': paciente[1], 'status': paciente[2]} for paciente in pacientes]
    return jsonify(lista_pacientes)

@app.route('/chamar-paciente', methods=['POST'])
def chamar_paciente():
    data = request.json
    nome = data.get('nome')
    guiche = data.get('guiche')

    if not nome or not guiche:
        return jsonify({'message': 'Nome e guichê são obrigatórios!'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Verifica se o paciente existe
        cursor.execute('SELECT * FROM fila_pacientes WHERE nome = %s', (nome,))
        paciente_existente = cursor.fetchone()
        if not paciente_existente:
            return jsonify({'error': 'Paciente não encontrado!'}), 404

        # Atualiza o status
        cursor.execute(
            'UPDATE fila_pacientes SET status = %s, guiche = %s WHERE nome = %s',
            ('chamado', guiche, nome)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'error': 'Falha ao atualizar paciente.'}), 500

        # Emitindo o evento
        socketio.emit('paciente_chamado', {'nome': nome, 'guiche': guiche})

        # Inicia a tarefa em segundo plano se necessário
        # socketio.start_background_task(update_status, nome)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({'message': 'Paciente chamado com sucesso!'}), 200




@app.route('/deletar-paciente', methods=['DELETE'])
def deletar_paciente():
    data = request.json
    nome = data.get('nome')

    if not nome:
        return jsonify({'message': 'Nome é obrigatório!'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('DELETE FROM fila_pacientes WHERE nome = %s', (nome,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'message': 'Paciente não encontrado!'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({'message': 'Paciente deletado com sucesso!'}), 200


@app.route('/get-atendimento-atual', methods=['GET'])
def get_atendimento_atual():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT nome, guiche, tipo_atendimento FROM fila_pacientes WHERE status = %s LIMIT 1', ('chamado',))
    atendimento = cursor.fetchone()
    cursor.close()
    conn.close()

    if atendimento:
        return jsonify({'nome': atendimento[0], 'guiche': atendimento[1], 'tipo': atendimento[2]})
    return jsonify(None)

@app.route('/get-lista-chamados', methods=['GET'])
def get_lista_chamados():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT nome, guiche FROM fila_pacientes WHERE status = %s', ('chamado',))
    chamados = cursor.fetchall()
    cursor.close()
    conn.close()

    lista_chamados = [{'nome': chamado[0], 'guiche': chamado[1]} for chamado in chamados]
    return jsonify(lista_chamados)

@app.route('/get-lista-atendidos', methods=['GET'])
def get_lista_atendidos():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT nome, guiche FROM fila_pacientes WHERE status = %s', ('atendido',))
    atendidos = cursor.fetchall()
    cursor.close()
    conn.close()

    lista_atendidos = [{'nome': atendido[0], 'guiche': atendido[1]} for atendido in atendidos]
    return jsonify(lista_atendidos)


@app.after_request
def apply_csp(response):
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' https://cdn.socket.io; connect-src 'self' http://127.0.0.1:8000; style-src 'self' 'unsafe-inline';"
    return response




if __name__ == '__main__':
    socketio.run(app, debug=True)
