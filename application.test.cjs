const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
new vm.Script(script);

const values = new Map();
const storage = new Map();
const element = id => {
  if (!values.has(id)) values.set(id, {
    value: '', checked: false, hidden: true, innerHTML: '', textContent: '', disabled: false,
    addEventListener() {}, focus() {}, scrollIntoView() {},
    classList: { add() {}, remove() {}, toggle() {} },
    querySelector() { return null; }
  });
  return values.get(id);
};

const context = vm.createContext({
  console, Intl, Date, Math, Map, Set, JSON, Number, String, Object, Array, RegExp, Error, Blob, URL,
  localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  },
  location: { hash: '', href: 'http://localhost/' },
  document: {
    getElementById: element,
    addEventListener() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    body: { classList: { toggle() {} } }
  },
  window: { addEventListener() {}, scrollTo() {}, print() {} },
  setInterval() {}, setTimeout() {}, requestAnimationFrame() {},
  confirm: () => true,
  prompt: () => null
});

vm.runInContext(script.replace(/\nrender\(\);\nonboardingRegisterVisit\(\);/, '\n'), context);
const run = source => vm.runInContext(source, context);
run('render=()=>{};notify=()=>{}');

function resetTournament(config = '') {
  values.clear();
  run(`
    personnel.active='manager';
    state=normalizeTournament(empty());
    ${config}
    collection={activeId:'test',systemAudit:[],tournaments:[{id:'test',audit:[],data:state}]};
    snapshots.clear();
    writeTournamentCollection(collection);
    snapshots.set('test',JSON.stringify(state));
    resetNavigation('overview');
  `);
}

resetTournament();
assert.equal(run('answerTournamentQuestion("Wie lege ich ein Turnier an?").key'), 'create');
assert.equal(run('answerTournamentQuestion("Wie stelle ich das Startgeld ein?").key'), 'fees');
assert.equal(run('answerTournamentQuestion("Wie sage ich das Turnier ab?").key'), 'cancellation');
assert.equal(run('answerTournamentQuestion("Wo sehe ich die Rückerstattung?").key'), 'payments');
assert.equal(run('answerTournamentQuestion("Wie ist das Wetter morgen?").key'), undefined);
run("personnel.active='viewer'");
assert.equal(run('answerTournamentQuestion("Wo finde ich das Budget?").key'), undefined);
resetTournament();

assert.equal(run('isSetupPlaceholder(collection.tournaments[0])'), true);
run("onboardingStart();guidedSetupMove('next')");
assert.equal(run('guidedSetupRead().step'), 1);
assert.equal(run("guidedSetupReady('tournament',guidedSetupRead())"), false);
run("guidedSetupMove('pause');guidedSetupMemory.clear();onboardingRegisterVisit()");
assert.equal(run('tab'), 'tournaments');
run('onboardingStart()');
assert.equal(run('guidedSetupRead().step'), 1);
run("collection.tournaments[0].data.name='Einrichtungstest';snapshots.set('test',JSON.stringify(state));guidedSetupChoose('test');guidedSetupMove('next')");
assert.equal(run("guidedSetupReady('organizer',guidedSetupRead())"), false);
run("guidedSetupSaved('organizer');guidedSetupMove('next');guidedSetupSaved('configuration')");
assert.equal(run("guidedSetupReady('configuration',guidedSetupRead())"), false);
run("state.eventStart='2027-06-12T10:00';snapshots.set('test',JSON.stringify(state));guidedSetupMove('next');guidedSetupMove('skip')");
assert.equal(run("guidedSetupReady('finish',guidedSetupRead())"), true);
assert.equal(run('guidedSetupRead().skipped'), true);
run("guidedSetupMove('next');personnel.active='trainer'");
assert.equal(run('guidedSetupRead()'), null);
run("personnel.active='viewer'");
assert.equal(run("canOpenTab('guidedSetup')"), false);
resetTournament();

