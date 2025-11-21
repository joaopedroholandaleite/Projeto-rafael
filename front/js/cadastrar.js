// ===== Máscaras =====
function mascaraCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return cpf;
}

function mascaraValor(valor) {
  valor = valor.replace(/\D/g, "");
  valor = (valor / 100).toFixed(2) + "";
  valor = valor.replace(".", ",");
  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return valor;
}

// ===== Elementos do formulário =====
const formCadastro = document.getElementById("formCadastro");
const produtosContainer = document.getElementById("produtosContainer");
const addProdutoBtn = document.getElementById("addProduto");
const cpfInput = document.getElementById("cpf_aut");

// Aplica máscara de CPF ao digitar
cpfInput.addEventListener("input", (e) => {
  e.target.value = mascaraCPF(e.target.value);
});

// ===== Função para criar box de produto =====
function criarProdutoBox() {
  const box = document.createElement("div");
  box.classList.add("produto-box");

  box.innerHTML = `
    <label>Tipo de Produto</label>
    <select class="tipoProduto" required>
      <option value="">Selecione</option>
      <option value="livro">Livro</option>
      <option value="cd">CD</option>
      <option value="dvd">DVD</option>
    </select>

    <label>Título</label>
    <input type="text" class="tituloProduto" required>

    <div class="camposLivro" style="display:none;">
      <label>Gênero Literário</label>
      <input type="text" class="generoLivro">
      <label>Número de Páginas</label>
      <input type="number" class="paginasLivro">
      <label>Valor</label>
      <input type="text" class="valorProduto">
    </div>

    <div class="camposCD" style="display:none;">
      <label>Armazenamento (GB)</label>
      <input type="text" class="armazenamentoCD">
      <label>Tempo de Áudio (min)</label>
      <input type="number" class="tempoCD">
      <label>Valor</label>
      <input type="text" class="valorProduto">
    </div>

    <div class="camposDVD" style="display:none;">
      <label>Armazenamento (GB)</label>
      <input type="text" class="armazenamentoDVD">
      <label>Tempo de Vídeo (min)</label>
      <input type="number" class="tempoDVD">
      <label>Valor</label>
      <input type="text" class="valorProduto">
    </div>

    <button type="button" class="removeProduto">Remover</button>
    <hr>
  `;

  // Exibir campos conforme tipo selecionado
  const tipoSelect = box.querySelector(".tipoProduto");
  tipoSelect.addEventListener("change", () => {
    box.querySelector(".camposLivro").style.display = tipoSelect.value === "livro" ? "block" : "none";
    box.querySelector(".camposCD").style.display = tipoSelect.value === "cd" ? "block" : "none";
    box.querySelector(".camposDVD").style.display = tipoSelect.value === "dvd" ? "block" : "none";
  });

  // Máscara de valor
  box.querySelectorAll(".valorProduto").forEach(input => {
    input.addEventListener("input", (e) => {
      e.target.value = mascaraValor(e.target.value);
    });
  });

  // Remover box
  box.querySelector(".removeProduto").addEventListener("click", () => box.remove());

  produtosContainer.appendChild(box);
}

// Botão adicionar produto
addProdutoBtn.addEventListener("click", criarProdutoBox);

// ===== Envio do formulário =====
formCadastro.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Dados do autor
  const autor = {
    nome_aut: document.getElementById("nome_aut").value,
    cpf_aut: document.getElementById("cpf_aut").value.replace(/\D/g, ""),
    datanascimento_aut: document.getElementById("datanascimento_aut").value
  };

  try {
    // Cadastra autor
    const autorRes = await fetch("http://localhost:3000/autor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(autor)
    });

    const autorData = await autorRes.json();

    if (!autorData[0]?.id_aut) {
      alert("Erro ao cadastrar autor!");
      console.log("Resposta ao cadastrar autor:", autorData);
      return;
    }

    const aut_id = autorData[0].id_aut;

    // Cadastra produtos
    const boxes = produtosContainer.querySelectorAll(".produto-box");

    for (const box of boxes) {
      const tipo = box.querySelector(".tipoProduto").value;
      const titulo = box.querySelector(".tituloProduto").value;
      const valorRaw = box.querySelector(".valorProduto")?.value || "0,00";
      const valor = parseFloat(valorRaw.replace(/\./g, "").replace(",", "."));

      // Corpo da requisição
      let body = { tipo, aut_id, titulo };

      if (tipo === "livro") {
        body.genero = box.querySelector(".generoLivro").value;
        body.paginas = box.querySelector(".paginasLivro").value;
        body.valor = valor;
      } else if (tipo === "cd") {
        body.armazenamento = box.querySelector(".armazenamentoCD").value;
        body.tempo = box.querySelector(".tempoCD").value;
        body.valor = valor;
      } else if (tipo === "dvd") {
        body.armazenamento = box.querySelector(".armazenamentoDVD").value;
        body.tempo = box.querySelector(".tempoDVD").value;
        body.valor = valor;
      }

      // Envia para o endpoint único /produto
      await fetch("http://localhost:3000/produto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    }

    document.getElementById("msg").innerText = "Cadastro realizado com sucesso!";
    formCadastro.reset();
    produtosContainer.innerHTML = "";

  } catch (err) {
    console.error("Erro geral ao cadastrar:", err);
    alert("Erro ao cadastrar. Veja o console para detalhes.");
  }
});
