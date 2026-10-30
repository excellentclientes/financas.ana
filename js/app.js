const $=s=>document.querySelector(s),K='fluxo_demo_v2';
const CATS0={Despesa:{Moradia:['Aluguel','Condomínio','Energia','Internet'],Alimentação:['Supermercado','Restaurante','Delivery'],Transporte:['Combustível','App de transporte','Manutenção'],Saúde:['Plano de saúde','Farmácia','Consultas'],Lazer:['Streaming','Cinema','Viagens'],Educação:['Cursos','Livros'],Tecnologia:['Eletrônicos','Assinaturas']},
 Receita:{Trabalho:['Salário','Freelance'],Investimentos:['Dividendos','Rendimentos'],Vendas:['Produtos','Serviços']}};
let CATS=(()=>{try{const c=JSON.parse(localStorage.getItem('fluxo_cats'));if(c&&c.Despesa&&c.Receita)return c}catch(e){}return JSON.parse(JSON.stringify(CATS0))})();
const CONTAS=[],CARTOES=[];
const brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fd=d=>d?d.split('-').reverse().join('/'):'—';
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TODAY=iso(new Date());
const mlabel=m=>{const[y,n]=m.split('-');const s=new Date(y,n-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});return s[0].toUpperCase()+s.slice(1)};

function seed(){
 let r=11;const rnd=()=>(r=(r*16807)%2147483647)/2147483647,between=(a,b)=>Math.round((a+rnd()*(b-a))*100)/100;
 const L=[],now=new Date();let n=1;
 const add=(o)=>L.push({n:n++,tipo:'Despesa',parc:'1/1',qtd:1,cartao:'',pgto:'',compra:'',status:'pendente',...o});
 for(let m=-4;m<=2;m++){
  const dt=d=>iso(new Date(now.getFullYear(),now.getMonth()+m,d));
  const E=(d,desc,cat,sub,valor,conta,x={})=>{const venc=dt(d),paid=venc<TODAY&&rnd()>.08;add({venc,desc,cat,sub,valor,conta,compra:x.cartao?dt(Math.max(1,d-Math.floor(rnd()*6)-1)):venc,pgto:paid?venc:'',status:paid?'pago':'pendente',...x})};
  const R=(d,desc,cat,sub,valor,conta)=>{const venc=dt(d),paid=venc<TODAY;add({tipo:'Receita',venc,desc,cat,sub,valor,conta,compra:'',pgto:paid?venc:'',status:paid?'pago':'pendente'})};
  R(5,'Salário mensal','Trabalho','Salário',8500,'Itaú');
  if(m%2===0)R(18,'Projeto freelance - site institucional','Trabalho','Freelance',between(1400,3200),'Nubank');
  R(15,'Dividendos de ações','Investimentos','Dividendos',between(280,520),'Banco do Brasil');
  if(m%3===0)R(22,'Venda de produtos online','Vendas','Produtos',between(600,1400),'Nubank');
  E(10,'Aluguel do apartamento','Moradia','Aluguel',2200,'Itaú');
  E(10,'Condomínio','Moradia','Condomínio',680,'Itaú');
  E(15,'Conta de energia','Moradia','Energia',between(170,330),'Caixa');
  E(20,'Internet fibra 500MB','Moradia','Internet',119.9,'Caixa');
  E(8,'Plano de saúde','Saúde','Plano de saúde',540,'Itaú');
  E(12,'Netflix','Lazer','Streaming',55.9,'Nubank',{cartao:'Nubank Mastercard'});
  E(12,'Spotify Família','Lazer','Streaming',34.9,'Nubank',{cartao:'Nubank Mastercard'});
  E(7+Math.floor(rnd()*4),'Supermercado da semana','Alimentação','Supermercado',between(320,690),'Nubank',{cartao:'Nubank Mastercard',qtd:Math.ceil(rnd()*3)});
  E(21+Math.floor(rnd()*5),'Compras do mês','Alimentação','Supermercado',between(380,820),'Itaú',{cartao:'Itaú Visa'});
  E(14,'Jantar em restaurante','Alimentação','Restaurante',between(110,260),'Itaú',{cartao:'XP Visa Infinite'});
  E(25,'Pedido de delivery','Alimentação','Delivery',between(45,98),'Nubank',{cartao:'Nubank Mastercard'});
  E(9,'Abastecimento do carro','Transporte','Combustível',between(180,320),'Itaú',{cartao:'Itaú Visa',qtd:Math.ceil(rnd()*2)});
  E(23,'Corridas de aplicativo','Transporte','App de transporte',between(60,170),'Nubank',{cartao:'Nubank Mastercard'});
  E(17,'Farmácia','Saúde','Farmácia',between(40,190),'Banco do Brasil');
  if(m%2)E(27,'Cinema e pipoca','Lazer','Cinema',between(70,130),'Nubank',{cartao:'XP Visa Infinite',qtd:2});
  if(m>=-3&&m<=2)E(5,'Notebook 14" (parcelado)','Tecnologia','Eletrônicos',449.9,'Itaú',{cartao:'XP Visa Infinite',parc:`${m+4}/10`,compra:iso(new Date(now.getFullYear(),now.getMonth()-3,2))});
  if(m>=-1&&m<=1)E(28,'Curso de inglês','Educação','Cursos',289,'Banco do Brasil',{parc:`${m+2}/3`});
 }
 L.sort((a,b)=>a.venc.localeCompare(b.venc)).forEach((x,i)=>x.n=i+1);
 return L;
}
function load(){try{const s=localStorage.getItem(K);if(s)return JSON.parse(s)}catch(e){}return []}
function persist(){try{localStorage.setItem(K,JSON.stringify(D))}catch(e){}}
let D=load();
let CARDS=null;try{CARDS=JSON.parse(localStorage.getItem('fluxo_cards'))}catch(e){}
if(!Array.isArray(CARDS))CARDS=[];
/* Cartões citados em lançamentos mas ausentes da lista: criados só na memória, com id fixo (igual em todos os aparelhos) */
const hashNome=s=>{let n=7;for(const ch of s)n=(n*31+ch.charCodeAt(0))>>>0;return n.toString(36)};
D.forEach(x=>{if(x.cartao&&!CARDS.some(c=>c.nome===x.cartao))CARDS.push({id:'c_'+hashNome(x.cartao),nome:x.cartao,limite:0})});
function cardsSave(){try{localStorage.setItem('fluxo_cards',JSON.stringify(CARDS))}catch(e){}CARTOES.length=0;CARDS.forEach(c=>CARTOES.push(c.nome))}
let BANKS=null,TR=null,BKE=null,TRE=null,FAT=null;
try{FAT=JSON.parse(localStorage.getItem('fluxo_faturas'))}catch(e){}
if(!Array.isArray(FAT))FAT=[];
try{BANKS=JSON.parse(localStorage.getItem('fluxo_banks'))}catch(e){}
if(!Array.isArray(BANKS))BANKS=[];
try{TR=JSON.parse(localStorage.getItem('fluxo_transf'))}catch(e){}
if(!Array.isArray(TR))TR=[];
function syncContas(){CONTAS.length=0;BANKS.filter(b=>b.status==='Ativo').forEach(b=>CONTAS.push(b.nome))}
function banksSave(){try{localStorage.setItem('fluxo_banks',JSON.stringify(BANKS))}catch(e){}syncContas()}
function trSave_(){try{localStorage.setItem('fluxo_transf',JSON.stringify(TR))}catch(e){}}
function parseMon(v){return parseMoney(v)}
syncContas();
const saldoAtual=b=>b.saldo+D.filter(x=>x.conta===b.nome&&st(x)==='pago'&&!(x.tipo==='Despesa'&&x.cartao)).reduce((a,x)=>a+(x.tipo==='Receita'?x.valor:-x.valor),0)-FAT.filter(f=>f.conta===b.nome).reduce((a,f)=>a+f.valor,0);
const bkAtivos=()=>BANKS.filter(b=>b.status==='Ativo');
const bkBadge=s=>`<span class="bst ${s==='Ativo'?'on':'off'}">${s}</span>`;

function bkRender(){
 const at=bkAtivos(),hoje=TODAY.slice(0,7);
 const sIni=at.reduce((a,b)=>a+b.saldo,0);
 const pago=D.filter(x=>st(x)==='pago');
 const rec=pago.filter(x=>x.tipo==='Receita').reduce((a,x)=>a+x.valor,0);
 const des=pago.filter(x=>x.tipo==='Despesa'&&!x.cartao).reduce((a,x)=>a+x.valor,0)+FAT.reduce((a,f)=>a+f.valor,0);
 const recM=pago.filter(x=>x.tipo==='Receita'&&x.venc.slice(0,7)===hoje).reduce((a,x)=>a+x.valor,0);
 const desM=pago.filter(x=>x.tipo==='Despesa'&&!x.cartao&&x.venc.slice(0,7)===hoje).reduce((a,x)=>a+x.valor,0);
 const acum=at.reduce((a,b)=>a+saldoAtual(b),0);

 const linhas=at.map(b=>`<tr><td class="nm">${esc(b.nome)}</td><td class="r">${brl(saldoAtual(b))}</td></tr>`).join('');
 $('#bkres').innerHTML=`<table class="ct"><thead><tr><th>Conta bancária</th><th class="r">Saldo</th></tr></thead><tbody>${linhas||'<tr><td colspan="2" class="empty" style="padding:18px">Nenhuma conta ativa.</td></tr>'}</tbody><tfoot><tr><th>Total</th><th class="r">${brl(acum)}</th></tr></tfoot></table>`;
 const rows=BANKS.map(b=>`<tr><td class="nm">${esc(b.nome)}</td><td class="r">${brl(b.saldo)}</td><td>${fd(b.data)}</td><td>${bkBadge(b.status)}</td><td class="r">${brl(saldoAtual(b))}</td><td class="act"><button class="ic" onclick="bkOpen('${b.id}')" title="Editar" aria-label="Editar">✎</button><button class="ic" onclick="bkDel('${b.id}')" title="Excluir" aria-label="Excluir">🗑</button></td></tr>`).join('');
 $('#bkA').innerHTML=`<table class="ct"><thead><tr><th>Conta Bancária</th><th class="r">Saldo Inicial</th><th>Data Saldo Inicial</th><th>Status</th><th class="r">Valor atual</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="empty" style="padding:22px">Nenhuma conta cadastrada.</td></tr>'}</tbody></table>`;
 $('#ctBk').textContent=BANKS.length+(BANKS.length===1?' conta':' contas');
}
function bkOpen(id){BKE=id||null;const b=id?BANKS.find(x=>x.id===id):null;$('#bkt').textContent=b?'Editar conta bancária':'Nova conta bancária';$('#bk_n').value=b?b.nome:'';$('#bk_s').value=b?String(b.saldo).replace('.',','):'';$('#bk_d').value=b?b.data:TODAY;$('#bk_st').value=b?b.status:'Ativo';$('#bkdlg').showModal();$('#bk_n').focus()}
function bkSave(e){e.preventDefault();const n=nm($('#bk_n').value),sv=parseMon($('#bk_s').value),d=$('#bk_d').value,stt=$('#bk_st').value;
 if(!n)return false;if(!isFinite(sv)){toast('Informe um saldo válido');return false}
 if(BANKS.some(b=>b.id!==BKE&&same(b.nome,n))){toast('Já existe uma conta com esse nome');return false}
 if(BKE){const b=BANKS.find(x=>x.id===BKE);if(b.nome!==n){D.forEach(x=>{if(x.conta===b.nome)x.conta=n});TR.forEach(t=>{if(t.origem===b.nome)t.origem=n});persist();trSave_();b.nome=n}b.saldo=sv;b.data=d;b.status=stt}
 else BANKS.push({id:'b'+Date.now().toString(36),nome:n,saldo:sv,data:d,status:stt});
 banksSave();bkRender();render();trRender();$('#bkdlg').close();toast(BKE?'Conta atualizada':'Conta cadastrada');return false}
function confirmar(msg,ok='Excluir'){
 return new Promise(res=>{
  const d=document.getElementById('confdlg');
  $('#conf-msg').textContent=msg;$('#conf-ok').textContent=ok;
  const fim=v=>{d.close();res(v)};
  $('#conf-ok').onclick=()=>fim(true);
  $('#conf-no').onclick=()=>fim(false);
  d.oncancel=e=>{e.preventDefault();fim(false)};
  d.showModal();$('#conf-no').focus();
 });
}
function bkDel(id){const b=BANKS.find(x=>x.id===id);if(!b)return;const n=D.filter(x=>x.conta===b.nome).length+TR.filter(t=>t.origem===b.nome).length;
 const msg=n?`A conta "${b.nome}" tem ${n} lançamento(s)/transferência(s) vinculados. Excluir mesmo assim? Prefira marcar como Inativa.`:`Excluir a conta "${b.nome}"?`;
 confirmar(msg).then(ok=>{if(ok){BANKS=BANKS.filter(x=>x.id!==id);banksSave();bkRender();render();trRender();toast('Conta excluída')}})}

function trRender(){
 const nomes=n=>BANKS.some(b=>b.nome===n)?'':' class="bk-off"';
 const rows=[...TR].sort((a,b)=>b.data.localeCompare(a.data)).map(t=>`<tr><td>${fd(t.data)}</td><td>${esc(t.origem)}</td><td>${esc(t.destino)}</td><td>${esc(t.desc||'—')}</td><td class="r">${brl(t.valor)}</td><td><span class="bst ${t.status==='Concluída'?'on':'wait'}">${t.status}</span></td><td class="act"><button class="ic" onclick="trOpen('${t.id}')" title="Editar" aria-label="Editar">✎</button><button class="ic" onclick="trDel('${t.id}')" title="Excluir" aria-label="Excluir">🗑</button></td></tr>`).join('');
 $('#trA').innerHTML=`<table class="ct"><thead><tr><th>Data</th><th>Conta Bancária - Origem</th><th>Conta Bancária - Destino</th><th>Descrição</th><th class="r">Valor</th><th>Status</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="7" class="empty" style="padding:22px">Nenhuma transferência cadastrada.</td></tr>'}</tbody></table>`;
 $('#ctT').textContent=TR.length+(TR.length===1?' transferência':' transferências');
}
function trOpen(id){
 if(!id&&semContaAtiva('Cadastre uma conta bancária antes de criar transferências'))return;
 TRE=id||null;const t=id?TR.find(x=>x.id===id):null;const ativos=bkAtivos();
 if(!ativos.length&&!t){toast('Cadastre pelo menos uma conta ativa');return}
 const o=opts(ativos.map(b=>b.nome));
 $('#trt').textContent=t?'Editar transferência':'Nova transferência';
 $('#tr_d').value=t?t.data:TODAY;$('#tr_v').value=t?String(t.valor).replace('.',','):'';
 $('#tr_o').innerHTML=o;
 $('#tr_o').value=t?t.origem:(ativos[0]||{}).nome||'';$('#tr_t').value=t?t.destino:'';
 $('#tr_desc').value=t?t.desc:'';$('#tr_st').value=t?t.status:'Concluída';
 $('#trdlg').showModal();$('#tr_v').focus()}
function trSave(e){e.preventDefault();const v=parseMon($('#tr_v').value),o=$('#tr_o').value,t=$('#tr_t').value.trim();
 if(!isFinite(v)||v<=0){toast('Informe um valor válido');return false}
 if(!o){toast('Selecione a conta de origem');return false}
 if(!t){toast('Informe a conta de destino');return false}
 const obj={data:$('#tr_d').value,origem:o,destino:t,desc:$('#tr_desc').value.trim(),valor:v,status:$('#tr_st').value};
 if(TRE){Object.assign(TR.find(x=>x.id===TRE),obj)}else TR.push({id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),...obj});
 trSave_();trRender();$('#trdlg').close();toast(TRE?'Transferência atualizada':'Transferência cadastrada');return false}
function trDel(id){confirmar('Excluir esta transferência?').then(ok=>{if(ok){TR=TR.filter(x=>x.id!==id);trSave_();trRender();toast('Transferência excluída')}})}

// Ao abrir a página NÃO grava nada na nuvem (gravar aqui fazia as contas se sobrescreverem e a página recarregar sem parar)
CARTOES.length=0;CARDS.forEach(c=>CARTOES.push(c.nome));
const st=x=>x.status==='pago'?'pago':(x.venc<TODAY?'atrasado':'pendente');
const stLabel=x=>({pago:x.tipo==='Receita'?'Recebido':'Pago',pendente:'Em aberto',atrasado:'Atrasado'}[st(x)]);

