const ul = document.getElementById("lista-autores");

// Função para buscar e renderizar autores
function listarAutores() {
  fetch("http://localhost:3000/autor")
    .then(res => res.json())
    .then(autores => {
      ul.innerHTML = ""; // limpa a lista antes de renderizar

      if (autores.length === 0) {
        ul.innerHTML = "<li style='color:#ccc; padding:10px;'>Nenhum autor encontrado.</li>";
        return;
      }

      autores.forEach(a => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.backgroundColor = "#1e1e1e";
        li.style.color = "#fff";
        li.style.padding = "12px 15px";
        li.style.borderRadius = "10px";
        li.style.marginBottom = "10px";
        li.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        li.textContent = `${a.nome_aut} — CPF: ${a.cpf_aut}`;

        // Criar botão de deletar
        const btnDelete = document.createElement("button");
        btnDelete.textContent = "Deletar";
        btnDelete.style.backgroundColor = "#ff4d4d";
        btnDelete.style.color = "#fff";
        btnDelete.style.border = "none";
        btnDelete.style.padding = "6px 12px";
        btnDelete.style.borderRadius = "8px";
        btnDelete.style.cursor = "pointer";
        btnDelete.style.fontWeight = "bold";
        btnDelete.style.transition = "0.2s";

        btnDelete.addEventListener("mouseover", () => btnDelete.style.backgroundColor = "#cc0000");
        btnDelete.addEventListener("mouseout", () => btnDelete.style.backgroundColor = "#ff4d4d");

        btnDelete.addEventListener("click", () => {
          if (confirm(`Deseja realmente deletar o autor ${a.nome_aut}?`)) {
            fetch(`http://localhost:3000/autor/${a.id_aut}`, { method: "DELETE" })
              .then(res => {
                if (res.ok) {
                  alert("Autor deletado com sucesso!");
                  listarAutores(); // atualizar a lista
                } else {
                  alert("Erro ao deletar autor.");
                }
              })
              .catch(err => console.error("Erro:", err));
          }
        });

        li.appendChild(btnDelete);
        ul.appendChild(li);
      });
    })
    .catch(err => console.error("Erro:", err));
}

// Chama a função inicialmente para carregar a lista
listarAutores();

