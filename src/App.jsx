import React, { useState, useMemo, useRef, createContext, useContext, useEffect } from "react";
import {
  LayoutDashboard, Users, CalendarDays, Package, MapPin, Boxes, Search, Plus, X,
  Phone, MessageCircle, Upload, FileText, Trash2, Pencil, Download, Printer,
  ChevronLeft, ChevronRight, Check, Clock, AlertTriangle, Stethoscope, Ear,
  ClipboardList, FileCheck2, Building2, ChevronDown, ArrowRight, BadgeCheck,
  CalendarClock, Wallet, PackageCheck, PackageSearch, UserPlus, Save, Info,
  MoreVertical, Gift, Truck, ShieldCheck, ArrowLeft, RefreshCw, Menu, Sparkles
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

/* =========================================================================
   IMOUVIR · CRM — Design tokens
   Paleta derivada do site institucional (theme-color #0a7f83)
   ========================================================================= */
const C = {
  teal: "#0a7f83",
  tealDark: "#075e61",
  tealDarker: "#0b2e2f",
  tealInk: "#06282a",
  cream: "#f5f8f7",
  card: "#ffffff",
  ink: "#132625",
  sub: "#5c7473",
  border: "#e3ebe9",
  coral: "#ff6b4a",
  coralDark: "#e2532f",
  amber: "#c98a1f",
  amberBg: "#fbf1de",
  green: "#1f8f61",
  greenBg: "#e3f5ec",
  red: "#d64545",
  redBg: "#fbe9e8",
  blue: "#3272a6",
  blueBg: "#e8f1f8",
};

const FONTS = `
.imv-t-105{font-size:10.5px}
.imv-t-11{font-size:11px}
.imv-t-115{font-size:11.5px}
.imv-t-12{font-size:12px}
.imv-t-125{font-size:12.5px}
.imv-t-13{font-size:13px}
.imv-t-135{font-size:13.5px}
.imv-t-14{font-size:14px}
.imv-t-15{font-size:15px}
.imv-t-16{font-size:16px}
.imv-t-165{font-size:16.5px}
.imv-t-17{font-size:17px}
.imv-t-19{font-size:19px}
.imv-t-24{font-size:24px}
.imv-minw-20{min-width:20px}
.imv-minw-160{min-width:160px}
.imv-minw-180{min-width:180px}
.imv-minw-220{min-width:220px}
.imv-maxw-560{max-width:560px}
.imv-maxw-820{max-width:820px}
.imv-w-248{width:248px}
.imv-w-62p{width:62%}
.imv-z-60{z-index:60}
.imv-trk-014{letter-spacing:0.14em}
.imv-mt-1px{margin-top:1px}
.imv-gap-2px{gap:2px}
.imv-hover-tint5:hover{background:rgba(0,0,0,0.05)}
.imv-hover-tint3:hover{background:rgba(0,0,0,0.03)}
@media (min-width: 1024px){ .imv-w-248{width:248px} }

@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
`;

/* =========================================================================
   Dados de catálogo — extraídos da planilha real de pedidos SONIC
   (fábrica: código único por item, conforme fornecido pelo Paulo)
   ========================================================================= */
const CATALOGO_INICIAL = [
  {cat:'APARELHOS AASI',nome:'RADIANT100 MNR RECARREGÁVEL',codigo:'222291',preco:2800.0},
  {cat:'APARELHOS AASI',nome:'RADIANT 100 MNR',codigo:'230652',preco:2700.0},
  {cat:'APARELHOS AASI',nome:'RADIANT100 MNBTE',codigo:'234745',preco:2500.0},
  {cat:'APARELHOS AASI',nome:'RADIANT100 CUSTOMIZADO',codigo:'',preco:2500.0},
  {cat:'APARELHOS AASI',nome:'RADIANT 60 MNR RECARREGÁVEL',codigo:'222305',preco:1800.0},
  {cat:'APARELHOS AASI',nome:'RADIANT 60 MNR',codigo:'230666',preco:1650.0},
  {cat:'APARELHOS AASI',nome:'RADIANT 60 MNBTE',codigo:'234759',preco:1575.0},
  {cat:'APARELHOS AASI',nome:'RADIANT 60 CUSTOMIZADO',codigo:'',preco:1575.0},
  {cat:'APARELHOS AASI',nome:'RADIANT 20 MNR RECARREGÁVEL',codigo:'240470',preco:1100.0},
  {cat:'APARELHOS AASI',nome:'RADIANT 20 MNR',codigo:'240749',preco:935.0},
  {cat:'APARELHOS AASI',nome:'RADIANT 20 MNBTE',codigo:'234772',preco:880.0},
  {cat:'APARELHOS AASI',nome:'RADIANT 20 CUSTOMIZADO',codigo:'',preco:880.0},
  {cat:'APARELHOS AASI',nome:'TREK 40 Super Power',codigo:'248369',preco:1133.0},
  {cat:'APARELHOS AASI',nome:'TREK 40 Ultra Power',codigo:'247787',preco:1133.0},
  {cat:'APARELHOS AASI',nome:'CARREGADOR SONIC PLUS',codigo:'225683',preco:600.0},
  {cat:'APARELHOS AASI',nome:'CARREGADOR SONIC MESA',codigo:'200309',preco:400.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 100 MINIRITE Recarregável',codigo:'197014',preco:2200.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 100 MINIRITE',codigo:'196447',preco:2178.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 100 BTE 105',codigo:'196429',preco:1925.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 80 MINIRITE Recarregável',codigo:'197020',preco:1600.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 80 MINIRITE',codigo:'196454',preco:1628.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 80 BTE 105',codigo:'196435',preco:1573.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 60 MINIRITE Recarregável',codigo:'197026',preco:1400.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 60 MINIRITE',codigo:'196460',preco:1265.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 60 BTE 105',codigo:'196441',preco:1210.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 40 MINIRITE Recarregável',codigo:'215144',preco:950.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 40 MINIRITE',codigo:'215325',preco:935.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 40 BTE 105',codigo:'215349',preco:880.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 20 MINIRITE',codigo:'215331',preco:825.0},
  {cat:'APARELHOS AASI',nome:'CAPTIVATE 20 BTE 105',codigo:'215355',preco:770.0},
  {cat:'RECEPTORES',nome:'Recep. 60 miniFit 1L',codigo:'149272',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 60 miniFit 1R',codigo:'149271',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 60 miniFit 2L',codigo:'149274',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 60 miniFit 2R',codigo:'149273',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 60 miniFit 3L',codigo:'149276',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 60 miniFit 3R',codigo:'149275',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 60 miniFit 4L',codigo:'149278',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 60 miniFit 4R',codigo:'149277',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 85 miniFit 1L',codigo:'149279',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 85 miniFit 1R',codigo:'149280',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 85 miniFit 2L',codigo:'149281',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 85 miniFit 2R',codigo:'149282',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 85 miniFit 3L',codigo:'149283',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 85 miniFit 3R',codigo:'149284',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 85 miniFit 4L',codigo:'149285',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 85 miniFit 4R',codigo:'149286',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 100 miniFit 1L',codigo:'149287',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 100 miniFit 1R',codigo:'149288',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 100 miniFit 2L',codigo:'149289',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 100 miniFit 2R',codigo:'149290',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 100 miniFit 3L',codigo:'149291',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 100 miniFit 3R',codigo:'149292',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 100 miniFit 4L',codigo:'149293',preco:170.0},
  {cat:'RECEPTORES',nome:'Recep. 100 miniFit 4R',codigo:'149294',preco:170.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 0.9 0L',codigo:'156522',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 0.9 0R',codigo:'156526',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 0.9 1L',codigo:'156523',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 0.9 1R',codigo:'156527',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 0.9 2L',codigo:'156524',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 0.9 2R',codigo:'156528',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 0.9 3L',codigo:'156525',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 0.9 3R',codigo:'156529',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 1.3 0L',codigo:'156533',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 1.3 0R',codigo:'156537',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 1.3 1L',codigo:'156534',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 1.3 1R',codigo:'156538',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 1.3 2L',codigo:'156535',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 1.3 2R',codigo:'156539',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 1.3 3L',codigo:'156536',preco:58.0},
  {cat:'RECEPTORES',nome:'Tubo Fino miniFit 1.3 3R',codigo:'156540',preco:58.0},
  {cat:'DOMO',nome:'Domo OpenBass 5mm (aberto) - receptor de 60dB',codigo:'218359',preco:50.0},
  {cat:'DOMO',nome:'Domo OpenBass 6mm (aberto)',codigo:'218364',preco:50.0},
  {cat:'DOMO',nome:'Domo OpenBass 8mm (aberto)',codigo:'218368',preco:50.0},
  {cat:'DOMO',nome:'Domo OpenBass 10mm (aberto)',codigo:'218373',preco:50.0},
  {cat:'DOMO',nome:'Domo OpenBass 12mm (aberto)',codigo:'218377',preco:50.0},
  {cat:'DOMO',nome:'Domo Aberto 5 mm',codigo:'173494',preco:50.0},
  {cat:'DOMO',nome:'Domo Aberto 6 mm',codigo:'149303',preco:50.0},
  {cat:'DOMO',nome:'Domo Aberto 8 mm',codigo:'149304',preco:50.0},
  {cat:'DOMO',nome:'Domo Aberto 10 mm',codigo:'149305',preco:50.0},
  {cat:'DOMO',nome:'Domo Bass Double (duplo) 6mm',codigo:'149306',preco:50.0},
  {cat:'DOMO',nome:'Domo Bass Double (duplo) 8mm',codigo:'149307',preco:50.0},
  {cat:'DOMO',nome:'Domo Bass Double (duplo) 10mm',codigo:'149308',preco:50.0},
  {cat:'DOMO',nome:'Domo Bass Double (duplo) 12mm',codigo:'149309',preco:50.0},
  {cat:'DOMO',nome:'Domo Bass Single (único) 6mm',codigo:'149310',preco:50.0},
  {cat:'DOMO',nome:'Domo Bass Single (único) 8mm',codigo:'149311',preco:50.0},
  {cat:'DOMO',nome:'Domo Bass Single (único) 10mm',codigo:'149312',preco:50.0},
  {cat:'DOMO',nome:'Domo Bass Single (único) 12mm',codigo:'149313',preco:50.0},
  {cat:'DOMO',nome:'Domo Power 6mm',codigo:'149314',preco:50.0},
  {cat:'DOMO',nome:'Domo Power 8mm',codigo:'149315',preco:50.0},
  {cat:'DOMO',nome:'Domo Power 10mm',codigo:'149316',preco:50.0},
  {cat:'DOMO',nome:'Domo Power 12mm',codigo:'149317',preco:50.0},
  {cat:'DOMO',nome:'Adaptadores Domo Plus (Tulipa)',codigo:'5892510000',preco:50.0},
  {cat:'PILHAS',nome:'Sonic 10',codigo:'686010',preco:9.0},
  {cat:'PILHAS',nome:'Sonic 13',codigo:'686013',preco:9.0},
  {cat:'PILHAS',nome:'Sonic 312',codigo:'686312',preco:9.0},
  {cat:'PILHAS',nome:'Sonic 675',codigo:'686675',preco:9.0},
  {cat:'PILHAS',nome:'Bateria Recarregável 312+ LI-ION SER',codigo:'240909',preco:120.0},
  {cat:'FILTROS',nome:'Filtro do gancho ( Damper )',codigo:'6893021000',preco:28.75},
  {cat:'FILTROS',nome:'O-Cap (ITC, ITE) - protetor microfone',codigo:'128003',preco:100.0},
  {cat:'FILTROS',nome:'WAX PROTECTION SET PROWAX MINIFIT',codigo:'130091',preco:71.3},
  {cat:'FILTROS',nome:'Prowax**',codigo:'123367',preco:57.5},
  {cat:'FILTROS',nome:'T-Cap Bege (CIC) - protetor microfone',codigo:'123328',preco:90.85},
  {cat:'FILTROS',nome:'T-Cap Preto (IIC) - protetor microfone',codigo:'123327',preco:86.25},
  {cat:'FILTROS',nome:'Waxstop',codigo:'6893028000',preco:25.3},
  {cat:'FERRAMENTAS',nome:'Régua para medir tubo fino',codigo:'8902125000',preco:9.92},
  {cat:'FERRAMENTAS',nome:'Régua para medir receptor 0 a 5',codigo:'8902129000',preco:17.92},
  {cat:'FERRAMENTAS',nome:'Ferramenta para medir impressão',codigo:'120313',preco:63.13},
  {cat:'FERRAMENTAS',nome:'Ferramenta Lite Tip',codigo:'118890',preco:12.51},
  {cat:'FERRAMENTAS',nome:'Ferramenta para remoção do receptor',codigo:'8906023000',preco:8.0},
  {cat:'FERRAMENTAS',nome:'FERRAMENTA PARA ADAPTADOR (Trimmer)',codigo:'8250123000',preco:8.0},
  {cat:'FERRAMENTAS',nome:'Ferramenta para remoção do pino (chave vermelha)',codigo:'8902227000',preco:6.0},
  {cat:'FERRAMENTAS',nome:'Ferramenta para limpeza de ventilação',codigo:'8250109203',preco:4.15},
  {cat:'FERRAMENTAS',nome:'Ferramenta para filtro de micro molde (empurrar)',codigo:'8250121000',preco:8.24},
  {cat:'FERRAMENTAS',nome:'Ferramenta para micro molde (apertar)',codigo:'8250109800',preco:7.14},
  {cat:'FERRAMENTAS',nome:'Ferramenta para limpeza de ventilação pequena',codigo:'121563',preco:12.25},
  {cat:'FERRAMENTAS',nome:'Ferramenta para medir tamanho da ventilação',codigo:'8902177002',preco:10.29},
  {cat:'FERRAMENTAS',nome:'Ferramenta para retirar Flex Power Mould',codigo:'143070',preco:12.52},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Caneta Earlite',codigo:'125718',preco:248.04},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Ponta para caneta Earlite',codigo:'8900115808',preco:59.07},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Lâmpada para caneta Earlite',codigo:'8900205102',preco:17.25},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Material p/ impressão A- Zoft (B+C) (azul e branca)',codigo:'7825015004',preco:782.56},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Material p/ impressão Dreve 544g (verde e branca)',codigo:'175547',preco:662.22},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Seringa para molde',codigo:'8900102709',preco:181.98},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Estetoclips',codigo:'8901020100',preco:32.2},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Tubo para Estetoclips',codigo:'8900105302',preco:38.0},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Adaptador para Estetoclips',codigo:'5730002008',preco:38.67},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Pino Estetoclips',codigo:'9002101709',preco:28.75},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Estetoclips completo',codigo:'5720101006',preco:177.1},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Tubinho de molde dobrado (2 mm)',codigo:'93301009',preco:3.45},
  {cat:'ACESSÓRIOS FONOAUDIÓLOGOS',nome:'Pinça pequena',codigo:'8243301301',preco:219.55},
  {cat:'GANCHOS',nome:'Cheer | Captivate (Adulto com filtro)',codigo:'137859',preco:11.5},
  {cat:'GANCHOS',nome:'Captivate (Pediátrico com filtro)',codigo:'137861',preco:11.5},
  {cat:'GANCHOS',nome:'Captivate (Adulto)',codigo:'135417',preco:11.5},
  {cat:'GANCHOS',nome:'Captivate (Pediátrico)',codigo:'137826',preco:11.5},
  {cat:'GANCHOS',nome:'Trek (Adulto com filtro)',codigo:'209647',preco:11.5},
  {cat:'GANCHOS',nome:'Trek (Pediátrico com filtro)',codigo:'209648',preco:11.5},
  {cat:'GANCHOS',nome:'Trek (Adulto)',codigo:'173685',preco:11.5},
  {cat:'GANCHOS',nome:'Trek (Pediátrico)',codigo:'173686',preco:11.5},
  {cat:'GANCHOS',nome:'Cheer Nano',codigo:'5710538000',preco:11.5},
  {cat:'GANCHOS',nome:'Pep 20',codigo:'5710113000',preco:66.68},
  {cat:'GANCHOS',nome:'Journey',codigo:'5710114000',preco:11.5},
  {cat:'ACESSÓRIOS CONECTIVIDADE',nome:'SoundGate 3',codigo:'144605',preco:700.0},
  {cat:'ACESSÓRIOS CONECTIVIDADE',nome:'Microfone Sonic',codigo:'145646',preco:550.0},
  {cat:'ACESSÓRIOS CONECTIVIDADE',nome:'Controle Remoto Sonic',codigo:'139770',preco:350.0},
  {cat:'ACESSÓRIOS CONECTIVIDADE',nome:'SoundClip A 2.4 G',codigo:'179320',preco:700.0},
  {cat:'ACESSÓRIOS CONECTIVIDADE',nome:'Adaptador TV-A 2.4 G',codigo:'168633',preco:700.0},
  {cat:'ACESSÓRIOS CONECTIVIDADE',nome:'Controle Remoto RC-A, 2.4G',codigo:'164369',preco:350.0},
  {cat:'ACESSÓRIOS CONECTIVIDADE',nome:'NOAHLINK WL - CPD-1',codigo:'177547',preco:800.0},
  {cat:'ACESSÓRIOS DE PROGRAMAÇÃO',nome:'Cabo para programação Nº 03 – OD (Vermelho)',codigo:'214372',preco:170.0},
  {cat:'ACESSÓRIOS DE PROGRAMAÇÃO',nome:'Cabo para programação Nº 03 – OE (Azul)',codigo:'214463',preco:170.0},
  {cat:'ACESSÓRIOS DE PROGRAMAÇÃO',nome:'FlexConnect (miniRITE)',codigo:'3900118005',preco:180.0},
  {cat:'ACESSÓRIOS DE PROGRAMAÇÃO',nome:'Mini FlexConnect',codigo:'117468',preco:157.0},
  {cat:'ACESSÓRIOS DE PROGRAMAÇÃO',nome:'Sapata branca para programação',codigo:'3995053008',preco:218.19},
  {cat:'ACESSÓRIOS DE PROGRAMAÇÃO',nome:'Adaptador mini para programação (CIC)',codigo:'164237',preco:247.98},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Bombinha de ar',codigo:'8900101909',preco:50.38},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Bateria para aparelho recarregável',codigo:'205490',preco:119.59},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Desumidificador Elétrico PerfectDry Lux',codigo:'003040848',preco:400.0},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Desumidificador KidCat Sonic',codigo:'003040854',preco:457.63},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Testador de pilhas',codigo:'8901015009',preco:18.5},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'MALETA SONIC KIT DE TUBOS FINOS MINIFIT',codigo:'156557',preco:600.0},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'MALETA SONIC KIT DE RECEPTORES',codigo:'152606',preco:650.0},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Grip Tip com Ventilação Pequeno L',codigo:'153923',preco:63.25},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Grip Tip com Ventilação Pequeno R',codigo:'153921',preco:63.25},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Grip Tip com Ventilação Grande L',codigo:'153919',preco:63.25},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Grip Tip com Ventilação Grande R',codigo:'153917',preco:63.25},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Grip Tip sem Ventilação Pequeno L',codigo:'153924',preco:63.25},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Grip Tip sem Ventilação Pequeno R',codigo:'153922',preco:63.25},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Grip Tip sem Ventilação Grande L',codigo:'153920',preco:63.25},
  {cat:'ACESSÓRIOS PARA USUÁRIOS',nome:'Grip Tip sem Ventilação Grande R',codigo:'153918',preco:63.25},
].map((d, i) => ({ id: "cat-" + i, ...d }));

