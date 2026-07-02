import { supabase } from "../lib/supabaseClient.js";

const DOCS_BUCKET = "documentos";

/* ---------------------------------------------------------------------- */
/* Mapeamento de linhas do banco (snake_case) <-> objetos do app (camelCase) */
/* ---------------------------------------------------------------------- */

function fromHistoricoRow(row) {
  return { id: row.id, data: row.data, texto: row.texto };
}

function fromDocumentoRow(row) {
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    tamanho: row.tamanho,
    dataUpload: row.data_upload,
    storagePath: row.storage_path,
  };
}

function fromPatientRow(row) {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    cpf: row.cpf,
    dataNascimento: row.data_nascimento || "",
    cidade: row.cidade,
    uf: row.uf,
    endereco: row.endereco,
    status: row.status,
    fonoaudiologo: row.fonoaudiologo,
    observacoes: row.observacoes,
    historico: (row.paciente_historico || [])
      .slice()
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .map(fromHistoricoRow),
    documentos: (row.documentos || [])
      .slice()
      .sort((a, b) => new Date(b.data_upload) - new Date(a.data_upload))
      .map(fromDocumentoRow),
  };
}

function toPatientRow(p) {
  return {
    nome: p.nome,
    telefone: p.telefone,
    cpf: p.cpf || "",
    data_nascimento: p.dataNascimento || null,
    cidade: p.cidade || "",
    uf: p.uf || "",
    endereco: p.endereco || "",
    status: p.status,
    fonoaudiologo: p.fonoaudiologo || "",
    observacoes: p.observacoes || "",
  };
}

function fromAppointmentRow(row) {
  return {
    id: row.id,
    pacienteId: row.paciente_id,
    unidadeId: row.unidade_id,
    tipo: row.tipo,
    data: row.data,
    hora: row.hora?.slice(0, 5) || row.hora,
    profissional: row.profissional,
    status: row.status,
    confirmadoEm: row.confirmado_em,
  };
}

function toAppointmentRow(a) {
  return {
    paciente_id: a.pacienteId,
    unidade_id: a.unidadeId,
    tipo: a.tipo,
    data: a.data,
    hora: a.hora,
    profissional: a.profissional || "",
    status: a.status,
    confirmado_em: a.confirmadoEm || null,
  };
}

function fromCatalogRow(row) {
  return { id: row.id, cat: row.cat, nome: row.nome, codigo: row.codigo, preco: Number(row.preco) };
}

function toCatalogRow(c) {
  return { cat: c.cat, nome: c.nome, codigo: c.codigo || "", preco: Number(c.preco) || 0 };
}

function fromUnitRow(row) {
  return {
    id: row.id,
    codigo: row.codigo,
    cidade: row.cidade,
    uf: row.uf,
    endereco: row.endereco,
    telefone: row.telefone,
    sede: row.sede,
  };
}

function toUnitRow(u) {
  return {
    codigo: u.codigo || "",
    cidade: u.cidade,
    uf: u.uf || "",
    endereco: u.endereco || "",
    telefone: u.telefone || "",
    sede: Boolean(u.sede),
  };
}

function fromOrderItemRow(row) {
  return { catalogoId: row.catalogo_id, nome: row.nome, codigo: row.codigo, quantidade: row.quantidade, precoUnitario: Number(row.preco_unitario) };
}

function fromOrderSeriesRow(row) {
  return { catalogoId: row.catalogo_id, nome: row.nome, numeroSerie: row.numero_serie };
}

function fromOrderRow(row) {
  const itens = (row.pedido_itens || []).filter((i) => !i.bonificacao).map(fromOrderItemRow);
  const bonificacao = (row.pedido_itens || []).filter((i) => i.bonificacao).map(fromOrderItemRow);
  return {
    id: row.id,
    numero: row.numero,
    idFabrica: row.id_fabrica,
    pacienteId: row.paciente_id,
    unidadeId: row.unidade_id,
    enderecoEntregaCustom: row.endereco_entrega_custom,
    condicaoPagamento: row.condicao_pagamento,
    fonoaudiologo: row.fonoaudiologo,
    itens,
    bonificacao,
    status: row.status,
    nf: row.nf_numero ? { numero: row.nf_numero, data: row.nf_data, fabricante: row.nf_fabricante } : null,
    series: (row.pedido_series || []).map(fromOrderSeriesRow),
    criadoEm: row.criado_em,
  };
}

