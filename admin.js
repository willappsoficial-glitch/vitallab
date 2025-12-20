/**
 * CONFIGURAÇÃO DO ADMIN
 * Verifique se a URL abaixo é a mesma do seu script.js (mesma versão implantada)
 */
const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec"; 

// ==========================================
// 1. FUNÇÃO: CADASTRAR PACIENTE (CORRIGIDA)
// ==========================================
async function cadastrarPaciente() {
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCpf').value;
    const boxResultado = document.getElementById('resultadoCadastro');

    if (!nome || !cpf) {
        return Swal.fire('Atenção', 'Preencha Nome e CPF', 'warning');
    }

    Swal.fire({ title: 'Cadastrando...', didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'cadastrarPaciente',
                nome: nome,
                cpf: cpf
            })
        });

        const res = await response.json();
        Swal.close();

        if (res.success) {
            Swal.fire({
                icon: 'success',
                title: 'Cadastrado!',
                text: 'ID enviado para o Bloco 3 automaticamente.',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Mostra os dados no Bloco 1
            boxResultado.style.display = 'block';
            document.getElementById('resUser').innerText = cpf;
            document.getElementById('resSenha').innerText = res.senha;
            document.getElementById('resId').innerText = res.id;
            
            // === A MÁGICA ACONTECE AQUI ===
            // Pega o campo do Bloco 3 e preenche com o ID novo
            const inputBloco3 = document.getElementById('exameIdPaciente');
            inputBloco3.value = res.id;
            
            // Animação visual (Pisca verde forte e volta ao verde claro)
            inputBloco3.style.backgroundColor = "#198754"; // Verde escuro
            inputBloco3.style.color = "#fff"; // Texto branco
            
            setTimeout(() => { 
                inputBloco3.style.backgroundColor = "#e8f5e9"; // Volta ao original
                inputBloco3.style.color = "#000"; 
            }, 1000);

            // Limpa o formulário de cadastro para o próximo
            document.getElementById('cadNome').value = '';
            document.getElementById('cadCpf').value = '';
            
        } else {
            Swal.fire('Erro', res.message, 'error');
        }

    } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Falha na conexão.', 'error');
    }
}

// ==========================================
// 2. FUNÇÃO: BUSCAR PACIENTE
// ==========================================
async function buscarPaciente() {
    const termo = document.getElementById('buscaTermo').value;
    const box = document.getElementById('resultadoBusca');

    if (!termo) {
        return Swal.fire('Atenção', 'Digite um Nome ou CPF para buscar', 'warning');
    }

    // Feedback visual no botão da lupa
    const btnBusca = document.querySelector('.input-group button');
    const iconeOriginal = btnBusca.innerHTML;
    btnBusca.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'buscarPaciente',
                termo: termo
            })
        });

        const res = await response.json();
        btnBusca.innerHTML = iconeOriginal;

        if (res.success) {
            box.style.display = 'block';
            document.getElementById('buscNome').innerText = res.nome;
            document.getElementById('buscCpf').innerText = res.cpf;
            document.getElementById('buscId').innerText = res.id;
        } else {
            box.style.display = 'none';
            Swal.fire('Não encontrado', 'Nenhum paciente com esse dado.', 'info');
        }

    } catch (error) {
        console.error(error);
        btnBusca.innerHTML = iconeOriginal;
        Swal.fire('Erro', 'Falha na conexão.', 'error');
    }
}

// Função auxiliar para o botão "Usar ID" (Do Bloco 2 para o 3)
function usarIdEncontrado() {
    const idEncontrado = document.getElementById('buscId').innerText;
    
    if(!idEncontrado || idEncontrado === '...') return;

    const inputBloco3 = document.getElementById('exameIdPaciente');
    inputBloco3.value = idEncontrado;
    
    // Animação visual
    inputBloco3.style.backgroundColor = "#198754";
    inputBloco3.style.color = "#fff";
    setTimeout(() => { 
        inputBloco3.style.backgroundColor = "#e8f5e9"; 
        inputBloco3.style.color = "#000"; 
    }, 1000);
}


// ==========================================
// 3. FUNÇÃO: LANÇAR EXAME
// ==========================================
async function lancarExame() {
    const id = document.getElementById('exameIdPaciente').value;
    const exame = document.getElementById('exameNome').value;

    if (!id) {
        return Swal.fire('Atenção', 'O campo ID está vazio. Cadastre ou Busque um paciente antes.', 'warning');
    }

    Swal.fire({ title: 'Salvando...', didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'salvarExame',
                idPaciente: id,
                nomeExame: exame
            })
        });

        const res = await response.json();
        Swal.close();

        if (res.success) {
            Swal.fire('Sucesso', 'Exame lançado! Agora suba o PDF no AppSheet.', 'success');
            // Opcional: Limpar o ID após lançar ou manter para lançar outro exame do mesmo paciente?
            // Vou manter o ID lá caso queira lançar outro exame para a mesma pessoa.
        } else {
            Swal.fire('Erro', res.message, 'error');
        }

    } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Falha na conexão.', 'error');
    }
}