const CONDICOES_PAGAMENTO = [
  { codigo: "001", descricao: "DEPÓSITO EM CONTA" },
  { codigo: "CIELO", descricao: "PAGAMENTO CARTÃO" },
  { codigo: "009", descricao: "BOLETO 30 DIAS" },
  { codigo: "102", descricao: "2X BOLETO" },
  { codigo: "011", descricao: "3X BOLETO" },
  { codigo: "086", descricao: "4X BOLETO" },
  { codigo: "105", descricao: "5X BOLETO" },
  { codigo: "100", descricao: "6X BOLETO" },
];

const FABRICANTES = ["ATOMED PRODUTOS MEDICOS E DE AUX. HUMANO LTDA.", "TELEX", "Outra distribuidora"];

/* Unidades — cidades reais do site imouvir.com.br. Endereço completo fica em
   branco até o Paulo cadastrar (evita inventar endereço que não existe). */
const UNIDADES_INICIAIS = [
  { id: "un-01", codigo: "01", cidade: "Cuiabá", uf: "MT", endereco: "", telefone: "65992364617", sede: true },
  { id: "un-02", codigo: "02", cidade: "Cáceres", uf: "MT", endereco: "", telefone: "" },
  { id: "un-03", codigo: "03", cidade: "Juína", uf: "MT", endereco: "", telefone: "" },
  { id: "un-04", codigo: "04", cidade: "Capital (Rio de Janeiro)", uf: "RJ", endereco: "", telefone: "" },
  { id: "un-05", codigo: "05", cidade: "Icaraí, Niterói", uf: "RJ", endereco: "", telefone: "" },
  { id: "un-06", codigo: "06", cidade: "Navegantes", uf: "SC", endereco: "", telefone: "" },
  { id: "un-07", codigo: "07", cidade: "Itapema", uf: "SC", endereco: "", telefone: "" },
  { id: "un-08", codigo: "08", cidade: "Capital (São Paulo)", uf: "SP", endereco: "", telefone: "" },
  { id: "un-09", codigo: "09", cidade: "Atibaia", uf: "SP", endereco: "", telefone: "" },
  { id: "un-10", codigo: "10", cidade: "Santo André", uf: "SP", endereco: "", telefone: "" },
  { id: "un-11", codigo: "11", cidade: "Ribeirão Preto", uf: "SP", endereco: "", telefone: "" },
  { id: "un-12", codigo: "12", cidade: "São Bernardo do Campo", uf: "SP", endereco: "", telefone: "" },
  { id: "un-14", codigo: "14", cidade: "Bauru", uf: "SP", endereco: "", telefone: "" },
  { id: "un-15", codigo: "15", cidade: "Brasília", uf: "DF", endereco: "", telefone: "" },
  { id: "un-16", codigo: "16", cidade: "Salvador", uf: "BA", endereco: "", telefone: "" },
  { id: "un-17", codigo: "17", cidade: "Vitória", uf: "ES", endereco: "", telefone: "" },
  {
    id: "un-13", codigo: "13", cidade: "Uberlândia", uf: "MG",
    endereco: "Associação dos Surdos e Mudos de Uberlândia - ASUL, Rua Matheus Vaz, nº 865, Bairro Luizote de Freitas II, Uberlândia/MG, CEP 38.414-308",
    telefone: "",
  },
  { id: "un-18", codigo: "18", cidade: "Curitiba", uf: "PR", endereco: "", telefone: "" },
];

/* =========================================================================
   Helpers
   ========================================================================= */
let __uid = 1000;
const uid = (p = "id") => `${p}-${(__uid++).toString(36)}`;

function onlyDigits(s = "") { return String(s).replace(/\D/g, ""); }