/* ---------------------------------------------------------------------- */
/* Pacientes                                                              */
/* ---------------------------------------------------------------------- */

export async function listPatients() {
  const { data, error } = await supabase
    .from("pacientes")
    .select("*, paciente_historico(*), documentos(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(fromPatientRow);
}

export async function createPatient(patient, historicoTexto) {
  const { data, error } = await supabase.from("pacientes").insert(toPatientRow(patient)).select().single();
  if (error) throw error;
  if (historicoTexto) await addHistorico(data.id, historicoTexto);
  return fromPatientRow({ ...data, paciente_historico: [], documentos: [] });
}

export async function updatePatient(id, fields) {
  const { error } = await supabase.from("pacientes").update(pickDefined(fields)).eq("id", id);
  if (error) throw error;
}

function pickDefined(fields) {
  const map = {
    nome: "nome", telefone: "telefone", cpf: "cpf", dataNascimento: "data_nascimento",
    cidade: "cidade", uf: "uf", endereco: "endereco", status: "status",
    fonoaudiologo: "fonoaudiologo", observacoes: "observacoes",
  };
  const out = {};
  for (const [key, col] of Object.entries(map)) {
    if (key in fields) out[col] = fields[key];
  }
  return out;
}

export async function addHistorico(pacienteId, texto) {
  const { data, error } = await supabase
    .from("paciente_historico")
    .insert({ paciente_id: pacienteId, texto })
    .select()
    .single();
  if (error) throw error;
  return fromHistoricoRow(data);
}

export async function addDocumento(pacienteId, file, tipo) {
  const path = `${pacienteId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(DOCS_BUCKET).upload(path, file);
  if (uploadError) throw uploadError;
  const { data, error } = await supabase
    .from("documentos")
    .insert({ paciente_id: pacienteId, nome: file.name, tipo, tamanho: file.size, storage_path: path })
    .select()
    .single();
  if (error) throw error;
  return fromDocumentoRow(data);
}

export async function removeDocumento(doc) {
  await supabase.storage.from(DOCS_BUCKET).remove([doc.storagePath]);
  const { error } = await supabase.from("documentos").delete().eq("id", doc.id);
  if (error) throw error;
}

export async function getDocumentUrl(storagePath) {
  const { data, error } = await supabase.storage.from(DOCS_BUCKET).createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

/* ---------------------------------------------------------------------- */
/* Agendamentos                                                           */
/* ---------------------------------------------------------------------- */

export async function listAppointments() {
  const { data, error } = await supabase.from("agendamentos").select("*").order("data").order("hora");
  if (error) throw error;
  return data.map(fromAppointmentRow);
}

export async function createAppointment(appt) {
  const { data, error } = await supabase.from("agendamentos").insert(toAppointmentRow(appt)).select().single();
  if (error) throw error;
  return fromAppointmentRow(data);
}

export async function updateAppointment(id, fields) {
  const partial = {};
  const map = { pacienteId: "paciente_id", unidadeId: "unidade_id", tipo: "tipo", data: "data", hora: "hora", profissional: "profissional", status: "status", confirmadoEm: "confirmado_em" };
  for (const [key, col] of Object.entries(map)) if (key in fields) partial[col] = fields[key];
  const { error } = await supabase.from("agendamentos").update(partial).eq("id", id);
  if (error) throw error;
}

export async function deleteAppointment(id) {
  const { error } = await supabase.from("agendamentos").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------------------------------------------------- */
/* Catálogo                                                               */
/* ---------------------------------------------------------------------- */

export async function listCatalog() {
  const { data, error } = await supabase.from("catalogo").select("*").order("cat").order("nome");
  if (error) throw error;
  return data.map(fromCatalogRow);
}

export async function createCatalogItem(item) {
  const { data, error } = await supabase.from("catalogo").insert(toCatalogRow(item)).select().single();
  if (error) throw error;
  return fromCatalogRow(data);
}

export async function updateCatalogItem(id, fields) {
  const { error } = await supabase.from("catalogo").update(toCatalogRow(fields)).eq("id", id);
  if (error) throw error;
}

export async function deleteCatalogItem(id) {
  const { error } = await supabase.from("catalogo").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------------------------------------------------- */
/* Unidades                                                               */
/* ---------------------------------------------------------------------- */

export async function listUnits() {
  const { data, error } = await supabase.from("unidades").select("*").order("codigo");
  if (error) throw error;
  return data.map(fromUnitRow);
}

export async function createUnit(unit) {
  const { data, error } = await supabase.from("unidades").insert(toUnitRow(unit)).select().single();
  if (error) throw error;
  return fromUnitRow(data);
}

export async function updateUnit(id, fields) {
  const { error } = await supabase.from("unidades").update(toUnitRow(fields)).eq("id", id);
  if (error) throw error;
}

export async function deleteUnit(id) {
  const { error } = await supabase.from("unidades").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------------------------------------------------- */
/* Pedidos                                                                */
/* ---------------------------------------------------------------------- */

export async function listOrders() {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, pedido_itens(*), pedido_series(*)")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data.map(fromOrderRow);
}

export async function createOrder(order) {
  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({
      numero: order.numero,
      id_fabrica: order.idFabrica,
      paciente_id: order.pacienteId,
      unidade_id: order.unidadeId,
      endereco_entrega_custom: order.enderecoEntregaCustom || "",
      condicao_pagamento: order.condicaoPagamento,
      fonoaudiologo: order.fonoaudiologo || "",
      status: order.status,
    })
    .select()
    .single();
  if (error) throw error;

  const itemRows = [
    ...order.itens.map((i) => ({ pedido_id: pedido.id, catalogo_id: i.catalogoId, nome: i.nome, codigo: i.codigo, quantidade: i.quantidade, preco_unitario: i.precoUnitario, bonificacao: false })),
    ...order.bonificacao.map((i) => ({ pedido_id: pedido.id, catalogo_id: i.catalogoId, nome: i.nome, codigo: i.codigo, quantidade: i.quantidade, preco_unitario: i.precoUnitario, bonificacao: true })),
  ];
  if (itemRows.length) {
    const { error: itemsError } = await supabase.from("pedido_itens").insert(itemRows);
    if (itemsError) throw itemsError;
  }

  return fromOrderRow({ ...pedido, pedido_itens: itemRows.map((r, i) => ({ ...r, id: `tmp-${i}` })), pedido_series: [] });
}

export async function updateOrder(id, order) {
  const { error } = await supabase
    .from("pedidos")
    .update({
      paciente_id: order.pacienteId,
      unidade_id: order.unidadeId,
      endereco_entrega_custom: order.enderecoEntregaCustom || "",
      condicao_pagamento: order.condicaoPagamento,
      fonoaudiologo: order.fonoaudiologo || "",
    })
    .eq("id", id);
  if (error) throw error;

  const { error: deleteError } = await supabase.from("pedido_itens").delete().eq("pedido_id", id);
  if (deleteError) throw deleteError;

  const itemRows = [
    ...order.itens.map((i) => ({ pedido_id: id, catalogo_id: i.catalogoId, nome: i.nome, codigo: i.codigo, quantidade: i.quantidade, preco_unitario: i.precoUnitario, bonificacao: false })),
    ...order.bonificacao.map((i) => ({ pedido_id: id, catalogo_id: i.catalogoId, nome: i.nome, codigo: i.codigo, quantidade: i.quantidade, preco_unitario: i.precoUnitario, bonificacao: true })),
  ];
  if (itemRows.length) {
    const { error: itemsError } = await supabase.from("pedido_itens").insert(itemRows);
    if (itemsError) throw itemsError;
  }

  return { itens: order.itens, bonificacao: order.bonificacao };
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from("pedidos").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteOrder(id) {
  const { error } = await supabase.from("pedidos").delete().eq("id", id);
  if (error) throw error;
}

export async function setOrderBilling(id, nf, series) {
  const { error } = await supabase
    .from("pedidos")
    .update({ status: "Faturado", nf_numero: nf.numero, nf_data: nf.data, nf_fabricante: nf.fabricante })
    .eq("id", id);
  if (error) throw error;

  if (series.length) {
    const rows = series.map((s) => ({ pedido_id: id, catalogo_id: s.catalogoId, nome: s.nome, numero_serie: s.numeroSerie }));
    const { error: seriesError } = await supabase.from("pedido_series").insert(rows);
    if (seriesError) throw seriesError;
  }
}
