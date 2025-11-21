const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = "https://yzubdxptxxqojjnnplpx.supabase.co";
const supabaseKey = "sb_publishable_cMz8U-EqR0IvQAjoj1ZkhQ_r0T8LCZa"; // Coloque sua key válida
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

  // Deleta produtos do autor primeiro
  await supabase.from("livro").delete().eq("aut_id", id);
  await supabase.from("cds").delete().eq("aut_id", id);
  await supabase.from("dvds").delete().eq("aut_id", id);

  const { data, error } = await supabase.from("autor").delete().eq("id_aut", id).select();
  if (error) return res.status(400).json(error);
  res.json({ message: "Autor deletado", autor: data[0] });
});

// ===== PRODUTO =====
app.post("/produto", async (req, res) => {
  const { tipo, aut_id, titulo, genero, paginas, armazenamento, tempo, valor } = req.body;

  let tabela;
  let registro;

  if (tipo === "livro") {
    tabela = "livro";
    registro = { aut_id, titulo_liv: titulo, generoliterario_liv: genero, numeropaginas_liv: paginas, valor_liv: valor };
  } else if (tipo === "cd") {
    tabela = "cds";
    registro = { aut_id, titulo_cds: titulo, armazenamentocds: armazenamento, tempo_audio: tempo, valor };
  } else if (tipo === "dvd") {
    tabela = "dvds";
    registro = { aut_id, titulo_dvd: titulo, armazenamentodvd: armazenamento, tempo_video: tempo, valor };
  } else {
    return res.status(400).json({ error: "Tipo de produto inválido" });
  }

  const { data, error } = await supabase.from(tabela).insert([registro]).select();
  if (error) return res.status(400).json(error);
  res.json(data);
});

// ===== LISTAR TODOS OS PRODUTOS =====
app.get("/produtos", async (req, res) => {
  try {
    const { data: livros } = await supabase.from("livro").select("*");
    const { data: cds } = await supabase.from("cds").select("*");
    const { data: dvds } = await supabase.from("dvds").select("*");

    res.json({ livros, cds, dvds });
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
});

// ===== SERVIDOR =====
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
