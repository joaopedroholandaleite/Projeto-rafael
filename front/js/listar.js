fetch("http://localhost:3000/autor")
  .then(res => res.json())
  .then(autores => {
    const ul = document.getElementById("lista-autores");

    if (autores.length === 0) {
      ul.innerHTML = "<li>Nenhum autor encontrado.</li>";
      return;
    }

    autores.forEach(a => {
      const li = document.createElement("li");
      li.textContent = `${a.nome_aut} — CPF: ${a.cpf_aut}`;
      ul.appendChild(li);
    });
  })
  .catch(err => console.error("Erro:", err));