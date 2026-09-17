import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.116.0'

const SUPABASE_URL='https://agkjutuvfjcahckhjkra.supabase.co'
const SUPABASE_KEY='sb_publishable_6oA2tFA2W-yfzK6GpL4Bhw_prNXvyvd'
const API=`${SUPABASE_URL}/functions/v1/reseller-panel-api`
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)
const $=id=>document.getElementById(id)
const PLAN={'3h':{label:'3 horas',price:4},'10h':{label:'10 horas',price:8},'1d':{label:'1 dia',price:14},'3d':{label:'3 dias',price:30},'1w':{label:'7 dias',price:40},'1m':{label:'1 mês',price:70}}
const statusName={active:'Ativa',pending:'Pendente',expired:'Expirada',revoked:'Revogada'}
let me=null,permissions={},overview=null,licenses=[],clients=[],transactions=[],selectedLicense=null,activePanel='overview'

const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))
const digits=v=>String(v??'').replace(/\D/g,'')
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v||0))
const fmt=v=>v?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'—'
const show=id=>$(id).classList.remove('hidden'),hide=id=>$(id).classList.add('hidden')
function flash(msg){$('flash').textContent=msg;show('flash');clearTimeout(flash.t);flash.t=setTimeout(()=>hide('flash'),3200)}
function openModal(id){show(id)}
function closeModals(){document.querySelectorAll('.modal').forEach(x=>x.classList.add('hidden'))}
async function session(){return (await supabase.auth.getSession()).data.session}
async function api(body){const s=await session();if(!s)throw Object.assign(new Error('Sessão expirada.'),{code:'unauthorized'});const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${s.access_token}`},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(d.detail||d.error||`Erro ${r.status}`);e.code=d.error;e.data=d;throw e}return d}
async function copy(text,msg='Copiado.'){await navigator.clipboard.writeText(text);flash(msg)}
function phoneUrl(v){let d=digits(v);if(d&&d.length<=11&&!d.startsWith('55'))d='55'+d;return d?`https://wa.me/${d}`:''}

function authEmailForLogin(value){
  const login=String(value||'').trim().toLowerCase()
  return `rv.${login}@auth.satanabe.store`
}

function configureLoginUI(){
  const input=$('loginEmail')
  if(input){
    input.type='text'
    input.autocomplete='username'
    input.placeholder='Seu login'
    const label=input.closest('label')?.querySelector('span')
    if(label)label.textContent='Login'
  }
  const subtitle=document.querySelector('#authView .muted')
  if(subtitle)subtitle.textContent='Entre com o login e a senha fornecidos pelo administrador.'
  const forgot=$('forgotButton')
  if(forgot)forgot.remove()
  const passwordView=$('passwordView')
  if(passwordView)passwordView.classList.add('hidden')
}

function applyPermissions(){
  document.querySelectorAll('[data-panel]').forEach(b=>{const p=b.dataset.panel;b.classList.toggle('hidden',permissions[p]===false)})
  const order=['overview','keys','clients','revenue'];if(permissions[activePanel]===false){activePanel=order.find(x=>permissions[x]!==false)||'overview'}
}
function setIdentity(){const r=me?.reseller||{};$('storeNameSide').textContent=r.store_name||'Reseller';$('storeNameHero').textContent=r.store_name||'Sua loja';$('storeMetaHero').textContent=[r.owner_name,r.whatsapp||r.phone].filter(Boolean).join(' • ')||r.email||'';$('ownerSide').textContent=r.owner_name||r.store_name||'Revendedor';$('emailSide').textContent='Revendedor';$('userInitial').textContent=(r.owner_name||r.store_name||'R').trim().charAt(0).toUpperCase();document.title=`${r.store_name||'Satanabe'} • Reseller`}
function setPanel(name){if(permissions[name]===false)return;activePanel=name;document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));$(`${name}Panel`).classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.panel===name));$('pageTitle').textContent={overview:'Overview',keys:'Keys',clients:'Clientes',revenue:'Receita'}[name]||name;$('sideNav').closest('.sidebar')?.classList.remove('open');loadPanel(name).catch(handleError)}
async function loadPanel(name){$('syncStatus').textContent='Atualizando…';if(name==='overview')await loadOverview();if(name==='keys')await loadLicenses();if(name==='clients')await loadClients();if(name==='revenue')await loadRevenue();$('syncStatus').textContent='Atualizado'}
function handleError(e){if(e.code==='reseller_disabled'){hide('appView');hide('authView');$('blockedTitle').textContent='Painel desativado';$('blockedMessage').textContent='O administrador desativou este revendedor. As keys existentes não são alteradas automaticamente.';show('blockedView');return}if(e.code==='reseller_not_found'||e.code==='permission_denied'){if(e.code==='permission_denied'){flash('Você não possui acesso a esta área.');return}hide('appView');hide('authView');$('blockedTitle').textContent='Conta não vinculada';$('blockedMessage').textContent='Este login não está vinculado a um painel de revendedor.';show('blockedView');return}flash(e.message||'Erro inesperado.')}

