/* Dados fixos da IMOUVIR (o "cliente" que compra da fábrica) — os mesmos em
   todo pedido, replicados do modelo real de planilha usado com a SONIC. */
const CLIENTE_NOME = "IMOUVIR";
const CLIENTE_CNPJ = "35.342.560/0001-09";
const CLIENTE_RAZAO_SOCIAL = "INSTITUTO MAÇÔNICO OUVIR - IMOUVIR";

const AZUL_LABEL = "FF00B0F0";
const MOEDA = '"R$"\\ #,##0.00';

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dataCurta(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d)) return "";
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)}`;
}

function extrairCep(endereco) {
  const m = (endereco || "").match(/CEP[:\s]*([\d.-]+)/i);
  return m ? m[1] : "";
}

function labelCell(ws, coord, text) {
  const cell = ws.getCell(coord);
  cell.value = text;
  cell.font = { bold: true };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: AZUL_LABEL } };
  cell.alignment = { horizontal: "right", vertical: "middle", wrapText: true };
  return cell;
}

function valueCell(ws, coord, value, opts = {}) {
  const cell = ws.getCell(coord);
  cell.value = value;
  if (opts.bold) cell.font = { bold: true };
  if (opts.numFmt) cell.numFmt = opts.numFmt;
  cell.alignment = { horizontal: opts.align || "left", vertical: "middle", wrapText: Boolean(opts.wrap) };
  return cell;
}

function sectionHeaderCell(ws, coord, text) {
  const cell = ws.getCell(coord);
  cell.value = text;
  cell.font = { bold: true };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: AZUL_LABEL } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  return cell;
}

function columnHeaderRow(ws, row) {
  const headers = [
    ["B", "Código", "center"],
    ["C", "Descrição", "left"],
    ["D", "Quantidade", "center"],
    ["E", "Valor unitário", "center"],
    ["F", "Valor total", "center"],
  ];
  headers.forEach(([col, text, align]) => {
    const cell = ws.getCell(`${col}${row}`);
    cell.value = text;
    cell.font = { bold: true };
    cell.alignment = { horizontal: align, vertical: "middle" };
    if (col === "E" || col === "F") cell.numFmt = MOEDA;
  });
}

function itemRows(ws, startRow, itens) {
  itens.forEach((it, i) => {
    const row = startRow + i;
    valueCell(ws, `B${row}`, it.codigo || "", { align: "center" });
    valueCell(ws, `C${row}`, it.nome, { align: "left" });
    valueCell(ws, `D${row}`, it.quantidade, { align: "center", numFmt: "0" });
    valueCell(ws, `E${row}`, it.precoUnitario, { align: "center", numFmt: MOEDA });
    valueCell(ws, `F${row}`, it.quantidade * it.precoUnitario, { align: "center", numFmt: MOEDA });
  });
  return startRow + itens.length;
}

function totalRow(ws, row, itens) {
  const total = itens.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
  valueCell(ws, `E${row}`, "TOTAL", { bold: true, align: "left" });
  valueCell(ws, `F${row}`, total, { bold: true, align: "left", numFmt: MOEDA });
  return row + 1;
}

/**
 * Gera a "Planilha de Pedidos SONIC" já preenchida com os dados do pedido,
 * no mesmo layout usado para enviar pedidos à fábrica, e dispara o download
 * no navegador.
 */
export async function exportPedidoXlsx({ order, paciente, unidade }) {
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Planilha de Pedidos SONIC");

  ws.columns = [
    { width: 1 }, { width: 23.3 }, { width: 44.1 }, { width: 17.1 }, { width: 17.9 }, { width: 37.7 },
  ];

  ws.mergeCells("B1:F2");
  const titulo = ws.getCell("B1");
  titulo.value = "PLANILHA DE PEDIDOS SONIC";
  titulo.font = { bold: true, size: 14 };
  titulo.fill = { type: "pattern", pattern: "solid", fgColor: { argb: AZUL_LABEL } };
  titulo.alignment = { horizontal: "center", vertical: "middle" };

  const enderecoEntrega = order.enderecoEntregaCustom || unidade?.endereco || "";
  const condicao = CONDICOES_PAGAMENTO_MAP[order.condicaoPagamento] || order.condicaoPagamento;
  const nomePaciente = `${order.numero} - PCT ${(paciente?.nome || "").toUpperCase()} - ${(unidade?.cidade || "").toUpperCase()} - ${dataCurta(order.criadoEm)}`;

  labelCell(ws, "B3", "ID:");
  valueCell(ws, "C3", order.idFabrica || "", { align: "left" });
  labelCell(ws, "E3", "N° de Pedido:");
  valueCell(ws, "F3", `OC ${order.numero}`, { align: "left" });

  labelCell(ws, "B4", "Cliente:");
  valueCell(ws, "C4", CLIENTE_NOME);
  labelCell(ws, "E4", "CNPJ:");
  valueCell(ws, "F4", CLIENTE_CNPJ, { align: "left" });

  labelCell(ws, "B5", "*Razão Social:");
  ws.mergeCells("C5:D5");
  valueCell(ws, "C5", CLIENTE_RAZAO_SOCIAL);

  labelCell(ws, "B6", "Endereço de Entrega");
  ws.mergeCells("C6:D6");
  ws.getRow(6).height = 78.75;
  valueCell(ws, "C6", enderecoEntrega, { wrap: true });
  labelCell(ws, "E6", "CEP");
  valueCell(ws, "F6", extrairCep(enderecoEntrega), { align: "left" });

  labelCell(ws, "B7", "Nome do Paciente");
  ws.mergeCells("C7:D7");
  valueCell(ws, "C7", nomePaciente);
  labelCell(ws, "E7", "Cidade");
  valueCell(ws, "F7", `${unidade?.cidade || ""} - ${unidade?.uf || ""}`, { align: "left" });

  labelCell(ws, "B8", "Condição de Pagamento");
  ws.mergeCells("C8:D8");
  valueCell(ws, "C8", condicao, { bold: true });
  labelCell(ws, "E8", "PGTO");
  valueCell(ws, "F8", condicao, { align: "left" });

  labelCell(ws, "B9", "Código Pagamento");
  ws.mergeCells("C9:D9");
  valueCell(ws, "C9", order.condicaoPagamento || "", { bold: true });

  labelCell(ws, "B10", "NF:");
  ws.mergeCells("C10:D10");
  valueCell(ws, "C10", order.nf ? `NF ${order.nf.numero} de ${new Date(order.nf.data).toLocaleDateString("pt-BR")}` : "");

  let row = 11;
  ws.mergeCells(`B${row}:F${row}`);
  sectionHeaderCell(ws, `B${row}`, "PEDIDO");
  row += 1;

  columnHeaderRow(ws, row);
  row += 1;

  const itensRowStart = row;
  row = itemRows(ws, row, order.itens);
  row = totalRow(ws, row, order.itens);
  row += 1;

  ws.mergeCells(`B${row}:F${row}`);
  sectionHeaderCell(ws, `B${row}`, "Bonificação");
  row += 1;

  columnHeaderRow(ws, row);
  row += 1;

  row = itemRows(ws, row, order.bonificacao);
  row = totalRow(ws, row, order.bonificacao);

  // Contorna cada linha de item com uma borda fina, igual ao modelo original.
  const thin = { style: "thin", color: { argb: "FFBFBFBF" } };
  for (let r = itensRowStart - 1; r < row; r++) {
    ["B", "C", "D", "E", "F"].forEach((col) => {
      ws.getCell(`${col}${r}`).border = { top: thin, left: thin, bottom: thin, right: thin };
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const nomeArquivo = nomeArquivoPedido(order, paciente, unidade);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const CONDICOES_PAGAMENTO_MAP = {
  "001": "DEPÓSITO EM CONTA",
  CIELO: "PAGAMENTO CARTÃO",
  "009": "BOLETO 30 DIAS",
  "102": "2X BOLETO",
  "011": "3X BOLETO",
  "086": "4X BOLETO",
  "105": "5X BOLETO",
  "100": "6X BOLETO",
};

function slug(text) {
  return (text || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function nomeArquivoPedido(order, paciente, unidade) {
  const partes = [order.numero, "PCT", slug(paciente?.nome), slug(unidade?.cidade), dataCurta(order.criadoEm)];
  return `${partes.filter(Boolean).join("_")}.xlsx`;
}