let TAB='';const TABN={pendente:'Em aberto',pago:'Pagos / Recebidos','':'Todos os status'};
function setTab(t){TAB=t;render()}
/* ===== Busca inteligente: pesquisa em todas as colunas ===== */
const nrm=s=>String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\u00a0/g,' ').toLowerCase();
const MESES=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const dtxt=d=>{if(!d)return'';const[y,m,dd]=d.split('-'),mi=+m-1;return[fd(d),d,`${dd}/${m}`,`${m}/${y}`,MESES[mi],MESES[mi].slice(0,3),y].join(' ')};
const vtxt=v=>[v.toFixed(2),v.toFixed(2).replace('.',','),v.toLocaleString('pt-BR',{minimumFractionDigits:2}),String(Math.round(v)),brl(v)].join(' ');
const FIELDS={
 n:x=>String(x.n).padStart(4,'0')+' '+x.n,
 tipo:x=>x.tipo,
 venc:x=>dtxt(x.venc),
 pgto:x=>dtxt(x.pgto),
 parc:x=>x.parc||'',
 conta:x=>x.conta+' '+(x.cartao||'sem cartao'),
 cat:x=>x.cat,
 sub:x=>x.sub,
 compra:x=>dtxt(x.compra),
 qtd:x=>String(x.qtd),
 desc:x=>x.desc,
 valor:x=>vtxt(x.valor),
 status:x=>stLabel(x)+' '+st(x)+' '+(st(x)==='pago'?'quitado':'em aberto')
};
const COLS={n:['n','no','nº','num','numero'],tipo:['tipo'],venc:['venc','vencimento'],pgto:['pgto','pagamento','recebimento','receb','pago'],parc:['parc','parcela'],conta:['conta','cartao','banco'],cat:['cat','categoria'],sub:['sub','subcategoria'],compra:['compra'],qtd:['qtd','quantidade'],desc:['desc','descricao'],valor:['valor'],status:['status','situacao']};
const COLK={};Object.entries(COLS).forEach(([k,a])=>a.forEach(n=>COLK[n]=k));
const pnum=t=>{t=t.replace(/[^\d.,]/g,'');if(t.includes(','))t=t.replace(/\./g,'').replace(',','.');return parseFloat(t)};
function parseQ(s){
 const out=[],re=/(?:([^\s:"]+):)?(?:"([^"]*)"|(\S+))/g;let m;
 while((m=re.exec(s))){
  const quoted=m[2]!==undefined;let col=m[1]?COLK[nrm(m[1])]:null,val=quoted?m[2]:m[3];
  if(m[1]&&!col)val=m[1]+':'+val;
  if(!quoted){
   if(/^[<>=]+$/.test(val))continue;
   if(val.endsWith(':')&&COLK[nrm(val.slice(0,-1))])continue;
   const c=val.match(/^(>=|<=|>|<|=)\s*(-?[\d.,]+)$/);
   if(c&&!isNaN(pnum(c[2]))){out.push({col:'valor',op:c[1],n:pnum(c[2])});continue}
  }
  let neg=false;if(!quoted&&/^-(?=\D)/.test(val)){neg=true;val=val.slice(1)}
  val=nrm(val).trim();if(val)out.push({col,t:val,neg});
 }
 return out;
}
let _qs=null,_Q=[];
const getQ=()=>{const s=$('#q').value;if(s!==_qs){_qs=s;_Q=parseQ(s)}return _Q};
function matchQ(x,Q){
 if(!Q.length)return true;let all=null;
 return Q.every(t=>{
  if(t.op){const v=x.valor;return t.op==='>'?v>t.n:t.op==='<'?v<t.n:t.op==='>='?v>=t.n:t.op==='<='?v<=t.n:Math.abs(v-t.n)<.005}
  const hay=t.col?nrm(FIELDS[t.col](x)):(all||(all=nrm(Object.values(FIELDS).map(f=>f(x)).join(' | '))));
  return t.neg?!hay.includes(t.t):hay.includes(t.t);
 });
}
/* destaca os trechos encontrados (só na coluna correspondente) */
function hl(s,key){
 s=String(s);const T=getQ().filter(t=>t.t&&!t.neg&&(!t.col||t.col===key)).map(t=>t.t);
 if(!T.length)return esc(s);
 const n=nrm(s);if(n.length!==s.length)return esc(s);
 const mk=new Array(s.length).fill(0);
 T.forEach(t=>{let i=n.indexOf(t);while(i>-1){for(let k=i;k<i+t.length;k++)mk[k]=1;i=n.indexOf(t,i+t.length)}});
 let o='',open=false;
 for(let i=0;i<s.length;i++){if(mk[i]&&!open){o+='<mark>';open=true}else if(!mk[i]&&open){o+='</mark>';open=false}o+=esc(s[i])}
 return o+(open?'</mark>':'');
}
function setQ(v){$('#q').value=v;render();$('#q').focus()}
document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();$('#q').focus()}});

const FK={n:['Nº',x=>String(x.n).padStart(4,'0')],tipo:['Tipo',x=>x.tipo],venc:['Vencimento',x=>fd(x.venc)],pgto:['Pgto / Receb.',x=>x.pgto?fd(x.pgto):'—'],parc:['Parcela',x=>x.parc||'—'],conta:['Conta',x=>x.conta],cartao:['Cartão',x=>x.cartao||'—'],cat:['Categoria',x=>x.cat],compra:['Data da Compra',x=>x.compra?fd(x.compra):'—'],qtd:['Qtd',x=>String(x.qtd)],desc:['Descrição',x=>x.desc||'—'],valor:['Valor',x=>brl(x.valor)],status:['Status',x=>stLabel(x)]};
let FCOL={};
function colBtns(){document.querySelectorAll('.thf').forEach(b=>b.classList.toggle('on',!!FCOL[b.dataset.k]))}
function colFilter(k,btn){
 const [lab,get]=FK[k];const vals=[...new Set(D.map(get))].sort((a,b)=>String(a).localeCompare(String(b),'pt'));
 $('#cf_t').textContent='Filtrar: '+lab;$('#cf_k').value=k;
 $('#cf_list').innerHTML=vals.map(v=>`<label class="cf-i"><input type="checkbox" value="${esc(v)}"${(!FCOL[k]||FCOL[k].has(String(v)))?' checked':''}><span>${esc(v)}</span></label>`).join('')||'<p style="color:var(--mut)">Sem valores</p>';
 const d=$('#coldlg');d.style.visibility='hidden';d.showModal();
 if(btn){const r=btn.getBoundingClientRect(),w=d.offsetWidth,h=d.offsetHeight;
  let x=Math.min(r.left,window.innerWidth-w-12),y=r.bottom+8;if(y+h>window.innerHeight-12)y=Math.max(12,r.top-h-8);
  d.style.left=Math.max(12,x)+'px';d.style.top=y+'px';}
 d.style.visibility='';
}
function colApply(e){
 e.preventDefault();const k=$('#cf_k').value;
 const todos=[...$('#cf_list').querySelectorAll('input')],sel=todos.filter(i=>i.checked).map(i=>i.value);
 if(sel.length===todos.length)delete FCOL[k];else FCOL[k]=new Set(sel);
 colBtns();$('#coldlg').close();render();return false;
}
function colClear(){delete FCOL[$('#cf_k').value];colBtns();$('#coldlg').close();render()}
function filtered(tab=TAB){
 const Q=getQ(),t=$('#ft').value,m=$('#fm').value,yr=$('#fy').value;
 return D.filter(x=>Object.keys(FCOL).every(k=>FCOL[k].has(String(FK[k][1](x)))))
  .filter(x=>(!t||x.tipo===t)&&(!tab||(tab==='pago'?st(x)==='pago':st(x)!=='pago'))&&(!m||(yr?x.venc.startsWith(m):x.venc.slice(5,7)===m))&&(!yr||x.venc.startsWith(yr))&&matchQ(x,Q)).sort((a,b)=>a.venc.localeCompare(b.venc)||a.n-b.n);
}
function months(){
 const y=$('#fy').value,cur=$('#fm').value;
 const anos=[...new Set(D.map(x=>x.venc.slice(0,4)))].sort().reverse();
 $('#fy').innerHTML='<option value="">Todos os anos</option>'+anos.map(a=>`<option value="${a}">${a}</option>`).join('');
 const yy=anos.includes(y)?y:'';
 $('#fy').value=yy;
 let opts;
 if(yy){
  // com ano: meses do ano escolhido (valor AAAA-MM), sem repetir o ano no nome
  opts=[...new Set(D.filter(x=>x.venc.startsWith(yy)).map(x=>x.venc.slice(0,7)))].sort().reverse().map(m=>[m,MN[+m.slice(5,7)-1]]);
 }else{
  // sem ano: nome do mês vale para todos os anos (valor MM)
  opts=[...new Set(D.map(x=>x.venc.slice(5,7)))].sort().map(mm=>[mm,MN[+mm-1]]);
 }
 $('#fm').innerHTML='<option value="">Todos os meses</option>'+opts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
 $('#fm').value=opts.some(o=>o[0]===cur)?cur:'';
}
function fyChange(){months();render()}
const sum=(a,f)=>a.filter(f).reduce((s,x)=>s+x.valor,0);

function render(){
 try{plRender()}catch(e){}
 const L=filtered(''),T=filtered(),rec=sum(L,x=>x.tipo==='Receita'),des=sum(L,x=>x.tipo==='Despesa'&&!x.cartao),pend=sum(L,x=>x.tipo==='Despesa'&&st(x)!=='pago'),atr=L.filter(x=>x.tipo==='Despesa'&&st(x)==='atrasado').length;
 const saldoIni=bkAtivos().reduce((a,b)=>a+b.saldo,0);
 $('#kpis').innerHTML=resumoCards(L);
 $('#kmini').innerHTML=`<div class="km main" style="cursor:pointer" onclick="setView('b')"><span>Saldo</span><b>${brl(saldoPer(L))}</b></div><div class="km"><span>Receitas</span><b class="rec">${brl(rec)}</b></div><div class="km"><span>Despesas</span><b class="des">${brl(des)}</b></div><div class="km"><span>Despesas em aberto</span><b>${brl(pend)}</b></div>`;
 const bc={};L.filter(x=>x.tipo==='Despesa').forEach(x=>bc[x.cat]=(bc[x.cat]||0)+x.valor);
 const top=Object.entries(bc).sort((a,b)=>b[1]-a[1]).slice(0,6),mx=top[0]?top[0][1]:1;
 $('#cats').innerHTML=top.map(([c,v])=>`<div class="bar"><span>${c}</span><div><i style="width:${v/mx*100}%"></i></div><b>${brl(v)}</b></div>`).join('')||'<p class="empty">Sem despesas no filtro.</p>';
 const bm={};D.forEach(x=>{const m=x.venc.slice(0,7);bm[m]=bm[m]||{R:0,D:0};bm[m][x.tipo==='Receita'?'R':'D']+=x.valor});
 const ks=Object.keys(bm).sort().slice(-6),mm=Math.max(...ks.map(k=>Math.max(bm[k].R,bm[k].D)),1);
 $('#months').innerHTML=ks.map(k=>`<div class="mc"><div class="p"><i style="height:${bm[k].R/mm*100}%;background:#0f766e" title="${brl(bm[k].R)}"></i><i style="height:${bm[k].D/mm*100}%;background:#e11d48" title="${brl(bm[k].D)}"></i></div>${new Date(k.slice(0,4),k.slice(5,7)-1,1).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</div>`).join('');
 $('#tb').innerHTML=T.map(x=>`<tr class="rowx" onclick="rowOpen(event,${x.n})">
  <td data-l="Nº" class="num">${hl(String(x.n).padStart(4,'0'),'n')}</td>
  <td data-l="Tipo"><span class="tag ${x.tipo}">${hl(x.tipo,'tipo')}</span></td>
  <td data-l="Vencimento">${hl(fd(x.venc),'venc')}</td>
  <td data-l="Pgto / Receb.">${hl(fd(x.pgto),'pgto')}</td>
  <td data-l="Parcela">${hl(x.parc||'—','parc')}</td>
  <td data-l="Conta">${hl(x.conta||'—','conta')}</td>
  <td data-l="Cartão">${hl(x.cartao||'—','conta')}</td>
  <td data-l="Categoria">${hl(x.cat,'cat')}<small>${hl(x.sub,'sub')}</small></td>
  <td data-l="Data da Compra">${hl(fd(x.compra),'compra')}</td>
  <td data-l="Qtd">${hl(String(x.qtd),'qtd')}</td>
  <td data-l="Descrição"><b style="font-weight:600">${hl(x.desc,'desc')}</b></td>
  <td data-l="Valor" class="v ${x.tipo==='Receita'?'rec':'des'}">${hl((x.tipo==='Receita'?'+':'−')+' '+brl(x.valor),'valor')}</td>
  <td data-l="Status"><span class="tag ${st(x)}">${stLabel(x)}</span></td>
  <td class="act"><button class="ic" onclick="openF(${x.n})" title="Editar" aria-label="Editar">✎</button><button class="ic" onclick="del(${x.n})" title="Excluir" aria-label="Excluir">🗑</button></td></tr>`).join('')||'<tr><td class="empty" colspan="13">Nenhum lançamento encontrado. Ajuste os filtros ou crie um novo.</td></tr>';
 document.querySelectorAll('.tabs button').forEach(b=>{b.classList.toggle('on',b.dataset.t===TAB);b.querySelector('em').textContent=filtered(b.dataset.t).length});
 $('#cnt').textContent=`${T.length} lançamentos`;$('#tot').innerHTML=`Saldo desta lista: <b style="color:var(--ink)">${brl(sum(T,x=>x.tipo==='Receita')-sum(T,x=>x.tipo==='Despesa'))}</b>`;
 if(!$('#vG').hidden)grender();
}

const opts=(a,b)=>(b!==undefined?`<option value="">${b}</option>`:'')+a.map(x=>`<option>${esc(x)}</option>`).join('');
function fillCat(c,s){const t=$('#f_tipo').value;$('#f_cat').innerHTML=opts(Object.keys(CATS[t]),'Selecione');if(c)$('#f_cat').value=c;fillSub(s);
 $('#f_status').options[1].text=t==='Receita'?'Recebido':'Pago'}
function fillSub(s){$('#f_sub').innerHTML=opts(CATS[$('#f_tipo').value][$('#f_cat').value]||[],'Selecione');if(s)$('#f_sub').value=s}
let editing=null,selRow=null,editInit=null,uPgto='';
const stAuto=p=>p&&p<=TODAY?'pago':'pendente';
const qtdF=()=>Math.max(1,parseInt($('#f_qtd').value,10)||1);
// Vencimento da fatura: dia de pagamento do cartão no mês correto, conforme a data da compra
function vencFatura(compra,diaPag,diaFech){
 let [y,mo,d]=compra.split('-').map(Number);
 if(diaFech){
  // compra a partir do dia de fechamento entra na fatura seguinte
  if(d>=diaFech){mo++;if(mo>12){mo=1;y++}}
  // se o pagamento é depois do fechamento, vence no mesmo mês do fechamento; senão, no mês seguinte
  if(diaPag<=diaFech){mo++;if(mo>12){mo=1;y++}}
 }else if(d>=diaPag){mo++;if(mo>12){mo=1;y++}}
 const ult=new Date(y,mo,0).getDate();
 return `${y}-${String(mo).padStart(2,'0')}-${String(Math.min(diaPag,ult)).padStart(2,'0')}`;
}
function addMeses(d,k){let [y,m,dd]=d.split('-').map(Number);m+=k;y+=Math.floor((m-1)/12);m=((m-1)%12+12)%12+1;const ult=new Date(y,m,0).getDate();return `${y}-${String(m).padStart(2,'0')}-${String(Math.min(dd,ult)).padStart(2,'0')}`}
const isParc=()=>document.querySelector('input[name=tl]:checked').value==='parc';
let PD=[],managing=null;
const isNew=()=>!editing&&!managing;
const modoSel=()=>document.querySelector('input[name=modo]:checked').value;
const cardAtual=()=>{const nm=$('#f_cartao').value;return $('#f_tipo').value==='Despesa'&&nm?CARDS.find(c=>c.nome===nm):null};
// 1ª parcela: mesma regra do vencimento (fatura do cartão pela data da compra)
function p1Auto(){const c=$('#f_compra').value;if(!c)return '';const cd=cardAtual();return cd&&cd.diaPag?vencFatura(c,cd.diaPag,cd.diaFech):c}
function autoP1(){if(isParc()&&isNew())$('#f_p1').value=p1Auto()}
// Rascunho das parcelas: aparece na lista assim que o nº de parcelas é informado
function buildPD(){
 const vt=$('#f_vtot'),vf=$('#f_vfix'),modo=modoSel(),lk=!!managing;
 vt.disabled=lk||modo!=='total';vf.disabled=lk||modo!=='parcela';
 if(!isParc()||!isNew()){PD=[];return}
 const n=Math.min(120,parseInt($('#f_npar').value,10)||0);
 if(n<1){PD=[];return}
 const base=$('#f_p1').value||p1Auto()||TODAY;
 const v=parseMoney((modo==='total'?vt:vf).value),c=v>0?Math.round(v*100):0;
 const each=modo==='total'?Math.floor(c/n):c,last=modo==='total'?c-each*(n-1):c;
 const old=PD;
 PD=Array.from({length:n},(_,i)=>{const o=old[i]||{};return{i,venc:addMeses(base,i),valor:(i===n-1?last:each)/100,conta:o.conta||'',pgto:o.pgto||'',status:stAuto(o.pgto||'')}});
 // o campo não selecionado mostra o valor equivalente
 if(modo==='total')vf.value=c>0?(each/100).toFixed(2):'';else vt.value=c>0?(c*n/100).toFixed(2):'';
}
const FG=id=>$('#'+id).closest('.fg');
function layoutLanc(){
 const parc=isParc();if(layoutLanc.m===parc)return;layoutLanc.m=parc;
 const A=$('#fs_a'),B=$('#fs_b'),w1=$('#xl_w1'),w2=$('#xl_w2'),w3=$('#xl_w3'),w5=$('#xl_w5'),w6=$('#xl_w6'),cfg=$('#fs_cfg');
 if(parc){
  $('#lg_a').textContent='Dados Gerais';$('#lg_b').textContent='Dados da parcela';
  w5.append(FG('f_nlan'),FG('f_qtd'));w6.append(FG('f_cat'),FG('f_sub'));w3.append(FG('f_cartao'),FG('f_compra'));
  A.append(w5,w6,w3,FG('f_desc'),FG('f_valor'));
  FG('f_valor').hidden=true;$('#f_valor').required=false;$('#f_conta').required=false;
  w1.append(FG('f_venc'),FG('f_pgto'));w2.append(FG('f_parc'),FG('f_status'));
  B.append(FG('f_conta'),w1,w2,$('#xl_hint'));FG('f_conta_g').hidden=true;
  w1.hidden=w2.hidden=w3.hidden=w5.hidden=w6.hidden=false;cfg.hidden=false;
  autoP1();
 }else{
  $('#lg_a').textContent='Dados do pagamento';$('#lg_b').textContent='Dados Gerais';
  w1.hidden=w2.hidden=w3.hidden=w5.hidden=w6.hidden=true;cfg.hidden=true;
  A.append(FG('f_conta'),FG('f_cat'),FG('f_sub'),FG('f_cartao'),FG('f_compra'),FG('f_qtd'),FG('f_desc'),FG('f_valor'));
  FG('f_valor').hidden=false;$('#f_valor').required=true;$('#f_conta').required=false;
  B.append(FG('f_nlan'),FG('f_conta_g'),FG('f_venc'),FG('f_pgto'),FG('f_status'),FG('f_parc'),$('#xl_hint'));
 }
}
function prevParc(){
 layoutLanc();
 $('#fs_cfg').hidden=!isParc();
 buildPD();
 if(typeof selRow==='string'&&!PD[+selRow.slice(1)])selRow=null;
 sessRender();refreshGerais();
}
$('#dlg').addEventListener('input',prevParc);
$('#dlg').addEventListener('cancel',e=>e.preventDefault());
$('#dlg').addEventListener('change',prevParc);
function fgVis(){
 const cartao=!!$('#f_cartao').value, despesa=$('#f_tipo').value==='Despesa';
 // compra no cartão: vencimento automático pela fatura
 const comp=$('#f_compra').closest('.fg'), parc=$('#f_parc').closest('.fg');
 comp.hidden=!despesa;
 $('#f_cartao').closest('.fg').hidden=!despesa;
 parc.hidden=!(despesa&&cartao&&!!editing);
 // receita já recebida: a data relevante é a de recebimento, não o vencimento
 $('#f_venc').closest('.fg').hidden=!despesa&&$('#f_status').value==='pago';
}
const pad4=n=>String(n).padStart(4,'0');
const nextN=()=>Math.max(0,...D.map(i=>i.n))+1;
const setv=(el,v)=>{if(el.value!==v)el.value=v};
function setStatusUI(v){const s=$('#f_status');s.value=v;s.dataset.st=v}
function selData(){
 if(selRow===null)return null;
 if(typeof selRow==='string'){const p=PD[+selRow.slice(1)];return p?{draft:true,r:p}:null}
 const r=SESS.find(s=>s.n===selRow);return r?{draft:false,r}:null;
}
// Dados Gerais / Dados da parcela: prévia, ou dados da linha selecionada na lista
function refreshGerais(){
 const parc=isParc(),despesa=$('#f_tipo').value==='Despesa',cd=cardAtual(),compra=$('#f_compra').value||TODAY;
 $('#f_status').disabled=true;
 const cg=$('#f_conta_g');FG('f_conta_g').hidden=parc||!!editing;
 if(editing){
  $('#f_pgto').disabled=false;
  $('#f_venc').readOnly=!!(cd&&cd.diaPag);
  if(cd&&cd.diaPag&&$('#f_compra').value)$('#f_venc').value=vencFatura(compra,cd.diaPag,cd.diaFech);
  setStatusUI(stAuto($('#f_pgto').value));$('#xl_hint').textContent='';return;
 }
 FG('f_parc').hidden=!parc;
 const s=selData();
 if(s){
  const r=s.r;
  setv($('#f_nlan'),pad4(s.draft?nextN():r.n));
  setv($('#f_venc'),r.venc);$('#f_venc').readOnly=true;
  $('#f_pgto').disabled=false;setv($('#f_pgto'),r.pgto||'');setStatusUI(r.status);
  if(!parc){setv(cg,r.conta||'');cg.disabled=!!r.conta;if(!r.conta)$('#f_pgto').disabled=true;if(managing)setv($('#f_conta'),r.conta||'')}
  if(parc){$('#f_conta').disabled=!s.draft;setv($('#f_conta'),r.conta||'');setv($('#f_parc'),s.draft?`${r.i+1}/${PD.length}`:(r.parc||''))}
  else $('#f_conta').disabled=!!managing;
  $('#xl_hint').textContent=parc&&s.draft?'Escolha a conta bancária e, se já foi paga, a data de pagamento desta parcela. Clique na linha de novo para desmarcar.':(!parc&&!r.conta?'Escolha a conta bancária para registrar o pagamento. Clique na linha de novo para desmarcar.':'Informe a data de pagamento. Clique na linha de novo para desmarcar.');
 }else if(parc){
  setv($('#f_nlan'),pad4(managing||nextN()));setv($('#f_venc'),'');$('#f_venc').readOnly=true;
  $('#f_pgto').disabled=true;setv($('#f_pgto'),'');setStatusUI('pendente');
  $('#f_conta').disabled=true;setv($('#f_conta'),'');setv($('#f_parc'),'');
  $('#xl_hint').textContent=managing?'Clique numa parcela da lista para informar a data de pagamento.':PD.length?'Clique numa linha da lista para escolher a conta bancária e a data de pagamento da parcela.':'Informe o nº de parcelas e o valor para ver as parcelas na lista.';
 }else{
  $('#f_nlan').value=pad4(nextN());
  if(despesa)$('#f_venc').value=cd&&cd.diaPag?vencFatura(compra,cd.diaPag,cd.diaFech):compra;
  $('#f_venc').readOnly=despesa;
  const cv=$('#f_conta').value;
  $('#f_pgto').disabled=true;setv($('#f_pgto'),cv?(uPgto||TODAY):'');setStatusUI(cv?'pago':'pendente');
  setv(cg,cv);cg.disabled=true;
  $('#f_conta').disabled=!!managing;
  $('#xl_hint').textContent=SESS.length?'Clique numa linha da lista para informar a conta bancária / data de pagamento.':'Preencha os dados do pagamento e clique em Adicionar.';
 }
}
function selectRow(k){selRow=selRow===k?null:k;sessRender();refreshGerais();
 if(selRow!==null){const c=$('#f_conta');(!c.disabled&&isParc()?c:$('#f_pgto')).focus()}}
['input','change'].forEach(ev=>$('#f_conta').addEventListener(ev,()=>{
 if(!isParc()&&isNew()&&selRow===null){const c=$('#f_conta').value;if(!c)uPgto='';else if(!uPgto)uPgto=TODAY}
 if(isParc()&&isNew()&&typeof selRow==='string'){const p=PD[+selRow.slice(1)];if(p){p.conta=$('#f_conta').value;sessRender()}}
}));
// Conta bancária em Dados Gerais (ÚNICO): ao escolher, a data de pagamento vira hoje e o status Pago
$('#f_conta_g').addEventListener('change',()=>{
 if(isParc()||editing)return;
 const v=$('#f_conta_g').value,s=selData();if(!s||s.draft||!v||s.r.conta)return;
 if(!CONTAS.includes(v)){toast('Escolha uma conta bancária ativa');$('#f_conta_g').value='';return}
 const x=D.find(i=>i.n===s.r.n);if(!x)return;
 x.conta=v;x.pgto=TODAY;x.status='pago';s.r.conta=v;s.r.pgto=TODAY;s.r.status='pago';
 persist();months();render();sessRender();refreshGerais();toast('Conta bancária definida e lançamento pago');
});
// Data de pagamento: o status muda sozinho (hoje ou antes = Pago), linha por linha
$('#f_pgto').addEventListener('input',()=>{
 const p=$('#f_pgto').value,st=stAuto(p);
 if(editing){setStatusUI(st);return}
 const s=selData();if(!s)return;
 if(s.draft){s.r.pgto=p;s.r.status=st;sessRender();setStatusUI(st);return}
 const x=D.find(i=>i.n===s.r.n);if(!x)return;
 x.pgto=p;x.status=st;s.r.pgto=p;s.r.status=st;persist();months();render();sessRender();setStatusUI(st);
});
$('#f_prev_body').addEventListener('click',e=>{const tr=e.target.closest('tr[data-n]');if(!tr)return;const v=tr.dataset.n;selectRow(/^d/.test(v)?v:parseInt(v,10))});
['input','change'].forEach(ev=>$('#f_compra').addEventListener(ev,autoP1));
$('#f_cartao').addEventListener('change',autoP1);$('#f_tipo').addEventListener('change',autoP1);
$('#f_status').addEventListener('change',fgVis);
$('#f_compra').addEventListener('change',fgVis);
$('#f_cartao').addEventListener('change',fgVis);
function openF(n){
 selRow=null;managing=null;PD=[];setLock(false);if(!n){SESS=[]}
 $('#f_nlan').value=n?String(n).padStart(4,'0'):String(Math.max(0,...D.map(i=>i.n))+1).padStart(4,'0');
 document.querySelector(`input[name=tl][value=${n?'unico':'unico'}]`).checked=true;$('#fs_cfg').hidden=true;$('#f_p1').value='';$('#f_npar').value='';$('#f_vtot').value='';$('#f_vfix').value='';document.querySelector('input[name=modo][value=total]').checked=true;layoutLanc();sessRender();
 if(!n&&semContaAtiva('Cadastre uma conta bancária antes de criar lançamentos'))return;
 editing=n||null;$('#dt').textContent=n?`Editar lançamento ${String(n).padStart(4,'0')}`:'Novo lançamento';
 const x0=n?D.find(i=>i.n===n):null,cur=x0&&x0.conta;
 const contaOpts=CONTAS.slice();if(cur&&!contaOpts.includes(cur))contaOpts.push(cur);
 $('#f_conta').innerHTML='<option value="">Selecione</option>'+contaOpts.map(c=>`<option value="${esc(c)}">${esc(c)}${CONTAS.includes(c)?'':' (inativa)'}</option>`).join('');
 $('#f_conta_g').innerHTML=$('#f_conta').innerHTML;uPgto='';
 $('#f_cartao').innerHTML=opts(CARTOES,'Sem cartão');
 const x=x0||{tipo:'Despesa',status:'pendente',desc:'',valor:'',qtd:1,venc:TODAY,pgto:'',compra:TODAY,parc:'1/1',conta:'',cartao:''};
 $('#f_tipo').value=x.tipo;fillCat(x.cat,x.sub);
 $('#f_status').value=x.status;$('#f_desc').value=x.desc;editInit=x0?{unit:String(Number((x0.valor/(x0.qtd||1)).toFixed(2))),qtd:x0.qtd||1,total:x0.valor}:null;$('#f_valor').value=x0?editInit.unit:x.valor;$('#f_qtd').value=x.qtd;$('#f_venc').value=x.venc;
 $('#f_pgto').value=x.pgto||'';$('#f_compra').value=x.compra||x.venc;$('#f_parc').value=x.parc||'1/1';$('#f_conta').value=x.conta;$('#f_cartao').value=x.cartao;fgVis();buildPD();refreshGerais();
 $('#dlg').showModal();
}
let SESS=[];
function allRows(){
 const nx=Math.max(0,...D.map(i=>i.n))+1;
 return SESS.map(r=>({k:r.n,n:r.n,parc:r.parc||'1/1',venc:r.venc,pgto:r.pgto,conta:r.conta,valor:r.valor,status:r.status,d:false}))
  .concat(PD.map(p=>({k:'d'+p.i,n:nx+p.i,parc:`${p.i+1}/${PD.length}`,venc:p.venc,pgto:p.pgto,conta:p.conta,valor:p.valor,status:p.status,d:true})));
}
function sessRender(){
 const rows=allRows(),tb=$('#f_prev_body');
 const html=rows.length?rows.map(r=>`<tr data-n="${r.k}"${r.d?' data-d="1"':''}${String(r.k)===String(selRow)?' class="sel"':''}><td>${pad4(r.n)}</td><td>${esc(r.parc)}</td><td>${fd(r.venc)}</td><td>${r.pgto?fd(r.pgto):'—'}</td><td>${r.conta?esc(r.conta):'—'}</td><td class="r">${brl(r.valor)}</td><td><span class="xl-st ${r.status}">${r.status==='pago'?'Pago':'Em aberto'}</span></td></tr>`).join(''):'<tr><td colspan="7" class="xl-empty">Nenhum lançamento adicionado ainda.</td></tr>';
 if(tb._h!==html){tb.innerHTML=html;tb._h=html}
 const tot=rows.reduce((a,r)=>a+r.valor,0),pago=rows.filter(r=>r.status==='pago').reduce((a,r)=>a+r.valor,0);
 $('#f_tot').innerHTML=`<span>Total Geral<b>${brl(tot)}</b></span><span>Total Pago<b>${brl(pago)}</b></span><span>Total em Aberto<b>${brl(tot-pago)}</b></span>`;
}
const LOCKIDS=['f_tipo','f_cat','f_sub','f_cartao','f_compra','f_qtd','f_desc','f_valor','f_npar','f_p1','f_vtot','f_vfix'];
function setLock(b){LOCKIDS.forEach(id=>$('#'+id).disabled=b);document.querySelectorAll('input[name=tl],input[name=modo]').forEach(x=>x.disabled=b);$('#xl_add').hidden=b}
const rowOf=x=>({n:x.n,parc:x.parc||'1/1',venc:x.venc,pgto:x.pgto||'',conta:x.conta,valor:x.valor,status:x.status==='pago'?'pago':'pendente'});
// Todas as parcelas do mesmo lançamento
function grupoDe(x){
 if(x.g)return D.filter(i=>i.g===x.g).sort((p,q)=>p.n-q.n);
 const m=/^\d+\/(\d+)$/.exec(x.parc||'');if(!m||m[1]==='1')return [x];
 return D.filter(i=>!i.g&&i.tipo===x.tipo&&i.desc===x.desc&&i.cat===x.cat&&i.sub===x.sub&&i.cartao===x.cartao&&i.compra===x.compra&&(i.parc||'').endsWith('/'+m[1])).sort((p,q)=>p.n-q.n);
}
// Clique numa linha da tabela: abre o lançamento com todas as parcelas na visualização
function rowOpen(ev,n){
 if(ev.target.closest('button,select,a,input,label,.act'))return;
 const x=D.find(i=>i.n===n);if(!x)return;
 const grp=grupoDe(x),gp=grp.length>1;
 openF(n);
 editing=null;managing=grp[0].n;SESS=grp.map(rowOf);PD=[];selRow=null;
 document.querySelector(`input[name=tl][value=${gp?'parc':'unico'}]`).checked=true;
 layoutLanc();
 if(gp){$('#f_npar').value=grp.length;$('#f_p1').value=grp[0].venc;document.querySelector('input[name=modo][value=total]').checked=true;
  $('#f_vtot').value=grp.reduce((t,i)=>t+i.valor,0).toFixed(2);$('#f_vfix').value=grp[0].valor.toFixed(2)}
 $('#dt').textContent='Lançamento '+pad4(grp[0].n);
 setLock(true);fgVis();
 if(!gp)selRow=SESS[0].n;
 $('#fs_cfg').hidden=!gp;sessRender();refreshGerais();
}
function sessLimpaCampos(){
 // Volta o formulário ao estado de um lançamento novo (mantém só o Tipo: Despesa/Receita)
 document.querySelector('input[name=tl][value=unico]').checked=true;$('#fs_cfg').hidden=true;$('#f_p1').value='';$('#f_npar').value='';$('#f_vtot').value='';$('#f_vfix').value='';document.querySelector('input[name=modo][value=total]').checked=true;PD=[];layoutLanc();
 fillCat();
 $('#f_cartao').value='';$('#f_compra').value=TODAY;$('#f_qtd').value='1';$('#f_desc').value='';
 $('#f_conta').value='';uPgto='';
 $('#f_valor').value='';$('#f_venc').value=TODAY;$('#f_pgto').value='';$('#f_parc').value='1/1';
 selRow=null;fgVis();buildPD();refreshGerais();sessRender();
}
function xlTitulo(){$('#dt').textContent=$('#f_tipo').value==='Receita'?'Lançamento de Receita':'Lançamento de Despesa'}
function concluirLanc(){SESS=[];PD=[];managing=null;selRow=null;setLock(false);$('#dlg').close();render()}
function save(e){
 e.preventDefault();
 if(managing)return false;
 if(!editing&&semContaAtiva('Cadastre uma conta bancária antes de criar lançamentos')){$('#dlg').close();return false}
 if(!editing&&isParc()){
  buildPD();
  if(!PD.length){toast('Informe o número de parcelas');return false}
  if(PD.some(p=>!(p.valor>0))){toast('Informe o Total Parcelado ou o Valor Fixo');return false}
  const sem=PD.findIndex(p=>!CONTAS.includes(p.conta));
  if(sem>=0){toast(`Escolha a conta bancária da parcela ${sem+1}: clique na linha da lista`);selRow='d'+sem;sessRender();refreshGerais();return false}
  const tipo=$('#f_tipo').value,cartao=tipo==='Despesa'?$('#f_cartao').value:'',g=nextN();let nx=g-1;
  const base={tipo,desc:$('#f_desc').value.trim(),cat:$('#f_cat').value,sub:$('#f_sub').value,qtd:qtdF(),cartao,compra:$('#f_compra').value||TODAY};
  PD.forEach(p=>{nx++;const parc=`${p.i+1}/${PD.length}`;
   D.push({...base,n:nx,g,status:p.status,valor:p.valor,venc:p.venc,pgto:p.pgto,parc,conta:p.conta});
   SESS.push({n:nx,parc,venc:p.venc,pgto:p.pgto,conta:p.conta,valor:p.valor,status:p.status})});
  const q=PD.length;persist();months();render();sessLimpaCampos();toast(`${q} parcelas adicionadas`);return false;
 }
 const cv=$('#f_conta').value;
 if((editing||cv)&&!CONTAS.includes(cv)){toast('Escolha uma conta bancária ativa');return false}
 const o={tipo:$('#f_tipo').value,status:editing?stAuto($('#f_pgto').value):(cv?'pago':'pendente'),desc:$('#f_desc').value.trim(),cat:$('#f_cat').value,sub:$('#f_sub').value,valor:(editing&&editInit&&$('#f_valor').value===editInit.unit&&qtdF()===editInit.qtd)?editInit.total:Math.round((parseFloat($('#f_valor').value)||0)*qtdF()*100)/100,qtd:qtdF(),venc:$('#f_venc').value||$('#f_compra').value||TODAY,pgto:$('#f_pgto').value,compra:$('#f_compra').value,parc:$('#f_parc').value||'1/1',conta:$('#f_conta').value,cartao:$('#f_cartao').value};
 if(o.tipo!=='Despesa'){o.compra=o.venc;o.parc='1/1';o.cartao=''}
 else if(!o.cartao){o.parc='1/1'}
 if(o.tipo==='Receita'&&o.status==='pago'){o.pgto=o.pgto||TODAY;o.venc=o.pgto}
 if(!editing&&o.status==='pago')o.pgto=uPgto||TODAY;
 if(o.status==='pago'&&!o.pgto)o.pgto=TODAY;if(o.status==='pendente')o.pgto='';
 if(editing){Object.assign(D.find(i=>i.n===editing),o);persist();months();render();$('#dlg').close();toast('Lançamento atualizado');return false}
 o.n=Math.max(0,...D.map(i=>i.n))+1;D.push(o);
 SESS.push({n:o.n,parc:'1/1',venc:o.venc,pgto:o.pgto,conta:o.conta,valor:o.valor,status:o.status});
 persist();months();render();sessRender();sessLimpaCampos();toast('Lançamento adicionado');return false;
}
function setStatus(n,v){const x=D.find(i=>i.n===n);x.status=v;x.pgto=v==='pago'?(x.pgto||TODAY):'';persist();render();toast(v==='pago'?(x.tipo==='Receita'?'Marcado como recebido':'Marcado como pago'):'Voltou para pendente')}
function del(n){confirmar('Excluir este lançamento?').then(ok=>{if(ok){D=D.filter(i=>i.n!==n);persist();months();render();toast('Lançamento excluído')}})}
function toast(t){
 let e=document.getElementById('toast-pop');
 if(!e){e=document.createElement('div');e.id='toast-pop';e.setAttribute('popover','manual');document.body.appendChild(e)}
 e.textContent=t;
 try{e.hidePopover()}catch(_){}
 try{e.showPopover()}catch(_){}
 clearTimeout(e._t);e._t=setTimeout(()=>{try{e.hidePopover()}catch(_){}},2600);
}
function semContaAtiva(msg){if(bkAtivos().length)return false;toast(msg);return true}

function pdf(){
 if(!window.jspdf){alert('Não foi possível carregar o gerador de PDF. Verifique a conexão com a internet.');return}
 const L=filtered(),{jsPDF}=window.jspdf,doc=new jsPDF({orientation:'landscape',unit:'pt',format:'a4'}),W=doc.internal.pageSize.getWidth(),M=36;
 const rec=sum(L,x=>x.tipo==='Receita'),des=sum(L,x=>x.tipo==='Despesa'),pend=sum(L,x=>x.tipo==='Despesa'&&st(x)!=='pago');
 const per=$('#fm').value?mlabel($('#fm').value):'Todos os períodos',fl=[$('#ft').value,TABN[TAB],$('#q').value&&`"${$('#q').value}"`].filter(Boolean).join(' · ')||'Sem filtros adicionais';
 doc.setFillColor(15,118,110);doc.rect(0,0,W,84,'F');
 doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(22);doc.text('Relatório Financeiro',M,42);
 doc.setFont('helvetica','normal');doc.setFontSize(10.5);doc.text(`${per}  |  ${fl}`,M,62);
 doc.text('Gerado em '+new Date().toLocaleString('pt-BR'),W-M,42,{align:'right'});doc.text('Fluxo · Gestão financeira',W-M,62,{align:'right'});
 const bw=(W-2*M-36)/4,box=[['Saldo',rec-des,[15,118,110]],['Receitas',rec,[4,120,87]],['Despesas',des,[190,18,60]],['Despesas em aberto',pend,[180,83,9]]];
 box.forEach(([l,v,c],i)=>{const x=M+i*(bw+12);doc.setFillColor(246,248,247);doc.setDrawColor(229,234,232);doc.roundedRect(x,100,bw,58,8,8,'FD');
  doc.setFillColor(...c);doc.rect(x,112,3,34,'F');doc.setTextColor(102,117,113);doc.setFontSize(9.5);doc.text(l,x+14,120);
  doc.setTextColor(...c);doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text(brl(v),x+14,141);doc.setFont('helvetica','normal')});
 doc.autoTable({startY:174,margin:{left:M,right:M,bottom:40},theme:'plain',
  head:[['Nº','Tipo','Venc.','Pgto/Receb.','Parc.','Conta / Cartão','Categoria','Descrição','Valor','Status']],
  body:L.map(x=>[String(x.n).padStart(4,'0'),x.tipo,fd(x.venc),fd(x.pgto),x.parc,x.conta+(x.cartao?' / '+x.cartao:''),x.cat+' > '+x.sub,x.desc,(x.tipo==='Receita'?'+ ':'- ')+brl(x.valor),stLabel(x)]),
  foot:[['','','','','','','','Saldo do período',brl(rec-des),'']],
  styles:{fontSize:8,cellPadding:{top:5,bottom:5,left:5,right:5},textColor:[20,32,30],lineColor:[229,234,232],lineWidth:{bottom:.5}},
  headStyles:{fillColor:[236,243,241],textColor:[15,95,88],fontStyle:'bold'},
  footStyles:{fillColor:[236,243,241],textColor:[20,32,30],fontStyle:'bold'},
  alternateRowStyles:{fillColor:[250,251,250]},columnStyles:{8:{halign:'right',fontStyle:'bold'}},
  didParseCell:d=>{if(d.section==='head'&&d.column.index===8)d.cell.styles.halign='right';if(d.section==='foot'&&d.column.index===8)d.cell.styles.halign='right';
   if(d.section==='body'){const x=L[d.row.index];if(d.column.index===8)d.cell.styles.textColor=x.tipo==='Receita'?[4,120,87]:[190,18,60];
    if(d.column.index===9){const s=st(x);d.cell.styles.textColor=s==='pago'?[4,120,87]:s==='atrasado'?[190,18,60]:[180,83,9];d.cell.styles.fontStyle='bold'}}},
  didDrawPage:d=>{const h=doc.internal.pageSize.getHeight();doc.setFontSize(8.5);doc.setTextColor(140);doc.text('Fluxo · Relatório financeiro',M,h-18);doc.text('Página '+doc.internal.getNumberOfPages(),W-M,h-18,{align:'right'})}});
 {const GS={};L.forEach(x=>{const k=x.tipo+'|'+x.cat+'|'+x.sub;const g=GS[k]=GS[k]||{t:x.tipo,c:x.cat,s:x.sub,n:0,v:0};g.n++;g.v+=x.valor});
 const rowsS=Object.values(GS).sort((a,b)=>a.t.localeCompare(b.t)||a.c.localeCompare(b.c,'pt')||a.s.localeCompare(b.s,'pt')).map(g=>[g.t,g.c,g.s,String(g.n),brl(g.v)]);
 const yS=doc.lastAutoTable.finalY+28;doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(20,32,30);doc.text('Resumo por subcategoria',M,yS);
 pdfTable(doc,M,yS+8,['Tipo','Categoria','Subcategoria','Lançamentos','Total'],rowsS.length?rowsS:[['—','','','','']],[3,4]);}
 doc.save('relatorio-financeiro.pdf');toast('Relatório PDF gerado');
}
/* ===== Aba de Gráficos ===== */
const G={from:'',to:'',tipo:'',status:'',conta:'',cartao:'',cat:'',sub:'',q:''};
const PAL=['#0f766e','#e11d48','#f59e0b','#6366f1','#0ea5e9','#84cc16','#d946ef','#64748b'],EMPTY='<p class="empty">Sem dados no filtro.</p>';
const mshort=m=>new Date(m.slice(0,4),m.slice(5,7)-1,1).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')+'/'+m.slice(2,4);
const kfmt0=v=>Math.abs(v)>=1000?(v/1000).toFixed(Math.abs(v)>=10000?0:1).replace('.',',')+'k':String(Math.round(v));
/* Valores com centavos aparecem exatos (ex.: 0,59 / 1.234,56); sem centavos mantém o formato curto */
const kfmt=v=>{const c=Math.round(v*100);return c%100!==0?(c/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):kfmt0(v)};
/* Eixo: abaixo de 1000 mostra decimais (sem arredondar) quando necessário */
const afmt=v=>Math.abs(v)<1000?(Math.round(v*100)/100).toLocaleString('pt-BR',{maximumFractionDigits:2}):kfmt0(v);
const sumBy=(a,f)=>{const o={};a.forEach(x=>{const k=f(x);o[k]=(o[k]||0)+x.valor});return Object.entries(o).sort((p,q)=>q[1]-p[1])};
function setView(v){
 $('#hnew').style.visibility=(v==='p')?'hidden':'';['l','p','c','t','b','g'].forEach(k=>{$('#v'+k.toUpperCase()).hidden=v!==k});document.querySelectorAll('.views button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));if(v==='g')grender();if(v==='p')plRender(1);if(v==='c')ccRender();if(v==='t')trRender();if(v==='b')bkRender();VIEW=v;sessionStorage.setItem('fluxo_view',v);$('#hnew .t').textContent=v==='p'?'Novo cadastro':v==='c'?'Novo cartão':v==='t'?'Nova transferência':v==='b'?'Nova conta':'Novo lançamento'}
function resumoCards(L){
 const at=bkAtivos(),ini=at.reduce((a,b)=>a+b.saldo,0),hoje=TODAY.slice(0,7);
 const rec=sum(L,x=>x.tipo==='Receita'),des=sum(L,x=>x.tipo==='Despesa'&&!x.cartao);
 const recM=sum(L,x=>x.tipo==='Receita'&&x.venc.slice(0,7)===hoje),desM=sum(L,x=>x.tipo==='Despesa'&&!x.cartao&&x.venc.slice(0,7)===hoje);
 const cards=[['Saldo inicial',brl(ini),'',1],['Receitas',brl(rec),'rec',0],['Despesas',brl(des),'des',0],['Saldo do mês',brl(recM-desM),'',0],['Saldo acumulado',brl(saldoPer(L)),'',0]];
 return cards.map(([l,v,c,main])=>`<div class="card kpi${main?' main':''}"><span>${l}</span><b class="${c}">${v}</b></div>`).join('');
}
function saldoPer(L){
 const r=sum(L,x=>x.tipo==='Receita'&&st(x)==='pago'),d=sum(L,x=>x.tipo==='Despesa'&&!x.cartao&&st(x)==='pago');
 return bkAtivos().reduce((a,b)=>a+b.saldo,0)+r-d-FAT.reduce((a,f)=>a+f.valor,0);
}
function gfCount(){const n=['from','to','tipo','status','cat','sub','conta','cartao'].filter(k=>G[k]).length;const e=$('#gf-n');if(e){e.textContent=n;e.hidden=!n}}
function gfClear(){['from','to','tipo','status','cat','sub','conta','cartao'].forEach(k=>G[k]='');gfCount();grender()}
const GF_ROWS=[['from','Período inicial','gm1'],['to','Período final','gm2'],['tipo','Tipo','gt'],['status','Status','gs'],['cat','Categoria','gcat'],['sub','Subcategoria','gsub'],['conta','Conta','gcon'],['cartao','Cartão de crédito','gcar']];
function gfTxt(key,selId){const v=G[key];if(!v)return 'Todos';const o=Array.from($('#'+selId).options).find(x=>x.value===v);return o?o.text:v}
function gfMenu(){
 $('#gf-title').textContent='Filtros';$('#gf-back').hidden=true;
 $('#gf-list').onclick=null;
 $('#gf-list').innerHTML=GF_ROWS.map(([k,l,id])=>{const on=!!G[k];return `<button class="gfd-row${on?' on':''}" type="button" onclick="gfOpcoes('${k}')"><span>${esc(l)}</span><small>${esc(gfTxt(k,id))}</small></button>`}).join('');
}
function gfOpcoes(key){
 const row=GF_ROWS.find(r=>r[0]===key);if(!row)return;
 event&&event.stopPropagation();
 const sel=$('#'+row[2]);
 $('#gf-title').textContent=row[1];$('#gf-back').hidden=false;
 $('#gf-list').innerHTML=Array.from(sel.options).map(o=>{const on=(o.value===(G[key]||''));return `<button class="gfd-row${on?' on':''}" type="button" data-v="${esc(o.value)}" data-k="${key}"><span>${esc(o.text)}</span>${on?'<span class="ck">✓</span>':''}</button>`}).join('');
 $('#gf-list').onclick=e=>{const b=e.target.closest('.gfd-row');if(!b||!b.dataset.k)return;gset(b.dataset.k,b.dataset.v);gfMenu()};
}
function gfAbrir(){gfMenu();$('#gfdlg').showModal()}
function gset(k,v){G[k]=v;if(k==='cat')G.sub='';if(k==='from'&&v&&G.to&&v>G.to)G.to=v;if(k==='to'&&v&&G.from&&v<G.from)G.from=v;gfCount();grender()}
document.getElementById('gfdlg').addEventListener('close',gfCount);
gfCount();
function gf(ign=[]){const Q=parseQ(G.q),I=k=>ign.includes(k);
 return D.filter(x=>{const m=x.venc.slice(0,7);return(I('from')||!G.from||m>=G.from)&&(I('to')||!G.to||m<=G.to)&&(!G.tipo||x.tipo===G.tipo)&&(I('status')||!G.status||st(x)===G.status)&&(I('conta')||!G.conta||x.conta===G.conta)&&(I('cartao')||!G.cartao||x.cartao===G.cartao)&&(I('cat')||!G.cat||x.cat===G.cat)&&(I('sub')||!G.sub||x.sub===G.sub)&&matchQ(x,Q)})}
const hbars=(rows,g,sel)=>{const mx=rows[0]?rows[0][1]:1;return rows.map(([l,v,k])=>`<div class="bar sel${sel&&sel!==(k||l)?' dim':''}" data-g="${g}" data-v="${esc(k||l)}" title="${esc(l)}"><span>${esc(l)}</span><div><i style="width:${v/mx*100}%"></i></div><b>${brl(v)}</b></div>`).join('')||EMPTY};
function grid(W,H,pl,pr,pt,pb,lo,top){const Y=v=>pt+(top-v)/(top-lo)*(H-pt-pb);let o='';for(let i=0;i<=4;i++){const v=lo+(top-lo)*i/4;o+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e5eae8"/><text x="${pl-5}" y="${Y(v)+3}" text-anchor="end" font-size="9.5" fill="#667571">${afmt(v)}</text>`}return[Y,o]}
const GDEF='<defs><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2dd4bf"/><stop offset="1" stop-color="#0f766e"/></linearGradient><linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb7185"/><stop offset="1" stop-color="#be123c"/></linearGradient><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14b8a6" stop-opacity=".45"/><stop offset="1" stop-color="#14b8a6" stop-opacity="0"/></linearGradient><filter id="glw" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
/* Etiquetas de valor dos gráficos: "pílula" legível sempre acima da barra, sem cortar e sem sobrepor */
const G_PH=18;
function gPillW(t){return Math.round(t.length*6.4+12)}
function gPill(it,W){const w=it.w,x=it.cx-w/2;return`<g style="pointer-events:none"><rect x="${x}" y="${it.y}" width="${w}" height="${G_PH}" rx="6" fill="#fff" stroke="${it.c}" stroke-opacity=".4"/><text x="${it.cx}" y="${it.y+12.6}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${it.c}">${it.t}</text></g>`}
function gPlace(items,W){const placed=[];
 items.forEach(it=>{it.w=gPillW(it.t);it.cx=Math.min(Math.max(it.cx,it.w/2+2),W-it.w/2-2)});
 items.sort((a,b)=>a.cx-b.cx).forEach(it=>{for(let n=0;n<4;n++){if(!placed.some(p=>Math.abs(p.cx-it.cx)<(p.w+it.w)/2+2&&Math.abs(p.y-it.y)<G_PH+2))break;it.y+=it.dir*(G_PH+2)}placed.push(it)});
 return items}
function gMes(){const bm={};gf(['from','to']).forEach(x=>{const m=x.venc.slice(0,7);(bm[m]=bm[m]||{R:0,D:0})[x.tipo==='Receita'?'R':'D']+=x.valor});
 bkAtivos().forEach(b=>{if(!b.saldo)return;const m=(b.data||TODAY).slice(0,7);(bm[m]=bm[m]||{R:0,D:0}).R+=b.saldo});
 const ks=Object.keys(bm).sort().slice(-12);if(!ks.length)return EMPTY;
 const el=document.getElementById('g_mes'),W=Math.max(300,(el&&el.clientWidth)||560),H=230,pl=40,pr=10,pb=26,top=Math.max(1,...ks.map(k=>Math.max(bm[k].R,bm[k].D))),sw=(W-pl-pr)/ks.length,bw=Math.min(26,Math.max(6,sw*.32)),rng=G.from||G.to,e=Math.max(1,Math.ceil(46/sw));
 let pt=16,Y,gr,items;
 for(let p=0;p<2;p++){[Y,gr]=grid(W,H,pl,pr,pt,pb,0,top);items=[];
  ks.forEach((k,i)=>{const r=bm[k].R,dd=bm[k].D,cx=pl+sw*(i+.5);
   if(r>0)items.push({cx:cx-bw/2-1.5,y:Y(r)-5-G_PH,t:'R$ '+kfmt(r),c:'#0f766e',dir:-1});
   if(dd>0)items.push({cx:cx+bw/2+1.5,y:Y(dd)-5-G_PH,t:'R$ '+kfmt(dd),c:'#be123c',dir:-1})});
  gPlace(items,W);const mn=Math.min(...items.map(i=>i.y),99);if(mn>=2)break;pt+=2-mn+4}
 let o=`<svg viewBox="0 0 ${W} ${H}">${GDEF}`+gr;
 ks.forEach((k,i)=>{const cx=pl+sw*(i+.5),d=rng&&!((!G.from||k>=G.from)&&(!G.to||k<=G.to)),r=bm[k].R,dd=bm[k].D;
  o+=`<g data-g="month" data-v="${k}" style="cursor:pointer;opacity:${d?.3:1}"><title>${mlabel(k)}\nReceitas: ${brl(r)}\nDespesas: ${brl(dd)}\nSaldo: ${brl(r-dd)}</title><rect x="${cx-sw/2}" y="0" width="${sw}" height="${H-pb+4}" fill="transparent"/><rect x="${cx-bw-1.5}" y="${Y(r)}" width="${bw}" height="${Math.max(1,Y(0)-Y(r))}" rx="4" fill="url(#gR)" filter="url(#glw)"/><rect x="${cx+1.5}" y="${Y(dd)}" width="${bw}" height="${Math.max(1,Y(0)-Y(dd))}" rx="4" fill="url(#gD)" filter="url(#glw)"/>${i%e===0?`<text x="${cx}" y="${H-8}" text-anchor="middle" font-size="10" fill="#667571">${mshort(k)}</text>`:''}</g>`});
 return o+items.map(it=>gPill(it,W)).join('')+'</svg>'}
function gSal(L){const bm={};L.forEach(x=>{const m=x.venc.slice(0,7);bm[m]=(bm[m]||0)+(x.tipo==='Receita'?x.valor:-x.valor)});
 const ks=Object.keys(bm).sort();if(!ks.length)return EMPTY;let c=0;const cum=ks.map(k=>c+=bm[k]),n=ks.length;
 const el=document.getElementById('g_sal'),W=Math.max(300,(el&&el.clientWidth)||420),H=210,pl=44,pr=12,hasNeg=cum.some(v=>v<0),pb=hasNeg?46:26,lo=Math.min(0,...cum),hi=Math.max(1,...cum),sw=(W-pl-pr)/n,bw=Math.min(30,Math.max(6,sw*.6)),e=Math.max(1,Math.ceil(46/sw));
 let pt=16,Y,gr,items;
 for(let p=0;p<2;p++){[Y,gr]=grid(W,H,pl,pr,pt,pb,lo,hi);items=[];
  cum.forEach((v,i)=>{const cx=pl+sw*(i+.5),y=Math.min(Y(v),Y(0)),h=Math.max(1,Math.abs(Y(v)-Y(0))),t=(v<0?'-':'')+'R$ '+kfmt(Math.abs(v));
   items.push(v>=0?{cx,y:y-5-G_PH,t,c:'#0f766e',dir:-1}:{cx,y:y+h+5,t,c:'#be123c',dir:1})});
  gPlace(items,W);const mn=Math.min(...items.map(i=>i.y),99);if(mn>=2)break;pt+=2-mn+4}
 return`<svg viewBox="0 0 ${W} ${H}">${GDEF}${gr}`+cum.map((v,i)=>{const cx=pl+sw*(i+.5),y=Math.min(Y(v),Y(0)),h=Math.max(1,Math.abs(Y(v)-Y(0)));return`<rect x="${cx-bw/2}" y="${y}" width="${bw}" height="${h}" rx="4" fill="url(#${v>=0?'gR':'gD'})"><title>${mlabel(ks[i])}: ${brl(v)}</title></rect>${i%e===0?`<text x="${cx}" y="${H-8}" text-anchor="middle" font-size="10" fill="#667571">${mshort(ks[i])}</text>`:''}`}).join('')+items.map(it=>gPill(it,W)).join('')+'</svg>'}
(()=>{let t;window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(()=>{if(typeof VIEW!=='undefined'&&VIEW==='g')grender()},150)})})();
function gDonut(rows){const tot=rows.reduce((s,r)=>s+r[1],0);if(!tot)return EMPTY;const C=2*Math.PI*60;let acc=0;
 const arcs=rows.map(([c,v],i)=>{const len=v/tot*C,o=`<circle cx="90" cy="90" r="60" fill="none" stroke="${PAL[i%8]}" stroke-width="26" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-acc}" transform="rotate(-90 90 90)" data-g="cat" data-v="${esc(c)}" style="cursor:pointer;opacity:${G.cat&&G.cat!==c?.25:1}"><title>${esc(c)}: ${brl(v)}</title></circle>`;acc+=len;return o}).join('');
 return`<div class="dn"><svg viewBox="0 0 180 180">${arcs}<text x="90" y="86" text-anchor="middle" font-size="11" fill="#667571">Total</text><text x="90" y="104" text-anchor="middle" font-size="15" font-weight="800" fill="#14201e">R$ ${kfmt(tot)}</text></svg><div class="lg2">${rows.map(([c,v],i)=>`<div class="lgr" data-g="cat" data-v="${esc(c)}" style="opacity:${G.cat&&G.cat!==c?.4:1}"><u style="background:${PAL[i%8]}"></u>${esc(c)}<b>${brl(v)} <em>${Math.round(v/tot*100)}%</em></b></div>`).join('')}</div></div>`}
function grender(){
 const mo=[...new Set(D.map(x=>x.venc.slice(0,7)))].sort(),opt=(a,all,f=x=>x)=>`<option value="">${all}</option>`+a.map(x=>`<option value="${esc(x)}">${esc(f(x))}</option>`).join(''),set=(id,h,v)=>{const e=$(id);e.innerHTML=h;e.value=v};
 set('#gm1',opt(mo,'De (início)',mlabel),G.from);set('#gm2',opt(mo,'Até (fim)',mlabel),G.to);
 set('#gcat',opt([...new Set(D.map(x=>x.cat))].sort(),'Todas as categorias'),G.cat);
 set('#gsub',opt([...new Set(D.filter(x=>!G.cat||x.cat===G.cat).map(x=>x.sub))].sort(),'Todas as subcategorias'),G.sub);
 set('#gcon',opt(CONTAS,'Todas as contas'),G.conta);set('#gcar',opt(CARTOES,'Todos os cartões'),G.cartao);$('#gt').value=G.tipo;$('#gs').value=G.status;
 const lab={tipo:'Tipo',status:'Status',conta:'Conta',cartao:'Cartão',cat:'Categoria',sub:'Subcategoria',q:'Busca'},ch=[];
 if(G.from||G.to)ch.push(['per','Período',(G.from?mshort(G.from):'início')+' → '+(G.to?mshort(G.to):'fim')]);
 Object.keys(lab).forEach(k=>G[k]&&ch.push([k,lab[k],k==='status'?{pago:'Pago/Recebido',pendente:'Em aberto',atrasado:'Atrasado'}[G[k]]:G[k]]));
 $('#gchips').innerHTML=ch.length?ch.map(([k,l,v])=>`<button class="chip on" data-x="${k}">${l}: <b>${esc(v)}</b> ✕</button>`).join('')+'<button class="chip" data-x="all">Limpar tudo</button>':'<span>Clique nos gráficos para filtrar · ou use os filtros acima</span>';
 const L=gf(),DT=G.tipo||'Despesa',P=DT+'s',rec=sum(L,x=>x.tipo==='Receita'),des=sum(L,x=>x.tipo==='Despesa'&&!x.cartao),ab=sum(L,x=>x.tipo==='Despesa'&&st(x)!=='pago');
 const saldoIniG=bkAtivos().reduce((a,b)=>a+b.saldo,0);
 $('#gkpis').innerHTML=resumoCards(L);
 $('#g_mes').innerHTML=gMes();
 $('#g_t1').textContent=P+' por categoria';$('#g_cat').innerHTML=gDonut(sumBy(gf(['cat','sub']).filter(x=>x.tipo===DT),x=>x.cat));
 $('#g_t2').textContent=P+' por subcategoria';$('#g_sub').innerHTML=hbars(sumBy(gf(['sub']).filter(x=>x.tipo===DT),x=>x.cat+'|'+x.sub).slice(0,8).map(([k,v])=>[k.split('|')[1],v,k]),'sub',G.sub?G.cat+'|'+G.sub:'');
 $('#g_t3').textContent=P+' por conta';$('#g_acc').innerHTML=hbars(sumBy(gf(['conta']).filter(x=>x.tipo===DT),x=>x.conta),'conta',G.conta);
 $('#g_t4').textContent=P+' por cartão de crédito';$('#g_car').innerHTML=hbars(sumBy(gf(['cartao']).filter(x=>x.tipo===DT&&x.cartao),x=>x.cartao),'cartao',G.cartao);
 $('#g_t6').textContent='Situação dos saldos';$('#g_saldo').innerHTML=hbars(bkAtivos().map(b=>[b.nome,saldoAtual(b),b.nome]).sort((a,b)=>b[1]-a[1]),'conta',G.conta);
 const SL={pago:DT==='Receita'?'Recebido':'Pago',pendente:'Em aberto',atrasado:'Atrasado'},SC={pago:'#047857',pendente:'#f59e0b',atrasado:'#be123c'},sr=gf(['status']).filter(x=>x.tipo===DT),sb={};
 sr.forEach(x=>{const k=st(x);(sb[k]=sb[k]||{v:0,n:0}).v+=x.valor;sb[k].n++});
 $('#g_t5').textContent='Status';
 $('#g_sta').innerHTML=sr.length?`<div class="stk">${Object.keys(SL).filter(k=>sb[k]).map(k=>`<i data-g="status" data-v="${k}" title="${SL[k]}: ${brl(sb[k].v)}" style="flex:${sb[k].v};background:${SC[k]};opacity:${G.status&&G.status!==k?.3:1}"></i>`).join('')}</div>`+Object.keys(SL).map(k=>`<div class="lgr" data-g="status" data-v="${k}" style="opacity:${G.status&&G.status!==k?.4:1}"><u style="background:${SC[k]}"></u>${SL[k]} <em>${sb[k]?sb[k].n:0} lanç.</em><b>${brl(sb[k]?sb[k].v:0)}</b></div>`).join(''):EMPTY;
 $('#g_top').innerHTML=[...L].sort((a,b)=>b.valor-a.valor).slice(0,5).map(x=>`<div class="rk"><div><b style="font-weight:600">${esc(x.desc)}</b><small>${esc(x.cat)} · ${fd(x.venc)} · ${stLabel(x)}</small></div><span class="v ${x.tipo==='Receita'?'rec':'des'}">${x.tipo==='Receita'?'+':'−'} ${brl(x.valor)}</span></div>`).join('')||EMPTY;
 $('#g_sal').innerHTML=gSal(L);
}
$('#vG').addEventListener('click',e=>{
 const x=e.target.closest('[data-x]');
 if(x){const k=x.dataset.x;if(k==='all')Object.keys(G).forEach(i=>G[i]='');else if(k==='per')G.from=G.to='';else{G[k]='';if(k==='cat')G.sub=''}$('#gq').value=G.q;grender();return}
 const t=e.target.closest('[data-g]');if(!t)return;const k=t.dataset.g,v=t.dataset.v;
 if(k==='month'){const on=G.from===v&&G.to===v;G.from=G.to=on?'':v}
 else if(k==='sub'){const[c,sb]=v.split('|'),on=G.cat===c&&G.sub===sb;G.cat=on?'':c;G.sub=on?'':sb}
 else G[k]=G[k]===v?'':v;
 grender();
});

(function(){const v=$('#vL'),e=$('#stky'),k=$('#kpis'),t=()=>{const kr=k.getBoundingClientRect(),vr=v.getBoundingClientRect();e.classList.toggle('scr',v.scrollTop>0&&kr.height>0&&vr.height>0&&kr.bottom<=vr.top+1)};v.addEventListener('scroll',t,{passive:true});addEventListener('resize',t);if(window.ResizeObserver){const ro=new ResizeObserver(t);ro.observe(k);ro.observe(v)}t();setTimeout(t,0)})();
(function(){const e=$('#stky'),f=()=>$('#vL').style.setProperty('--stk',e.offsetHeight+'px');f();if(window.ResizeObserver)new ResizeObserver(f).observe(e);addEventListener('resize',f)})();
const COLN=['Nº','Tipo','Vencimento','Pgto / Receb.','Parcela','Conta','Cartão','Categoria','Data da Compra','Qtd','Descrição','Valor','Status'];let HC=[];try{HC=JSON.parse(localStorage.getItem('fluxo_cols')||'[]')}catch(e){}
function applyCols(){$('#colcss').textContent=HC.length?HC.map(i=>`.tbs th:nth-child(${i+1}),.tbs td:not(.empty):nth-child(${i+1})`).join(',')+'{display:none!important}':''}
function saveCols(){try{localStorage.setItem('fluxo_cols',JSON.stringify(HC))}catch(e){}applyCols()}
function openCols(){$('#cbody').innerHTML=COLN.map((n,i)=>`<label class="cfg-i"><input type="checkbox" data-i="${i}"${HC.includes(i)?'':' checked'}>${n}</label>`).join('');$('#cdlg').showModal();cfgTab('k')}
function resetCols(){HC=[];saveCols();openCols()}
$('#cbody').addEventListener('change',e=>{const c=e.target,i=+c.dataset.i;if(!c.checked&&COLN.length-HC.length<=1){c.checked=true;return}HC=c.checked?HC.filter(x=>x!==i):[...HC,i];saveCols()});
applyCols();
const IC=(d)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`,
 I_ED=IC('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),I_DEL=IC('<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/>'),I_X=IC('<path d="M6 6l12 12M18 6 6 18"/>'),I_PL=IC('<path d="M12 5v14M5 12h14"/>');
let CT='Despesa';
let KY=new Date().getFullYear(),KE=null;
function ccRender(){
 const yr=$('#kyr'),now=new Date();if(!yr.options.length)for(let y=now.getFullYear()-2;y<=now.getFullYear()+3;y++)yr.add(new Option(y,y));yr.value=KY;
 const cur=KY===now.getFullYear()?now.getMonth():-1,rd=v=>Math.round(v*100)/100,used={},mon={};
 CARDS.forEach(c=>{used[c.nome]=0;mon[c.nome]=Array(12).fill(0)});
 D.forEach(x=>{if(x.tipo!=='Despesa'||!x.cartao||st(x)!=='pago'||!(x.cartao in used))return;used[x.cartao]+=x.valor;const f=faturaDe(x);if(f.m.slice(0,4)===String(KY))mon[x.cartao][+f.m.slice(5,7)-1]+=x.valor});
 CARDS.forEach(c=>{used[c.nome]=Math.max(0,used[c.nome]-FAT.filter(f=>f.cartao===c.nome).reduce((a,f)=>a+f.valor,0));for(let m=0;m<12;m++)mon[c.nome][m]=faturaRestante(c.nome,`${KY}-${String(m+1).padStart(2,'0')}`)});
 const cs=CARDS.slice().sort((a,b)=>a.nome.localeCompare(b.nome,'pt')),pc=(g,l)=>l>0?g/l*100:null,
  bar=p=>p==null?'<span style="color:var(--mut)">Sem limite</span>':`<div class="ub"><span><i class="${p>=90?'hi':p>=70?'mid':''}" style="width:${Math.min(100,p)}%"></i></span><b>${p.toFixed(1).replace('.',',')}%</b></div>`;
 let tl=0,tg=0;
 const tot0=Array(12).fill(0);cs.forEach(c=>mon[c.nome].forEach((v,m)=>tot0[m]+=rd(v)));
 const rows=cs.map(c=>{const g=rd(used[c.nome]),d=rd(c.limite-g);tl+=c.limite;tg+=g;return`<tr><td class="nm" title="${esc(c.nome)}">${esc(c.nome)}</td><td class="r">${brl(c.limite)}</td><td class="r">${brl(g)}</td><td class="r${d<0?' neg':''}">${brl(d)}</td><td>${bar(pc(g,c.limite))}</td><td class="act"><button class="ic" data-a="e" data-i="${c.id}" title="Editar" aria-label="Editar">✎</button><button class="ic" data-a="d" data-i="${c.id}" title="Excluir" aria-label="Excluir">🗑</button></td></tr>`}).join('');
 $('#cwA').innerHTML=`<table class="ct"><thead><tr><th>Cartão</th><th class="r">Limite</th><th class="r">Valor gasto</th><th class="r">Limite disponível</th><th>Limite utilizado</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="empty" style="padding:22px">Nenhum cartão cadastrado. Use “Novo cartão” para cadastrar.</td></tr>'}${cs.length?`<tr class="tot"><td>Total</td><td class="r">${brl(tl)}</td><td class="r">${brl(rd(tg))}</td><td class="r${tl-tg<0?' neg':''}">${brl(rd(tl-tg))}</td><td>${bar(pc(tg,tl))}</td><td></td></tr>`:''}</tbody></table>`;
 $('#ctA').textContent='';
 {const mxL=Math.max(1,...cs.map(c=>c.limite)),pcn=(v,m)=>Math.min(100,v/m*100),fm=v=>brl(rd(v));
  $('#cch1').innerHTML=`<h4><span>Limite utilizado</span><span>${KY}</span></h4><div class="cpr">${cs.map(c=>{const p=pc(used[c.nome],c.limite);return`<div class="cpr-r" title="${esc(c.nome)}\nLimite: ${fm(c.limite)}\nUsado: ${fm(used[c.nome])}"><div class="cpr-h"><s>${esc(c.nome)}</s><b>${fm(used[c.nome])} / ${fm(c.limite)}</b></div><div class="ub"><span><i class="${p>=90?'hi':p>=70?'mid':''}" style="width:${Math.min(100,p)}%"></i></span><b>${p.toFixed(1).replace('.',',')}%</b></div></div>`}).join('')||'<span style="color:var(--mut);font-size:11px">Sem cartões</span>'}</div>`;}
  const mxM=Math.max(1,...tot0),ML=['J','F','M','A','M','J','J','A','S','O','N','D'];
 const W0=200,tw=W0+80*12,tot=Array(12).fill(0);
 let body=cs.map(c=>`<tr><td class="pl-t" style="font-weight:700;box-shadow:1px 0 0 var(--line);overflow:hidden;text-overflow:ellipsis" title="${esc(c.nome)}">${esc(c.nome)}</td>${mon[c.nome].map((v,m)=>{v=rd(v);tot[m]+=v;return`<td class="cv${m===cur?' cur':''}">${v?pm(v):'<i>—</i>'}</td>`}).join('')}</tr>`).join('');
 if(!cs.length)body='<tr><td class="empty" colspan="13" style="padding:22px;text-align:center;color:var(--mut)">Nenhum cartão cadastrado.</td></tr>';
 else body+=`<tr class="pl-tot"><td class="pl-t" style="box-shadow:1px 0 0 var(--line)">Total</td>${tot.map((v,m)=>`<td class="cv${m===cur?' cur':''}">${pm(rd(v))}</td>`).join('')}</tr>`;
 const box=$('#cwB'),sl=box.scrollLeft;
 box.innerHTML=`<table class="pt" style="width:100%;min-width:${tw}px"><colgroup><col style="width:${W0}px">${'<col style="width:80px">'.repeat(12)}</colgroup><thead><tr><th class="pl-t" style="left:0">Cartão</th>${MS.map((n,m)=>`<th class="m${m===cur?' cur':''}" title="${MN[m]}">${n}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
 box.scrollLeft=sl;$('#ctB').textContent='Total no ano: R$ '+pm(rd(tot.reduce((a,b)=>a+b,0)));
}
// Fatura: compra antes do dia de pagamento cai na fatura deste mês; a partir do dia, cai na do mês seguinte
function faturaDe(x){
 const card=CARDS.find(c=>c.nome===x.cartao);
 const base=(x.pgto||x.compra||x.venc);
 if(!card||!card.diaPag)return{m:x.venc.slice(0,7)};
 return{m:vencFatura(base,card.diaPag,card.diaFech).slice(0,7)};
 return{m:`${y}-${String(mo).padStart(2,'0')}`};
}

const faturaTotal=(c,m)=>D.filter(x=>x.tipo==='Despesa'&&x.cartao===c&&st(x)==='pago'&&faturaDe(x).m===m).reduce((a,x)=>a+x.valor,0);
const faturaPaga=(c,m)=>FAT.filter(f=>f.cartao===c&&f.mes===m).reduce((a,f)=>a+f.valor,0);
const faturaRestante=(c,m)=>Math.max(0,Math.round((faturaTotal(c,m)-faturaPaga(c,m))*100)/100);
function fatOpen(){
 if(!CARDS.length){toast('Cadastre um cartão primeiro');return}
 if(!bkAtivos().length){toast('Cadastre uma conta bancária ativa primeiro');return}
 const meses=[...new Set(D.filter(x=>x.tipo==='Despesa'&&x.cartao&&st(x)==='pago').map(x=>faturaDe(x).m))].sort().reverse();
 if(!meses.length){toast('Não há faturas pagas para registrar pagamento');return}
 $('#fa_cartao').innerHTML=CARDS.map(c=>`<option>${esc(c.nome)}</option>`).join('');
 $('#fa_mes').innerHTML=meses.map(m=>`<option value="${m}">${mlabel(m)}</option>`).join('');
 $('#fa_conta').innerHTML=bkAtivos().map(b=>`<option>${esc(b.nome)}</option>`).join('');
 fatTotal();$('#fatdlg').showModal();
}
function fatTotal(){
 const c=$('#fa_cartao').value,m=$('#fa_mes').value;
 const tot=faturaTotal(c,m),pago=faturaPaga(c,m),res=faturaRestante(c,m);
 $('#fa_info').innerHTML=`Fatura: <b>${brl(tot)}</b> · já pago: ${brl(pago)} · restante: <b>${brl(res)}</b>`;
 $('#fa_valor').value=res?String(res).replace('.',','):'';
}
function fatSave(e){
 e.preventDefault();
 const c=$('#fa_cartao').value,m=$('#fa_mes').value,v=parseMoney($('#fa_valor').value),conta=$('#fa_conta').value;
 const res=faturaRestante(c,m);
 if(!res){toast('Esta fatura já está paga');return false}
 if(!(v>0)){toast('Informe o valor pago');return false}
 if(v>res+0.001){toast('O valor pago não pode ser maior que o restante da fatura');return false}
 FAT.push({id:'f'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),cartao:c,mes:m,valor:Math.round(v*100)/100,data:TODAY,conta});
 try{localStorage.setItem('fluxo_faturas',JSON.stringify(FAT))}catch(err){}
 ccRender();render();bkRender();
 $('#fatdlg').close();toast(v>=res-0.001?'Fatura quitada':'Pagamento parcial registrado');
 return false;
}
function fatHist(){
 const rows=[...FAT].sort((a,b)=>b.data.localeCompare(a.data)).map(f=>`<tr><td>${fd(f.data)}</td><td>${esc(f.cartao)}</td><td>${mlabel(f.mes)}</td><td>${esc(f.conta)}</td><td class="r">${brl(f.valor)}</td></tr>`).join('');
 $('#fath_list').innerHTML=`<table class="ct"><thead><tr><th>Data</th><th>Cartão</th><th>Fatura</th><th>Conta</th><th class="r">Valor pago</th></tr></thead><tbody>${rows||'<tr><td colspan="5" class="empty" style="padding:22px">Nenhum pagamento registrado.</td></tr>'}</tbody></table>`;
 $('#fathdlg').showModal();
}
function pdfFat(){
 if(!window.jspdf)return pdfNoJsp();
 const{doc,W,M}=pdfNew('Histórico de faturas pagas','Pagamentos registrados das faturas de cartão');
 const tot=FAT.reduce((a,f)=>a+f.valor,0);
 pdfKpis(doc,W,M,100,[['Total pago',tot,PDFC.GR],['Pagamentos',String(FAT.length),PDFC.MU]]);
 const rows=[...FAT].sort((a,b)=>b.data.localeCompare(a.data)).map(f=>[fd(f.data),f.cartao,mlabel(f.mes),f.conta,brl(f.valor)]);
 pdfTable(doc,M,180,['Data','Cartão','Fatura','Conta','Valor pago'],rows.length?rows:[['Nenhum pagamento','','','','']],[4],rows.length?['Total','','','',brl(tot)]:null);
 doc.save('historico-faturas.pdf');toast('Relatório PDF gerado');
}
function ccOpen(id){
 if(!id&&semContaAtiva('Cadastre uma conta bancária antes de adicionar cartões'))return;KE=id||null;const c=id?CARDS.find(x=>x.id===id):null;$('#kdt').textContent=c?'Editar cartão':'Novo cartão';$('#k_n').value=c?c.nome:'';$('#k_l').value=c?String(c.limite).replace('.',','):'';$('#k_dia').value=c&&c.diaPag?c.diaPag:'';$('#k_fech').value=c&&c.diaFech?c.diaFech:'';$('#kdlg').showModal();$('#k_n').focus()}
function ccSave(e){e.preventDefault();const n=nm($('#k_n').value),l=parseMoney($('#k_l').value);
 if(!n)return false;if(!isFinite(l)||l<0){toast('Informe um limite válido');return false}
 if(CARDS.some(c=>c.id!==KE&&same(c.nome,n))){toast('Já existe um cartão com esse nome');return false}
 const lim=Math.round(l*100)/100;const dia=parseInt($('#k_dia').value,10);
 if(!(dia>=1&&dia<=31)){toast('Informe o dia de pagamento da fatura (1 a 31)');return false}
 const fech=parseInt($('#k_fech').value,10);
 if(!(fech>=1&&fech<=31)){toast('Informe o dia de fechamento da fatura (1 a 31)');return false}
 if(KE){const c=CARDS.find(x=>x.id===KE);if(c.nome!==n){D.forEach(x=>{if(x.cartao===c.nome)x.cartao=n});if(G.cartao===c.nome)G.cartao=n;persist();c.nome=n}c.limite=lim;c.diaPag=dia;c.diaFech=fech}
 else CARDS.push({id:'c'+Date.now().toString(36),nome:n,limite:lim,diaPag:dia,diaFech:fech});
 cardsSave();ccRender();render();$('#kdlg').close();toast(KE?'Cartão atualizado':'Cartão cadastrado');return false}
function ccDel(id){const c=CARDS.find(x=>x.id===id);if(!c)return;const n=D.filter(x=>x.cartao===c.nome).length;
 if(n)return toast(`"${c.nome}" está em uso em ${n} lançamento${n===1?'':'s'}`);
 confirmar(`Excluir o cartão "${c.nome}"?`).then(ok=>{if(ok){CARDS=CARDS.filter(x=>x.id!==id);cardsSave();ccRender();toast('Cartão excluído')}})}
$('#cwA').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;b.dataset.a==='e'?ccOpen(b.dataset.i):ccDel(b.dataset.i)});
function saveCats(){try{localStorage.setItem('fluxo_cats',JSON.stringify(CATS))}catch(e){}}
function cfgTab(k){document.querySelectorAll('.cfgtabs button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));$('#cbody').hidden=k!=='c';$('#catbody').hidden=k!=='k';$('#rbtn').hidden=k!=='c';$('#cseg').hidden=k!=='k';$('#cfgp').textContent=k==='c'?'Escolha quais colunas aparecem na tabela de lançamentos.':'Cadastre as categorias e as subcategorias usadas nos lançamentos.';if(k==='k')renderCats()}
function setCT(t){CT=t;renderCats()}
function renderCats(){const t=CT,C=CATS[t];document.querySelectorAll('#cseg button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
 $('#catbody').innerHTML=`<div class="addrow"><input id="ncat" placeholder="Nova categoria de ${t.toLowerCase()}…" maxlength="40"><button type="button" class="btn p" data-a="ac">${I_PL}Adicionar categoria</button></div>`
 +Object.keys(C).map(c=>`<div class="cat" data-c="${esc(c)}"><div class="cat-h"><b>${esc(c)}</b><span class="cnt">${C[c].length} subcategoria${C[c].length===1?'':'s'}</span><button type="button" data-a="rc" title="Renomear categoria" aria-label="Renomear categoria">${I_ED}</button><button type="button" data-a="dc" title="Excluir categoria" aria-label="Excluir categoria">${I_DEL}</button></div>
  <div class="subs">${C[c].map(sb=>`<span class="sub" data-s="${esc(sb)}"><i style="font-style:normal">${esc(sb)}</i><button type="button" data-a="rs" title="Renomear" aria-label="Renomear subcategoria">${I_ED}</button><button type="button" data-a="ds" title="Excluir" aria-label="Excluir subcategoria">${I_X}</button></span>`).join('')}</div>
  <div class="addrow"><input placeholder="Nova subcategoria…" maxlength="40"><button type="button" class="btn" data-a="as">${I_PL}Adicionar</button></div></div>`).join('')}
function catsChanged(rows){saveCats();if(rows){persist();months();render()}renderCats()}
const dup=(a,v,ig)=>a.some(x=>x!==ig&&x.toLowerCase()===v.toLowerCase());
function inl(el,old,cb,cancel){const i=document.createElement('input');i.className='inl';i.value=old;i.maxLength=40;el.replaceWith(i);i.focus();i.select();let d=0;const fin=ok=>{if(d)return;d=1;ok?cb(i.value.trim()):(cancel||renderCats)()};i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();fin(1)}};i.onblur=()=>fin(0)}
$('#catbody').addEventListener('keydown',e=>{if(e.key!=='Enter'||e.target.className==='inl')return;const b=e.target.closest('.addrow');if(b){e.preventDefault();b.querySelector('button').click()}});
$('#catbody').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,t=CT,C=CATS[t],card=b.closest('.cat'),c=card&&card.dataset.c,sc=b.closest('.sub'),sb=sc&&sc.dataset.s;
 if(a==='ac'){const i=$('#ncat'),v=i.value.trim();if(!v)return i.focus();if(dup(Object.keys(C),v))return toast('Essa categoria já existe');C[v]=['Geral'];return catsChanged(0)}
 if(a==='as'){const i=card.querySelector('.addrow input'),v=i.value.trim();if(!v)return i.focus();if(dup(C[c],v))return toast('Essa subcategoria já existe nesta categoria');C[c].push(v);return catsChanged(0)}
 if(a==='rc')return inl(card.querySelector('.cat-h b'),c,v=>{if(!v||v===c)return renderCats();if(dup(Object.keys(C),v,c))return toast('Essa categoria já existe'),renderCats();const n={};Object.keys(C).forEach(k=>n[k===c?v:k]=C[k]);CATS[t]=n;D.forEach(x=>{if(x.tipo===t&&x.cat===c)x.cat=v});catsChanged(1)});
 if(a==='rs')return inl(sc.querySelector('i'),sb,v=>{if(!v||v===sb)return renderCats();if(dup(C[c],v,sb))return toast('Essa subcategoria já existe nesta categoria'),renderCats();C[c]=C[c].map(x=>x===sb?v:x);D.forEach(x=>{if(x.tipo===t&&x.cat===c&&x.sub===sb)x.sub=v});catsChanged(1)});
 if(a==='dc'){const n=D.filter(x=>x.tipo===t&&x.cat===c).length;if(n)return toast(`"${c}" está em uso em ${n} lançamento${n===1?'':'s'}`);if(Object.keys(C).length<2)return toast('Mantenha ao menos uma categoria');confirmar(`Excluir a categoria "${c}"?`).then(ok=>{if(ok){delete C[c];catsChanged(0)}});return}
 if(a==='ds'){const n=D.filter(x=>x.tipo===t&&x.cat===c&&x.sub===sb).length;if(n)return toast(`"${sb}" está em uso em ${n} lançamento${n===1?'':'s'}`);if(C[c].length<2)return toast('Cada categoria precisa de ao menos uma subcategoria');C[c]=C[c].filter(x=>x!==sb);catsChanged(0)}
});
const MN=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],MS=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
let PL=[];try{PL=JSON.parse(localStorage.getItem('fluxo_plan')||'[]')}catch(e){}
let PY=new Date().getFullYear();
const plPersist=()=>{try{localStorage.setItem('fluxo_plan',JSON.stringify(PL))}catch(e){}},
 pm=n=>n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}),
 pk=m=>PY+'-'+String(m+1).padStart(2,'0'),
 nm=v=>String(v).trim().replace(/\s+/g,' '),
 same=(a,b)=>a.toLowerCase()===b.toLowerCase();