async function bootApp(){
  try{me=await api({action:'me'});permissions=me.permissions||{};setIdentity();applyPermissions();hide('authView');hide('passwordView');hide('blockedView');show('appView');setPanel(activePanel)}catch(e){handleError(e)}
}
async function loadOverview(){const d=await api({action:'overview'});overview=d;const s=d.stats||{};$('ovActive').textContent=s.active_keys||0;$('ovToday').textContent=s.expires_today||0;$('ovTomorrow').textContent=s.expires_tomorrow||0;$('ov3d').textContent=s.expires_3d||0;$('ovDevices').textContent=s.devices||0;$('ovClients').textContent=s.clients||0;$('ovPending').textContent=s.pending_keys||0;$('ovExpired').textContent=s.expired_keys||0;$('ovRevoked').textContent=s.revoked_keys||0;$('heroRevenue').textContent=money(s.month_revenue);$('ovTotalRevenue').textContent=money(s.total_revenue);renderAlerts()}
function renderAlerts(){const rows=overview?.alerts||[];$('alertEmpty').classList.toggle('hidden',rows.length>0);$('alertList').innerHTML=rows.map(l=>{const c=l.client||{};return`<div class="list-row"><div class="main"><strong>${esc(c.name||l.plan||l.duration_label||'Key')}</strong><small>${esc(c.phone||l.key_hint||'')}</small></div><div><strong>${fmt(l.expires_at)}</strong></div></div>`}).join('')}

async function loadLicenses(){const d=await api({action:'list_licenses'});licenses=d.licenses||[];renderKeys()}
function renderKeys(){const q=norm($('keySearch').value),f=$('keyFilter').value;const rows=licenses.filter(l=>(f==='all'||l.status===f)&&(!q||[l.license_key,l.key_hint,l.plan,l.duration_label,l.client?.name,l.client?.phone].some(v=>norm(v).includes(q))));$('keyCount').textContent=`${rows.length} key${rows.length===1?'':'s'}`;$('keyEmpty').classList.toggle('hidden',rows.length>0);$('keyList').innerHTML=rows.map(l=>`<article class="key-card"><div class="card-head"><div><div class="card-title">${esc(l.client?.name||l.plan||l.duration_label||'Key')}</div><div class="meta"><span class="badge ${l.status}">${statusName[l.status]||l.status}</span><span>${esc(l.plan||l.duration_label||'')}</span><span>${l.device_count||0}/${l.max_devices} aparelhos</span></div></div><div class="muted">${l.expires_at?fmt(l.expires_at):'Não ativada'}</div></div><div class="keyline">${esc(l.license_key||l.key_hint||'')}</div><div class="row-actions"><button class="mini" data-key="open" data-id="${l.id}">Abrir</button><button class="mini" data-key="copy" data-id="${l.id}">Copiar</button>${l.client?.phone?`<button class="mini" data-key="whatsapp" data-id="${l.id}">WhatsApp</button>`:''}</div></article>`).join('')}
async function loadClients(){const d=await api({action:'list_clients'});clients=d.clients||[];fillClientSelect();renderClients()}
function renderClients(){const q=norm($('clientSearch').value);const rows=clients.filter(c=>!q||[c.name,c.phone].some(v=>norm(v).includes(q)));$('clientEmpty').classList.toggle('hidden',rows.length>0);$('clientList').innerHTML=rows.map(c=>`<article class="client-card"><div class="card-head"><div><div class="card-title">${esc(c.name)}</div><div class="meta"><span>${c.key_count||0} key(s)</span><span>${c.active_key_count||0} ativa(s)</span></div></div></div><div class="client-phone">${esc(c.phone||'Sem telefone')}</div><div class="row-actions">${c.phone?`<button class="mini" data-client="whatsapp" data-id="${c.id}">WhatsApp</button>`:''}${!c.key_count?`<button class="mini danger" data-client="delete" data-id="${c.id}">Excluir</button>`:''}</div></article>`).join('')}
function fillClientSelect(){const sel=$('createClient');if(!sel)return;const old=sel.value;sel.innerHTML='<option value="">Sem cliente</option>'+clients.map(c=>`<option value="${c.id}">${esc(c.name)}${c.phone?' — '+esc(c.phone):''}</option>`).join('');if([...sel.options].some(o=>o.value===old))sel.value=old}
async function loadRevenue(){const d=await api({action:'list_transactions'});transactions=d.transactions||[];$('revMonth').textContent=money(d.summary?.month);$('revTotal').textContent=money(d.summary?.total);$('revCount').textContent=d.summary?.count||0;renderRevenue()}
function renderRevenue(){const q=norm($('revenueSearch').value);const rows=transactions.filter(t=>!q||[t.client?.name,t.client?.phone,t.note,t.kind].some(v=>norm(v).includes(q)));$('revenueEmpty').classList.toggle('hidden',rows.length>0);$('revenueList').innerHTML=rows.map(t=>`<div class="list-row"><div class="main"><strong>${esc(t.client?.name||t.note||'Venda')}</strong><small>${t.kind==='renewal'?'Renovação':'Venda'} • ${fmt(t.created_at)}${t.note?' • '+esc(t.note):''}</small></div><div class="amount">${money(t.amount)}</div></div>`).join('')}

