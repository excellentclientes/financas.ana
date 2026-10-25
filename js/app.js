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
D.forEach(x=>{if(x.cartao&&!CARDS.some(c=>c.nome===x.cartao))CARDS.push({id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),nome:x.cartao,limite:0})});
function cardsSave(){try{localStorage.setItem('fluxo_cards',JSON.stringify(CARDS))}catch(e){}CARTOES.length=0;CARDS.forEach(c=>CARTOES.push(c.nome))}
let BANKS=null,TR=null,BKE=null,TRE=null;
try{BANKS=JSON.parse(localStorage.getItem('fluxo_banks'))}catch(e){}
if(!Array.isArray(BANKS))BANKS=[];
try{TR=JSON.parse(localStorage.getItem('fluxo_transf'))}catch(e){}
if(!Array.isArray(TR))TR=[];
function syncContas(){CONTAS.length=0;BANKS.filter(b=>b.status==='Ativo').forEach(b=>CONTAS.push(b.nome))}
function banksSave(){try{localStorage.setItem('fluxo_banks',JSON.stringify(BANKS))}catch(e){}syncContas()}
function trSave_(){try{localStorage.setItem('fluxo_transf',JSON.stringify(TR))}catch(e){}}
function parseMon(v){return parseMoney(v)}
syncContas();
const saldoAtual=b=>b.saldo+D.filter(x=>x.conta===b.nome&&st(x)==='pago'&&!(x.tipo==='Despesa'&&x.cartao)).reduce((a,x)=>a+(x.tipo==='Receita'?x.valor:-x.valor),0);
const bkAtivos=()=>BANKS.filter(b=>b.status==='Ativo');
const bkBadge=s=>`<span class="bst ${s==='Ativo'?'on':'off'}">${s}</span>`;