function parseMoney(v){v=String(v).replace(/[R$\s]/g,'');if(!v)return NaN;if(v.includes(','))v=v.replace(/\./g,'').replace(',','.');return Number(v)}
function plRender(focus){
 const yr=$('#pyr'),now=new Date();
 // valores automáticos: cada lançamento cai na categoria/subcategoria dele, no mês do vencimento
 const PLR=(()=>{const A={};D.forEach(x=>{if(!x.cat||!x.sub||x.venc.slice(0,4)!==String(PY))return;const k=x.tipo+'|'+x.cat+'|'+x.sub;const a=A[k]=A[k]||{id:k,t:x.tipo,c:x.cat,s:x.sub,v:{}};const mm=x.venc.slice(0,7);a.v[mm]=(a.v[mm]||0)+x.valor});return Object.values(A)})();if(!yr.options.length)for(let y=now.getFullYear()-2;y<=now.getFullYear()+3;y++)yr.add(new Option(y,y));yr.value=PY;
 const TT={Receita:Array(12).fill(0),Despesa:Array(12).fill(0)};
 const cur=PY===now.getFullYear()?now.getMonth():-1,W=[80,110,130],cols=W.map(w=>`<col style="width:${w}px">`).join('')+'<col style="width:80px">'.repeat(12),tw=W.reduce((a,b)=>a+b,0)+80*12;
 [['Receita','R'],['Despesa','D']].forEach(([t,k])=>{
  const rows=PLR.filter(r=>r.t===t).sort((a,b)=>a.c.localeCompare(b.c,'pt')||a.s.localeCompare(b.s,'pt')),box=$('#pw'+k),sl=box.scrollLeft,groups=[],tot=Array(12).fill(0);
  rows.forEach(r=>{const g=groups[groups.length-1];if(g&&g.c===r.c)g.r.push(r);else groups.push({c:r.c,r:[r]})});
  let body='',first=true;
  groups.forEach(g=>g.r.forEach((r,i)=>{
   body+='<tr>'+(first?`<td class="pl-t" rowspan="${rows.length}"><span class="tag ${t}">${t}</span></td>`:'')+(i===0?`<td class="pl-c" rowspan="${g.r.length}" title="${esc(g.c)}">${esc(g.c)}</td>`:'')+`<td class="pl-s"><div class="pl-sw"><span title="${esc(r.s)}">${esc(r.s)}</span></div></td>`;first=false;
   for(let m=0;m<12;m++){const v=r.v[pk(m)];if(v!=null)tot[m]+=v;body+=`<td class="pl-v${m===cur?' cur':''}" data-id="${r.id}" data-m="${m}" title="Clique para ${v!=null?'editar':'lançar'}">${v!=null?pm(v):'<i>—</i>'}</td>`}
   body+='</tr>'}));
  if(!rows.length)body='<tr><td class="empty" colspan="15" style="padding:22px;text-align:center;color:var(--mut);white-space:normal">Nenhuma subcategoria cadastrada. Use “Configurar tabela” para cadastrar categorias e subcategorias.</td></tr>';
  else body+=`<tr class="pl-tot"><td class="pl-s" colspan="3" style="left:0">Total</td>${tot.map((v,m)=>`<td class="pl-v${m===cur?' cur':''}">${pm(v)}</td>`).join('')}</tr>`;
  box.innerHTML=`<table class="pt" style="width:100%;min-width:${tw}px"><colgroup>${cols}</colgroup><thead><tr><th class="pl-t">Tipo</th><th class="pl-c">Categoria</th><th class="pl-s">Subcategoria</th>${MS.map((n,m)=>`<th class="m${m===cur?' cur':''}" title="${MN[m]}">${n}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
  TT[t]=tot;
  $('#pt'+k).textContent='Total no ano: R$ '+pm(tot.reduce((a,b)=>a+b,0));
  box.scrollLeft=sl;
  if(focus){const th=box.querySelector('th.cur');box.scrollLeft=th?Math.max(0,th.offsetLeft-W.reduce((a,b)=>a+b,0)-110):0}
 });
 {const box=$('#pwS'),sl=box.scrollLeft,cls=v=>v<0?' neg':v>0?' pos':'',rd=v=>Math.round(v*100)/100,CS={};
  PLR.forEach(r=>{const a=CS[r.c]=CS[r.c]||Array(12).fill(0);for(let m=0;m<12;m++){const v=r.v[pk(m)];if(v!=null)a[m]+=(r.t==='Receita'?v:-v)}});
  const tt=Array(12).fill(0);Object.keys(CS).forEach(c=>CS[c].forEach((v,m)=>tt[m]+=v));
  const body=`<tr class="pl-tot"><td class="pl-s" colspan="3" style="left:0">Total</td>${tt.map((v,m)=>{v=rd(v);return `<td class="sd${cls(v)}${m===cur?' cur':''}">${pm(v)}</td>`}).join('')}</tr>`;
  box.innerHTML=`<table class="pt" style="width:100%;min-width:${tw}px"><colgroup>${cols}</colgroup><thead><tr><th class="pl-c" colspan="3" style="left:0;box-shadow:1px 0 0 var(--line)">Receitas vs Despesas</th>${MS.map((n,m)=>`<th class="m${m===cur?' cur':''}" title="${MN[m]}">${n}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
  $('#ptS').textContent='Saldo no ano: R$ '+pm(tt.reduce((a,b)=>a+b,0));
  {const rc=TT.Receita,ds=TT.Despesa,sR=rc.reduce((a,b)=>a+b,0),sD=ds.reduce((a,b)=>a+b,0),sS=rd(sR-sD),sub=(v,l)=>cur>=0?`${MN[cur]}: ${brl(v)}`:`Ano ${PY}`,cs=cur>=0?rd(rc[cur]-ds[cur]):0;
   $('#plk').innerHTML=`<div class="card kpi"><span>Receitas</span><b class="rec">${brl(sR)}</b><i>${cur>=0?`${MN[cur]}: ${brl(rc[cur])}`:`Ano ${PY}`}</i></div><div class="card kpi"><span>Despesas</span><b class="des">${brl(sD)}</b><i>${cur>=0?`${MN[cur]}: ${brl(ds[cur])}`:`Ano ${PY}`}</i></div><div class="card kpi main"><span>Saldo</span><b>${brl(sS)}</b><i>${cur>=0?`${MN[cur]}: ${brl(cs)}`:`Ano ${PY}`}</i></div>`}
  box.scrollLeft=sl;
  if(focus){const th=box.querySelector('th.cur');box.scrollLeft=th?Math.max(0,th.offsetLeft-W.reduce((a,b)=>a+b,0)-110):0}}
 if(!window.__plSync){window.__plSync=1;const ids=['#pwR','#pwD','#pwS'];let lock=0;ids.forEach(i=>$(i).addEventListener('scroll',function(){if(lock)return;lock=1;ids.forEach(j=>{const b=$(j);if(b!==this)b.scrollLeft=this.scrollLeft});lock=0}))}
}
function plFillCats(c){const t=$('#p_t').value,ks=Object.keys(PC[t]).sort(pt);$('#p_c').innerHTML=ks.length?ks.map(k=>`<option>${esc(k)}</option>`).join(''):'<option value="">Nenhuma categoria cadastrada</option>';if(c&&ks.includes(c))$('#p_c').value=c;plFillSubs()}
function plFillSubs(sb){const t=$('#p_t').value,ss=(PC[t][$('#p_c').value]||[]).slice().sort(pt);$('#p_s').innerHTML=ss.length?ss.map(k=>`<option>${esc(k)}</option>`).join(''):'<option value="">Nenhuma subcategoria cadastrada</option>';if(sb&&ss.includes(sb))$('#p_s').value=sb}
function plOpen(id,m){
 if(id&&!PL.find(x=>x.id===id)){toast('Os valores do planejamento vêm automaticamente dos lançamentos');return}
 if(!id&&!['Despesa','Receita'].some(t=>Object.values(PC[t]).some(a=>a.length))){toast('Configure categoria e subcategoria em “Configurar tabela” antes de planejar');return}
 const r=id?PL.find(x=>x.id===id):null,now=new Date();
 $('#p_y').textContent='Ano de referência: '+PY+'. Categorias e subcategorias vêm de “Configurar tabela”.';
 $('#p_m').innerHTML=MN.map((n,i)=>`<option value="${i}">${n}</option>`).join('');
 $('#p_t').value=r?r.t:'Despesa';$('#p_m').value=m!=null?m:(PY===now.getFullYear()?now.getMonth():0);
 plFillCats(r&&r.c);plFillSubs(r&&r.s);
 const v=r&&m!=null?r.v[pk(m)]:null;$('#p_v').value=v!=null?String(v).replace('.',','):'';
 $('#p_del').hidden=v==null;$('#pdt').textContent=v!=null?'Editar valor':'Novo cadastro';$('#pdlg').showModal();
 (r?$('#p_v'):$('#p_c')).focus()}