function formatPhone(v = "") {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function waLink(phone, message) {
  const d = onlyDigits(phone);
  if (!d) return null;
  const full = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(message || "")}`;
}

function formatBRL(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pad2(n) { return String(n).padStart(2, "0"); }

function formatDateBR(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d)) return "—";
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatDateInputValue(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d)) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(dateLike, days) {
  const d = new Date(dateLike);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function startOfMonth(d) { const x = new Date(d); x.setDate(1); x.setHours(0, 0, 0, 0); return x; }
function endOfMonth(d) { const x = new Date(d); x.setMonth(x.getMonth() + 1, 0); x.setHours(23, 59, 59, 999); return x; }

function cx(...a) { return a.filter(Boolean).join(" "); }

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

/* =========================================================================
   Seeds — pacientes / agendamentos / pedidos (dados de demonstração
   coerentes com o fluxo real descrito pelo Paulo)
   ========================================================================= */
const today = new Date();

const PACIENTES_INICIAIS = [
  {
    id: "pac-1001",
    nome: "Claudineia Elizabeti da Silva Hübener",
    telefone: "65999012233",
    cpf: "",
    dataNascimento: "1977-07-18",
    cidade: "Juína", uf: "MT",
    endereco: "",
    status: "Adaptado",
    fonoaudiologo: "Dra. Camila Rezende",
    observacoes: "Adaptação bilateral concluída. Cliente satisfeita, sem queixas de retorno.",
    documentos: [],
    historico: [
      { id: uid("h"), data: addDays(today, -70).toISOString(), texto: "Primeiro contato via WhatsApp — indicação de familiar." },
      { id: uid("h"), data: addDays(today, -58).toISOString(), texto: "Avaliação auditiva realizada e teste com aparelho demo (Sonic CV40)." },
      { id: uid("h"), data: addDays(today, -50).toISOString(), texto: "Decisão de compra confirmada. Pedido 663.03.26 aberto." },
      { id: uid("h"), data: addDays(today, -30).toISOString(), texto: "Pedido faturado — NF 124.081 — 2x Sonic CV40 B 105." },
      { id: uid("h"), data: addDays(today, -19).toISOString(), texto: "Entrega e adaptação realizadas. Termo de Recebimento assinado." },
    ],
  },
  {
    id: "pac-1002",
    nome: "Romilda Alves Faria",
    telefone: "34999887766",
    cpf: "",
    dataNascimento: "1958-02-11",
    cidade: "Uberlândia", uf: "MG",
    endereco: "",
    status: "Pedido em Andamento",
    fonoaudiologo: "Dr. Henrique Salles",
    observacoes: "Atendimento via parceria com a ASUL (Associação dos Surdos e Mudos de Uberlândia).",
    documentos: [],
    historico: [
      { id: uid("h"), data: addDays(today, -20).toISOString(), texto: "Avaliação auditiva anexada — perda moderada bilateral." },
      { id: uid("h"), data: addDays(today, -12).toISOString(), texto: "Teste com aparelho demo realizado, decisão de compra confirmada." },
      { id: uid("h"), data: addDays(today, -4).toISOString(), texto: "Pedido OC 647.13.26 enviado para faturamento — 2x Radiant 20 MNR Recarregável." },
    ],
  },
  {
    id: "pac-1003",
    nome: "José Ailton Ferreira Gomes",
    telefone: "65981234567",
    cpf: "",
    dataNascimento: "1965-09-03",
    cidade: "Cuiabá", uf: "MT",
    endereco: "",
    status: "Teste Agendado",
    fonoaudiologo: "Dra. Camila Rezende",
    observacoes: "Queixa principal: dificuldade em ambientes ruidosos e reuniões de trabalho.",
    documentos: [],
    historico: [
      { id: uid("h"), data: addDays(today, -3).toISOString(), texto: "Contato via WhatsApp — agendada avaliação auditiva." },
    ],
  },
  {
    id: "pac-1004",
    nome: "Marlene Aparecida Souza",
    telefone: "65999456123",
    cpf: "",
    dataNascimento: "1949-12-24",
    cidade: "Cáceres", uf: "MT",
    endereco: "",
    status: "Aguardando Decisão",
    fonoaudiologo: "Dra. Camila Rezende",
    observacoes: "Realizou teste com aparelho demo, aguardando retorno da família sobre orçamento.",
    documentos: [],
    historico: [
      { id: uid("h"), data: addDays(today, -6).toISOString(), texto: "Audiometria anexada ao processo (enviada pelo paciente via WhatsApp)." },
      { id: uid("h"), data: addDays(today, -1).toISOString(), texto: "Teste com aparelho demo realizado — aguardando decisão." },
    ],
  },
  {
    id: "pac-1005",
    nome: "Antônio Carlos Pereira",
    telefone: "65991230099",
    cpf: "",
    dataNascimento: "1952-04-30",
    cidade: "Cuiabá", uf: "MT",
    endereco: "",
    status: "Novo Contato",
    fonoaudiologo: "",
    observacoes: "Chegou por indicação, ainda sem avaliação agendada.",
    documentos: [],
    historico: [
      { id: uid("h"), data: addDays(today, -1).toISOString(), texto: "Novo contato recebido via WhatsApp." },
    ],
  },
  {
    id: "pac-1006",
    nome: "Vera Lúcia Nogueira Dias",
    telefone: "65992001188",
    cpf: "",
    dataNascimento: "1960-06-15",
    cidade: "Cuiabá", uf: "MT",
    endereco: "",
    status: "Aguardando Retorno",
    fonoaudiologo: "Dra. Camila Rezende",
    observacoes: "Aparelho enviado pela fábrica, aguardando chegada para agendar entrega.",
    documentos: [],
    historico: [
      { id: uid("h"), data: addDays(today, -25).toISOString(), texto: "Pedido faturado, aguardando envio da fábrica." },
    ],
  },
];

function seedAppointments(patients) {
  const find = (name) => patients.find((p) => p.nome === name);
  return [
    {
      id: uid("ag"),
      pacienteId: find("José Ailton Ferreira Gomes").id,
      tipo: "Avaliação e Teste",
      data: formatDateInputValue(addDays(today, 1)),
      hora: "09:30",
      unidadeId: "un-01",
      profissional: "Dra. Camila Rezende",
      status: "Agendado",
      confirmadoEm: null,
    },
    {
      id: uid("ag"),
      pacienteId: find("Vera Lúcia Nogueira Dias").id,
      tipo: "Entrega e Adaptação",
      data: formatDateInputValue(addDays(today, 1)),
      hora: "14:00",
      unidadeId: "un-01",
      profissional: "Dra. Camila Rezende",
      status: "Agendado",
      confirmadoEm: null,
    },
    {
      id: uid("ag"),
      pacienteId: find("Marlene Aparecida Souza").id,
      tipo: "Retorno de Acompanhamento",
      data: formatDateInputValue(addDays(today, 2)),
      hora: "10:00",
      unidadeId: "un-02",
      profissional: "Dra. Camila Rezende",
      status: "Agendado",
      confirmadoEm: null,
    },
    {
      id: uid("ag"),
      pacienteId: find("Antônio Carlos Pereira").id,
      tipo: "Avaliação e Teste",
      data: formatDateInputValue(addDays(today, 4)),
      hora: "11:00",
      unidadeId: "un-01",
      profissional: "Dra. Camila Rezende",
      status: "Agendado",
      confirmadoEm: null,
    },
    {
      id: uid("ag"),
      pacienteId: find("Claudineia Elizabeti da Silva Hübener").id,
      tipo: "Retorno de Acompanhamento",
      data: formatDateInputValue(addDays(today, -2)),
      hora: "09:00",
      unidadeId: "un-03",
      profissional: "Dra. Camila Rezende",
      status: "Realizado",
      confirmadoEm: addDays(today, -3).toISOString(),
    },
    {
      id: uid("ag"),
      pacienteId: find("Romilda Alves Faria").id,
      tipo: "Avaliação e Teste",
      data: formatDateInputValue(addDays(today, -10)),
      hora: "15:30",
      unidadeId: "un-13",
      profissional: "Dr. Henrique Salles",
      status: "Realizado",
      confirmadoEm: addDays(today, -11).toISOString(),
    },
  ];
}

function seedOrders(patients) {
  const find = (name) => patients.find((p) => p.nome === name);
  return [
    {
      id: uid("ped"),
      numero: "663.03.26",
      idFabrica: "903071",
      pacienteId: find("Claudineia Elizabeti da Silva Hübener").id,
      unidadeId: "un-03",
      enderecoEntregaCustom: "",
      condicaoPagamento: "009",
      fonoaudiologo: "Dra. Camila Rezende",
      itens: [{ catalogoId: "cat-2", nome: "RADIANT100 MNBTE", codigo: "234745", quantidade: 2, precoUnitario: 2500 }],
      bonificacao: [{ catalogoId: "cat-93", nome: "Bateria Recarregável 312+ LI-ION SER", codigo: "240909", quantidade: 2, precoUnitario: 120 }],
      status: "Entregue e Documentado",
      nf: { numero: "124.081", data: "2026-06-22", fabricante: FABRICANTES[0] },
      series: [
        { catalogoId: "cat-2", numeroSerie: "96476026" },
        { catalogoId: "cat-2", numeroSerie: "96476184" },
      ],
      criadoEm: addDays(today, -50).toISOString(),
    },
    {
      id: uid("ped"),
      numero: "647.13.26",
      idFabrica: "903075",
      pacienteId: find("Romilda Alves Faria").id,
      unidadeId: "un-13",
      enderecoEntregaCustom: "",
      condicaoPagamento: "009",
      fonoaudiologo: "Dr. Henrique Salles",
      itens: [{ catalogoId: "cat-8", nome: "RADIANT 20 MNR RECARREGÁVEL", codigo: "240470", quantidade: 2, precoUnitario: 1100 }],
      bonificacao: [
        { catalogoId: "cat-155", nome: "Desumidificador KidCat Sonic", codigo: "003040854", quantidade: 1, precoUnitario: 18 },
        { catalogoId: "cat-42", nome: "Recep. 85 miniFit 3L", codigo: "149283", quantidade: 1, precoUnitario: 170 },
        { catalogoId: "cat-43", nome: "Recep. 85 miniFit 3R", codigo: "149284", quantidade: 1, precoUnitario: 170 },
        { catalogoId: "cat-89", nome: "Domo Power 8mm", codigo: "149315", quantidade: 1, precoUnitario: 50 },
        { catalogoId: "cat-90", nome: "Domo Power 10mm", codigo: "149316", quantidade: 1, precoUnitario: 50 },
        { catalogoId: "cat-99", nome: "WAX PROTECTION SET PROWAX MINIFIT", codigo: "130091", quantidade: 2, precoUnitario: 71.3 },
      ],
      status: "Aguardando Faturamento",
      nf: null,
      series: [],
      criadoEm: addDays(today, -4).toISOString(),
    },
    {
      id: uid("ped"),
      numero: "664.01.26",
      idFabrica: "903080",
      pacienteId: find("Vera Lúcia Nogueira Dias").id,
      unidadeId: "un-01",
      enderecoEntregaCustom: "",
      condicaoPagamento: "011",
      fonoaudiologo: "Dra. Camila Rezende",
      itens: [{ catalogoId: "cat-4", nome: "RADIANT 60 MNR RECARREGÁVEL", codigo: "222305", quantidade: 2, precoUnitario: 1800 }],
      bonificacao: [],
      status: "Enviado",
      nf: { numero: "124.205", data: formatDateInputValue(addDays(today, -8)), fabricante: FABRICANTES[0] },
      series: [],
      criadoEm: addDays(today, -25).toISOString(),
    },
  ];
}

/* =========================================================================
   Contexto global
   ========================================================================= */
const CRM = createContext(null);
const useCRM = () => useContext(CRM);

const STATUS_PACIENTE = ["Novo Contato", "Teste Agendado", "Aguardando Decisão", "Pedido em Andamento", "Aguardando Retorno", "Adaptado", "Inativo"];
const STATUS_PACIENTE_COR = {
  "Novo Contato": C.blue, "Teste Agendado": C.amber, "Aguardando Decisão": C.coral,
  "Pedido em Andamento": C.teal, "Aguardando Retorno": C.amber, "Adaptado": C.green, "Inativo": C.sub,
};
const TIPOS_AGENDAMENTO = ["Avaliação e Teste", "Confirmação de Retorno", "Entrega e Adaptação", "Retorno de Acompanhamento"];
const STATUS_AGENDAMENTO = ["Agendado", "Confirmado", "Realizado", "Não Compareceu", "Cancelado"];
const STATUS_AGENDAMENTO_COR = {
  "Agendado": C.amber, "Confirmado": C.green, "Realizado": C.blue, "Não Compareceu": C.red, "Cancelado": C.sub,
};
const STATUS_PEDIDO = ["Aguardando Faturamento", "Faturado", "Enviado", "Entregue e Documentado"];
const STATUS_PEDIDO_COR = {
  "Aguardando Faturamento": C.amber, "Faturado": C.blue, "Enviado": C.teal, "Entregue e Documentado": C.green,
};
const TIPOS_DOCUMENTO = ["Audiometria", "Comprovante de Pagamento", "Documento Pessoal", "Termo Assinado", "Outro"];

/* =========================================================================
   Primitivos de UI
   ========================================================================= */
function Btn({ children, variant = "primary", size = "md", icon: Icon, className, ...props }) {
  const sizes = { sm: "px-3 py-1.5 imv-t-13 gap-1.5", md: "px-4 py-2.5 text-sm gap-2", lg: "px-5 py-3 imv-t-15 gap-2" };
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap";
  const styles = {
    primary: { background: `linear-gradient(180deg, ${C.teal}, ${C.tealDark})`, color: "#fff", boxShadow: "0 1px 2px rgba(6,40,42,0.25)" },
    coral: { background: `linear-gradient(180deg, ${C.coral}, ${C.coralDark})`, color: "#fff", boxShadow: "0 1px 2px rgba(226,83,47,0.3)" },
    ghost: { background: "transparent", color: C.ink, border: `1px solid ${C.border}` },
    subtle: { background: C.cream, color: C.tealDark, border: `1px solid ${C.border}` },
    danger: { background: C.redBg, color: C.red, border: `1px solid #f2c9c7` },
    whatsapp: { background: "linear-gradient(180deg,#2fbd60,#22a552)", color: "#fff" },
  };
  return (
    <button className={cx(base, sizes[size], className)} style={styles[variant]} {...props}>
      {Icon ? <Icon size={size === "sm" ? 14 : 16} strokeWidth={2.3} /> : null}
      {children}
    </button>
  );
}

function IconBtn({ icon: Icon, title, onClick, tone = "default", size = 16 }) {
  const tones = { default: C.sub, danger: C.red, teal: C.teal };
  return (
    <button
      title={title}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-md imv-hover-tint5 transition-colors"
      style={{ width: 30, height: 30, color: tones[tone] }}
    >
      <Icon size={size} />
    </button>
  );
}

function Badge({ children, color = C.sub, bg }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 imv-t-115 font-bold uppercase tracking-wide"
      style={{ color, background: bg || `${color}1a` }}
    >
      {children}
    </span>
  );
}

function StatusDot({ color }) {
  return <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: color }} />;
}

function Field({ label, children, hint, required }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? (
        <span className="imv-t-125 font-bold" style={{ color: C.tealDark }}>
          {label} {required ? <span style={{ color: C.coral }}>*</span> : null}
        </span>
      ) : null}
      {children}
      {hint ? <span className="imv-t-115" style={{ color: C.sub }}>{hint}</span> : null}
    </label>
  );
}

const inputStyle = {
  border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 14,
  color: C.ink, background: "#fff", outline: "none", fontFamily: "Inter, sans-serif", width: "100%",
};

function Input(props) { return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }
function Textarea(props) { return <textarea {...props} style={{ ...inputStyle, ...(props.style || {}), resize: "vertical" }} />; }
function Select({ children, ...props }) {
  return (
    <div className="relative">
      <select {...props} style={{ ...inputStyle, appearance: "none", paddingRight: 32 }} className="cursor-pointer">
        {children}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.sub }} />
    </div>
  );
}

function Modal({ open, onClose, title, subtitle, children, width = 560, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4" style={{ background: "rgba(6,40,42,0.45)" }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full rounded-2xl shadow-2xl" style={{ maxWidth: width, background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-start justify-between gap-4 px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h3 className="imv-t-17 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{title}</h3>
            {subtitle ? <p className="mt-0.5 imv-t-13" style={{ color: C.sub }}>{subtitle}</p> : null}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/5 shrink-0"><X size={18} style={{ color: C.sub }} /></button>
        </div>
        <div className="px-6 py-5" style={{ maxHeight: "70vh", overflowY: "auto" }}>{children}</div>
        {footer ? <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: `1px solid ${C.border}`, background: C.cream, borderRadius: "0 0 16px 16px" }}>{footer}</div> : null}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-16 text-center" style={{ background: C.cream, border: `1.5px dashed ${C.border}` }}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: `${C.teal}14` }}>
        <Icon size={24} style={{ color: C.teal }} />
      </div>
      <div>
        <p className="imv-t-15 font-bold" style={{ color: C.ink }}>{title}</p>
        <p className="mx-auto mt-1 max-w-sm imv-t-135" style={{ color: C.sub }}>{text}</p>
      </div>
      {action}
    </div>
  );
}

