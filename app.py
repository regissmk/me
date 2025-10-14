from flask import Flask, jsonify, request, render_template, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid # Para gerar tokens de convite e UUIDs
import hashlib # Para hash de senha
import os # Para variáveis de ambiente
from supabase import create_client, Client
from sqlalchemy.exc import IntegrityError # Para lidar com erros de integridade (duplicatas)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@host:port/database' # Substitua pela sua URI do Supabase
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Tabelas de associação para relações Many-to-Many
contrato_plano_association = db.Table('contrato_plano_association',
    db.Column('contrato_id', db.String(36), db.ForeignKey('contrato.id'), primary_key=True), # Alterado para String(36)
    db.Column('plano_id', db.Integer, db.ForeignKey('plano.id'), primary_key=True)
)

contrato_produto_association = db.Table('contrato_produto_association',
    db.Column('contrato_id', db.String(36), db.ForeignKey('contrato.id'), primary_key=True), # Alterado para String(36)
    db.Column('produto_id', db.Integer, db.ForeignKey('produto.id'), primary_key=True)
)

# NEW: Tabela de associação para Foto e Aluno (etiquetagem)
foto_aluno_association = db.Table('foto_aluno_association',
    db.Column('foto_id', db.Integer, db.ForeignKey('foto.id'), primary_key=True),
    db.Column('aluno_id', db.Integer, db.ForeignKey('aluno.id'), primary_key=True)
)