function plSave(e){e.preventDefault();const t=$('#p_t').value,m=+$('#p_m').value,val=parseMoney($('#p_v').value),c=$('#p_c').value,sb=$('#p_s').value;
 if(!c||!sb){toast('Configure categoria e subcategoria em “Configurar tabela” antes de planejar');return false}
 if(!c||!sb){toast('Cadastre a categoria e a subcategoria em “Configurar tabela”');return false}
 if(!isFinite(val)||val<0){toast('Informe um valor válido');return false}
 const r=PL.find(x=>x.t===t&&x.c===c&&x.s===sb);if(!r){toast('Subcategoria não encontrada');return false}
 const had=r.v[pk(m)]!=null;r.v[pk(m)]=Math.round(val*100)/100;plPersist();plRender();$('#pdlg').close();toast(had?'Valor atualizado':'Cadastro salvo');return false}
function plDelVal(){const r=PL.find(x=>x.t===$('#p_t').value&&x.c===$('#p_c').value&&x.s===$('#p_s').value);if(r){delete r.v[pk(+$('#p_m').value)];plPersist();plRender()}$('#pdlg').close();toast('Valor removido')}
$('#vP').addEventListener('click',e=>{const c=e.target.closest('td.pl-v[data-id]');if(c)plOpen(c.dataset.id,+c.dataset.m)});
let VIEW='l',PT='Despesa',PC=null;
const pt=(a,b)=>a.localeCompare(b,'pt'),pcSave=()=>{try{localStorage.setItem('fluxo_pcats',JSON.stringify(PC))}catch(e){}};
try{PC=JSON.parse(localStorage.getItem('fluxo_pcats'))}catch(e){}
if(!PC||!PC.Despesa||!PC.Receita)PC={Despesa:{},Receita:{}};
PL=PL.filter(r=>PC[r.t]);PL.forEach(r=>{const C=PC[r.t];C[r.c]=C[r.c]||[];if(!C[r.c].includes(r.s))C[r.c].push(r.s)});
function plSync(soMemoria){const keep=[];['Despesa','Receita'].forEach(t=>Object.keys(PC[t]).forEach(c=>PC[t][c].forEach(sb=>{keep.push(PL.find(x=>x.t===t&&x.c===c&&x.s===sb)||{id:'p_'+hashNome(t+'|'+c+'|'+sb),t,c,s:sb,v:{}})})));PL=keep;if(!soMemoria){plPersist();pcSave()}}
plSync(true); // ao abrir a página só ajusta na memória: gravar aqui fazia as contas se sobrescreverem e a tela recarregar sem parar
const pcN=(t,c,sb)=>PL.filter(r=>r.t===t&&r.c===c&&(sb==null||r.s===sb)).reduce((a,r)=>a+Object.keys(r.v).length,0);
function pcOpen(){$('#pcdlg').showModal();pcRender()}
function setPT(t){PT=t;pcRender()}
function pcRender(){const t=PT,C=PC[t];document.querySelectorAll('#pcseg button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
 $('#pcadd').innerHTML=`<div class="addrow"><input id="pncat" placeholder="Nova categoria de ${t.toLowerCase()}…" maxlength="40"><button type="button" class="btn p" data-a="ac">${I_PL}Adicionar categoria</button></div>`;
 $('#pcbody').innerHTML=(Object.keys(C).sort(pt).map(c=>`<div class="cat" data-c="${esc(c)}"><div class="cat-h"><b>${esc(c)}</b><span class="cnt">${C[c].length} subcategoria${C[c].length===1?'':'s'}</span><button type="button" data-a="rc" title="Renomear categoria" aria-label="Renomear categoria">${I_ED}</button><button type="button" data-a="dc" title="Excluir categoria" aria-label="Excluir categoria">${I_DEL}</button></div>
  <div class="subs">${C[c].slice().sort(pt).map(sb=>`<span class="sub" data-s="${esc(sb)}"><i style="font-style:normal">${esc(sb)}</i><button type="button" data-a="rs" title="Renomear" aria-label="Renomear subcategoria">${I_ED}</button><button type="button" data-a="ds" title="Excluir" aria-label="Excluir subcategoria">${I_X}</button></span>`).join('')}</div>
  <div class="addrow"><input placeholder="Nova subcategoria…" maxlength="40"><button type="button" class="btn" data-a="as">${I_PL}Adicionar</button></div></div>`).join('')||'<p class="cfgp" style="padding:4px 2px!important">Nenhuma categoria cadastrada ainda.</p>')}
$('#pcdlg').addEventListener('keydown',e=>{if(e.key!=='Enter'||e.target.className==='inl')return;const b=e.target.closest('.addrow');if(b){e.preventDefault();b.querySelector('button').click()}});
function pcDone(focusCat){plSync();plRender();pcRender();
 if(focusCat){const el=[...document.querySelectorAll('#pcbody .cat')].find(x=>x.dataset.c===focusCat);const i=el&&el.querySelector('.addrow input');if(i)i.focus()}}

$('#pcdlg').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,t=PT,C=PC[t],card=b.closest('.cat'),c=card&&card.dataset.c,sc=b.closest('.sub'),sb=sc&&sc.dataset.s;
 if(a==='ac'){const i=$('#pncat'),v=nm(i.value);if(!v)return i.focus();if(Object.keys(C).some(k=>same(k,v)))return toast('Essa categoria já existe');C[v]=[];pcDone();$('#pncat')&&$('#pncat').focus();return}
 if(a==='as'){const i=card.querySelector('.addrow input'),v=nm(i.value);if(!v)return i.focus();if(C[c].some(k=>same(k,v)))return toast('Essa subcategoria já existe nesta categoria');C[c].push(v);return pcDone(c)}
 if(a==='rc')return inl(card.querySelector('.cat-h b'),c,v=>{v=nm(v);if(!v||v===c)return pcRender();if(Object.keys(C).some(k=>k!==c&&same(k,v)))return toast('Essa categoria já existe'),pcRender();const n={};Object.keys(C).forEach(k=>n[k===c?v:k]=C[k]);PC[t]=n;PL.forEach(r=>{if(r.t===t&&r.c===c)r.c=v});pcDone()},pcRender);
 if(a==='rs')return inl(sc.querySelector('i'),sb,v=>{v=nm(v);if(!v||v===sb)return pcRender();if(C[c].some(k=>k!==sb&&same(k,v)))return toast('Essa subcategoria já existe nesta categoria'),pcRender();C[c]=C[c].map(x=>x===sb?v:x);PL.forEach(r=>{if(r.t===t&&r.c===c&&r.s===sb)r.s=v});pcDone()},pcRender);
 if(a==='dc'){const n=pcN(t,c);confirmar(`Excluir a categoria "${c}"${n?` e os ${n} valor${n===1?'':'es'} lançado${n===1?'':'s'} nela`:''}?`).then(ok=>{if(ok){delete C[c];pcDone()}});return}
 if(a==='ds'){const n=pcN(t,c,sb);confirmar(`Excluir a subcategoria "${sb}"${n?` e os ${n} valor${n===1?'':'es'} lançado${n===1?'':'s'} nela`:''}?`).then(ok=>{if(ok){C[c]=C[c].filter(x=>x!==sb);pcDone()}})}
});