function players(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `p${index + 1}`,
    name: `Team ${index + 1}`,
    checked: true,
    group: null
  }));
}

function setPlayers(count) {
  run(`state.players=${JSON.stringify(players(count))};state.registration.maxEntries=Math.max(state.registration.maxEntries,${count});snapshots.set('test',JSON.stringify(state));writeTournamentCollection(collection)`);
}

// Migration and validation of older tournament records.
const old = { name: 'Altbestand', sport: 'Tennis', format: 'ko', players: [], matches: [] };
run(`globalThis.oldTournament=${JSON.stringify(old)};normalizeTournament(oldTournament)`);
assert.equal(run('oldTournament.courtCount'), 4);
assert.equal(run('oldTournament.stage'), 'draft');
assert.equal(run('oldTournament.cancellation'), null);
assert.deepEqual(JSON.parse(run('JSON.stringify(oldTournament.registration)')), { open: true, maxEntries: 16, waitlist: [], cancelled: [] });
assert.throws(() => run("validateImportTournament({name:'Defekt',sport:'Tennis',format:'ko',players:[],matches:[{id:'m',status:'scheduled',a:'missing'}]})"), /unbekannte Teams/);

// Registration, capacity, FIFO waitlist, duplicate protection and promotion.
resetTournament('state.registration.maxEntries=2');
run("registerParticipant('Team A',false);registerParticipant('Team B',false);registerParticipant('Team C',false)");
assert.equal(run('state.players.length'), 2);
assert.equal(run('state.registration.waitlist.length'), 1);
assert.throws(() => run("registerParticipant('team a',false)"), /bereits angemeldet/);
run('cancelRegistration(state.players[0].id)');
assert.equal(run('state.players.length'), 2);
assert.equal(run('state.registration.waitlist.length'), 0);
assert.equal(run("state.players.some(p=>p.name==='Team C')"), true);
assert.equal(run('state.registration.cancelled.length'), 1);

// Paid online registration: Stripe only, confirmed before the start slot; waitlist remains free.
resetTournament("state.fee={enabled:true,cents:1500,unit:'entry',membersPerEntry:1,method:'stripe'}");
assert.throws(() => run("registerParticipant('Online Team',true,'test')"), /zuerst vollständig über Stripe/);
run("registerParticipant('Online Team',true,'test',{provider:'stripe',status:'paid',sessionRef:'demo_test'})");
assert.equal(run('state.players.length'), 1);
assert.equal(run("state.paymentRecords[state.players[0].id].events[0].method"), 'stripe');
assert.equal(run("state.paymentRecords[state.players[0].id].events[0].cents"), 1500);
assert.equal(run("state.players[0].onlinePayment"), 'stripe_paid_demo');
resetTournament("state.fee={enabled:true,cents:1500,unit:'entry',membersPerEntry:1,method:'stripe'};state.registration.maxEntries=1;state.players=[{id:'full',name:'Belegt',checked:false,group:null}]");
run("registerParticipant('Wartendes Team',true,'test')");
assert.equal(run('state.registration.waitlist.length'), 1);
assert.equal(run("state.registration.waitlist[0].onlinePayment"), 'stripe_required_on_promotion');
assert.equal(run("Object.keys(state.paymentRecords).length"), 0);
assert.doesNotMatch(run('setup()'), /Banküberweisung|Zahlung vor Ort/);