function openKeyDetail(l){selectedLicense=l;$('kdTitle').textContent=l.client?.name||l.plan||'Detalhes da key';$('kdBody').innerHTML=`<div class="detail-grid"><div class="detail-item"><span>Status</span><strong>${statusName[l.status]||l.status}</strong></div><div class="detail-item"><span>Plano</span><strong>${esc(l.plan||l.duration_label||'—')}</strong></div><div class="detail-item"><span>Cliente</span><strong>${esc(l.client?.name||'Sem cliente')}</strong></div><div class="detail-item"><span>Telefone</span><strong>${esc(l.client?.phone||'—')}</strong></div><div class="detail-item"><span>Aparelhos</span><strong>${l.device_count||0}/${l.max_devices}</strong></div><div class="detail-item"><span>Vencimento</span><strong>${l.expires_at?fmt(l.expires_at):'Não ativada'}</strong></div><div class="detail-item" style="grid-column:1/-1"><span>Key</span><strong>${esc(l.license_key||l.key_hint||'—')}</strong></div></div>`;$('kdToggle').textContent=l.status==='revoked'?'Ativar':'Desativar';$('kdToggle').className=l.status==='revoked'?'success':'danger';$('kdWhatsapp').disabled=!l.client?.phone;openModal('keyDetailModal')}
function syncPlanPrice(selectId,inputId){const p=PLAN[$(selectId).value]||PLAN['1m'];$(inputId).value=p.price}

$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault()
  const login=$('loginEmail').value.trim().toLowerCase()
  const password=$('loginPassword').value
  $('loginError').textContent=''

  if(!/^[a-z0-9._-]{3,40}$/.test(login)){
    $('loginError').textContent='Login inválido.'
    return
  }

  $('loginButton').disabled=true
  const {error}=await supabase.auth.signInWithPassword({
    email:authEmailForLogin(login),
    password
  })
  $('loginButton').disabled=false

  if(error){
    $('loginError').textContent='Login ou senha inválidos.'
    return
  }

  await bootApp()
})
$('logoutButton').addEventListener('click',async()=>{await supabase.auth.signOut();location.reload()});$('blockedLogout').addEventListener('click',async()=>{await supabase.auth.signOut();location.reload()})

document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>setPanel(b.dataset.panel)))
$('mobileMenu').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'))
$('refreshButton').addEventListener('click',()=>loadPanel(activePanel).catch(handleError))
document.querySelectorAll('.close-modal').forEach(b=>b.addEventListener('click',closeModals));document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModals()}))

$('keySearch').addEventListener('input',renderKeys);$('keyFilter').addEventListener('change',renderKeys);$('clientSearch').addEventListener('input',renderClients);$('revenueSearch').addEventListener('input',renderRevenue)
$('createClientButton').addEventListener('click',()=>{$('createClientForm').reset();openModal('createClientModal')})
$('createClientForm').addEventListener('submit',async e=>{e.preventDefault();try{await api({action:'create_client',name:$('clientName').value,phone:$('clientPhone').value});closeModals();await loadClients();flash('Cliente criado.')}catch(err){handleError(err)}})
$('clientList').addEventListener('click',async e=>{const b=e.target.closest('[data-client]');if(!b)return;const c=clients.find(x=>x.id===b.dataset.id);if(!c)return;if(b.dataset.client==='whatsapp'){const u=phoneUrl(c.phone);if(u)window.open(u,'_blank');return}if(b.dataset.client==='delete'){if(!confirm(`Excluir ${c.name}?`))return;try{await api({action:'delete_client',client_id:c.id});await loadClients();flash('Cliente excluído.')}catch(err){handleError(err)}}})