/* ===== Relatórios PDF das demais abas ===== */
const PDFC={TL:[15,118,110],GR:[4,120,87],RS:[190,18,60],AM:[180,83,9],MU:[102,117,113]};
const pdfNoJsp=()=>{alert('Não foi possível carregar o gerador de PDF. Verifique a conexão com a internet.');return null};
function pdfNew(title,sub){
 const{jsPDF}=window.jspdf,doc=new jsPDF({orientation:'landscape',unit:'pt',format:'a4'}),W=doc.internal.pageSize.getWidth(),M=36;
 doc.setFillColor(...PDFC.TL);doc.rect(0,0,W,84,'F');
 doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(22);doc.text(title,M,42);
 doc.setFont('helvetica','normal');doc.setFontSize(10.5);doc.text(sub,M,62);
 doc.text('Gerado em '+new Date().toLocaleString('pt-BR'),W-M,42,{align:'right'});doc.text('Fluxo · Gestão financeira',W-M,62,{align:'right'});
 return{doc,W,M}}
function pdfKpis(doc,W,M,y,items){const n=items.length,bw=(W-2*M-12*(n-1))/n;
 items.forEach(([l,v,c],i)=>{const x=M+i*(bw+12);doc.setFillColor(246,248,247);doc.setDrawColor(229,234,232);doc.roundedRect(x,y,bw,58,8,8,'FD');
  doc.setFillColor(...c);doc.rect(x,y+12,3,34,'F');doc.setTextColor(...PDFC.MU);doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.text(l,x+14,y+20);
  doc.setTextColor(...c);doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text(typeof v==='string'?v:brl(v),x+14,y+41)})}