// Player cancellation starts the refund workflow, frees the slot and notifies the promoted team.
resetTournament("state.fee={enabled:true,cents:1500,unit:'entry',membersPerEntry:1,method:'stripe'};state.registration.maxEntries=1;state.players=[{id:'paid1',name:'Bezahltes Team',checked:false,group:null,onlinePayment:'stripe_paid_demo'}];state.registration.waitlist=[{id:'wait1',name:'Wartendes Team',checked:false,group:null,onlinePayment:'stripe_required_on_promotion'}];state.paymentRecords={paid1:{events:[{id:'pay1',type:'paid',cents:1500,at:new Date().toISOString(),method:'stripe',source:'stripe-demo'}]}}");
run("processRegistrationCancellation('paid1',true,'test')");
assert.equal(run('state.registration.cancelled.length'), 1);
assert.equal(run("state.registration.cancelled[0].cancellationProcess.status"), 'stripe_refund_pending');
assert.equal(run("state.registration.cancelled[0].cancellationProcess.refundCents"), 1500);
assert.equal(run("state.players[0].id"), 'wait1');
assert.equal(run("state.players[0].onlinePayment"), 'stripe_pending');
assert.equal(run("state.notifications.some(m=>m.playerId==='paid1'&&m.type==='Abmeldung bestätigt')"), true);
assert.equal(run("state.notifications.some(m=>m.playerId==='wait1'&&m.type==='Nachgerückt')"), true);
assert.throws(() => run("state.format='round';state.players.push({id:'p2',name:'Team 2',checked:true,group:null});state.players[0].checked=true;draw()"), /Stripe-Zahlung abschließen/);
run("stripeCheckoutDraft={kind:'promotion',tournamentId:'test',id:'wait1',name:'Wartendes Team',managementId:'test'};completeStripeDemoCheckout()");
assert.equal(run("state.players.find(p=>p.id==='wait1').onlinePayment"), 'stripe_paid_demo');
assert.equal(run("state.paymentRecords.wait1.events[0].method"), 'stripe');
assert.equal(run("state.notifications.some(m=>m.playerId==='wait1'&&m.type==='Stripe-Zahlung bestätigt')"), true);
run("state.players.forEach(p=>p.checked=true);draw()");
assert.equal(run('state.matches.length'), 1);

// Draw generation for round robin, groups and knock-out.
resetTournament("state.format='round'"); setPlayers(4); run('draw()');
assert.equal(run('state.matches.length'), 6);
assert.equal(run("state.matches.every(m=>m.stage==='group')"), true);

resetTournament("state.format='groups';state.groupSize=4;state.qualify=2"); setPlayers(8); run('draw()');
assert.equal(run('state.matches.length'), 12);
assert.equal(run("new Set(state.players.map(p=>p.group)).size"), 2);

resetTournament("state.format='ko';state.playBronze=true;state.courtCount=2"); setPlayers(4); run('draw()');
assert.equal(run('state.matches.length'), 3);
const semiIds = JSON.parse(run("JSON.stringify(state.matches.filter(m=>!m.dependencies.length).map(m=>m.id))"));
for (const id of semiIds) run(`startMatch(${JSON.stringify(id)},1);finishMatch(${JSON.stringify(id)},'6:4 6:3')`);
assert.equal(run('Boolean(mainFinal().a&&mainFinal().b)'), true);
assert.equal(run("state.matches.filter(m=>m.stage==='bronze').length"), 1);
assert.equal(run("phaseLabel(bronzeMatch())"), 'Spiel um Platz 3');

// Sport-specific score rules and invalid inputs.
resetTournament();
assert.equal(run("parseTennisScore('6:4 6:3').winnerIndex"), 0);
assert.equal(run("parseTennisScore('4:6 6:3 [10:7]').winnerIndex"), 0);
assert.throws(() => run("parseTennisScore('6:4 6:3 6:0')"), /bereits entschieden|maximal/);
run("state.tennisDecider='full'");
assert.equal(run("parseTennisScore('6:4 4:6 6:3').winnerIndex"), 0);
run("state.sport='Padel';state.tennisDecider='matchtb'");
assert.equal(run("parseSportScore('6:3 3:6 [10:8]').winnerIndex"), 0);
run("state.sport='Pickleball'");
assert.equal(run("parseSportScore('11:7 12:10').winnerIndex"), 0);
assert.throws(() => run("parseSportScore('11:10 11:9')"), /Vorsprung/);
run("state.sport='Beachvolleyball'");
assert.equal(run("parseSportScore('21:18 17:21 15:12').winnerIndex"), 0);