$('createKeyButton').addEventListener('click',async()=>{try{if(!clients.length)await loadClients();$('createKeyForm').reset();$('createPlan').value='1m';$('createDevices').value='1';$('createQuantity').value='1';syncPlanPrice('createPlan','createPrice');fillClientSelect();openModal('createKeyModal')}catch(e){handleError(e)}})
$('createPlan').addEventListener('change',()=>syncPlanPrice('createPlan','createPrice'))
$('createKeyForm').addEventListener('submit',async e=>{e.preventDefault();const p=PLAN[$('createPlan').value];$('submitCreateKey').disabled=true;try{const d=await api({action:'create_keys',duration:$('createPlan').value,plan:p.label,price_paid:$('createPrice').value,max_devices:Number($('createDevices').value),quantity:Number($('createQuantity').value),client_id:$('createClient').value||null,note:$('createNote').value});const keys=(d.created_keys||[]).map(x=>x.license_key);closeModals();$('keyResult').value=keys.join('\n');openModal('keyResultModal');await Promise.all([loadLicenses(),permissions.overview!==false?loadOverview():Promise.resolve()]);flash(`${keys.length} key(s) criada(s).`)}catch(err){handleError(err)}finally{$('submitCreateKey').disabled=false}})
$('copyAllKeys').addEventListener('click',()=>copy($('keyResult').value,'Keys copiadas.'))
$('keyList').addEventListener('click',e=>{const b=e.target.closest('[data-key]');if(!b)return;const l=licenses.find(x=>x.id===b.dataset.id);if(!l)return;if(b.dataset.key==='open'){openKeyDetail(l);return}if(b.dataset.key==='copy'){if(l.license_key)copy(l.license_key,'Key copiada.');else flash('Key completa não disponível.');return}if(b.dataset.key==='whatsapp'){const u=phoneUrl(l.client?.phone);if(u)window.open(u,'_blank')}})
$('kdCopy').addEventListener('click',()=>selectedLicense?.license_key?copy(selectedLicense.license_key,'Key copiada.'):flash('Key completa não disponível.'))
$('kdWhatsapp').addEventListener('click',()=>{const u=phoneUrl(selectedLicense?.client?.phone);if(u)window.open(u,'_blank')})
$('kdReset').addEventListener('click',async()=>{if(!selectedLicense||!confirm('Resetar todos os aparelhos conectados a esta key?'))return;try{await api({action:'reset_devices',license_id:selectedLicense.id});closeModals();await loadLicenses();flash('Aparelhos resetados.')}catch(e){handleError(e)}})
$('kdDevices').addEventListener('click',async()=>{if(!selectedLicense)return;const n=Number(prompt('Novo limite de aparelhos (1 a 20):',selectedLicense.max_devices));if(!Number.isInteger(n)||n<1||n>20)return;try{await api({action:'set_max_devices',license_id:selectedLicense.id,max_devices:n});closeModals();await loadLicenses();flash('Limite atualizado.')}catch(e){handleError(e)}})
$('kdToggle').addEventListener('click',async()=>{if(!selectedLicense)return;const enable=selectedLicense.status==='revoked';if(!enable&&!confirm('Desativar esta key?'))return;try{await api({action:'set_license_status',license_id:selectedLicense.id,enabled:enable});closeModals();await loadLicenses();flash(enable?'Key ativada.':'Key desativada.')}catch(e){handleError(e)}})
$('kdRenew').addEventListener('click',()=>{if(!selectedLicense)return;$('renewPlan').value='1m';syncPlanPrice('renewPlan','renewAmount');closeModals();openModal('renewModal')})
$('renewPlan').addEventListener('change',()=>syncPlanPrice('renewPlan','renewAmount'))
$('renewForm').addEventListener('submit',async e=>{e.preventDefault();if(!selectedLicense)return;try{await api({action:'renew',license_id:selectedLicense.id,duration:$('renewPlan').value,amount:$('renewAmount').value});closeModals();await Promise.all([loadLicenses(),permissions.revenue!==false?loadRevenue():Promise.resolve(),permissions.overview!==false?loadOverview():Promise.resolve()]);flash('Key renovada.')}catch(err){handleError(err)}})

async function start(){
  configureLoginUI()
  const {data:{session:s}}=await supabase.auth.getSession()

  if(!s){
    show('authView')
    hide('passwordView')
    hide('appView')
    hide('blockedView')
    return
  }

  await bootApp()
}
start(){
  const {data:{session:s}}=await supabase.auth.getSession()

  if(passwordFlow){
    if(s){
      showPasswordSetup()
      return
    }

    // Em links de recuperação o Supabase pode levar um instante para
    // transformar os dados da URL em uma sessão. O listener acima assume
    // assim que PASSWORD_RECOVERY/SIGNED_IN for disparado.
    hide('appView')
    hide('blockedView')
    show('authView')
    hide('passwordView')
    $('loginError').textContent='Validando link de recuperação…'
    return
  }

  if(!s){
    show('authView')
    hide('passwordView')
    hide('appView')
    hide('blockedView')
    return
  }

  await bootApp()
}
start()