function pdfTitle(doc,M,y,t){doc.setTextColor(20,32,30);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(t,M,y);return y+8}
function pdfTable(doc,M,y,head,body,right=[],foot){
 const H=doc.internal.pageSize.getHeight();
 doc.autoTable({theme:'plain',startY:y,margin:{left:M,right:M,bottom:40},head:[head],body,foot:foot?[foot]:undefined,
  styles:{fontSize:8.5,cellPadding:{top:5,bottom:5,left:6,right:6},textColor:[20,32,30],lineColor:[229,234,232],lineWidth:{bottom:.5}},
  headStyles:{fillColor:[236,243,241],textColor:[15,95,88],fontStyle:'bold'},
  footStyles:{fillColor:[236,243,241],textColor:[20,32,30],fontStyle:'bold'},
  alternateRowStyles:{fillColor:[250,251,250]},
  didParseCell:d=>{if(right.includes(d.column.index))d.cell.styles.halign='right'},
  didDrawPage:()=>{const W=doc.internal.pageSize.getWidth();doc.setFontSize(8.5);doc.setTextColor(140);doc.text('Fluxo · Relatório',M,H-18);doc.text('Página '+doc.internal.getNumberOfPages(),W-M,H-18,{align:'right'})}});
 return doc.lastAutoTable.finalY}