// Court conflicts, result persistence and navigation back to courts.
resetTournament("state.format='round';state.courtCount=2"); setPlayers(3);
run("state.matches=[createMatch('p1','p2','Liga','group'),createMatch('p1','p3','Liga','group'),createMatch('p2','p3','Liga','group')];snapshots.set('test',JSON.stringify(state));writeTournamentCollection(collection)");
const firstMatch = run('state.matches[0].id');
const secondMatch = run('state.matches[1].id');
run(`startMatch(${JSON.stringify(firstMatch)},1)`);
assert.throws(() => run(`startMatch(${JSON.stringify(secondMatch)},2)`), /spielt bereits/);
run(`finishMatch(${JSON.stringify(firstMatch)},'6:4 6:3')`);
assert.equal(run('state.matches[0].court'), 1);
assert.equal(run('reportCourt(state.matches[0])'), 1);
run("showTab('courts');openMatchResult(state.matches[1].id,true);backToCourts()");
assert.equal(run('tab'), 'courts');

// Day-of-event incidents: no-show, walkover, withdrawal and injury retirement.
resetTournament("state.format='round'"); setPlayers(2);
run("state.matches=[createMatch('p1','p2','Liga','group')];snapshots.set('test',JSON.stringify(state));writeTournamentCollection(collection);markParticipantNoShow('p1')");
assert.equal(run("participantEventStatus('p1')"), 'no_show');
assert.equal(run('availableMatches().length'), 0);
run('finishMatchByWalkover(state.matches[0].id)');
assert.equal(run('state.matches[0].outcome'), 'walkover');
assert.equal(run('state.matches[0].winner'), 'p2');

resetTournament("state.format='round'"); setPlayers(2);
run("state.matches=[createMatch('p1','p2','Liga','group')];snapshots.set('test',JSON.stringify(state));writeTournamentCollection(collection);withdrawParticipant('p1');finishMatchAfterWithdrawal(state.matches[0].id)");
assert.equal(run('state.matches[0].outcome'), 'withdrawal');
assert.equal(run('state.matches[0].winner'), 'p2');

resetTournament("state.format='round'"); setPlayers(2);
run("state.matches=[createMatch('p1','p2','Liga','group')];snapshots.set('test',JSON.stringify(state));writeTournamentCollection(collection);startMatch(state.matches[0].id,1);finishMatchByRetirement(state.matches[0].id,'p1')");
assert.equal(run('state.matches[0].outcome'), 'retirement');
assert.equal(run('state.matches[0].winner'), 'p2');

// DTB rest-period warning.
resetTournament("state.ruleProfile='dtb';state.sport='Tennis'"); setPlayers(3);
run(`state.matches=[
  {id:'done',a:'p1',b:'p2',status:'finished',startedAt:new Date(Date.now()-45*60000).toISOString(),finishedAt:new Date(Date.now()-5*60000).toISOString(),winner:'p1',loser:'p2',score:'6:2 6:2',court:1,stage:'group'},
  createMatch('p1','p3','Liga','group')
];snapshots.set('test',JSON.stringify(state));writeTournamentCollection(collection)`);
assert.match(run("matchRestProblem(state.matches[1])"), /Ruhepause/);

// Planning conflicts and draft validation.
resetTournament("state.format='round';state.courtCount=2;state.eventStart=new Date(Date.now()+3600000).toISOString().slice(0,16)"); setPlayers(4);
run("state.matches=[createMatch('p1','p2','Liga','group'),createMatch('p3','p4','Liga','group')];snapshots.set('test',JSON.stringify(state));writeTournamentCollection(collection)");
const future = run('Math.floor((Date.now()+7200000)/60000)*60000');
run(`planMatchDraft(state.matches[0].id,${future},1)`);
assert.throws(() => run(`planMatchDraft(state.matches[1].id,${future},1)`), /belegt/);
run(`planMatchDraft(state.matches[1].id,${future},2)`);
assert.equal(run('plannerConflicts(schedulePreview()).length'), 0);