# Supabase Client Initialization
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role key for backend operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    telefone = db.Column(db.String(20), nullable=True)
    
    alunos = db.relationship('Aluno', backref='pai', lazy=True)
    assinaturas = db.relationship('Assinatura', backref='cliente', lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'

class Contrato(db.Model):
    id = db.Column(db.String(36), primary_key=True) # Alterado para String(36)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    token_convite = db.Column(db.String(36), unique=True, nullable=True, default=lambda: str(uuid.uuid4()))

    planos = db.relationship('Plano', secondary=contrato_plano_association, backref='contratos', lazy=True)
    produtos = db.relationship('Produto', secondary=contrato_produto_association, backref='contratos', lazy=True)

    def __repr__(self):
        return f'<Contrato {self.nome}>'

class Evento(db.Model):
    id = db.Column(db.String(36), primary_key=True) # Alterado para String(36)
    nome = db.Column(db.String(100), nullable=False)
    data = db.Column(db.Date, nullable=False)
    contrato_id = db.Column(db.String(36), db.ForeignKey('contrato.id'), nullable=False) # Alterado para String(36)
    contrato = db.relationship('Contrato', backref='eventos', lazy=True)

    def __repr__(self):
        return f'<Evento {self.nome}>'

class Turma(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    evento_id = db.Column(db.String(36), db.ForeignKey('evento.id'), nullable=False) # Alterado para String(36)
    evento = db.relationship('Evento', backref='turmas', lazy=True)

    def __repr__(self):
        return f'<Turma {self.nome}>'

class Aluno(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=True)
    turno = db.Column(db.String(50), nullable=True)
    foto_referencia_url = db.Column(db.String(255), nullable=True)
    school_course = db.Column(db.String(255), nullable=True)
    turma_id = db.Column(db.Integer, db.ForeignKey('turma.id'), nullable=True)
    turma = db.relationship('Turma', backref='alunos_na_turma', lazy=True)

    def __repr__(self):
        return f'<Aluno {self.nome}>'

class Foto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(255), nullable=False)
    # Removido aluno_id, agora usamos a tabela de associação
    evento_id = db.Column(db.String(36), db.ForeignKey('evento.id'), nullable=False) # Alterado para String(36)
    evento = db.relationship('Evento', backref='fotos_evento', lazy=True)
    # NEW: Relação muitos-para-muitos com Aluno
    alunos_etiquetados = db.relationship('Aluno', secondary=foto_aluno_association, backref='fotos_etiquetadas', lazy=True)

    def __repr__(self):
        return f'<Foto {self.url}>'

class Plano(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    preco = db.Column(db.Numeric(10, 2), nullable=False)

    def __repr__(self):
        return f'<Plano {self.nome}>'

class Produto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    preco = db.Column(db.Numeric(10, 2), nullable=False)

    def __repr__(self):
        return f'<Produto {self.nome}>'

class Assinatura(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    plano_id = db.Column(db.Integer, db.ForeignKey('plano.id'), nullable=False)
    data_assinatura = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Assinatura User:{self.user_id} Plano:{self.plano_id}>'

def send_welcome_whatsapp(phone_number, client_name, client_dashboard_link):
    whatsapp_api_key = os.getenv('WHATSAPP_API_KEY')
    if not whatsapp_api_key:
        print("WHATSAPP_API_KEY não configurada. Pulando envio de mensagem WhatsApp.")
        return False

    print(f"Simulando mensagem WhatsApp para {phone_number} para {client_name}.")
    print(f"Mensagem: 🎉 Olá, {client_name}! Seja bem-vindo(a) à Memory School Fotografia! Seu cadastro foi concluído com sucesso. Acesse sua área do cliente aqui: {client_dashboard_link}")
    return True

@app.route('/')
def index():
    return "Bem-vindo à Memory School!"

@app.route('/admin/contrato/<string:contrato_id>/gerar-convite', methods=['POST']) # Alterado para string
def gerar_convite(contrato_id):
    contrato = db.session.get(Contrato, contrato_id)
    if not contrato:
        return jsonify({"error": "Contrato não encontrado"}), 404

    token = str(uuid.uuid4())
    contrato.token_convite = token
    db.session.commit()

    invite_link = f"http://localhost:3000/cadastro/{token}" 
    
    return jsonify({"message": "Link de convite gerado com sucesso", "invite_link": invite_link}), 200

@app.route('/convite/<token>', methods=['GET'])
def validar_convite(token):
    contrato = Contrato.query.filter_by(token_convite=token).first()
    if contrato:
        return render_template('cadastro.html', token=token)
    else:
        return "Link de convite inválido ou expirado", 404

@app.route('/api/contract-details/<token>', methods=['GET'])
def get_contract_details(token):
    contrato = Contrato.query.filter_by(token_convite=token).first()
    if not contrato:
        return jsonify({"error": "Contrato não encontrado ou inválido"}), 404

    plans_data = []
    for cp in contrato.planos:
        plans_data.append({
            "id": cp.id,
            "name": cp.nome,
            "description": cp.descricao,
            "price": float(cp.preco)
        })

    products_data = []
    for prod in contrato.produtos:
        products_data.append({
            "id": prod.id,
            "name": prod.nome,
            "description": prod.descricao,
            "price": float(prod.preco)
        })

    return jsonify({
        "id": contrato.id,
        "name": contrato.nome,
        "plans": plans_data,
        "products": products_data
    }), 200

@app.route('/api/register', methods=['POST'])
def register_client():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Dados JSON ausentes"}), 400

    invite_token = data.get('contractSlug')
    cpf = data.get('cpf')
    parent_name = data.get('parentName')
    phone = data.get('phone')
    parent_email = data.get('parentEmail')
    password = data.get('password')
    children_data = data.get('children', [])
    selected_plan_id = data.get('selectedPlan')

    if not all([invite_token, cpf, parent_name, phone, parent_email, password]):
        return jsonify({"error": "Campos obrigatórios ausentes"}), 400
    if not children_data:
        return jsonify({"error": "Pelo menos um filho deve ser cadastrado"}), 400
    if not selected_plan_id:
        return jsonify({"error": "Um plano deve ser selecionado para a assinatura"}), 400

    try:
        contrato = Contrato.query.filter_by(token_convite=invite_token).first()
        if not contrato:
            return jsonify({"error": "Token de convite inválido ou contrato não encontrado"}), 400

        password_hash = hashlib.sha256(password.encode()).hexdigest()
        new_user = User(
            email=parent_email,
            password_hash=password_hash,
            cpf=cpf,
            telefone=phone
        )
        db.session.add(new_user)
        db.session.flush()

        for child_data in children_data:
            dob_str = child_data.get('dob')
            data_nascimento = None
            if dob_str and len(dob_str) == 10:
                try:
                    data_nascimento = datetime.strptime(dob_str, '%d/%m/%Y').date()
                except ValueError:
                    print(f"Aviso: Formato de data inválido para o filho {child_data.get('name')}: {dob_str}")

            new_aluno = Aluno(
                nome=child_data.get('name'),
                user_id=new_user.id,
                data_nascimento=data_nascimento,
                turno=child_data.get('shift'),
                foto_referencia_url=child_data.get('photoPreview'),
                school_course=f"{child_data.get('school')} - {child_data.get('class')} ({child_data.get('shift')})"
            )
            db.session.add(new_aluno)
        
        plano = Plano.query.get(selected_plan_id)
        if not plano:
            db.session.rollback()
            return jsonify({"error": "Plano selecionado não encontrado"}), 400

        new_assinatura = Assinatura(
            user_id=new_user.id,
            plano_id=selected_plan_id,
            data_assinatura=datetime.utcnow()
        )
        db.session.add(new_assinatura)

        db.session.commit()

        client_dashboard_link = f"http://localhost:3000/client/dashboard"
        send_welcome_whatsapp(phone, parent_name.split(' ')[0], client_dashboard_link)

        return jsonify({"status": "success", "message": "Cadastro realizado com sucesso!"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Erro durante o cadastro: {e}")
        return jsonify({"error": "Erro interno do servidor", "details": str(e)}), 500

# NEW: API Endpoint to synchronize Gallery (Supabase) with Evento (Flask)
@app.route('/api/sync-gallery-event', methods=['POST'])
def sync_gallery_event():
    data = request.get_json()
    gallery_id = data.get('id')
    name = data.get('name')
    contract_id = data.get('contract_id')
    
    if not all([gallery_id, name, contract_id]):
        return jsonify({"error": "Missing gallery_id, name, or contract_id"}), 400

    try:
        # Check if contract exists in Flask's DB, if not, create it
        contrato = Contrato.query.get(contract_id)
        if not contrato:
            # Fetch contract details from Supabase if not found locally
            supabase_contract_data = supabase.from('contracts').select('*').eq('id', contract_id).single().execute()
            if supabase_contract_data.data:
                contrato = Contrato(
                    id=supabase_contract_data.data['id'],
                    nome=supabase_contract_data.data['name'],
                    descricao=supabase_contract_data.data['description'],
                    token_convite=supabase_contract_data.data['invite_link_id']
                )
                db.session.add(contrato)
                db.session.flush() # Flush to make it available for Evento FK
            else:
                return jsonify({"error": "Contract not found in Supabase or Flask"}), 404

        evento = Evento.query.get(gallery_id)
        if evento:
            # Update existing event
            evento.nome = name
            evento.contrato_id = contract_id
            # Assuming 'data' is not directly managed by React Gallery form, keep existing or set a default
            # For simplicity, let's set it to today if not already set or if it needs updating
            if not evento.data:
                evento.data = datetime.utcnow().date()
        else:
            # Create new event
            evento = Evento(
                id=gallery_id,
                nome=name,
                data=datetime.utcnow().date(), # Default to current date
                contrato_id=contract_id
            )
            db.session.add(evento)
        
        db.session.commit()
        return jsonify({"message": "Evento synchronized successfully", "evento_id": evento.id}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error during gallery-event sync: {e}")
        return jsonify({"error": "Internal server error during sync", "details": str(e)}), 500

# NEW: Endpoint to delete an event in Flask
@app.route('/api/delete-event/<string:event_id>', methods=['POST'])
def delete_event(event_id):
    try:
        evento = db.session.get(Evento, event_id)
        if not evento:
            return jsonify({"message": "Evento não encontrado no Flask, ignorando exclusão."}), 200

        # Desvincular turmas e alunos
        for turma in evento.turmas:
            for aluno in turma.alunos_na_turma:
                aluno.turma_id = None
            db.session.delete(turma)
        
        # Desvincular fotos
        for foto in evento.fotos_evento:
            foto.alunos_etiquetados = [] # Remove all associations
            db.session.delete(foto)

        db.session.delete(evento)
        db.session.commit()
        return jsonify({"message": "Evento e dados associados deletados com sucesso no Flask."}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao deletar evento no Flask: {e}")
        return jsonify({"error": "Erro interno do servidor ao deletar evento no Flask", "details": str(e)}), 500


@app.route('/admin/evento/<string:evento_id>', methods=['GET']) # Alterado para string
def admin_evento_detalhes(evento_id):
    evento = db.session.get(Evento, evento_id)
    if not evento:
        return "Evento não encontrado", 404

    contrato = db.session.get(Contrato, evento.contrato_id)
    if not contrato:
        return "Contrato associado ao evento não encontrado", 404

    turmas = Turma.query.filter_by(evento_id=evento_id).all()
    fotos = Foto.query.filter_by(evento_id=evento_id).all()

    # Fetch contract plans from Supabase (assuming plans are managed there)
    # This part needs to be adapted if Flask also manages plans/products
    # For now, we'll fetch from Supabase via the client
    supabase_contract_plans_response = supabase.from('contract_plans').select('plan_id').eq('contract_id', contrato.id).execute()
    supabase_contract_plan_ids = [item['plan_id'] for item in supabase_contract_plans_response.data] if supabase_contract_plans_response.data else []

    # Fetch users who have subscribed to these plans
    # This part assumes a mapping between Supabase user IDs and Flask user IDs, which is not direct.
    # For now, we'll simplify and just get all Alunos for demonstration.
    # In a real app, you'd need to link Supabase user IDs to Flask user IDs.
    students_for_contract = []
    if supabase_contract_plan_ids:
        # This is a placeholder. A direct join between Flask's User/Aluno and Supabase's auth.users/clients/orders is complex.
        # For now, we'll fetch all students and filter by contract later if needed.
        # A more robust solution would involve syncing Supabase client/user IDs to Flask's User model.
        all_alunos = Aluno.query.all()
        # Simplified: just get all students for now, as direct contract-plan-user-aluno link is complex across backends
        students_for_contract = all_alunos


    return render_template(
        'admin_evento_detalhes.html',
        evento=evento,
        contrato=contrato,
        turmas=turmas,
        fotos=fotos,
        students_for_contract=students_for_contract
    )

@app.route('/admin/evento/<string:evento_id>/add-turma', methods=['POST']) # Alterado para string
def add_turma(evento_id):
    evento = db.session.get(Evento, evento_id)
    if not evento:
        return jsonify({"error": "Evento não encontrado"}), 404

    data = request.get_json()
    nome_turma = data.get('nome')
    if not nome_turma:
        return jsonify({"error": "Nome da turma é obrigatório"}), 400

    new_turma = Turma(nome=nome_turma, evento_id=evento_id)
    db.session.add(new_turma)
    db.session.commit()
    return jsonify({"message": "Turma adicionada com sucesso", "turma": {"id": new_turma.id, "nome": new_turma.nome}}), 201

@app.route('/admin/turma/<int:turma_id>/add-aluno', methods=['POST'])
def associate_aluno_turma(turma_id):
    turma = db.session.get(Turma, turma_id)
    if not turma:
        return jsonify({"error": "Turma não encontrada"}), 404

    data = request.get_json()
    aluno_id = data.get('aluno_id')
    if not aluno_id:
        return jsonify({"error": "ID do aluno é obrigatório"}), 400

    aluno = db.session.get(Aluno, aluno_id)
    if not aluno:
        return jsonify({"error": "Aluno não encontrado"}), 404

    aluno.turma_id = turma_id
    db.session.commit()
    return jsonify({"message": "Aluno associado à turma com sucesso", "aluno": {"id": aluno.id, "nome": aluno.nome}}), 200

# NEW: Endpoint para desassociar aluno da turma
@app.route('/admin/turma/<int:turma_id>/remove-aluno', methods=['POST'])
def remove_aluno_turma(turma_id):
    turma = db.session.get(Turma, turma_id)
    if not turma:
        return jsonify({"error": "Turma não encontrada"}), 404

    data = request.get_json()
    aluno_id = data.get('aluno_id')
    if not aluno_id:
        return jsonify({"error": "ID do aluno é obrigatório"}), 400

    aluno = db.session.get(Aluno, aluno_id)
    if not aluno:
        return jsonify({"error": "Aluno não encontrado"}), 404
    
    if aluno.turma_id != turma_id:
        return jsonify({"error": "Aluno não pertence a esta turma"}), 400

    aluno.turma_id = None # Desvincula o aluno da turma
    db.session.commit()
    return jsonify({"message": "Aluno removido da turma com sucesso"}), 200

# NEW: Endpoint para deletar turma
@app.route('/admin/turma/<int:turma_id>/delete', methods=['POST'])
def delete_turma(turma_id):
    turma = db.session.get(Turma, turma_id)
    if not turma:
        return jsonify({"error": "Turma não encontrada"}), 404
    
    # Desvincular todos os alunos desta turma
    for aluno in turma.alunos_na_turma:
        aluno.turma_id = None
    
    db.session.delete(turma)
    db.session.commit()
    return jsonify({"message": "Turma deletada com sucesso e alunos desvinculados"}), 200


@app.route('/admin/evento/<string:evento_id>/upload-fotos', methods=['POST']) # Alterado para string
def upload_fotos(evento_id):
    evento = db.session.get(Evento, evento_id)
    if not evento:
        return jsonify({"error": "Evento não encontrado"}), 404

    if 'files[]' not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    uploaded_files = request.files.getlist('files[]')
    if not uploaded_files:
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400

    photo_urls = []
    for file in uploaded_files:
        if file.filename == '':
            continue

        try:
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            # Padronizando o bucket para 'event_photos'
            file_name_in_storage = f"{evento_id}/{uuid.uuid4()}.{file_extension}"
            
            file_content = file.read() 
            
            response = supabase.storage.from("event_photos").upload( # Usando 'event_photos'
                file_name_in_storage,
                file_content,
                {"content-type": file.content_type}
            )
            
            if response.get('error'):
                raise Exception(response['error']['message'])

            public_url_response = supabase.storage.from("event_photos").get_public_url(file_name_in_storage) # Usando 'event_photos'
            if public_url_response.get('error'):
                raise Exception(public_url_response['error']['message'])
            
            public_url = public_url_response['data']['publicUrl']
            
            new_foto = Foto(url=public_url, evento_id=evento_id)
            db.session.add(new_foto)
            photo_urls.append(public_url)

        except Exception as e:
            db.session.rollback()
            print(f"Erro ao fazer upload ou registrar foto: {e}")
            return jsonify({"error": f"Erro ao processar arquivo {file.filename}: {str(e)}"}), 500

    db.session.commit()
    return jsonify({"message": f"{len(photo_urls)} fotos carregadas com sucesso", "urls": photo_urls}), 201

# NEW: Rota para a interface de etiquetagem do Admin
@app.route('/admin/evento/<string:evento_id>/etiquetar', methods=['GET']) # Alterado para string
def admin_etiquetagem(evento_id):
    evento = db.session.get(Evento, evento_id)
    if not evento:
        return "Evento não encontrado", 404

    turmas = Turma.query.filter_by(evento_id=evento_id).all()
    
    # Carregar alunos com seus pais para exibir CPF
    alunos_do_evento = []
    for turma in turmas:
        for aluno in turma.alunos_na_turma:
            alunos_do_evento.append({
                'id': aluno.id,
                'nome': aluno.nome,
                'cpf_pai': aluno.pai.cpf if aluno.pai else 'N/A',
                'turma_nome': turma.nome
            })

    fotos = Foto.query.filter_by(evento_id=evento_id).all()
    
    # Para cada foto, obter os IDs dos alunos já etiquetados
    fotos_com_etiquetas = []
    for foto in fotos:
        etiquetados_ids = [aluno.id for aluno in foto.alunos_etiquetados]
        fotos_com_etiquetas.append({
            'id': foto.id,
            'url': foto.url,
            'etiquetados_ids': etiquetados_ids
        })

    return render_template(
        'admin_etiquetagem.html',
        evento=evento,
        turmas=turmas,
        alunos_do_evento=alunos_do_evento,
        fotos=fotos_com_etiquetas
    )

# NEW: API para etiquetar fotos
@app.route('/api/fotos/etiquetar', methods=['POST'])
def etiquetar_fotos():
    data = request.get_json()
    foto_ids = data.get('foto_ids', [])
    aluno_ids = data.get('aluno_ids', [])
    action = data.get('action') # 'add' or 'remove'

    if not foto_ids or not aluno_ids or action not in ['add', 'remove']:
        return jsonify({"error": "Dados inválidos para etiquetagem"}), 400

    try:
        fotos = Foto.query.filter(Foto.id.in_(foto_ids)).all()
        alunos = Aluno.query.filter(Aluno.id.in_(aluno_ids)).all()

        for foto in fotos:
            for aluno in alunos:
                if action == 'add':
                    if aluno not in foto.alunos_etiquetados:
                        foto.alunos_etiquetados.append(aluno)
                elif action == 'remove':
                    if aluno in foto.alunos_etiquetados:
                        foto.alunos_etiquetados.remove(aluno)
        
        db.session.commit()
        return jsonify({"message": "Etiquetagem atualizada com sucesso"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Erro de integridade ao etiquetar fotos (possível duplicata)"}), 409
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao etiquetar fotos: {e}")
        return jsonify({"error": "Erro interno do servidor ao etiquetar fotos", "details": str(e)}), 500

# NEW: Rota para a galeria privada do Cliente
@app.route('/dashboard/evento/<string:evento_id>', methods=['GET']) # Alterado para string
def cliente_galeria(evento_id):
    # Placeholder para o ID do usuário logado.
    # Em uma aplicação real, você obteria isso de uma sessão ou token JWT.
    # Por exemplo, se você tivesse Flask-Login: current_user_id = current_user.id
    # Para fins de demonstração, vamos usar um ID fixo ou de sessão.
    current_user_id = session.get('user_id', 1) # Assumindo user_id=1 para teste se não houver sessão

    user = db.session.get(User, current_user_id)
    if not user:
        # Redirecionar para login ou exibir erro de autenticação
        return "Acesso não autorizado. Por favor, faça login.", 403

    evento = db.session.get(Evento, evento_id)
    if not evento:
        return "Evento não encontrado", 404

    # 1. Obter todos os alunos vinculados ao usuário logado
    alunos_do_usuario = user.alunos
    alunos_ids_do_usuario = [aluno.id for aluno in alunos_do_usuario]

    # 2. Buscar todas as fotos do evento que estão etiquetadas para QUALQUER um dos alunos do usuário
    fotos_filtradas = db.session.query(Foto).join(foto_aluno_association).filter(
        foto_aluno_association.c.aluno_id.in_(alunos_ids_do_usuario),
        Foto.evento_id == evento_id
    ).distinct().all() # Usar distinct para evitar fotos duplicadas se etiquetadas para múltiplos filhos do mesmo pai

    return render_template(
        'galeria_cliente.html',
        evento=evento,
        fotos=fotos_filtradas,
        alunos_do_usuario=alunos_do_usuario # Pode ser útil para exibir "Fotos do seu filho X"
    )


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Certifique-se de que o bucket 'event_photos' existe no Supabase Storage.")
        print("Certifique-se de que as variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão configuradas.")
        print("\nATENÇÃO: As tabelas 'contrato' e 'evento' no seu banco de dados Flask foram alteradas para usar UUIDs.")
        print("Você precisará DELETAR e RE-CRIAR suas tabelas Flask para que as mudanças entrem em vigor.")
        print("Isso apagará todos os dados existentes nessas tabelas Flask.")
    app.run(debug=True)