const pdfNum=v=>v?v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
const pdfPct=(a,b)=>(b?a/b*100:0).toFixed(1).replace('.',',')+'%';

function pdfCard(){
 if(!window.jspdf)return pdfNoJsp();
 const{doc,W,M}=pdfNew('Relatório de Cartões de Crédito',`Ano ${KY}  |  Limite e valores em aberto`);
 const used={},mon={};CARDS.forEach(c=>{used[c.nome]=0;mon[c.nome]=Array(12).fill(0)});
 D.forEach(x=>{if(x.tipo!=='Despesa'||!x.cartao||st(x)!=='pago'||!(x.cartao in used))return;used[x.cartao]+=x.valor;const f=faturaDe(x);if(f.m.slice(0,4)===String(KY))mon[x.cartao][+f.m.slice(5,7)-1]+=x.valor});
 CARDS.forEach(c=>{used[c.nome]=Math.max(0,used[c.nome]-FAT.filter(f=>f.cartao===c.nome).reduce((a,f)=>a+f.valor,0));for(let m=0;m<12;m++)mon[c.nome][m]=faturaRestante(c.nome,`${KY}-${String(m+1).padStart(2,'0')}`)});
 const tl=CARDS.reduce((a,c)=>a+c.limite,0),tg=CARDS.reduce((a,c)=>a+used[c.nome],0);
 pdfKpis(doc,W,M,100,[['Limite total',tl,PDFC.TL],['Valor em aberto',tg,PDFC.AM],['Limite disponível',tl-tg,PDFC.GR],['Uso do limite',pdfPct(tg,tl),PDFC.RS]]);
 let y=pdfTitle(doc,M,180,'Cartões');
 const rows=CARDS.map(c=>[c.nome,brl(c.limite),brl(used[c.nome]),brl(c.limite-used[c.nome]),pdfPct(used[c.nome],c.limite)]);
 y=pdfTable(doc,M,y+6,['Cartão','Limite','Valor em aberto','Limite disponível','% utilizado'],rows.length?rows:[['Nenhum cartão cadastrado','','','','']],[1,2,3,4],
   ['Total',brl(tl),brl(tg),brl(tl-tg),pdfPct(tg,tl)])+22;
 y=pdfTitle(doc,M,y,`A pagar por mês em ${KY}`);
 const mrows=CARDS.map(c=>[c.nome,...mon[c.nome].map(pdfNum),pdfNum(mon[c.nome].reduce((a,b)=>a+b,0))]);
 const tots=Array.from({length:12},(_,m)=>CARDS.reduce((a,c)=>a+mon[c.nome][m],0));
 pdfTable(doc,M,y+6,['Cartão',...MS,'Total'],mrows.length?mrows:[['Nenhum cartão cadastrado',...Array(13).fill('')]],[...Array(13).keys()].map(i=>i+1),
   ['Total',...tots.map(pdfNum),pdfNum(tots.reduce((a,b)=>a+b,0))]);
 doc.save(`relatorio-cartoes-${KY}.pdf`);toast('Relatório PDF gerado')}