// Ladder initialization, classic target rules, challenge acceptance and ranking change.
resetTournament("state.format='ladder';state.sport='Tennis'"); setPlayers(6); run('ladderInit()');
assert.deepEqual(JSON.parse(run("JSON.stringify(ladderTargets('p6'))")), ['p4', 'p5']);
element('ladderFrom').value = 'p6'; element('ladderTo').value = 'p5';
run('ladderChallenge()');
const challenge = run('state.ladder.challenges[0].id');
run(`ladderAnswer(${JSON.stringify(challenge)},true)`);
element('ladderWin' + challenge).value = 'p6'; element('ladderScore' + challenge).value = '6:4 6:3';
run(`ladderComplete(${JSON.stringify(challenge)})`);
assert.equal(run("state.ladder.ranks.indexOf('p6')"), 4);
assert.equal(run('state.ladder.challenges[0].status'), 'finished');

// Role restrictions and complete view rendering.
resetTournament(); setPlayers(2);
run("personnel.active='viewer'");
assert.throws(() => run('draw()'), /Keine Berechtigung/);
assert.throws(() => run("cancelTournament('test','Krankheit')"), /Nur Vereinsmanager und Trainer/);
run("personnel.active='director'");
assert.throws(() => run("cancelTournament('test','Krankheit')"), /Nur Vereinsmanager und Trainer/);
run("personnel.active='manager'");
assert.throws(() => run("setDeploymentMode('standalone')"), /Nur Root/);
run("personnel.active='root';setDeploymentMode('standalone')");
assert.equal(run('deploymentMode'), 'standalone');
assert.equal(storage.get('bap-tournament-demo-v38-deployment-mode'), 'standalone');
assert.match(run('deploymentModeOverview()'), /Eigenständige Turnierverwaltung/);
run("setDeploymentMode('integrated')");
run("personnel.active='trainer';state.registration.waitlist=[{id:'wait1',name:'Wartendes Team'}];cancelTournament('test','Zu geringe Beteiligung','Mindestzahl nicht erreicht')");
assert.equal(run('state.stage'), 'cancelled');
assert.equal(run('state.cancellation.reason'), 'Zu geringe Beteiligung');
assert.equal(run("state.notifications.filter(m=>m.type==='Turnier abgesagt').length"), 3);
assert.throws(() => run("state.name='Nicht erlaubt';save()"), /zuerst die Absage zurücknehmen/);
run("restoreTournament('test')");
assert.equal(run('state.stage'), 'draft');
assert.equal(run('state.cancellation'), null);
assert.equal(run("state.notifications.filter(m=>m.type==='Turnierabsage zurückgenommen').length"), 3);
run("personnel.active='manager'");
for (const view of ['tournamentsView','overview','setup','participants','registrationView','paymentsView','financeView','drawView','courtsView','resultsView','planView','notificationsView','ladderView','closingView','featureOverviewView','guideView','permissionsView','playerAccountView']) {
  assert.equal(typeof run(`${view}()`), 'string', `${view} renders`);
}
assert.match(run('featureOverviewView()'), /Alles für den Turniertag/);
assert.match(run('featureOverviewView()'), /Datenbankanbindung/);
assert.equal(run("menuForTab('features')"), 'finish');

console.log('PASS: migration/import validation, registration/waitlist, Stripe-only paid online registration, player cancellation/refund/promotion workflow, round-robin/groups/KO, bronze match, four sport score profiles, courts/navigation, three incident types, DTB rest periods, planning conflicts, ladder workflow, Root-only deployment mode, manager/trainer cancellation with participant notifications, permissions, feature overview, and 19 views.');
