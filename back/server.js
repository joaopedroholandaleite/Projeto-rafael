const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = "https://yzubdxptxxqojjnnplpx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dWJkeHB0eHhxb2pqbm5wbHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDc1NTQsImV4cCI6MjA3ODA4MzU1NH0.rK92NTcQBaG8YM54qVc9XWtYLbGgKbRVH6TbP6W7LUk";

const supabase = createClient(supabaseUrl, supabaseKey);

// ===== AUTOR =====
app.post("/autor", async (req, res) => {
  const { nome_aut, cpf_aut, datanascimento_aut } = req.body;
  const { data, error } = await supabase
    .from("autor")
    .insert([{ nome_aut, cpf_aut, datanascimento_aut }])
    .select();

  if (error) return res.status(400).json(error);
  res.json(data);
});

app.get("/autor", async (req, res) => {
  const { data, error } = await supabase.from("autor").select("*");
  if (error) return res.status(400).json(error);
  res.json(data);
});

// ===== DELETE AUTOR =====
app.delete("/autor/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const { data, error } = await supabase
    .from("autor")
    .delete()
    .eq("id_aut", id)
    .select(); // importante para que data retorne os registros deletados

  if (error) return res.status(400).json({ error: error.message });
  if (data.length === 0) return res.status(404).json({ error: "Autor não encontrado" });

  res.json({ message: "Autor deletado com sucesso", autor: data[0] });
});

// ===== PRODUTO ÚNICO: LIVRO, CD OU DVD =====
app.post("/produto", async (req, res) => {
  const { tipo, aut_id, titulo, genero, paginas, armazenamento, tempo, valor } = req.body;

  let tabela, registro;

  if (tipo === "livro") {
    tabela = "livro";
    registro = {
      aut_id,
      titulo_liv: titulo,
      generoliterario_liv: genero,
      numeropaginas_liv: paginas,
      valor_liv: valor,
    };
  } else if (tipo === "cd") {
    tabela = "cds";
    registro = {
      aut_id,
      titulo_cds: titulo,
      armazenamentocds: armazenamento,
      tempodevideo_cds: tempo,
      valor,
    };
  } else if (tipo === "dvd") {
    tabela = "dvds";
    registro = {
      aut_id,
      titulo_dvd: titulo,
      armazenamentodvd: armazenamento,
      tempodevideo_dvd: tempo,
      valor,
    };
  } else {
    return res.status(400).json({ error: "Tipo de produto inválido" });
  }

  const { data, error } = await supabase.from(tabela).insert([registro]).select();
  if (error) return res.status(400).json(error);
  res.json(data);
});

// ===== LISTAR PRODUTOS =====
app.get("/produto/:tipo", async (req, res) => {
  const tipo = req.params.tipo;
  let tabela;

  if (tipo === "livro") tabela = "livro";
  else if (tipo === "cd") tabela = "cds";
  else if (tipo === "dvd") tabela = "dvds";
  else return res.status(400).json({ error: "Tipo de produto inválido" });

  const { data, error } = await supabase.from(tabela).select("*");
  if (error) return res.status(400).json(error);
  res.json(data);
});

// ===== SERVIDOR =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