function pdfTr(){
 if(!window.jspdf)return pdfNoJsp();
 const{doc,W,M}=pdfNew('Relatório de Transferências','Todas as transferências cadastradas');
 const tot=TR.reduce((a,t)=>a+t.valor,0),con=TR.filter(t=>t.status==='Concluída').reduce((a,t)=>a+t.valor,0),pen=TR.filter(t=>t.status!=='Concluída').reduce((a,t)=>a+t.valor,0);
 pdfKpis(doc,W,M,100,[['Total transferido',tot,PDFC.TL],['Concluídas',con,PDFC.GR],['Pendentes',pen,PDFC.AM],['Quantidade',String(TR.length),PDFC.MU]]);
 const rows=[...TR].sort((a,b)=>b.data.localeCompare(a.data)).map(t=>[fd(t.data),t.origem,t.destino,t.desc||'—',brl(t.valor),t.status]);
 pdfTable(doc,M,180,['Data','Conta Bancária - Origem','Conta Bancária - Destino','Descrição','Valor','Status'],rows.length?rows:[['Nenhuma transferência cadastrada','','','','','']],[4],
   rows.length?['Total','','','',brl(tot),'']:null);
 doc.save('relatorio-transferencias.pdf');toast('Relatório PDF gerado')}

function pdfBk(){
 if(!window.jspdf)return pdfNoJsp();
 const{doc,W,M}=pdfNew('Relatório de Contas Bancárias','Saldo inicial e valor atual de cada conta');
 const at=bkAtivos(),sI=at.reduce((a,b)=>a+b.saldo,0),sA=at.reduce((a,b)=>a+saldoAtual(b),0);
 pdfKpis(doc,W,M,100,[['Saldo atual (ativas)',sA,sA>=0?PDFC.GR:PDFC.RS],['Saldo inicial (ativas)',sI,PDFC.TL],['Contas ativas',String(at.length),PDFC.TL],['Contas inativas',String(BANKS.length-at.length),PDFC.MU]]);
 const rows=BANKS.map(b=>[b.nome,brl(b.saldo),fd(b.data),b.status,brl(saldoAtual(b))]);
 pdfTable(doc,M,180,['Conta Bancária','Saldo Inicial','Data Saldo Inicial','Status','Valor atual'],rows.length?rows:[['Nenhuma conta cadastrada','','','','']],[1,4],
   rows.length?['Total ativas',brl(sI),'','',brl(sA)]:null);
 doc.save('relatorio-contas-bancarias.pdf');toast('Relatório PDF gerado')}

function pdfGr(){
 if(!window.jspdf)return pdfNoJsp();
 const L=gf(),{doc,W,M}=pdfNew('Relatório de Gráficos','Resumo conforme os filtros aplicados na aba Gráficos');
 const rec=L.filter(x=>x.tipo==='Receita').reduce((a,x)=>a+x.valor,0),des=L.filter(x=>x.tipo==='Despesa').reduce((a,x)=>a+x.valor,0),
  ab=L.filter(x=>x.tipo==='Despesa'&&st(x)!=='pago').reduce((a,x)=>a+x.valor,0);
 pdfKpis(doc,W,M,100,[['Receitas',rec,PDFC.GR],['Despesas',des,PDFC.RS],['Saldo',rec-des,rec-des>=0?PDFC.TL:PDFC.RS],['Despesas em aberto',ab,PDFC.AM]]);
 const grp=(k)=>{const m={};L.filter(x=>x.tipo==='Despesa').forEach(x=>{const key=k(x);if(!key)return;m[key]=(m[key]||0)+x.valor});return Object.entries(m).sort((a,b)=>b[1]-a[1])};
 const blocks=[['Despesas por categoria',grp(x=>x.cat)],['Despesas por conta',grp(x=>x.conta)],['Despesas por cartão de crédito',grp(x=>x.cartao)]];
 let y=180;
 blocks.forEach(([t,arr])=>{
  if(y>380){doc.addPage();y=36}
  y=pdfTitle(doc,M,y,t);
  const tot=arr.reduce((a,[,v])=>a+v,0);
  y=pdfTable(doc,M,y+6,['Item','Valor','% do total'],arr.length?arr.map(([k,v])=>[k,brl(v),pdfPct(v,tot)]):[['Sem dados','','']],[1,2],arr.length?['Total',brl(tot),'100%']:null)+22});
 doc.save('relatorio-graficos.pdf');toast('Relatório PDF gerado')}

function pdfPlan(){
 if(!window.jspdf){alert('Não foi possível carregar o gerador de PDF. Verifique a conexão com a internet.');return}
 const{jsPDF}=window.jspdf,doc=new jsPDF({orientation:'landscape',unit:'pt',format:'a4'}),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),M=36,now=new Date(),cur=PY===now.getFullYear()?now.getMonth():-1,
  GR=[4,120,87],RS=[190,18,60],TL=[15,118,110],sm=a=>a.reduce((x,y)=>x+y,0);
 const build=t=>{const rows=PL.filter(r=>r.t===t).sort((a,b)=>a.c.localeCompare(b.c,'pt')||a.s.localeCompare(b.s,'pt')),groups=[],tot=Array(12).fill(0);
  rows.forEach(r=>{const g=groups[groups.length-1];if(g&&g.c===r.c)g.r.push(r);else groups.push({c:r.c,r:[r]});for(let m=0;m<12;m++){const v=r.v[pk(m)];if(v!=null)tot[m]+=v}});return{rows,groups,tot}},
  R=build('Receita'),D=build('Despesa'),tR=R.tot,tD=D.tot,rec=sm(tR),des=sm(tD),saldo=rec-des;
 /* ---- Página 1: capa com resumo ---- */
 doc.setFillColor(...TL);doc.rect(0,0,W,84,'F');
 doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(22);doc.text('Relatório de Planejamento',M,42);
 doc.setFont('helvetica','normal');doc.setFontSize(10.5);doc.text(`Ano ${PY}  |  Valores realizados por mês`,M,62);
 doc.text('Gerado em '+now.toLocaleString('pt-BR'),W-M,42,{align:'right'});doc.text('Fluxo · Gestão financeira',W-M,62,{align:'right'});
 const sm4=cur>=0?[`Saldo de ${MN[cur]}`,tR[cur]-tD[cur]]:['Saldo médio mensal',saldo/12],bw=(W-2*M-36)/4,box=[['Receitas no ano',rec,GR],['Despesas no ano',des,RS],['Saldo do ano',saldo,saldo>=0?TL:RS],[sm4[0],sm4[1],sm4[1]>=0?[180,83,9]:RS]];
 box.forEach(([l,v,c],i)=>{const x=M+i*(bw+12);doc.setFillColor(246,248,247);doc.setDrawColor(229,234,232);doc.roundedRect(x,100,bw,58,8,8,'FD');
  doc.setFillColor(...c);doc.rect(x,112,3,34,'F');doc.setTextColor(102,117,113);doc.setFontSize(9.5);doc.setFont('helvetica','normal');doc.text(l,x+14,120);
  doc.setTextColor(...c);doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text(brl(v),x+14,141)});
 /* gráfico de colunas: receitas × despesas por mês */
 const x0=M+40,x1=W-M,y0=222,y1=372,cw=(x1-x0)/12,mx=Math.max(1,...tR,...tD),bw2=Math.min(15,cw*.28);
 doc.setTextColor(20,32,30);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Receitas × despesas por mês',M,196);
 doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setFillColor(20,184,166);doc.rect(W-M-150,189,8,8,'F');doc.setTextColor(102,117,113);doc.text('Receitas',W-M-138,196);doc.setFillColor(244,63,94);doc.rect(W-M-80,189,8,8,'F');doc.text('Despesas',W-M-68,196);
 if(cur>=0){doc.setFillColor(230,244,241);doc.roundedRect(x0+cw*cur+2,y0-8,cw-4,y1-y0+42,5,5,'F')}
 doc.setDrawColor(229,234,232);doc.setLineWidth(.6);doc.setFontSize(7.5);
 for(let i=0;i<=4;i++){const y=y1-(y1-y0)*i/4;doc.line(x0,y,x1,y);doc.setTextColor(102,117,113);doc.text(afmt(mx*i/4),x0-6,y+2.5,{align:'right'})}
 doc.text('Saldo',x0-6,y1+27,{align:'right'});
 for(let m=0;m<12;m++){const cx=x0+cw*m+cw/2,hr=tR[m]/mx*(y1-y0),hd=tD[m]/mx*(y1-y0),sl=tR[m]-tD[m];
  if(hr>0){doc.setFillColor(20,184,166);doc.rect(cx-bw2-1,y1-hr,bw2,hr,'F')}if(hd>0){doc.setFillColor(244,63,94);doc.rect(cx+1,y1-hd,bw2,hd,'F')}
  doc.setFont('helvetica',m===cur?'bold':'normal');doc.setFontSize(8);doc.setTextColor(m===cur?15:102,m===cur?118:117,m===cur?110:113);doc.text(MS[m],cx,y1+13,{align:'center'});
  doc.setFont('helvetica','bold');doc.setFontSize(6.6);doc.setTextColor(...(sl>=0?GR:RS));doc.text((tR[m]||tD[m])?pm(sl):'–',cx,y1+27,{align:'center'})}
 doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(140);doc.text('Valores em R$. O mês atual aparece destacado.',M,y1+52);
 /* ---- Páginas seguintes: tabelas ---- */
 doc.addPage();let y=44;
 [['Receitas',R,GR],['Despesas',D,RS]].forEach(([ttl,B,col],k)=>{
  if(k&&y>H-150){doc.addPage();y=44}
  doc.setFillColor(...col);doc.roundedRect(M,y-12,4,16,2,2,'F');doc.setTextColor(20,32,30);doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text(ttl,M+12,y);
  doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(102,117,113);doc.text('Total no ano: R$ '+pm(sm(B.tot)),W-M,y,{align:'right'});
  if(!B.rows.length){doc.setFontSize(9.5);doc.text('Nenhuma subcategoria cadastrada.',M+12,y+24);y+=64;return}
  const body=[];B.groups.forEach(g=>g.r.forEach((r,i)=>{const c=[];if(i===0)c.push({content:g.c,rowSpan:g.r.length,styles:{fontStyle:'bold',valign:'middle'}});c.push(r.s);let rt=0;for(let m=0;m<12;m++){const v=r.v[pk(m)];if(v!=null)rt+=v;c.push(v!=null?pm(v):'–')}c.push(pm(rt));body.push(c)}));
  doc.autoTable({startY:y+12,margin:{left:M,right:M,top:40,bottom:40},theme:'plain',
   head:[['Categoria','Subcategoria',...MS,'Total']],body,foot:[[{content:'Total',colSpan:2},...B.tot.map(pm),pm(sm(B.tot))]],showFoot:'lastPage',
   styles:{fontSize:7,cellPadding:{top:4.5,bottom:4.5,left:3,right:3},textColor:[20,32,30],lineColor:[229,234,232],lineWidth:{bottom:.5},overflow:'ellipsize'},
   headStyles:{fillColor:[236,243,241],textColor:[15,95,88],fontStyle:'bold'},footStyles:{fillColor:[236,243,241],textColor:col,fontStyle:'bold'},alternateRowStyles:{fillColor:[250,251,250]},
   columnStyles:Object.assign({0:{cellWidth:86},1:{cellWidth:100},14:{cellWidth:56,fontStyle:'bold'}},...Array.from({length:12},(_,i)=>({[i+2]:{cellWidth:44,halign:'right'}}))),
   didParseCell:d=>{const c=d.column.index;if(c>=2)d.cell.styles.halign='right';
    if(c>=2&&c<=13&&cur===c-2){if(d.section==='head'){d.cell.styles.fillColor=TL;d.cell.styles.textColor=255}else if(d.section==='body')d.cell.styles.fillColor=[230,244,241]}
    if(d.section==='body'&&d.cell.raw==='–')d.cell.styles.textColor=[180,190,187]}});
  y=doc.lastAutoTable.finalY+30});
 /* ---- Saldo por categoria ---- */
 {const CS={};PL.forEach(r=>{const a=CS[r.c]=CS[r.c]||Array(12).fill(0);for(let m=0;m<12;m++){const v=r.v[pk(m)];if(v!=null)a[m]+=(r.t==='Receita'?v:-v)}});
  const cats=Object.keys(CS).sort((a,b)=>a.localeCompare(b,'pt')),rd=v=>Math.round(v*100)/100,tt=Array(12).fill(0);
  if(y>H-150){doc.addPage();y=44}
  doc.setFillColor(...TL);doc.roundedRect(M,y-12,4,16,2,2,'F');doc.setTextColor(20,32,30);doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text('Saldo',M+12,y);
  doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(102,117,113);doc.text('Saldo no ano: R$ '+pm(saldo),W-M,y,{align:'right'});
  if(!cats.length){doc.text('Nenhuma categoria cadastrada.',M+12,y+24)}
  else{cats.forEach(c=>CS[c].forEach((v,m)=>tt[m]+=v));const body=[[{content:'Receitas vs Despesas',colSpan:2,styles:{fontStyle:'bold'}},...tt.map(v=>pm(rd(v))),pm(rd(sm(tt)))]];
   doc.autoTable({startY:y+12,margin:{left:M,right:M,top:40,bottom:40},theme:'plain',
    head:[[{content:'',colSpan:2},...MS,'Total']],body,
    styles:{fontSize:7,cellPadding:{top:4.5,bottom:4.5,left:3,right:3},textColor:[20,32,30],lineColor:[229,234,232],lineWidth:{bottom:.5},overflow:'ellipsize'},
    headStyles:{fillColor:[236,243,241],textColor:[15,95,88],fontStyle:'bold'},footStyles:{fillColor:[236,243,241],textColor:TL,fontStyle:'bold'},alternateRowStyles:{fillColor:[250,251,250]},
    columnStyles:Object.assign({0:{cellWidth:86},1:{cellWidth:100},14:{cellWidth:56,fontStyle:'bold'}},...Array.from({length:12},(_,i)=>({[i+2]:{cellWidth:44,halign:'right'}}))),
    didParseCell:d=>{const c=d.column.index,raw=String(d.cell.raw);if(c>=2)d.cell.styles.halign='right';
     if(c>=2&&c<=13&&cur===c-2){if(d.section==='head'){d.cell.styles.fillColor=TL;d.cell.styles.textColor=255}else if(d.section==='body')d.cell.styles.fillColor=[230,244,241]}
     if(c>=2&&d.section!=='head'&&/^[-−]/.test(raw))d.cell.styles.textColor=RS;else if(c>=2&&d.section!=='head'&&raw!=='0,00')d.cell.styles.textColor=GR}})}}
 const n=doc.getNumberOfPages();for(let i=1;i<=n;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(140);doc.text(`Fluxo · Planejamento ${PY}`,M,H-18);doc.text(`Página ${i} de ${n}`,W-M,H-18,{align:'right'})}
 doc.save(`planejamento-${PY}.pdf`);toast('Relatório PDF gerado')}
months();render();
// Mantém a aba aberta quando a página é atualizada pela sincronização
(()=>{const sv=sessionStorage.getItem('fluxo_view');if(sv&&sv!=='l')try{setView(sv)}catch(e){}})();