function Avatar({ nome, size = 38 }) {
  const initials = (nome || "?").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  const hues = [C.teal, C.coral, C.blue, C.amber, C.green];
  const hue = hues[(nome || "").length % hues.length];
  return (
    <div className="flex items-center justify-center rounded-full font-bold shrink-0" style={{ width: size, height: size, background: `${hue}20`, color: hue, fontSize: size * 0.36, fontFamily: "Manrope, sans-serif" }}>
      {initials}
    </div>
  );
}

/* Onda sonora — elemento de assinatura visual (identidade auditiva) */
function SoundWave({ size = 22, color = "#ffffff", animate = true, bars = 5 }) {
  const heights = [0.4, 0.75, 1, 0.6, 0.85];
  return (
    <div className="flex items-end imv-gap-2px" style={{ height: size }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={animate ? "imv-wave-bar" : ""}
          style={{
            width: Math.max(2, size * 0.11), height: `${(heights[i % heights.length]) * 100}%`,
            background: color, borderRadius: 2, animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
        <SoundWave size={18} color="#ffffff" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="imv-t-15 font-extrabold tracking-tight text-white" style={{ fontFamily: "Manrope, sans-serif" }}>IMOUVIR</div>
          <div className="imv-t-105 font-semibold uppercase imv-trk-014" style={{ color: "rgba(255,255,255,0.55)" }}>CRM · Saúde Auditiva</div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   Sidebar & Topbar
   ========================================================================= */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pacientes", label: "Pacientes", icon: Users },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "pedidos", label: "Pedidos", icon: Package },
  { id: "catalogo", label: "Catálogo de Aparelhos", icon: Boxes },
  { id: "unidades", label: "Unidades", icon: MapPin },
];

function Sidebar({ page, setPage, mobileOpen, setMobileOpen }) {
  const { patients, appointments, orders } = useCRM();
  const pendentesAmanha = appointments.filter((a) => isSameDay(a.data, addDays(today, 1)) && a.status !== "Cancelado" && a.status !== "Realizado" && !a.confirmadoEm).length;
  const pedidosAguardando = orders.filter((o) => o.status === "Aguardando Faturamento").length;

  const badgeFor = (id) => {
    if (id === "agenda" && pendentesAmanha > 0) return pendentesAmanha;
    if (id === "pedidos" && pedidosAguardando > 0) return pedidosAguardando;
    return null;
  };

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside
        className={cx("fixed z-40 flex h-full imv-w-248 flex-col justify-between px-4 py-5 transition-transform lg:sticky lg:top-0 lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}
        style={{ background: `linear-gradient(185deg, ${C.tealDarker}, ${C.tealInk})` }}
      >
        <div>
          <div className="px-1.5 pb-6">
            <Logo />
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = page === item.id;
              const badge = badgeFor(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => { setPage(item.id); setMobileOpen(false); }}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 imv-t-135 font-semibold transition-colors"
                  style={{ background: active ? "rgba(255,255,255,0.14)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.65)" }}
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={17} strokeWidth={2.2} />
                    {item.label}
                  </span>
                  {badge ? (
                    <span className="flex h-5 imv-minw-20 items-center justify-center rounded-full px-1 imv-t-105 font-extrabold" style={{ background: C.coral, color: "#fff" }}>
                      {badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="rounded-xl px-3.5 py-3.5" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5">
            <Avatar nome="Paulo Leite" size={34} />
            <div className="leading-tight">
              <div className="imv-t-13 font-bold text-white">Paulo Leite</div>
              <div className="imv-t-11" style={{ color: "rgba(255,255,255,0.55)" }}>Gestor do projeto</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 imv-t-105 leading-snug" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)" }}>
            <Info size={12} className="shrink-0 imv-mt-1px" />
            Protótipo — dados em memória para validação do fluxo.
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ title, subtitle, onMenu, right }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b px-5 py-4 backdrop-blur lg:px-8" style={{ background: "rgba(245,248,247,0.9)", borderColor: C.border }}>
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-lg p-1.5 hover:bg-black/5 lg:hidden"><Menu size={20} style={{ color: C.ink }} /></button>
        <div>
          <h1 className="imv-t-19 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{title}</h1>
          {subtitle ? <p className="imv-t-13" style={{ color: C.sub }}>{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-3">{right}</div>
    </header>
  );
}

/* =========================================================================
   Dashboard
   ========================================================================= */
function Dashboard({ goTo }) {
  const { patients, appointments, orders, units } = useCRM();

  const amanha = appointments
    .filter((a) => isSameDay(a.data, addDays(today, 1)) && a.status !== "Cancelado")
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const pacientesAtivos = patients.filter((p) => p.status !== "Inativo").length;
  const pedidosAndamento = orders.filter((o) => o.status !== "Entregue e Documentado").length;
  const aguardandoFaturamento = orders.filter((o) => o.status === "Aguardando Faturamento");
  const faturamentoMes = orders
    .filter((o) => o.nf && new Date(o.nf.data).getMonth() === today.getMonth() && new Date(o.nf.data).getFullYear() === today.getFullYear())
    .reduce((s, o) => s + o.itens.reduce((si, it) => si + it.quantidade * it.precoUnitario, 0), 0);

  const semanaData = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(today, i);
    const count = appointments.filter((a) => isSameDay(a.data, d) && a.status !== "Cancelado").length;
    return { dia: `${DIAS_SEMANA[d.getDay()]} ${pad2(d.getDate())}`, agendamentos: count };
  });

  const pedidosPorStatus = STATUS_PEDIDO.map((s) => ({ name: s, value: orders.filter((o) => o.status === s).length })).filter((x) => x.value > 0);
  const pieCores = { "Aguardando Faturamento": C.amber, "Faturado": C.blue, "Enviado": C.teal, "Entregue e Documentado": C.green };

  const pacientesPorStatus = STATUS_PACIENTE.map((s) => ({ status: s, n: patients.filter((p) => p.status === s).length }));

  return (
    <div className="flex flex-col gap-6 p-5 lg:p-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Users} label="Pacientes ativos" value={pacientesAtivos} tone={C.teal} onClick={() => goTo("pacientes")} />
        <KpiCard icon={CalendarClock} label="Confirmar amanhã" value={amanha.filter((a) => !a.confirmadoEm).length} tone={C.coral} onClick={() => goTo("agenda")} />
        <KpiCard icon={PackageSearch} label="Aguardando faturamento" value={aguardandoFaturamento.length} tone={C.amber} onClick={() => goTo("pedidos")} />
        <KpiCard icon={Wallet} label="Faturado este mês" value={formatBRL(faturamentoMes)} tone={C.green} small />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Confirmações de amanhã */}
        <div className="rounded-2xl p-5 xl:col-span-2" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="imv-t-15 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>Confirmações de amanhã · {formatDateBR(addDays(today, 1))}</h3>
            <Badge color={C.coral}>{amanha.length} agendamento{amanha.length === 1 ? "" : "s"}</Badge>
          </div>
          {amanha.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Nenhum agendamento amanhã" text="Quando houver atendimentos marcados para amanhã, eles aparecem aqui para confirmação rápida via WhatsApp." />
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
              {amanha.map((a) => {
                const p = patients.find((x) => x.id === a.pacienteId);
                const u = units.find((x) => x.id === a.unidadeId);
                const msg = `Olá ${p?.nome?.split(" ")[0] || ""}, aqui é da IMOUVIR! Passando para confirmar seu atendimento amanhã, dia ${formatDateBR(a.data)} às ${a.hora}, com ${a.profissional || "nossa equipe"} — ${u?.cidade || ""}. Podemos confirmar sua presença? 😊`;
                return (
                  <div key={a.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar nome={p?.nome} size={36} />
                    <div className="imv-minw-160 flex-1">
                      <div className="imv-t-135 font-bold" style={{ color: C.ink }}>{p?.nome}</div>
                      <div className="imv-t-12" style={{ color: C.sub }}>{a.tipo} · {a.hora} · {u?.cidade}</div>
                    </div>
                    {a.confirmadoEm ? (
                      <Badge color={C.green}><Check size={11} /> Confirmado</Badge>
                    ) : (
                      <a href={waLink(p?.telefone, msg)} target="_blank" rel="noreferrer">
                        <Btn variant="whatsapp" size="sm" icon={MessageCircle}>Confirmar</Btn>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pipeline pacientes */}
        <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="mb-4 imv-t-15 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>Jornada dos pacientes</h3>
          <div className="flex flex-col gap-3">
            {pacientesPorStatus.map((s) => (
              <div key={s.status}>
                <div className="mb-1 flex items-center justify-between imv-t-125">
                  <span className="flex items-center gap-1.5 font-semibold" style={{ color: C.ink }}>
                    <StatusDot color={STATUS_PACIENTE_COR[s.status]} /> {s.status}
                  </span>
                  <span className="font-bold" style={{ color: C.sub }}>{s.n}</span>
                </div>
                <div className="h-1.5 w-full rounded-full" style={{ background: C.cream }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${patients.length ? (s.n / patients.length) * 100 : 0}%`, background: STATUS_PACIENTE_COR[s.status] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Bar chart agendamentos */}
        <div className="rounded-2xl p-5 lg:col-span-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="mb-1 imv-t-15 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>Agendamentos — próximos 7 dias</h3>
          <p className="mb-3 imv-t-125" style={{ color: C.sub }}>Distribuição de atendimentos marcados por dia.</p>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={semanaData} barSize={28}>
                <CartesianGrid vertical={false} stroke={C.border} />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} width={24} />
                <Tooltip cursor={{ fill: "rgba(10,127,131,0.06)" }} contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5 }} />
                <Bar dataKey="agendamentos" radius={[6, 6, 0, 0]} fill={C.teal} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart pedidos */}
        <div className="rounded-2xl p-5 lg:col-span-2" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="mb-1 imv-t-15 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>Pedidos por etapa</h3>
          <p className="mb-3 imv-t-125" style={{ color: C.sub }}>Status de todos os pedidos ativos.</p>
          {pedidosPorStatus.length === 0 ? (
            <EmptyState icon={Package} title="Sem pedidos" text="Novos pedidos aparecerão aqui." />
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pedidosPorStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3}>
                    {pedidosPorStatus.map((entry, i) => <Cell key={i} fill={pieCores[entry.name]} />)}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11.5 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Pedidos aguardando faturamento */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="imv-t-15 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>Pedidos aguardando faturamento</h3>
          <button onClick={() => goTo("pedidos")} className="flex items-center gap-1 imv-t-125 font-bold" style={{ color: C.teal }}>Ver todos <ArrowRight size={13} /></button>
        </div>
        {aguardandoFaturamento.length === 0 ? (
          <EmptyState icon={PackageCheck} title="Tudo faturado" text="Não há pedidos pendentes de faturamento no momento." />
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
            {aguardandoFaturamento.map((o) => {
              const p = patients.find((x) => x.id === o.pacienteId);
              const total = o.itens.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
              return (
                <div key={o.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="rounded-lg px-2.5 py-1 font-mono imv-t-12 font-bold" style={{ background: C.cream, color: C.tealDark }}>{o.numero}</div>
                  <div className="imv-minw-160 flex-1 imv-t-135 font-bold" style={{ color: C.ink }}>{p?.nome}</div>
                  <div className="imv-t-13 font-bold" style={{ color: C.ink }}>{formatBRL(total)}</div>
                  <Badge color={STATUS_PEDIDO_COR[o.status]}>{o.status}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone, onClick, small }) {
  return (
    <button onClick={onClick} disabled={!onClick} className="flex flex-col gap-3 rounded-2xl p-4 text-left transition-transform disabled:cursor-default lg:p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${tone}18` }}>
        <Icon size={19} style={{ color: tone }} />
      </div>
      <div>
        <div className={small ? "imv-t-19 font-extrabold" : "imv-t-24 font-extrabold"} style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{value}</div>
        <div className="imv-t-125 font-semibold" style={{ color: C.sub }}>{label}</div>
      </div>
    </button>
  );
}

/* =========================================================================
   Pacientes
   ========================================================================= */
function PacientesPage() {
  const { patients, setPatients, units } = useCRM();
  const [query, setQuery] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [selectedId, setSelectedId] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = patients.filter((p) => {
    const matchQ = (p.nome + p.telefone + p.cidade).toLowerCase().includes(query.toLowerCase());
    const matchS = statusFiltro === "Todos" || p.status === statusFiltro;
    return matchQ && matchS;
  });

  const selected = patients.find((p) => p.id === selectedId);

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 imv-minw-220">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.sub }} />
          <Input placeholder="Buscar por nome, telefone ou cidade…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div className="w-full sm:w-56">
          <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
            <option>Todos</option>
            {STATUS_PACIENTE.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
        <Btn icon={UserPlus} onClick={() => setShowNew(true)}>Novo Paciente</Btn>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum paciente encontrado" text="Ajuste a busca ou cadastre um novo paciente para iniciar o acompanhamento." action={<Btn icon={UserPlus} onClick={() => setShowNew(true)}>Novo Paciente</Btn>} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const pendencias = p.documentos.length === 0;
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)} className="flex flex-col gap-3 rounded-2xl p-4 text-left transition-shadow hover:shadow-md" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar nome={p.nome} />
                    <div>
                      <div className="imv-t-14 font-bold leading-tight" style={{ color: C.ink }}>{p.nome}</div>
                      <div className="imv-t-12" style={{ color: C.sub }}>{p.cidade}/{p.uf}</div>
                    </div>
                  </div>
                  <Badge color={STATUS_PACIENTE_COR[p.status]}>{p.status}</Badge>
                </div>
                <div className="flex items-center justify-between imv-t-125" style={{ color: C.sub }}>
                  <span className="flex items-center gap-1.5"><Phone size={13} /> {formatPhone(p.telefone)}</span>
                  {pendencias ? <span className="flex items-center gap-1 font-semibold" style={{ color: C.coral }}><AlertTriangle size={12} /> Sem exame</span> : <span className="flex items-center gap-1 font-semibold" style={{ color: C.green }}><FileCheck2 size={12} /> {p.documentos.length} doc.</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && <PatientDrawer patient={selected} onClose={() => setSelectedId(null)} />}
      {showNew && <NewPatientModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewPatientModal({ onClose }) {
  const { patients, setPatients } = useCRM();
  const [form, setForm] = useState({ nome: "", telefone: "", dataNascimento: "", cidade: "", uf: "", endereco: "", fonoaudiologo: "", observacoes: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const salvar = () => {
    if (!form.nome.trim() || !onlyDigits(form.telefone)) return;
    const novo = {
      id: uid("pac"), ...form, telefone: onlyDigits(form.telefone), cpf: "", status: "Novo Contato",
      documentos: [], historico: [{ id: uid("h"), data: new Date().toISOString(), texto: "Paciente cadastrado no CRM." }],
    };
    setPatients([novo, ...patients]);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Novo paciente" subtitle="Cadastre os dados iniciais de contato." width={540}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar}>Salvar paciente</Btn></>}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label="Nome completo" required><Input value={form.nome} onChange={set("nome")} placeholder="Ex.: Maria da Silva" /></Field></div>
        <Field label="WhatsApp" required><Input value={formatPhone(form.telefone)} onChange={set("telefone")} placeholder="(65) 99999-9999" /></Field>
        <Field label="Data de nascimento"><Input type="date" value={form.dataNascimento} onChange={set("dataNascimento")} /></Field>
        <Field label="Cidade"><Input value={form.cidade} onChange={set("cidade")} placeholder="Ex.: Cuiabá" /></Field>
        <Field label="UF"><Input value={form.uf} onChange={set("uf")} maxLength={2} placeholder="MT" /></Field>
        <div className="sm:col-span-2"><Field label="Endereço"><Input value={form.endereco} onChange={set("endereco")} placeholder="Rua, número, bairro, CEP" /></Field></div>
        <div className="sm:col-span-2"><Field label="Fonoaudiólogo responsável"><Input value={form.fonoaudiologo} onChange={set("fonoaudiologo")} placeholder="Ex.: Dra. Camila Rezende" /></Field></div>
        <div className="sm:col-span-2"><Field label="Observações"><Textarea rows={3} value={form.observacoes} onChange={set("observacoes")} placeholder="Queixa principal, indicação, etc." /></Field></div>
      </div>
    </Modal>
  );
}

function PatientDrawer({ patient, onClose }) {
  const { patients, setPatients, appointments, orders, units } = useCRM();
  const [tab, setTab] = useState("dados");
  const fileRef = useRef(null);

  const update = (fields) => setPatients(patients.map((p) => (p.id === patient.id ? { ...p, ...fields } : p)));
  const logHist = (texto) => update({ historico: [{ id: uid("h"), data: new Date().toISOString(), texto }, ...patient.historico] });

  const handleFiles = (fileList, tipo) => {
    const novos = Array.from(fileList).map((f) => ({
      id: uid("doc"), nome: f.name, tipo, tamanho: f.size, dataUpload: new Date().toISOString(), url: URL.createObjectURL(f),
    }));
    update({ documentos: [...novos, ...patient.documentos] });
    logHist(`${novos.length} documento(s) anexado(s) — ${tipo}.`);
  };

  const removeDoc = (id) => update({ documentos: patient.documentos.filter((d) => d.id !== id) });

  const patientAppointments = appointments.filter((a) => a.pacienteId === patient.id).sort((a, b) => new Date(b.data) - new Date(a.data));
  const patientOrders = orders.filter((o) => o.pacienteId === patient.id);

  const tabs = [
    { id: "dados", label: "Dados Gerais" },
    { id: "docs", label: `Documentos (${patient.documentos.length})` },
    { id: "agenda", label: `Agendamentos (${patientAppointments.length})` },
    { id: "pedidos", label: `Pedidos (${patientOrders.length})` },
    { id: "historico", label: "Histórico" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(6,40,42,0.45)" }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex h-full w-full imv-maxw-560 flex-col" style={{ background: C.card }}>
        <div className="flex items-start justify-between gap-3 px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <Avatar nome={patient.nome} size={46} />
            <div>
              <h3 className="imv-t-165 font-extrabold leading-tight" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{patient.nome}</h3>
              <div className="mt-1 flex items-center gap-2">
                <Select value={patient.status} onChange={(e) => { update({ status: e.target.value }); logHist(`Status alterado para "${e.target.value}".`); }} style={{ width: "auto" }}>
                  {STATUS_PACIENTE.map((s) => <option key={s}>{s}</option>)}
                </Select>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/5"><X size={18} style={{ color: C.sub }} /></button>
        </div>

        <div className="flex items-center gap-3 px-6 py-3" style={{ borderBottom: `1px solid ${C.border}`, background: C.cream }}>
          <a href={waLink(patient.telefone, `Olá ${patient.nome.split(" ")[0]}, aqui é da IMOUVIR!`)} target="_blank" rel="noreferrer" className="flex-1">
            <Btn variant="whatsapp" size="sm" icon={MessageCircle} className="w-full">{formatPhone(patient.telefone)}</Btn>
          </a>
          <span className="imv-t-125 font-semibold" style={{ color: C.sub }}>{patient.cidade}{patient.uf ? `/${patient.uf}` : ""}</span>
        </div>

        <div className="flex gap-1 overflow-x-auto px-4 pt-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="whitespace-nowrap rounded-t-lg px-3.5 py-2.5 imv-t-125 font-bold" style={{ color: tab === t.id ? C.teal : C.sub, borderBottom: tab === t.id ? `2.5px solid ${C.teal}` : "2.5px solid transparent" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "dados" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nome completo"><Input value={patient.nome} onChange={(e) => update({ nome: e.target.value })} /></Field>
              <Field label="WhatsApp"><Input value={formatPhone(patient.telefone)} onChange={(e) => update({ telefone: onlyDigits(e.target.value) })} /></Field>
              <Field label="Data de nascimento"><Input type="date" value={patient.dataNascimento} onChange={(e) => update({ dataNascimento: e.target.value })} /></Field>
              <Field label="CPF"><Input value={patient.cpf} onChange={(e) => update({ cpf: e.target.value })} placeholder="000.000.000-00" /></Field>
              <Field label="Cidade"><Input value={patient.cidade} onChange={(e) => update({ cidade: e.target.value })} /></Field>
              <Field label="UF"><Input value={patient.uf} maxLength={2} onChange={(e) => update({ uf: e.target.value.toUpperCase() })} /></Field>
              <div className="sm:col-span-2"><Field label="Endereço"><Input value={patient.endereco} onChange={(e) => update({ endereco: e.target.value })} placeholder="Rua, número, bairro, CEP" /></Field></div>
              <div className="sm:col-span-2"><Field label="Fonoaudiólogo responsável"><Input value={patient.fonoaudiologo} onChange={(e) => update({ fonoaudiologo: e.target.value })} /></Field></div>
              <div className="sm:col-span-2"><Field label="Observações"><Textarea rows={4} value={patient.observacoes} onChange={(e) => update({ observacoes: e.target.value })} /></Field></div>
            </div>
          )}

          {tab === "docs" && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border-2 border-dashed p-5 text-center" style={{ borderColor: C.border }}>
                <Upload size={22} className="mx-auto mb-2" style={{ color: C.teal }} />
                <p className="imv-t-13 font-semibold" style={{ color: C.ink }}>Anexar exame ou comprovante</p>
                <p className="mb-3 imv-t-12" style={{ color: C.sub }}>Audiometria trazida pessoalmente ou recebida por WhatsApp — o arquivo fica salvo na pasta digital do paciente.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <label key={tipo} className="cursor-pointer">
                      <input type="file" multiple hidden onChange={(e) => e.target.files.length && handleFiles(e.target.files, tipo)} />
                      <span className="inline-flex items-center rounded-lg px-3 py-1.5 imv-t-12 font-bold" style={{ background: C.cream, color: C.tealDark, border: `1px solid ${C.border}` }}>+ {tipo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {patient.documentos.length === 0 ? (
                <EmptyState icon={FileText} title="Nenhum documento anexado" text="Anexe a audiometria do paciente para liberar o teste com o aparelho." />
              ) : (
                <div className="flex flex-col gap-2">
                  {patient.documentos.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${C.teal}18` }}><FileText size={16} style={{ color: C.teal }} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate imv-t-13 font-bold" style={{ color: C.ink }}>{d.nome}</div>
                        <div className="imv-t-115" style={{ color: C.sub }}>{d.tipo} · {(d.tamanho / 1024).toFixed(0)} KB · {formatDateBR(d.dataUpload)}</div>
                      </div>
                      <a href={d.url} download={d.nome} target="_blank" rel="noreferrer"><IconBtn icon={Download} title="Baixar" tone="teal" /></a>
                      <IconBtn icon={Trash2} title="Remover" tone="danger" onClick={() => removeDoc(d.id)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "agenda" && (
            <div className="flex flex-col gap-2">
              {patientAppointments.length === 0 ? <EmptyState icon={CalendarDays} title="Sem agendamentos" text="Este paciente ainda não possui atendimentos marcados." /> :
                patientAppointments.map((a) => {
                  const u = units.find((x) => x.id === a.unidadeId);
                  return (
                    <div key={a.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${STATUS_AGENDAMENTO_COR[a.status]}18` }}><CalendarDays size={16} style={{ color: STATUS_AGENDAMENTO_COR[a.status] }} /></div>
                      <div className="flex-1">
                        <div className="imv-t-13 font-bold" style={{ color: C.ink }}>{a.tipo}</div>
                        <div className="imv-t-115" style={{ color: C.sub }}>{formatDateBR(a.data)} às {a.hora} · {u?.cidade}</div>
                      </div>
                      <Badge color={STATUS_AGENDAMENTO_COR[a.status]}>{a.status}</Badge>
                    </div>
                  );
                })}
            </div>
          )}

          {tab === "pedidos" && (
            <div className="flex flex-col gap-2">
              {patientOrders.length === 0 ? <EmptyState icon={Package} title="Sem pedidos" text="Nenhum pedido de aparelho registrado para este paciente ainda." /> :
                patientOrders.map((o) => {
                  const total = o.itens.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
                  return (
                    <div key={o.id} className="rounded-xl p-3" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono imv-t-125 font-bold" style={{ color: C.tealDark }}>{o.numero}</span>
                        <Badge color={STATUS_PEDIDO_COR[o.status]}>{o.status}</Badge>
                      </div>
                      <div className="mt-1.5 imv-t-125" style={{ color: C.sub }}>{o.itens.map((i) => i.nome).join(", ")}</div>
                      <div className="mt-1 imv-t-13 font-bold" style={{ color: C.ink }}>{formatBRL(total)}</div>
                    </div>
                  );
                })}
            </div>
          )}

          {tab === "historico" && (
            <div className="flex flex-col gap-0">
              {patient.historico.map((h, i) => (
                <div key={h.id} className="flex gap-3 pb-5">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" style={{ background: C.teal }} />
                    {i < patient.historico.length - 1 && <span className="w-px flex-1" style={{ background: C.border }} />}
                  </div>
                  <div>
                    <p className="imv-t-13 font-medium" style={{ color: C.ink }}>{h.texto}</p>
                    <p className="imv-t-115" style={{ color: C.sub }}>{formatDateBR(h.data)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Agenda / Calendário
   ========================================================================= */
function AgendaPage() {
  const { appointments, patients, units } = useCRM();
  const [cursor, setCursor] = useState(startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState(today);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);

  const monthStart = startOfMonth(cursor);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const days = Array.from({ length: 42 }).map((_, i) => addDays(gridStart, i));

  const dayAppointments = appointments
    .filter((a) => isSameDay(a.data, selectedDay))
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const countFor = (d) => appointments.filter((a) => isSameDay(a.data, d) && a.status !== "Cancelado").length;

  return (
    <div className="flex flex-col gap-5 p-5 lg:flex-row lg:p-8">
      {/* Calendário */}
      <div className="rounded-2xl p-5 lg:imv-w-62p" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="imv-t-16 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{MESES[cursor.getMonth()]} {cursor.getFullYear()}</h3>
          <div className="flex items-center gap-1">
            <IconBtn icon={ChevronLeft} title="Mês anterior" onClick={() => setCursor(addDays(startOfMonth(cursor), -1))} />
            <Btn variant="subtle" size="sm" onClick={() => { setCursor(startOfMonth(today)); setSelectedDay(today); }}>Hoje</Btn>
            <IconBtn icon={ChevronRight} title="Próximo mês" onClick={() => setCursor(addDays(endOfMonth(cursor), 1))} />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center imv-t-11 font-bold" style={{ color: C.sub }}>
          {DIAS_SEMANA.map((d) => <div key={d} className="py-1.5">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d, i) => {
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = isSameDay(d, today);
            const isSelected = isSameDay(d, selectedDay);
            const n = countFor(d);
            return (
              <button key={i} onClick={() => setSelectedDay(d)}
                className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl imv-t-13 font-semibold transition-colors"
                style={{
                  background: isSelected ? C.teal : isToday ? `${C.teal}14` : "transparent",
                  color: isSelected ? "#fff" : inMonth ? C.ink : C.border,
                  border: isToday && !isSelected ? `1.5px solid ${C.teal}` : "1.5px solid transparent",
                }}>
                {d.getDate()}
                {n > 0 && <span className="h-1.5 w-1.5 rounded-full" style={{ background: isSelected ? "#fff" : C.coral }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista do dia */}
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="imv-t-16 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{formatDateBR(selectedDay)}</h3>
            <p className="imv-t-125" style={{ color: C.sub }}>{dayAppointments.length} atendimento(s) marcado(s)</p>
          </div>
          <Btn icon={Plus} onClick={() => setShowNew(true)}>Agendar</Btn>
        </div>

        {dayAppointments.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Sem atendimentos neste dia" text="Clique em “Agendar” para marcar uma avaliação, retorno ou entrega." />
        ) : (
          <div className="flex flex-col gap-3">
            {dayAppointments.map((a) => {
              const p = patients.find((x) => x.id === a.pacienteId);
              const u = units.find((x) => x.id === a.unidadeId);
              const isTomorrow = isSameDay(a.data, addDays(today, 1));
              const msg = `Olá ${p?.nome?.split(" ")[0] || ""}, aqui é da IMOUVIR! Passando para confirmar seu atendimento no dia ${formatDateBR(a.data)} às ${a.hora}, com ${a.profissional || "nossa equipe"} — unidade ${u?.cidade || ""}. Podemos confirmar sua presença? 😊`;
              return (
                <div key={a.id} className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `4px solid ${STATUS_AGENDAMENTO_COR[a.status]}` }}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl font-mono font-extrabold leading-none" style={{ background: C.cream, color: C.tealDark, fontSize: 12.5 }}>
                        {a.hora}
                      </div>
                      <div>
                        <div className="imv-t-14 font-bold" style={{ color: C.ink }}>{p?.nome}</div>
                        <div className="imv-t-125" style={{ color: C.sub }}>{a.tipo} · {u?.cidade} · {a.profissional || "Sem profissional definido"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge color={STATUS_AGENDAMENTO_COR[a.status]}>{a.status}</Badge>
                      <IconBtn icon={Pencil} title="Editar" onClick={() => setEditing(a)} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a href={waLink(p?.telefone, msg)} target="_blank" rel="noreferrer"><Btn variant="whatsapp" size="sm" icon={MessageCircle}>{a.confirmadoEm ? "Reenviar confirmação" : "Confirmar via WhatsApp"}</Btn></a>
                    {!a.confirmadoEm && <Btn variant="subtle" size="sm" icon={Check} onClick={() => setEditing({ ...a, __markConfirmed: true })}>Marcar confirmado</Btn>}
                    {a.confirmadoEm && <span className="flex items-center gap-1 imv-t-12 font-semibold" style={{ color: C.green }}><BadgeCheck size={14} /> Confirmado {formatDateBR(a.confirmadoEm)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNew && <AppointmentModal defaultDate={selectedDay} onClose={() => setShowNew(false)} />}
      {editing && <AppointmentModal appointment={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function AppointmentModal({ appointment, defaultDate, onClose }) {
  const { patients, appointments, setAppointments, units } = useCRM();
  const isEdit = !!appointment && !appointment.__markConfirmed;
  const autoConfirm = appointment?.__markConfirmed;

  const [form, setForm] = useState({
    pacienteId: appointment?.pacienteId || patients[0]?.id || "",
    tipo: appointment?.tipo || TIPOS_AGENDAMENTO[0],
    data: appointment?.data || formatDateInputValue(defaultDate || today),
    hora: appointment?.hora || "09:00",
    unidadeId: appointment?.unidadeId || units[0]?.id,
    profissional: appointment?.profissional || "",
    status: appointment?.status || "Agendado",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (autoConfirm) {
      setAppointments(appointments.map((a) => (a.id === appointment.id ? { ...a, status: "Confirmado", confirmadoEm: new Date().toISOString() } : a)));
      onClose();
    }
    // eslint-disable-next-line
  }, []);
  if (autoConfirm) return null;

  const salvar = () => {
    if (isEdit) {
      setAppointments(appointments.map((a) => (a.id === appointment.id ? { ...a, ...form } : a)));
    } else {
      setAppointments([...appointments, { id: uid("ag"), ...form, confirmadoEm: null }]);
    }
    onClose();
  };

  const excluir = () => { setAppointments(appointments.filter((a) => a.id !== appointment.id)); onClose(); };

  return (
    <Modal open onClose={onClose} title={isEdit ? "Editar agendamento" : "Novo agendamento"} width={520}
      footer={
        <div className="flex w-full items-center justify-between">
          {isEdit ? <Btn variant="danger" size="sm" icon={Trash2} onClick={excluir}>Excluir</Btn> : <span />}
          <div className="flex gap-2"><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar}>Salvar</Btn></div>
        </div>
      }>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Paciente" required>
            <Select value={form.pacienteId} onChange={set("pacienteId")}>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Tipo de atendimento"><Select value={form.tipo} onChange={set("tipo")}>{TIPOS_AGENDAMENTO.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Unidade"><Select value={form.unidadeId} onChange={set("unidadeId")}>{units.map((u) => <option key={u.id} value={u.id}>{u.cidade}/{u.uf}</option>)}</Select></Field>
        <Field label="Data"><Input type="date" value={form.data} onChange={set("data")} /></Field>
        <Field label="Hora"><Input type="time" value={form.hora} onChange={set("hora")} /></Field>
        <Field label="Profissional"><Input value={form.profissional} onChange={set("profissional")} placeholder="Ex.: Dra. Camila Rezende" /></Field>
        <Field label="Status"><Select value={form.status} onChange={set("status")}>{STATUS_AGENDAMENTO.map((s) => <option key={s}>{s}</option>)}</Select></Field>
      </div>
    </Modal>
  );
}

/* =========================================================================
   Pedidos
   ========================================================================= */
function PedidosPage() {
  const { orders, patients } = useCRM();
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [showNew, setShowNew] = useState(false);
  const [openOrder, setOpenOrder] = useState(null);

  const filtered = orders.filter((o) => statusFiltro === "Todos" || o.status === statusFiltro).sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 gap-1.5 overflow-x-auto">
          {["Todos", ...STATUS_PEDIDO].map((s) => (
            <button key={s} onClick={() => setStatusFiltro(s)} className="whitespace-nowrap rounded-full px-3.5 py-1.5 imv-t-125 font-bold" style={{ background: statusFiltro === s ? C.teal : C.cream, color: statusFiltro === s ? "#fff" : C.sub }}>
              {s}
            </button>
          ))}
        </div>
        <Btn icon={Plus} onClick={() => setShowNew(true)}>Novo Pedido</Btn>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="Nenhum pedido nesta etapa" text="Crie um novo pedido a partir do catálogo de aparelhos configurado." action={<Btn icon={Plus} onClick={() => setShowNew(true)}>Novo Pedido</Btn>} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((o) => {
            const p = patients.find((x) => x.id === o.pacienteId);
            const total = o.itens.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
            const totalBoni = o.bonificacao.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
            return (
              <button key={o.id} onClick={() => setOpenOrder(o)} className="flex flex-wrap items-center gap-4 rounded-2xl p-4 text-left transition-shadow hover:shadow-md" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${STATUS_PEDIDO_COR[o.status]}18` }}>
                  <Package size={19} style={{ color: STATUS_PEDIDO_COR[o.status] }} />
                </div>
                <div className="imv-minw-180 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono imv-t-125 font-bold" style={{ color: C.tealDark }}>{o.numero}</span>
                    <span className="imv-t-135 font-bold" style={{ color: C.ink }}>{p?.nome}</span>
                  </div>
                  <div className="imv-t-12" style={{ color: C.sub }}>{o.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(", ")}{totalBoni > 0 ? ` · +${o.bonificacao.length} item(ns) de bonificação` : ""}</div>
                </div>
                <div className="text-right">
                  <div className="imv-t-14 font-extrabold" style={{ color: C.ink }}>{formatBRL(total)}</div>
                  <div className="imv-t-11" style={{ color: C.sub }}>{formatDateBR(o.criadoEm)}</div>
                </div>
                <Badge color={STATUS_PEDIDO_COR[o.status]}>{o.status}</Badge>
              </button>
            );
          })}
        </div>
      )}

      {showNew && <OrderFormModal onClose={() => setShowNew(false)} />}
      {openOrder && <OrderDetailModal order={openOrder} onClose={() => setOpenOrder(null)} />}
    </div>
  );
}

function ItemPicker({ label, items, onAdd }) {
  const { catalog } = useCRM();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = query.length > 0 ? catalog.filter((c) => (c.nome + c.codigo).toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];

  return (
    <div className="relative">
      <Field label={label}>
        <Input value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }} placeholder="Buscar por nome ou código do aparelho/acessório…" />
      </Field>
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl shadow-lg" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
          {results.map((r) => (
            <button key={r.id} onClick={() => { onAdd(r); setQuery(""); setOpen(false); }} className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left imv-hover-tint3">
              <div>
                <div className="imv-t-13 font-semibold" style={{ color: C.ink }}>{r.nome}</div>
                <div className="font-mono imv-t-11" style={{ color: C.sub }}>Cód. {r.codigo || "—"} · {r.cat}</div>
              </div>
              <span className="imv-t-125 font-bold" style={{ color: C.teal }}>{formatBRL(r.preco)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemsTable({ itens, setItens, bonificacao }) {
  const total = itens.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
  const updateQty = (i, q) => setItens(itens.map((it, idx) => (idx === i ? { ...it, quantidade: Math.max(1, Number(q) || 1) } : it)));
  const updatePrice = (i, v) => setItens(itens.map((it, idx) => (idx === i ? { ...it, precoUnitario: Number(v) || 0 } : it)));
  const remove = (i) => setItens(itens.filter((_, idx) => idx !== i));

  if (itens.length === 0) return <p className="rounded-lg px-3 py-3 text-center imv-t-125" style={{ background: C.cream, color: C.sub }}>Nenhum item adicionado ainda.</p>;

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${C.border}` }}>
      <table className="w-full imv-t-125">
        <thead><tr style={{ background: C.cream, color: C.sub }}>
          <th className="px-3 py-2 text-left font-bold">Código</th><th className="px-3 py-2 text-left font-bold">Descrição</th>
          <th className="w-20 px-2 py-2 text-center font-bold">Qtd</th><th className="w-28 px-2 py-2 text-right font-bold">Vl. Unit.</th>
          <th className="w-28 px-2 py-2 text-right font-bold">Total</th><th className="w-10 px-2 py-2"></th>
        </tr></thead>
        <tbody>
          {itens.map((it, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
              <td className="px-3 py-2 font-mono" style={{ color: C.sub }}>{it.codigo || "—"}</td>
              <td className="px-3 py-2 font-semibold" style={{ color: C.ink }}>{it.nome}{bonificacao ? <Gift size={11} className="ml-1 inline" style={{ color: C.coral }} /> : null}</td>
              <td className="px-2 py-2"><input type="number" min={1} value={it.quantidade} onChange={(e) => updateQty(i, e.target.value)} className="w-full rounded-md px-1.5 py-1 text-center" style={{ border: `1px solid ${C.border}` }} /></td>
              <td className="px-2 py-2"><input type="number" step="0.01" value={it.precoUnitario} onChange={(e) => updatePrice(i, e.target.value)} className="w-full rounded-md px-1.5 py-1 text-right" style={{ border: `1px solid ${C.border}` }} /></td>
              <td className="px-2 py-2 text-right font-bold" style={{ color: C.ink }}>{formatBRL(it.quantidade * it.precoUnitario)}</td>
              <td className="px-2 py-2 text-center"><IconBtn icon={X} title="Remover" tone="danger" onClick={() => remove(i)} /></td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr style={{ borderTop: `1.5px solid ${C.border}`, background: C.cream }}>
          <td colSpan={4} className="px-3 py-2.5 text-right font-bold" style={{ color: C.ink }}>TOTAL</td>
          <td className="px-2 py-2.5 text-right font-extrabold" style={{ color: C.teal }}>{formatBRL(total)}</td><td />
        </tr></tfoot>
      </table>
    </div>
  );
}

function OrderFormModal({ onClose }) {
  const { patients, units, orders, setOrders, updatePatient } = useCRM();
  const [pacienteId, setPacienteId] = useState(patients[0]?.id || "");
  const [unidadeId, setUnidadeId] = useState(units[0]?.id || "");
  const [enderecoCustom, setEnderecoCustom] = useState("");
  const [usarEnderecoCustom, setUsarEnderecoCustom] = useState(false);
  const [condicaoPagamento, setCondicaoPagamento] = useState(CONDICOES_PAGAMENTO[2].codigo);
  const [fonoaudiologo, setFonoaudiologo] = useState("");
  const [itens, setItens] = useState([]);
  const [bonificacao, setBonificacao] = useState([]);

  const paciente = patients.find((p) => p.id === pacienteId);
  const unidade = units.find((u) => u.id === unidadeId);

  const addItem = (setter, list) => (r) => {
    if (list.find((i) => i.catalogoId === r.id)) return;
    setter([...list, { catalogoId: r.id, nome: r.nome, codigo: r.codigo, quantidade: 1, precoUnitario: r.preco }]);
  };

  const salvar = () => {
    if (!pacienteId || itens.length === 0) return;
    const ano = String(new Date().getFullYear()).slice(-2);
    const seq = 660 + orders.length + 1;
    const numero = `${seq}.${unidade?.codigo || "00"}.${ano}`;
    const novo = {
      id: uid("ped"), numero, idFabrica: String(900000 + orders.length + 1),
      pacienteId, unidadeId, enderecoEntregaCustom: usarEnderecoCustom ? enderecoCustom : "",
      condicaoPagamento, fonoaudiologo: fonoaudiologo || paciente?.fonoaudiologo || "",
      itens, bonificacao, status: "Aguardando Faturamento", nf: null, series: [], criadoEm: new Date().toISOString(),
    };
    setOrders([novo, ...orders]);
    updatePatient(pacienteId, {
      status: "Pedido em Andamento",
      historico: [{ id: uid("h"), data: new Date().toISOString(), texto: `Pedido ${numero} criado e enviado para faturamento.` }, ...(paciente?.historico || [])],
    });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Novo pedido de aparelho" subtitle="Selecione o paciente, defina o endereço de entrega e monte os itens do pedido e da bonificação." width={720}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar} disabled={!pacienteId || itens.length === 0}>Criar pedido</Btn></>}>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Paciente" required><Select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>{patients.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</Select></Field>
          <Field label="Fonoaudiólogo responsável"><Input value={fonoaudiologo} onChange={(e) => setFonoaudiologo(e.target.value)} placeholder={paciente?.fonoaudiologo || "Ex.: Dra. Camila Rezende"} /></Field>
          <Field label="Unidade"><Select value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}>{units.map((u) => <option key={u.id} value={u.id}>{u.cidade}/{u.uf}</option>)}</Select></Field>
          <Field label="Condição de pagamento"><Select value={condicaoPagamento} onChange={(e) => setCondicaoPagamento(e.target.value)}>{CONDICOES_PAGAMENTO.map((c) => <option key={c.codigo} value={c.codigo}>{c.descricao}</option>)}</Select></Field>
        </div>

        <div className="rounded-xl p-3.5" style={{ background: C.cream }}>
          <label className="flex items-center gap-2 imv-t-125 font-bold" style={{ color: C.tealDark }}>
            <input type="checkbox" checked={usarEnderecoCustom} onChange={(e) => setUsarEnderecoCustom(e.target.checked)} /> Entregar em endereço diferente da unidade
          </label>
          {usarEnderecoCustom ? (
            <Textarea rows={2} className="mt-2" value={enderecoCustom} onChange={(e) => setEnderecoCustom(e.target.value)} placeholder="Destinatário, empresa/instituição, rua, número, bairro, cidade, UF, CEP" />
          ) : (
            <p className="mt-2 imv-t-125" style={{ color: C.sub }}>{unidade?.endereco || `Endereço da unidade ${unidade?.cidade} ainda não cadastrado — configure em “Unidades”.`}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="imv-t-125 font-bold" style={{ color: C.tealDark }}>Itens do pedido (pagos pelo paciente)</p>
          <ItemPicker items={itens} onAdd={addItem(setItens, itens)} />
          <ItemsTable itens={itens} setItens={setItens} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 imv-t-125 font-bold" style={{ color: C.coralDark }}><Gift size={13} /> Itens de bonificação (sem custo ao paciente)</p>
          <ItemPicker items={bonificacao} onAdd={addItem(setBonificacao, bonificacao)} />
          <ItemsTable itens={bonificacao} setItens={setBonificacao} bonificacao />
        </div>
      </div>
    </Modal>
  );
}

function OrderDetailModal({ order, onClose }) {
  const { patients, units, orders, setOrders, updatePatient } = useCRM();
  const [showBilling, setShowBilling] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const paciente = patients.find((p) => p.id === order.pacienteId);
  const unidade = units.find((u) => u.id === order.unidadeId);
  const total = order.itens.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
  const totalBoni = order.bonificacao.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);

  const avancarStatus = (novo) => {
    setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: novo } : o)));
    updatePatient(order.pacienteId, {
      historico: [{ id: uid("h"), data: new Date().toISOString(), texto: `Pedido ${order.numero} → status "${novo}".` }, ...(paciente?.historico || [])],
      ...(novo === "Entregue e Documentado" ? { status: "Adaptado" } : {}),
    });
  };

  const idx = STATUS_PEDIDO.indexOf(order.status);

  return (
    <>
      <Modal open onClose={onClose} title={`Pedido ${order.numero}`} subtitle={paciente?.nome} width={680}
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {STATUS_PEDIDO.map((s, i) => <span key={s} className="h-1.5 w-6 rounded-full" style={{ background: i <= idx ? C.teal : C.border }} />)}
            </div>
            <div className="flex flex-wrap gap-2">
              {order.status === "Aguardando Faturamento" && <Btn icon={FileCheck2} onClick={() => setShowBilling(true)}>Registrar faturamento</Btn>}
              {order.status === "Faturado" && <Btn icon={Truck} onClick={() => avancarStatus("Enviado")}>Marcar como enviado</Btn>}
              {order.status === "Enviado" && <Btn icon={PackageCheck} onClick={() => avancarStatus("Entregue e Documentado")}>Confirmar entrega</Btn>}
              {order.nf && <Btn variant="subtle" icon={Printer} onClick={() => setShowTerms(true)}>Gerar Termos</Btn>}
            </div>
          </div>
        }>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniInfo label="ID Fábrica" value={order.idFabrica} mono />
            <MiniInfo label="Unidade" value={`${unidade?.cidade}/${unidade?.uf}`} />
            <MiniInfo label="Pagamento" value={CONDICOES_PAGAMENTO.find((c) => c.codigo === order.condicaoPagamento)?.descricao} />
            <MiniInfo label="Fonoaudiólogo" value={order.fonoaudiologo || "—"} />
          </div>

          <div className="rounded-xl p-3.5" style={{ background: C.cream }}>
            <p className="mb-1 imv-t-115 font-bold uppercase tracking-wide" style={{ color: C.sub }}>Endereço de entrega</p>
            <p className="imv-t-13" style={{ color: C.ink }}>{order.enderecoEntregaCustom || unidade?.endereco || "Endereço não cadastrado."}</p>
          </div>

          <div><p className="mb-2 imv-t-125 font-bold" style={{ color: C.tealDark }}>Itens do pedido</p><ItemsTable itens={order.itens} setItens={() => {}} /></div>
          {order.bonificacao.length > 0 && <div><p className="mb-2 flex items-center gap-1.5 imv-t-125 font-bold" style={{ color: C.coralDark }}><Gift size={13} /> Bonificação</p><ItemsTable itens={order.bonificacao} setItens={() => {}} bonificacao /></div>}

          {order.nf && (
            <div className="rounded-xl p-3.5" style={{ background: C.greenBg, border: "1px solid #bfe4d3" }}>
              <p className="mb-1 flex items-center gap-1.5 imv-t-125 font-bold" style={{ color: C.green }}><ShieldCheck size={14} /> Faturado</p>
              <p className="imv-t-13" style={{ color: C.ink }}>NF {order.nf.numero} · {formatDateBR(order.nf.data)} · {order.nf.fabricante}</p>
              {order.series.length > 0 && <p className="mt-1 imv-t-12" style={{ color: C.sub }}>Nº de série: {order.series.map((s) => s.numeroSerie).join(", ")}</p>}
            </div>
          )}
        </div>
      </Modal>
      {showBilling && <BillingModal order={order} onClose={() => setShowBilling(false)} onDone={() => { setShowBilling(false); }} />}
      {showTerms && <TermsPrintModal order={order} paciente={paciente} unidade={unidade} onClose={() => setShowTerms(false)} />}
    </>
  );
}

function MiniInfo({ label, value, mono }) {
  return (
    <div>
      <p className="imv-t-11 font-bold uppercase tracking-wide" style={{ color: C.sub }}>{label}</p>
      <p className={cx("imv-t-13 font-bold", mono && "font-mono")} style={{ color: C.ink }}>{value}</p>
    </div>
  );
}

function BillingModal({ order, onClose, onDone }) {
  const { orders, setOrders, patients, updatePatient } = useCRM();
  const aparelhos = order.itens.filter((it) => CATALOGO_INICIAL.find((c) => c.id === it.catalogoId)?.cat === "APARELHOS AASI" || /RADIANT|CAPTIVATE|TREK|CV\d/i.test(it.nome));
  const [nf, setNf] = useState({ numero: "", data: formatDateInputValue(today), fabricante: FABRICANTES[0] });
  const [series, setSeries] = useState(
    aparelhos.flatMap((it) => Array.from({ length: it.quantidade }).map((_, i) => ({ catalogoId: it.catalogoId, nome: it.nome, numeroSerie: "" })))
  );

  const setSerie = (i, v) => setSeries(series.map((s, idx) => (idx === i ? { ...s, numeroSerie: v } : s)));

  const salvar = () => {
    setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: "Faturado", nf, series } : o)));
    const p = patients.find((x) => x.id === order.pacienteId);
    updatePatient(order.pacienteId, { historico: [{ id: uid("h"), data: new Date().toISOString(), texto: `Pedido ${order.numero} faturado — NF ${nf.numero}.` }, ...(p?.historico || [])] });
    onDone();
  };

  return (
    <Modal open onClose={onClose} title="Registrar faturamento" subtitle={`Pedido ${order.numero}`} width={560}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar} disabled={!nf.numero}>Salvar faturamento</Btn></>}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Nº da Nota Fiscal" required><Input value={nf.numero} onChange={(e) => setNf({ ...nf, numero: e.target.value })} placeholder="124.081" /></Field>
          <Field label="Data da NF"><Input type="date" value={nf.data} onChange={(e) => setNf({ ...nf, data: e.target.value })} /></Field>
          <Field label="Fabricante/Distribuidora"><Select value={nf.fabricante} onChange={(e) => setNf({ ...nf, fabricante: e.target.value })}>{FABRICANTES.map((f) => <option key={f}>{f}</option>)}</Select></Field>
        </div>
        {series.length > 0 && (
          <div>
            <p className="mb-2 imv-t-125 font-bold" style={{ color: C.tealDark }}>Números de série dos aparelhos</p>
            <div className="flex flex-col gap-2">
              {series.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-40 truncate imv-t-125 font-semibold" style={{ color: C.ink }}>{s.nome}</span>
                  <Input value={s.numeroSerie} onChange={(e) => setSerie(i, e.target.value)} placeholder="NS — número de série" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* Termo de Recebimento + Termo de Responsabilidade — versão imprimível,
   fiel ao modelo real utilizado pela IMOUVIR (gera PDF via impressão do navegador).
   Em produção, o mesmo conteúdo será preenchido automaticamente em .docx via
   python-docx a partir deste mesmo template. */
function TermsPrintModal({ order, paciente, unidade, onClose }) {
  const cidadeAssinatura = unidade?.cidade ? `${unidade.cidade}/${unidade.uf}` : "____________";
  const dataHoje = new Date();

  return (
    <div className="fixed inset-0 imv-z-60 overflow-y-auto py-6" style={{ background: "rgba(6,40,42,0.55)" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #imv-print-area, #imv-print-area * { visibility: visible; }
          #imv-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .imv-no-print { display: none !important; }
        }
      `}</style>
      <div className="mx-auto flex imv-maxw-820 flex-col gap-3 px-4">
        <div className="imv-no-print flex items-center justify-between rounded-xl px-4 py-3" style={{ background: C.card }}>
          <span className="imv-t-13 font-bold" style={{ color: C.ink }}>Prévia de impressão — Termo de Recebimento e Responsabilidade</span>
          <div className="flex gap-2">
            <Btn variant="ghost" size="sm" onClick={onClose}>Fechar</Btn>
            <Btn size="sm" icon={Printer} onClick={() => window.print()}>Imprimir / Salvar PDF</Btn>
          </div>
        </div>

        <div id="imv-print-area" className="rounded-xl p-10" style={{ background: "#fff", fontFamily: "Inter, sans-serif", color: "#111" }}>
          <h2 className="text-center imv-t-16 font-extrabold">Termo de Recebimento</h2>
          <p className="mt-1 text-center imv-t-115 font-semibold text-gray-500">PROJETO SAÚDE AUDITIVA – INSTITUTO MAÇÔNICO OUVIR - IMOUVIR</p>
          <p className="mt-4 imv-t-125 leading-relaxed">
            Através deste termo confirmo o recebimento do(s) aparelho(s) auditivo(s) e respectiva nota fiscal descritos no quadro abaixo, bem como recebi as orientações e cuidados necessários para proteção e bom funcionamento do(s) aparelho(s).
          </p>
          <p className="mt-3 imv-t-125 font-bold">{order.numero} - PCT {(paciente?.nome || "").toUpperCase()}</p>

          <table className="mt-2 w-full border-collapse imv-t-12">
            <tbody>
              <tr><td className="border border-gray-400 px-2 py-1 font-semibold" colSpan={1}>NF {order.nf?.numero} DE {formatDateBR(order.nf?.data)}</td><td className="border border-gray-400 px-2 py-1">{order.nf?.fabricante}</td></tr>
              {order.series.length > 0 ? order.series.map((s, i) => (
                <tr key={i}><td className="border border-gray-400 px-2 py-1">NS – {s.numeroSerie || "____________"}</td><td className="border border-gray-400 px-2 py-1">{s.nome}</td></tr>
              )) : <tr><td className="border border-gray-400 px-2 py-1">NS – ____________</td><td className="border border-gray-400 px-2 py-1"></td></tr>}
            </tbody>
          </table>

          <p className="mt-3 imv-t-11 font-bold uppercase leading-relaxed">
            Garantia do fabricante – 1 ano para defeitos de fabricação do aparelho, com exceção dos receptores, que possuem 3 meses de garantia — sujeito à análise e aprovação do laboratório da empresa.
          </p>

          <h3 className="mt-4 imv-t-13 font-extrabold">Cuidados a serem observados para preservação do Aparelho Auditivo</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 imv-t-115 leading-relaxed">
            <li>Proteja seu aparelho auditivo de sujeira. Mantenha os dedos limpos e secos antes de manusear os aparelhos — a entrada do microfone é pequena e pode obstruir facilmente.</li>
            <li>Evite impactos e quedas sobre superfícies duras, especialmente durante a limpeza ou troca de pilha.</li>
            <li>Não exponha o aparelho a altas temperaturas, luz solar direta ou proximidade de aquecedores.</li>
            <li>Proteja da umidade: remova antes do banho ou natação, evite deixá-lo no banheiro e retire a pilha à noite, deixando o compartimento aberto.</li>
            <li>Mantenha fora do alcance de crianças e animais domésticos.</li>
            <li>Evite contato com fixadores de cabelo ou maquiagem — remova o aparelho antes de aplicar esses produtos.</li>
            <li>Limpe apenas com pano macio e seco; nunca use álcool, solventes ou produtos de limpeza.</li>
            <li>Mantenha a higiene do ouvido em dia para o melhor desempenho do aparelho.</li>
            <li>Guarde em local seguro, sem pilha, dentro do estojo com desumidificador quando não estiver em uso.</li>
            <li>Reparos somente com especialistas autorizados — nunca abra o aparelho por conta própria.</li>
          </ul>

          <div className="mt-10 text-center imv-t-12">
            <p>{cidadeAssinatura}, {formatDateBR(dataHoje)}</p>
            <p className="mt-8 border-t border-gray-400 pt-1 mx-auto w-64">Assinatura</p>
          </div>

          <div className="my-10 border-t-2 border-dashed border-gray-300" />

          <h2 className="text-center imv-t-15 font-extrabold">TERMO DE RESPONSABILIDADE E AUTORIZAÇÃO<br />DE USO E DIREITOS DE IMAGEM INDIVIDUAL</h2>
          <p className="mt-3 imv-t-12 leading-relaxed">
            Conforme assinatura abaixo, declaro que concordo, sem ressalvas, em participar de campanhas de divulgação do "Instituto Maçônico Ouvir", por livre e espontânea vontade, assumindo toda e qualquer responsabilidade por minha participação.
          </p>

          <table className="mt-3 w-full border-collapse imv-t-12">
            <tbody>
              <tr><td className="border border-gray-400 px-2 py-1 font-semibold" colSpan={2}>Nome: {paciente?.nome}</td></tr>
              <tr><td className="border border-gray-400 px-2 py-1">CPF: {paciente?.cpf || "____________"}</td><td className="border border-gray-400 px-2 py-1"></td></tr>
              <tr><td className="border border-gray-400 px-2 py-1" colSpan={2}>Endereço: {paciente?.endereco || "____________"}</td></tr>
              <tr><td className="border border-gray-400 px-2 py-1">CEP: ____________</td><td className="border border-gray-400 px-2 py-1">Cidade/Estado: {paciente?.cidade}/{paciente?.uf}</td></tr>
              <tr><td className="border border-gray-400 px-2 py-1">Data Nasc.: {paciente?.dataNascimento ? formatDateBR(paciente.dataNascimento) : "____________"}</td><td className="border border-gray-400 px-2 py-1"></td></tr>
            </tbody>
          </table>

          <p className="mt-3 imv-t-11 leading-relaxed text-gray-700">
            Declaro ter ciência de que se trata de uma campanha de propaganda do "Instituto Maçônico Ouvir", com finalidade de divulgação de seus serviços, pela qual concordo e autorizo o uso de minha imagem, na divulgação da instituição, por prazo indeterminado, nas formas e meios de comunicação de praxe (impressos, digitais, redes sociais e demais mídias), a título gratuito, em todo o território nacional.
          </p>

          <div className="mt-10 text-center imv-t-12">
            <p>{cidadeAssinatura}, {formatDateBR(dataHoje)}</p>
            <p className="mt-8 border-t border-gray-400 pt-1 mx-auto w-64">Assinatura</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Catálogo de Aparelhos
   ========================================================================= */
function CatalogoPage() {
  const { catalog, setCatalog } = useCRM();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Todas");
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const categorias = ["Todas", ...Array.from(new Set(catalog.map((c) => c.cat)))];
  const filtered = catalog.filter((c) => (cat === "Todas" || c.cat === cat) && (c.nome + c.codigo).toLowerCase().includes(query.toLowerCase()));

  const remove = (id) => setCatalog(catalog.filter((c) => c.id !== id));

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 imv-minw-220">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.sub }} />
          <Input placeholder="Buscar por nome ou código…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div className="w-full sm:w-64"><Select value={cat} onChange={(e) => setCat(e.target.value)}>{categorias.map((c) => <option key={c}>{c}</option>)}</Select></div>
        <Btn icon={Plus} onClick={() => setShowNew(true)}>Novo item</Btn>
      </div>

      <p className="imv-t-125" style={{ color: C.sub }}>{filtered.length} de {catalog.length} itens cadastrados · cada aparelho/acessório possui código único junto à fábrica.</p>

      <div className="overflow-hidden rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <table className="w-full imv-t-13">
          <thead><tr style={{ background: C.cream }}>
            <th className="px-4 py-3 text-left font-bold" style={{ color: C.sub }}>Categoria</th>
            <th className="px-4 py-3 text-left font-bold" style={{ color: C.sub }}>Descrição</th>
            <th className="px-4 py-3 text-left font-bold" style={{ color: C.sub }}>Código</th>
            <th className="px-4 py-3 text-right font-bold" style={{ color: C.sub }}>Preço</th>
            <th className="w-20 px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {filtered.slice(0, 120).map((c) => (
              <tr key={c.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-4 py-2.5"><span className="imv-t-11 font-bold uppercase" style={{ color: C.teal }}>{c.cat}</span></td>
                <td className="px-4 py-2.5 font-semibold" style={{ color: C.ink }}>{c.nome}</td>
                <td className="px-4 py-2.5 font-mono" style={{ color: C.sub }}>{c.codigo || "—"}</td>
                <td className="px-4 py-2.5 text-right font-bold" style={{ color: C.ink }}>{formatBRL(c.preco)}</td>
                <td className="px-4 py-2.5"><div className="flex justify-end gap-1"><IconBtn icon={Pencil} title="Editar" onClick={() => setEditing(c)} /><IconBtn icon={Trash2} title="Excluir" tone="danger" onClick={() => remove(c.id)} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 120 && <p className="px-4 py-3 text-center imv-t-12" style={{ color: C.sub }}>Mostrando 120 de {filtered.length} — refine a busca para ver outros itens.</p>}
      </div>

      {(showNew || editing) && <CatalogItemModal item={editing} onClose={() => { setShowNew(false); setEditing(null); }} />}
    </div>
  );
}

function CatalogItemModal({ item, onClose }) {
  const { catalog, setCatalog } = useCRM();
  const [form, setForm] = useState({ cat: item?.cat || "APARELHOS AASI", nome: item?.nome || "", codigo: item?.codigo || "", preco: item?.preco || 0 });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const salvar = () => {
    if (!form.nome.trim()) return;
    if (item) setCatalog(catalog.map((c) => (c.id === item.id ? { ...c, ...form, preco: Number(form.preco) } : c)));
    else setCatalog([{ id: uid("cat"), ...form, preco: Number(form.preco) }, ...catalog]);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={item ? "Editar item do catálogo" : "Novo item no catálogo"} width={480}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar}>Salvar</Btn></>}>
      <div className="flex flex-col gap-4">
        <Field label="Categoria"><Input value={form.cat} onChange={set("cat")} placeholder="Ex.: APARELHOS AASI" /></Field>
        <Field label="Nome / descrição" required><Input value={form.nome} onChange={set("nome")} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Código de fábrica"><Input value={form.codigo} onChange={set("codigo")} /></Field>
          <Field label="Preço (R$)"><Input type="number" step="0.01" value={form.preco} onChange={set("preco")} /></Field>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================================
   Unidades
   ========================================================================= */
function UnidadesPage() {
  const { units, setUnits } = useCRM();
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const remove = (id) => setUnits(units.filter((u) => u.id !== id));

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-8">
      <div className="flex items-center justify-between">
        <p className="imv-t-13" style={{ color: C.sub }}>{units.length} unidades de atendimento cadastradas.</p>
        <Btn icon={Plus} onClick={() => setShowNew(true)}>Nova unidade</Btn>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {units.map((u) => (
          <div key={u.id} className="flex flex-col gap-3 rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.teal}18` }}><Building2 size={18} style={{ color: C.teal }} /></div>
                <div>
                  <div className="imv-t-14 font-bold" style={{ color: C.ink }}>{u.cidade}{u.sede ? <Badge color={C.teal}>Sede</Badge> : null}</div>
                  <div className="imv-t-12" style={{ color: C.sub }}>{u.uf} · código {u.codigo}</div>
                </div>
              </div>
              <div className="flex gap-1"><IconBtn icon={Pencil} title="Editar" onClick={() => setEditing(u)} /><IconBtn icon={Trash2} title="Excluir" tone="danger" onClick={() => remove(u.id)} /></div>
            </div>
            {u.endereco ? (
              <p className="imv-t-125 leading-relaxed" style={{ color: C.ink }}>{u.endereco}</p>
            ) : (
              <p className="flex items-center gap-1.5 imv-t-12 font-semibold" style={{ color: C.coral }}><AlertTriangle size={12} /> Endereço não cadastrado</p>
            )}
            {u.telefone ? <p className="flex items-center gap-1.5 imv-t-125" style={{ color: C.sub }}><Phone size={12} /> {formatPhone(u.telefone)}</p> : null}
          </div>
        ))}
      </div>
      {(showNew || editing) && <UnitModal unit={editing} onClose={() => { setShowNew(false); setEditing(null); }} />}
    </div>
  );
}

function UnitModal({ unit, onClose }) {
  const { units, setUnits } = useCRM();
  const [form, setForm] = useState({ codigo: unit?.codigo || "", cidade: unit?.cidade || "", uf: unit?.uf || "", endereco: unit?.endereco || "", telefone: unit?.telefone || "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const salvar = () => {
    if (!form.cidade.trim()) return;
    if (unit) setUnits(units.map((u) => (u.id === unit.id ? { ...u, ...form } : u)));
    else setUnits([...units, { id: uid("un"), ...form }]);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={unit ? "Editar unidade" : "Nova unidade"} width={480}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar}>Salvar</Btn></>}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2"><Field label="Cidade" required><Input value={form.cidade} onChange={set("cidade")} /></Field></div>
          <Field label="UF"><Input value={form.uf} maxLength={2} onChange={(e) => setForm((f) => ({ ...f, uf: e.target.value.toUpperCase() }))} /></Field>
        </div>
        <Field label="Código interno"><Input value={form.codigo} onChange={set("codigo")} placeholder="Ex.: 13" /></Field>
        <Field label="Endereço completo"><Textarea rows={3} value={form.endereco} onChange={set("endereco")} placeholder="Rua, número, bairro, cidade, UF, CEP" /></Field>
        <Field label="Telefone"><Input value={formatPhone(form.telefone)} onChange={(e) => setForm((f) => ({ ...f, telefone: onlyDigits(e.target.value) }))} /></Field>
      </div>
    </Modal>
  );
}

/* =========================================================================
   App
   ========================================================================= */
const PAGE_META = {
  dashboard: { title: "Dashboard", subtitle: "Visão geral de pacientes, agenda e pedidos." },
  pacientes: { title: "Pacientes", subtitle: "Pasta digital de cada paciente — dados, exames e histórico." },
  agenda: { title: "Agenda", subtitle: "Calendário de atendimentos com confirmação via WhatsApp." },
  pedidos: { title: "Pedidos", subtitle: "Do fechamento da venda ao termo de entrega assinado." },
  catalogo: { title: "Catálogo de Aparelhos", subtitle: "Itens configurados com nome e código junto à fábrica." },
  unidades: { title: "Unidades", subtitle: "Endereços de atendimento por cidade." },
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [patients, setPatients] = useState(PACIENTES_INICIAIS);
  const [appointments, setAppointments] = useState(() => seedAppointments(PACIENTES_INICIAIS));
  const [orders, setOrders] = useState(() => seedOrders(PACIENTES_INICIAIS));
  const [catalog, setCatalog] = useState(CATALOGO_INICIAL);
  const [units, setUnits] = useState(UNIDADES_INICIAIS);

  const updatePatient = (id, fields) => setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)));

  const ctx = { patients, setPatients, updatePatient, appointments, setAppointments, orders, setOrders, catalog, setCatalog, units, setUnits };

  const meta = PAGE_META[page];

  return (
    <CRM.Provider value={ctx}>
      <style>{FONTS}</style>
      <style>{`
        .imv-wave-bar { animation: imvwave 1s ease-in-out infinite alternate; }
        @keyframes imvwave { from { transform: scaleY(0.5); } to { transform: scaleY(1); } }
        @media (prefers-reduced-motion: reduce) { .imv-wave-bar { animation: none; } }
      `}</style>
      <div className="flex min-h-screen w-full" style={{ background: C.cream, fontFamily: "Inter, sans-serif" }}>
        <Sidebar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar
            title={meta.title}
            subtitle={meta.subtitle}
            onMenu={() => setMobileOpen(true)}
            right={
              <div className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex" style={{ background: `${C.teal}14` }}>
                <Sparkles size={13} style={{ color: C.teal }} />
                <span className="imv-t-115 font-bold" style={{ color: C.tealDark }}>IMOUVIR CRM</span>
              </div>
            }
          />
          {page === "dashboard" && <Dashboard goTo={setPage} />}
          {page === "pacientes" && <PacientesPage />}
          {page === "agenda" && <AgendaPage />}
          {page === "pedidos" && <PedidosPage />}
          {page === "catalogo" && <CatalogoPage />}
          {page === "unidades" && <UnidadesPage />}
        </div>
      </div>
    </CRM.Provider>
  );
}