function bkRender(){
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

cardsSave();
const st=x=>x.status==='pago'?'pago':(x.venc<TODAY?'atrasado':'pendente');
const stLabel=x=>({pago:x.tipo==='Receita'?'Recebido':'Pago',pendente:'Pendente',atrasado:'Atrasado'}[st(x)]);

let TAB='';const TABN={pendente:'Pendentes',pago:'Pagos / Recebidos','':'Todos os status'};
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

function filtered(tab=TAB){
 const Q=getQ(),t=$('#ft').value,m=$('#fm').value,yr=$('#fy').value;
 return D.filter(x=>(!t||x.tipo===t)&&(!tab||(tab==='pago'?st(x)==='pago':st(x)!=='pago'))&&(!m||(yr?x.venc.startsWith(m):x.venc.slice(5,7)===m))&&(!yr||x.venc.startsWith(yr))&&matchQ(x,Q)).sort((a,b)=>a.venc.localeCompare(b.venc)||a.n-b.n);
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
 const L=filtered(''),T=filtered(),rec=sum(L,x=>x.tipo==='Receita'),des=sum(L,x=>x.tipo==='Despesa'&&!x.cartao),pend=sum(L,x=>x.tipo==='Despesa'&&st(x)!=='pago'),atr=L.filter(x=>x.tipo==='Despesa'&&st(x)==='atrasado').length;
 $('#kpis').innerHTML=`<div class="card kpi main"><span>Saldo do período</span><b>${brl(rec-des)}</b><i>${L.length} lançamentos</i></div>
 <div class="card kpi"><span>Receitas</span><b class="rec">${brl(rec)}</b><i>${L.filter(x=>x.tipo==='Receita').length} entradas</i></div>
 <div class="card kpi"><span>Despesas</span><b class="des">${brl(des)}</b><i>${L.filter(x=>x.tipo==='Despesa').length} saídas</i></div>
 <div class="card kpi"><span>Despesas em aberto</span><b>${brl(pend)}</b><i>${atr} em atraso</i></div>`;
 $('#kmini').innerHTML=`<div class="km main"><span>Saldo do período</span><b>${brl(rec-des)}</b></div><div class="km"><span>Receitas</span><b class="rec">${brl(rec)}</b></div><div class="km"><span>Despesas</span><b class="des">${brl(des)}</b></div><div class="km"><span>Despesas em aberto</span><b>${brl(pend)}</b></div>`;
 const bc={};L.filter(x=>x.tipo==='Despesa').forEach(x=>bc[x.cat]=(bc[x.cat]||0)+x.valor);
 const top=Object.entries(bc).sort((a,b)=>b[1]-a[1]).slice(0,6),mx=top[0]?top[0][1]:1;
 $('#cats').innerHTML=top.map(([c,v])=>`<div class="bar"><span>${c}</span><div><i style="width:${v/mx*100}%"></i></div><b>${brl(v)}</b></div>`).join('')||'<p class="empty">Sem despesas no filtro.</p>';
 const bm={};D.forEach(x=>{const m=x.venc.slice(0,7);bm[m]=bm[m]||{R:0,D:0};bm[m][x.tipo==='Receita'?'R':'D']+=x.valor});
 const ks=Object.keys(bm).sort().slice(-6),mm=Math.max(...ks.map(k=>Math.max(bm[k].R,bm[k].D)),1);
 $('#months').innerHTML=ks.map(k=>`<div class="mc"><div class="p"><i style="height:${bm[k].R/mm*100}%;background:#0f766e" title="${brl(bm[k].R)}"></i><i style="height:${bm[k].D/mm*100}%;background:#e11d48" title="${brl(bm[k].D)}"></i></div>${new Date(k.slice(0,4),k.slice(5,7)-1,1).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</div>`).join('');
 $('#tb').innerHTML=T.map(x=>`<tr>
  <td data-l="Nº" class="num">${hl(String(x.n).padStart(4,'0'),'n')}</td>
  <td data-l="Tipo"><span class="tag ${x.tipo}">${hl(x.tipo,'tipo')}</span></td>
  <td data-l="Vencimento">${hl(fd(x.venc),'venc')}</td>
  <td data-l="Pgto / Receb.">${hl(fd(x.pgto),'pgto')}</td>
  <td data-l="Parcela">${hl(x.parc||'—','parc')}</td>
  <td data-l="Conta / Cartão">${hl(x.conta,'conta')}<small>${hl(x.cartao||'Sem cartão','conta')}</small></td>
  <td data-l="Categoria">${hl(x.cat,'cat')}<small>${hl(x.sub,'sub')}</small></td>
  <td data-l="Compra">${hl(fd(x.compra),'compra')}</td>
  <td data-l="Qtd">${hl(String(x.qtd),'qtd')}</td>
  <td data-l="Descrição"><b style="font-weight:600">${hl(x.desc,'desc')}</b></td>
  <td data-l="Valor" class="v ${x.tipo==='Receita'?'rec':'des'}">${hl((x.tipo==='Receita'?'+':'−')+' '+brl(x.valor),'valor')}</td>
  <td data-l="Status"><select class="tag ${st(x)}" onchange="setStatus(${x.n},this.value)" aria-label="Alterar status"><option value="pendente"${st(x)!=='pago'?' selected':''}>${st(x)==='atrasado'?'Atrasado':'Pendente'}</option><option value="pago"${st(x)==='pago'?' selected':''}>${x.tipo==='Receita'?'Recebido':'Pago'}</option></select></td>
  <td class="act"><button class="ic" onclick="openF(${x.n})" title="Editar" aria-label="Editar">✎</button><button class="ic" onclick="del(${x.n})" title="Excluir" aria-label="Excluir">🗑</button></td></tr>`).join('')||'<tr><td class="empty" colspan="13">Nenhum lançamento encontrado. Ajuste os filtros ou crie um novo.</td></tr>';
 document.querySelectorAll('.tabs button').forEach(b=>{b.classList.toggle('on',b.dataset.t===TAB);b.querySelector('em').textContent=filtered(b.dataset.t).length});
 $('#cnt').textContent=`${T.length} lançamentos`;$('#tot').innerHTML=`Saldo desta lista: <b style="color:var(--ink)">${brl(sum(T,x=>x.tipo==='Receita')-sum(T,x=>x.tipo==='Despesa'))}</b>`;
 if(!$('#vG').hidden)grender();
}

const opts=(a,b)=>(b!==undefined?`<option value="">${b}</option>`:'')+a.map(x=>`<option>${esc(x)}</option>`).join('');
function fillCat(c,s){const t=$('#f_tipo').value;$('#f_cat').innerHTML=opts(Object.keys(CATS[t]));if(c)$('#f_cat').value=c;fillSub(s);
 $('#f_status').options[1].text=t==='Receita'?'Recebido':'Pago'}
function fillSub(s){$('#f_sub').innerHTML=opts(CATS[$('#f_tipo').value][$('#f_cat').value]||[]);if(s)$('#f_sub').value=s}
let editing=null;
function fgVis(){
 const cartao=!!$('#f_cartao').value, despesa=$('#f_tipo').value==='Despesa';
 const comp=$('#f_compra').closest('.fg'), parc=$('#f_parc').closest('.fg');
 comp.hidden=!despesa;
 parc.hidden=!(despesa&&cartao);
 // receita já recebida: a data relevante é a de recebimento, não o vencimento
 $('#f_venc').closest('.fg').hidden=!despesa&&$('#f_status').value==='pago';
}
$('#f_status').addEventListener('change',()=>{if($('#f_status').value==='pago'&&!$('#f_pgto').value)$('#f_pgto').value=TODAY;fgVis()});
$('#f_cartao').addEventListener('change',fgVis);
function openF(n){
 if(!n&&semContaAtiva('Cadastre uma conta bancária antes de criar lançamentos'))return;
 editing=n||null;$('#dt').textContent=n?`Editar lançamento ${String(n).padStart(4,'0')}`:'Novo lançamento';
 const x0=n?D.find(i=>i.n===n):null,cur=x0&&x0.conta;
 const contaOpts=CONTAS.slice();if(cur&&!contaOpts.includes(cur))contaOpts.push(cur);
 $('#f_conta').innerHTML=contaOpts.map(c=>`<option value="${esc(c)}">${esc(c)}${CONTAS.includes(c)?'':' (inativa)'}</option>`).join('');
 $('#f_cartao').innerHTML=opts(CARTOES,'Sem cartão');
 const x=x0||{tipo:'Despesa',status:'pendente',desc:'',valor:'',qtd:1,venc:TODAY,pgto:'',compra:TODAY,parc:'1/1',conta:CONTAS[0]||'',cartao:''};
 $('#f_tipo').value=x.tipo;fillCat(x.cat,x.sub);
 $('#f_status').value=x.status;$('#f_desc').value=x.desc;$('#f_valor').value=x.valor;$('#f_qtd').value=x.qtd;$('#f_venc').value=x.venc;
 $('#f_pgto').value=x.pgto||(n?'':TODAY);$('#f_compra').value=x.compra||x.venc;$('#f_parc').value=x.parc||'1/1';$('#f_conta').value=x.conta;$('#f_cartao').value=x.cartao;fgVis();
 $('#dlg').showModal();
}
function save(e){
 e.preventDefault();
 if(!editing&&semContaAtiva('Cadastre uma conta bancária antes de criar lançamentos')){$('#dlg').close();return false}
 if(!CONTAS.includes($('#f_conta').value)){toast('Escolha uma conta bancária ativa');return false}
 const o={tipo:$('#f_tipo').value,status:$('#f_status').value,desc:$('#f_desc').value.trim(),cat:$('#f_cat').value,sub:$('#f_sub').value,valor:parseFloat($('#f_valor').value)||0,qtd:parseInt($('#f_qtd').value)||1,venc:$('#f_venc').value,pgto:$('#f_pgto').value,compra:$('#f_compra').value,parc:$('#f_parc').value||'1/1',conta:$('#f_conta').value,cartao:$('#f_cartao').value};
 if(o.tipo!=='Despesa'){o.compra=o.venc;o.parc='1/1';o.cartao=''}
 else if(!o.cartao){o.parc='1/1'}
 if(o.tipo==='Receita'&&o.status==='pago'){o.pgto=o.pgto||TODAY;o.venc=o.pgto}
 if(o.status==='pago'&&!o.pgto)o.pgto=o.venc;if(o.status==='pendente')o.pgto='';
 if(editing){Object.assign(D.find(i=>i.n===editing),o)}else{o.n=Math.max(0,...D.map(i=>i.n))+1;D.push(o)}
 persist();months();render();$('#dlg').close();toast(editing?'Lançamento atualizado':'Lançamento salvo');return false;
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
 doc.save('relatorio-financeiro.pdf');toast('Relatório PDF gerado');
}
/* ===== Aba de Gráficos ===== */
const G={from:'',to:'',tipo:'',status:'',conta:'',cartao:'',cat:'',sub:'',q:''};
const PAL=['#0f766e','#e11d48','#f59e0b','#6366f1','#0ea5e9','#84cc16','#d946ef','#64748b'],EMPTY='<p class="empty">Sem dados no filtro.</p>';
const mshort=m=>new Date(m.slice(0,4),m.slice(5,7)-1,1).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')+'/'+m.slice(2,4);
const kfmt=v=>Math.abs(v)>=1000?(v/1000).toFixed(Math.abs(v)>=10000?0:1).replace('.',',')+'k':String(Math.round(v));
const sumBy=(a,f)=>{const o={};a.forEach(x=>{const k=f(x);o[k]=(o[k]||0)+x.valor});return Object.entries(o).sort((p,q)=>q[1]-p[1])};
function setView(v){['l','p','c','t','b','g'].forEach(k=>{$('#v'+k.toUpperCase()).hidden=v!==k});document.querySelectorAll('.views button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));if(v==='g')grender();if(v==='p')plRender(1);if(v==='c')ccRender();if(v==='t')trRender();if(v==='b')bkRender();VIEW=v;sessionStorage.setItem('fluxo_view',v);$('#hnew .t').textContent=v==='p'?'Novo cadastro':v==='c'?'Novo cartão':v==='t'?'Nova transferência':v==='b'?'Nova conta':'Novo lançamento'}
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
function grid(W,H,pl,pr,pt,pb,lo,top){const Y=v=>pt+(top-v)/(top-lo)*(H-pt-pb);let o='';for(let i=0;i<=4;i++){const v=lo+(top-lo)*i/4;o+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e5eae8"/><text x="${pl-5}" y="${Y(v)+3}" text-anchor="end" font-size="9.5" fill="#667571">${kfmt(v)}</text>`}return[Y,o]}
const GDEF='<defs><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2dd4bf"/><stop offset="1" stop-color="#0f766e"/></linearGradient><linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb7185"/><stop offset="1" stop-color="#be123c"/></linearGradient><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14b8a6" stop-opacity=".45"/><stop offset="1" stop-color="#14b8a6" stop-opacity="0"/></linearGradient><filter id="glw" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
function gMes(){const bm={};gf(['from','to']).forEach(x=>{const m=x.venc.slice(0,7);(bm[m]=bm[m]||{R:0,D:0})[x.tipo==='Receita'?'R':'D']+=x.valor});
 const ks=Object.keys(bm).sort().slice(-12);if(!ks.length)return EMPTY;
 const W=600,H=200,pl=36,pr=8,pt=10,pb=24,top=Math.max(1,...ks.map(k=>Math.max(bm[k].R,bm[k].D))),lo=0,[Y,gr]=grid(W,H,pl,pr,pt,pb,lo,top),sw=(W-pl-pr)/ks.length,bw=Math.min(16,sw*.3),rng=G.from||G.to;
 let o=`<svg viewBox="0 0 ${W} ${H}">${GDEF}`+gr;
 ks.forEach((k,i)=>{const cx=pl+sw*(i+.5),d=rng&&!((!G.from||k>=G.from)&&(!G.to||k<=G.to)),r=bm[k].R,dd=bm[k].D;
  o+=`<g data-g="month" data-v="${k}" style="cursor:pointer;opacity:${d?.3:1}"><title>${mlabel(k)}\nReceitas: ${brl(r)}\nDespesas: ${brl(dd)}\nSaldo: ${brl(r-dd)}</title><rect x="${cx-sw/2}" y="${pt}" width="${sw}" height="${H-pt-pb}" fill="transparent"/><rect x="${cx-bw-1.5}" y="${Y(r)}" width="${bw}" height="${Math.max(1,Y(0)-Y(r))}" rx="4" fill="url(#gR)" filter="url(#glw)"/><rect x="${cx+1.5}" y="${Y(dd)}" width="${bw}" height="${Math.max(1,Y(0)-Y(dd))}" rx="4" fill="url(#gD)" filter="url(#glw)"/><text x="${cx}" y="${H-8}" text-anchor="middle" font-size="9.5" fill="#667571">${mshort(k)}</text></g>`});
 return o+'</svg>'}
function gSal(L){const bm={};L.forEach(x=>{const m=x.venc.slice(0,7);bm[m]=(bm[m]||0)+(x.tipo==='Receita'?x.valor:-x.valor)});
 const ks=Object.keys(bm).sort();if(!ks.length)return EMPTY;let c=0;const cum=ks.map(k=>c+=bm[k]),n=ks.length;
 const W=400,H=190,pl=38,pr=12,pt=10,pb=24,[Y,gr]=grid(W,H,pl,pr,pt,pb,Math.min(0,...cum),Math.max(1,...cum)),sw=(W-pl-pr)/n,bw=Math.min(26,sw*.62),e=Math.ceil(n/6);
 return`<svg viewBox="0 0 ${W} ${H}">${GDEF}${gr}`+cum.map((v,i)=>{const cx=pl+sw*(i+.5),y=Math.min(Y(v),Y(0)),h=Math.max(1,Math.abs(Y(v)-Y(0)));return`<rect x="${cx-bw/2}" y="${y}" width="${bw}" height="${h}" rx="4" fill="url(#${v>=0?'gR':'gD'})"><title>${mlabel(ks[i])}: ${brl(v)}</title></rect>${i%e===0?`<text x="${cx}" y="${H-8}" text-anchor="middle" font-size="9.5" fill="#667571">${mshort(ks[i])}</text>`:''}`}).join('')+'</svg>'}
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
 Object.keys(lab).forEach(k=>G[k]&&ch.push([k,lab[k],k==='status'?{pago:'Pago/Recebido',pendente:'Pendente',atrasado:'Atrasado'}[G[k]]:G[k]]));
 $('#gchips').innerHTML=ch.length?ch.map(([k,l,v])=>`<button class="chip on" data-x="${k}">${l}: <b>${esc(v)}</b> ✕</button>`).join('')+'<button class="chip" data-x="all">Limpar tudo</button>':'<span>Clique nos gráficos para filtrar · ou use os filtros acima</span>';
 const L=gf(),DT=G.tipo||'Despesa',P=DT+'s',rec=sum(L,x=>x.tipo==='Receita'),des=sum(L,x=>x.tipo==='Despesa'&&!x.cartao),ab=sum(L,x=>x.tipo==='Despesa'&&st(x)!=='pago');
 $('#gkpis').innerHTML=`<div class="card kpi main"><span>Saldo</span><b>${brl(rec-des)}</b><i>${L.length} lançamentos</i></div><div class="card kpi"><span>Receitas</span><b class="rec">${brl(rec)}</b><i>${L.filter(x=>x.tipo==='Receita').length} entradas</i></div><div class="card kpi"><span>Despesas</span><b class="des">${brl(des)}</b><i>${L.filter(x=>x.tipo==='Despesa').length} saídas</i></div><div class="card kpi"><span>Despesas em aberto</span><b>${brl(ab)}</b><i>${L.filter(x=>x.tipo==='Despesa'&&st(x)==='atrasado').length} em atraso</i></div>`;
 $('#g_mes').innerHTML=gMes();
 $('#g_t1').textContent=P+' por categoria';$('#g_cat').innerHTML=gDonut(sumBy(gf(['cat','sub']).filter(x=>x.tipo===DT),x=>x.cat));
 $('#g_t2').textContent=P+' por subcategoria';$('#g_sub').innerHTML=hbars(sumBy(gf(['sub']).filter(x=>x.tipo===DT),x=>x.cat+'|'+x.sub).slice(0,8).map(([k,v])=>[k.split('|')[1],v,k]),'sub',G.sub?G.cat+'|'+G.sub:'');
 $('#g_t3').textContent=P+' por conta';$('#g_acc').innerHTML=hbars(sumBy(gf(['conta']).filter(x=>x.tipo===DT),x=>x.conta),'conta',G.conta);
 $('#g_t4').textContent=P+' por cartão de crédito';$('#g_car').innerHTML=hbars(sumBy(gf(['cartao']).filter(x=>x.tipo===DT&&x.cartao),x=>x.cartao),'cartao',G.cartao);
 const SL={pago:DT==='Receita'?'Recebido':'Pago',pendente:'Pendente',atrasado:'Atrasado'},SC={pago:'#047857',pendente:'#f59e0b',atrasado:'#be123c'},sr=gf(['status']).filter(x=>x.tipo===DT),sb={};
 sr.forEach(x=>{const k=st(x);(sb[k]=sb[k]||{v:0,n:0}).v+=x.valor;sb[k].n++});
 $('#g_t5').textContent='Situação das '+P.toLowerCase();
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
const COLN=['Nº','Tipo','Vencimento','Pgto / Receb.','Parcela','Conta / Cartão','Categoria','Compra','Qtd','Descrição','Valor','Status'];let HC=[];try{HC=JSON.parse(localStorage.getItem('fluxo_cols')||'[]')}catch(e){}
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
 D.forEach(x=>{if(x.tipo!=='Despesa'||!x.cartao||!(x.cartao in used))return;used[x.cartao]+=x.valor;const f=faturaDe(x);if(f.m.slice(0,4)===String(KY))mon[x.cartao][+f.m.slice(5,7)-1]+=x.valor});
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
 const base=(x.compra||x.venc);
 if(!card||!card.diaPag)return{m:x.venc.slice(0,7)};
 let [y,mo,d]=base.split('-').map(Number);
 if(d>=card.diaPag){mo++;if(mo>12){mo=1;y++}}
 return{m:`${y}-${String(mo).padStart(2,'0')}`};
}
function ccOpen(id){
 if(!id&&semContaAtiva('Cadastre uma conta bancária antes de adicionar cartões'))return;KE=id||null;const c=id?CARDS.find(x=>x.id===id):null;$('#kdt').textContent=c?'Editar cartão':'Novo cartão';$('#k_n').value=c?c.nome:'';$('#k_l').value=c?String(c.limite).replace('.',','):'';$('#k_dia').value=c&&c.diaPag?c.diaPag:'';$('#kdlg').showModal();$('#k_n').focus()}
function ccSave(e){e.preventDefault();const n=nm($('#k_n').value),l=parseMoney($('#k_l').value);
 if(!n)return false;if(!isFinite(l)||l<0){toast('Informe um limite válido');return false}
 if(CARDS.some(c=>c.id!==KE&&same(c.nome,n))){toast('Já existe um cartão com esse nome');return false}
 const lim=Math.round(l*100)/100;const dia=parseInt($('#k_dia').value,10);
 if(!(dia>=1&&dia<=31)){toast('Informe o dia de pagamento da fatura (1 a 31)');return false}
 if(KE){const c=CARDS.find(x=>x.id===KE);if(c.nome!==n){D.forEach(x=>{if(x.cartao===c.nome)x.cartao=n});if(G.cartao===c.nome)G.cartao=n;persist();c.nome=n}c.limite=lim;c.diaPag=dia}
 else CARDS.push({id:'c'+Date.now().toString(36),nome:n,limite:lim,diaPag:dia});
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
 const yr=$('#pyr'),now=new Date();if(!yr.options.length)for(let y=now.getFullYear()-2;y<=now.getFullYear()+3;y++)yr.add(new Option(y,y));yr.value=PY;
 const TT={Receita:Array(12).fill(0),Despesa:Array(12).fill(0)};
 const cur=PY===now.getFullYear()?now.getMonth():-1,W=[80,110,130],cols=W.map(w=>`<col style="width:${w}px">`).join('')+'<col style="width:80px">'.repeat(12),tw=W.reduce((a,b)=>a+b,0)+80*12;
 [['Receita','R'],['Despesa','D']].forEach(([t,k])=>{
  const rows=PL.filter(r=>r.t===t).sort((a,b)=>a.c.localeCompare(b.c,'pt')||a.s.localeCompare(b.s,'pt')),box=$('#pw'+k),sl=box.scrollLeft,groups=[],tot=Array(12).fill(0);
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
  PL.forEach(r=>{const a=CS[r.c]=CS[r.c]||Array(12).fill(0);for(let m=0;m<12;m++){const v=r.v[pk(m)];if(v!=null)a[m]+=(r.t==='Receita'?v:-v)}});
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
function plSync(){const keep=[];['Despesa','Receita'].forEach(t=>Object.keys(PC[t]).forEach(c=>PC[t][c].forEach(sb=>{keep.push(PL.find(x=>x.t===t&&x.c===c&&x.s===sb)||{id:'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),t,c,s:sb,v:{}})})));PL=keep;plPersist();pcSave()}
plSync();
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
 D.forEach(x=>{if(x.tipo!=='Despesa'||!x.cartao||!(x.cartao in used))return;used[x.cartao]+=x.valor;const f=faturaDe(x);if(f.m.slice(0,4)===String(KY))mon[x.cartao][+f.m.slice(5,7)-1]+=x.valor});
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
 for(let i=0;i<=4;i++){const y=y1-(y1-y0)*i/4;doc.line(x0,y,x1,y);doc.setTextColor(102,117,113);doc.text(kfmt(mx*i/4),x0-6,y+2.5,{align:'right'})}
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
