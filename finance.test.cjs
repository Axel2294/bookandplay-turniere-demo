const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const file=fs.readFileSync(require('node:path').join(__dirname,'index.html'),'utf8');
const code=file.match(/<script>([\s\S]*)<\/script>/)[1];
new vm.Script(code);
const values=new Map(),storage=new Map();let fail=false;
const element=id=>{if(!values.has(id))values.set(id,{value:'',hidden:true,innerHTML:'',addEventListener(){},classList:{add(){},remove(){},toggle(){}},querySelector(){return null}});return values.get(id)};
const context=vm.createContext({console,Intl,Date,Math,Map,Set,JSON,Number,String,Object,Array,RegExp,Error,Blob,URL,localStorage:{getItem:k=>storage.get(k)??null,setItem(k,v){if(fail)throw Error('quota');storage.set(k,v)}},location:{hash:'',href:'http://localhost/'},document:{getElementById:element,addEventListener(){},querySelectorAll(){return[]},body:{classList:{toggle(){}}}},window:{addEventListener(){},scrollTo(){}},setInterval(){},setTimeout(){},confirm:()=>true,prompt:()=>null,requestAnimationFrame(){}});
// Use the actual application and persistence logic; skip only startup rendering.
vm.runInContext(code.replace(/\nrender\(\);\nonboardingRegisterVisit\(\);/,'\n'),context);
const run=s=>vm.runInContext(s,context);
run(`render=()=>{};notify=()=>{};collection.tournaments=[{id:'one',audit:[],data:normalizeTournament(empty())},{id:'two',audit:[],data:normalizeTournament(empty())}];collection.activeId='one';state=collection.tournaments[0].data;state.name='Bestand';state.players=[{id:'a',name:'Alpha',checked:true},{id:'b',name:'Beta',checked:true}];state.matches=[{id:'m1',a:'a',b:'b',status:'finished',score:'6:4 6:3',winner:'a'}];state.fee={enabled:true,cents:1000,unit:'entry',membersPerEntry:2,method:'cash'};state.paymentRecords={a:{events:[{id:'pay1',type:'paid',cents:1000,at:'2026-11-01',actor:'Alt'}]},b:{events:[{id:'pay2',type:'paid',cents:1000,at:'2026-11-02',actor:'Alt'}]}};writeTournamentCollection(collection);snapshots.clear();for(const r of collection.tournaments)snapshots.set(r.id,JSON.stringify(r.data));`);
const before=run('JSON.stringify(state)'),other=run('JSON.stringify(collection.tournaments[1])');
assert.equal(run('financeSummary().fees'),2000);assert.equal(run('JSON.stringify(state)'),before,'reading does not migrate data');
function fields(v){for(const [k,x]of Object.entries(v))element(k).value=x}
fields({fbKind:'expense',fbLabel:'Bälle',fbAmount:'30,50'});run('financeAddBudget()');
fields({feKind:'income',feLabel:'Sponsoring',feAmount:'100,25',feDate:'2026-11-24',feReceipt:'S1'});run('financeAddEntry()');
fields({fpLabel:'Bälle',fpSupplier:'Sporthaus',fpQuantity:'3',fpAmount:'10,10'});run('financeAddPurchase();globalThis.purchase=state.finance.purchases[0].id');
assert.equal(run('financeSummary().commitments'),3030);
assert.throws(()=>run('financeClose()'),/Beschaffungen/);
run(`financePurchaseStatus(purchase,'ordered');financePurchaseStatus(purchase,'received');financePurchaseStatus(purchase,'paid')`);
assert.throws(()=>run(`financePurchaseStatus(purchase,'paid')`),/Statuswechsel/);
assert.equal(run('financeSummary().expenses'),3030);assert.equal(run('financeSummary().balance'),8995);assert.equal(run('financeSummary().plannedBalance'),-1050);
run('financeClose()');assert.equal(run('state.finance.closed'),true);assert.throws(()=>run('financeAddEntry()'),/wieder öffnen/);assert.throws(()=>run("recordPayment('a','paid')"),/wieder öffnen/);
run('financeReopen();financeReverse(state.finance.entries.find(e=>e.purchaseId).id)');assert.equal(run('financeSummary().balance'),12025);assert.equal(run('state.finance.purchases[0].status'), 'cancelled');
assert.throws(()=>run('financeReverse(state.finance.entries.find(e=>e.purchaseId).id)'),/storniert/);
const current=JSON.parse(run('JSON.stringify(state)')),original=JSON.parse(before);delete current.finance;assert.deepEqual(current,original,'all existing tournament data unchanged');assert.equal(run('JSON.stringify(collection.tournaments[1])'),other,'other tournament untouched');
assert.ok(run('collection.tournaments[0].audit.length')>=8);
const persisted=run('JSON.stringify(state.finance)');fail=true;run('financeAddBudget()');fail=false;assert.equal(run('JSON.stringify(state.finance)'),persisted,'quota failure rolls back');
const priorStorage=storage.get('bap-tournament-demo-v25-collection');storage.set('bap-tournament-demo-v25-collection',priorStorage+' ');assert.throws(()=>run('financeAddBudget()'),/anderen Fenster/);storage.set('bap-tournament-demo-v25-collection',priorStorage);
run("personnel.active='viewer'");assert.throws(()=>run('financeAddBudget()'),/Berechtigung/);assert.throws(()=>run('exportFinance()'),/Berechtigung/);run("personnel.active='manager'");
for(const raw of ['0','-1','NaN','1.001','1e3','','1,2,3'])assert.throws(()=>run(`financeAmount(${JSON.stringify(raw)})`));assert.equal(run("financeAmount('0,29')"),29);
assert.throws(()=>run("financeDate('2026-02-30')"));
assert.ok(run('financeCsvRows().length')>10);assert.equal(run("csvCell('=SUM(A1)')"),'"\'=SUM(A1)"');
run(`state.paymentRecords.old={events:[{type:'paid',cents:400,at:'2026-11-01'}]}`);assert.equal(run('financeSummary().refundReview'),1);assert.equal(run('financeSummary().fees'),2400);assert.throws(()=>run('financeClose()'),/ehemaliger/);
for(const f of ['tournamentsView','overview','setup','participants','registrationView','paymentsView','financeView','drawView','courtsView','resultsView','planView','notificationsView','ladderView','closingView','guideView','permissionsView']){assert.equal(typeof run(f+'()'),'string',f+' renders')}
assert.equal(run('validateFinance(state.finance)===state.finance'),true);assert.throws(()=>run("validateFinance({closed:false,budget:[],entries:null,purchases:[],settlements:[]})"),/Finanzliste/);
console.log('PASS: syntax, read-only upgrade, cent arithmetic, budget, booking, procurement, duplicate prevention, settlement, locks, reversal, full data preservation, isolation, audit, quota rollback, stale-tab protection, permissions, validation, CSV, former participant payments, 17 existing/new views.');
