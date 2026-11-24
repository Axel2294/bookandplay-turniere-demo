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
run("personnel.active='manager'");
for (const view of ['tournamentsView','overview','setup','participants','registrationView','paymentsView','financeView','drawView','courtsView','resultsView','planView','notificationsView','ladderView','closingView','guideView','permissionsView','playerAccountView']) {
  assert.equal(typeof run(`${view}()`), 'string', `${view} renders`);
}

console.log('PASS: migration/import validation, registration/waitlist, round-robin/groups/KO, bronze match, four sport score profiles, courts/navigation, three incident types, DTB rest periods, planning conflicts, ladder workflow, permissions, and 18 views.');
