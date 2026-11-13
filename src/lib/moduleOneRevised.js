export const REVISION = 'founder-2026-11-13';
export const LESSONS = [
 {code:'R1-L1',title:"Who Am I Beyond What I've Always Known?",purpose:'Separate what you have noticed from the roles, expectations, and explanations attached to it.'},
 {code:'R1-L2',title:'How Does My Mind Work?',purpose:'Compare personality, attention, motivation, and circumstances without turning them into a fixed type.'},
 {code:'R1-L3',title:"What Haven’t I Discovered Yet?",purpose:'Meet unfamiliar processes, notice your response, and choose how to keep exploring.'}
];
export const KINDS = ['Personal observation','Question','Interest','Possible ability','Hypothesis or interpretation','Unexplored possibility'];
export const DOORS = [
 {id:'sound',title:'Build a sound scene',steps:['Imagine rain, a door closing, and footsteps.','Arrange those sounds to suggest someone arriving—or leaving.','Change just the order. What changed in the story?'],question:'Did arranging, imagining, or interpreting draw you in—or none of those?',outward:'Sound editing, field recording, theatre sound, oral history'},
 {id:'access',title:'Inspect an everyday process',steps:['Imagine a library that accepts bookings only by phone, 9–5.','Trace the steps for someone working those hours.','Change one step to make access easier. What new problem might it create?'],question:'Did noticing barriers, redesigning steps, or weighing trade-offs catch your attention?',outward:'Service design, accessibility review, operations, community research'},
 {id:'nature',title:'Compare before naming',steps:['Imagine three leaves: narrow and waxy; broad and thin; small and hairy.','Group them in two different ways without needing species names.','Name one thing you would need to observe outdoors before explaining the differences.'],question:'Did comparing shapes, inventing categories, or forming questions draw you in?',outward:'Field observation, botanical illustration, ecology, collection management'},
 {id:'repair',title:'Trace a fault',steps:['A fictional desk lamp does not light. Its bulb works in another lamp.','List two possible explanations without taking anything apart.','Choose a safe next check: try a known working outlet. What would either result tell you? Never open or handle live electrical equipment.'],question:'Did narrowing explanations, checking evidence, or restoring usefulness interest you?',outward:'Troubleshooting, quality assurance, repair cafés, technical support'}
];
export function blankReview(){return {revision:REVISION,answers:{},finished:{},map:[],lesson:0};}
export function reviseEntry(entry,text,kind){return {...entry,text,kind,revision:(entry.revision||1)+1,history:[...(entry.history||[]),{text:entry.text,kind:entry.kind,revision:entry.revision}],updatedAt:new Date().toISOString()};}
export function sourceChanged(entry,answers){return entry.sourceKey && (answers[entry.sourceKey]||'') !== entry.sourceText;}
