/* OrthoRef 漢方処方モジュール (kampo.js)
 * index.html の末尾（</body> の直前）に <script src="kampo.js"></script> を1行追加するだけで有効になる。
 * 既存ファイルの中身には触れず、次の3つを実行時に差し込む:
 *   1) 画面 #scr-kampo（#app 内、下部ナビの手前）
 *   2) ホーム画面のクイックアクセスに「漢方処方」ボタン
 *   3) 全文検索 SEARCH_INDEX に漢方の項目
 * 出典タグ P=ツムラ「整形外科領域のおすすめ漢方処方」(監修:田中裕之) / E=PEPARS No.208(2024)88-96 冨澤英明 / C=ペインクリニック冊子
 * amt:'src' = 甘草・附子量が提供資料から確認できた値 / 'ext' = 資料に記載なし(一般的な添付文書値を暫定入力。要確認)
 * cinn: 0=桂皮なし 1=桂皮/桂枝含有(資料で確認) 2=含有(資料外・要確認) */
(function(){
'use strict';

/* ============ DATA ============ */
var FORMULAS=[
{tj:28,name:'越婢加朮湯',lic:2,acon:0,mao:true,cinn:0,amt:'ext',acute:true,cat:'acute',src:['E'],
 use:'超急性〜急性の強い炎症（発赤・熱感・腫脹、水疱、関節水腫）。外傷・術後・表層感染・痛風/偽痛風の初期・ヘバーデン結節の急性期。',
 pearls:['麻黄の含有量は保険収載漢方で最多。3日ほどで著効しやすく、症状が消えたら中止してよいと指導する','皮膚・浅い皮下組織の炎症所見（視診・触診で確認できる）が強いときに選ぶ','胃腸が弱く強い痛みがなければ回避、または数日限定（麻黄の胃腸障害）','急性期は数日〜1週間の処方にとどめる']},
{tj:125,name:'桂枝茯苓丸加薏苡仁',lic:0,acon:0,mao:false,cinn:1,amt:'src',acute:true,cat:'acute',src:['E'],
 use:'外傷・術後のうっ血、血腫、皮下出血、静脈還流不良。急性期の軸になる処方。',
 pearls:['25番との違いは薏苡仁（筋内浮腫の軽減、各生薬量が増える）。運動器では125を優先（筆者）','手術前後、小さな縫合創でも合併症予防目的で処方（筆者）','糖尿病では術後うっ血・血腫が引きにくく感染リスクも上がる','血腫の使い分け: 軟部組織=桂枝茯苓丸、骨周囲=治打撲一方、皮下血腫=通導散(105)']},
{tj:114,name:'柴苓湯',lic:2,acon:0,mao:false,cinn:1,amt:'src',acute:true,cat:'neuro',src:['P','E'],
 use:'急性期の神経損傷・神経障害性疼痛、炎症に伴う間質の浮腫、術後・骨折後のむくみ。',
 pearls:['五苓散(17)＋小柴胡湯(9)の合方。末梢神経の浮腫と異常発火の両方を狙う','神経を扱う術式、皮神経損傷、椎間板ヘルニア初期の神経痛','皮膚所見が乏しく皮下の浮腫性変化が主体なら越婢加朮湯でなくこちら','神経が落ち着いたら五苓散へ切り替え（保険漢方で薬価が最も高い）']},
{tj:89,name:'治打撲一方',lic:1.5,acon:0,mao:false,cinn:2,amt:'src',acute:true,cat:'acute',src:['P','E'],
 use:'打撲による腫脹・疼痛。骨膜下血腫を伴う外傷、骨挫傷、骨折、骨髄炎、骨端症。',
 pearls:['骨周囲まで及ぶ深い打撲向き。転位の強い骨折より骨挫傷・ヒビ・圧迫骨折・不顕性骨折（舟状骨など）','ギプス保存加療では安定化と浮腫改善を期待して併用','骨内血腫が吸収される外傷後2〜3週で不要になることが多い','痛みが強ければ越婢加朮湯、神経痛と浮腫が強ければ柴苓湯と併用','MRIで骨挫傷所見のある慢性骨痛、成長期の骨端症にも']},
{tj:1,name:'葛根湯',lic:2,acon:0,mao:true,cinn:1,amt:'src',cat:'sub',src:['P','E'],
 use:'肩こり（項背部のこわばり）、頚〜肩〜肘周囲で上肢の重みによる筋牽引痛。術後リハ期、夜間に腕の置き場がない、腱鞘炎・テニス肘。',
 pearls:['越婢加朮湯から切り替えるマイルドな麻黄剤（麻黄量は約半分）','125の併用を推奨（筆者）','術後は筋量が一時的に減り腕の重みを感じやすい時期がある']},
{tj:17,name:'五苓散',lic:0,acon:0,mao:false,cinn:1,amt:'src',cat:'sub',src:['E'],
 use:'間質の浮腫、神経の浮腫性変化（低気圧でしびれが悪化）、手根管症候群・腱鞘炎。',
 pearls:['柴苓湯から小柴胡湯が不要になった時点での切り替え先','125の併用は継続を推奨','柴苓湯は五苓散を含む合方なので同時処方は重複']},
{tj:18,name:'桂枝加朮附湯',lic:2,acon:0.5,mao:false,cinn:1,amt:'src',cat:'chronic',src:['P','E','C'],
 use:'冷えで増悪する拘縮性・慢性の痛み全般。四肢関節が冷えると痛む、骨粗鬆症やRAの疼痛。ヘバーデン結節の冷え痛、ギプス後の手指拘縮。',
 pearls:['温める鎮痛薬の第一選択（筆者）。副作用はほぼ出ず、NSAIDsが飲めない胃腸虚弱にも使える','華奢で冷え症の体質。毎年冬に出る腰痛・膝のこわばりに','効果判定は3〜4週。3週を過ぎないと実感されないことが多い','効果が乏しく冷えがあればブシ末を追加（1日0.5g程度から漸増）']},
{tj:53,name:'疎経活血湯',lic:1,acon:0,mao:false,cinn:0,amt:'src',cat:'chronic',src:['P','E'],
 use:'冷えで増悪し瘀血（静脈系のうっ血・出血関連の症候群）を伴う腰痛・関節痛。糖尿病・血管疾患既往など全身的な血行不良がある慢性の運動器痛。',
 pearls:['キーワードは「風呂で楽になる」冷え症','冷えて拘縮した術後の糖尿病患者に処方する機会が多い（筆者）','四肢の暗色調（ヘモジデリン沈着）が改善した例あり（筆者の経験）']},
{tj:24,name:'加味逍遙散',lic:1.5,acon:0,mao:false,cinn:0,amt:'ext',cat:'neuro',src:['E','C'],
 use:'痛みが時間的・空間的に非特異的（うつろう）な病態、心因性疼痛、更年期の不定愁訴・イライラ・ほてり。',
 pearls:['男性にも処方可','診察ごとに痛む場所が違う、同日に移動・不規則に増減する訴えで試す','上半身の痛みには葛根湯と組むことが多い（追突後のむち打ちなど）']},
{tj:68,name:'芍薬甘草湯',lic:6,acon:0,mao:false,cinn:0,amt:'src',prn:true,cat:'muscle',src:['P','E','C'],
 use:'筋肉の痙攣に伴う痛み、こむら返り、有痛性筋痙攣。',
 pearls:['数分で効くとの報告。必ず頓服で使う（3包分3だと甘草6g/日）','頓服1包あたり甘草は約2g']},
{tj:107,name:'牛車腎気丸',lic:0,acon:1,mao:false,cinn:2,amt:'src',cat:'spine',src:['P','C'],
 use:'冷え・浮腫・しびれ・下肢痛を伴う腰痛。腰下肢痛、糖尿病性神経障害。',
 pearls:['附子含有。動悸などの循環器症状に注意']},
{tj:7,name:'八味地黄丸',lic:0,acon:0.5,mao:false,cinn:2,amt:'ext',cat:'spine',src:['C'],
 use:'腰痛（ペインクリニックで用いられる処方として記載）。',
 pearls:['提供資料には適応の記載のみ。牛車腎気丸との使い分けの根拠は資料内にない']},
{tj:38,name:'当帰四逆加呉茱萸生姜湯',lic:2,acon:0,mao:false,cinn:2,amt:'ext',cat:'spine',src:['C'],
 use:'冷えに伴う腰下肢痛（ペインクリニックで用いられる処方として記載）。',
 pearls:['当帰（血管新生作用）を含む','提供資料には適応の記載のみ']},
{tj:20,name:'防已黄耆湯',lic:1.5,acon:0,mao:false,cinn:0,amt:'src',cat:'joint',src:['P','C'],
 use:'膝関節の腫脹・疼痛（変形性膝関節症の膝痛）。むくみやすい水太り体質。',
 pearls:['蒼朮含有。関節内の水腫（水毒）を引かせるイメージ']},
{tj:97,name:'大防風湯',lic:1.5,acon:1,mao:false,cinn:0,amt:'src',cat:'joint',src:['P'],
 use:'慢性化した関節の腫脹・疼痛（関節炎・関節リウマチ）。',
 pearls:['附子含有。動悸などの循環器症状に注意']},
{tj:54,name:'抑肝散',lic:1.5,acon:0,mao:false,cinn:0,amt:'src',cat:'neuro',src:['P','E'],
 use:'疼痛による神経過敏、イライラ。',
 pearls:['柴胡含有（神経の異常な発火・メンタル系の過剰反応を鎮める）']},
{tj:41,name:'補中益気湯',lic:1.5,acon:0,mao:false,cinn:0,amt:'src',cat:'sys',src:['P','C'],
 use:'高齢者の虚弱（フレイル）・全身倦怠感。帯状疱疹後神経痛（ペインクリニック冊子）。',
 pearls:['疼痛領域での位置づけは資料に簡潔な記載のみ']},
{tj:108,name:'人参養栄湯',lic:1,acon:0,mao:false,cinn:2,amt:'src',cat:'sys',src:['P'],
 use:'高齢者のフレイル・全身倦怠感に、手足の冷え・貧血を伴う場合。',
 pearls:['補中益気湯との違いは冷えと貧血の有無']},
{tj:48,name:'十全大補湯',lic:1.5,acon:0,mao:false,cinn:2,amt:'ext',cat:'sys',src:['C'],
 use:'術後の貧血、食欲不振、全身倦怠感。',
 pearls:['提供資料には適応の記載のみ']},
{tj:62,name:'防風通聖散',lic:2,acon:0,mao:true,maoExt:true,cinn:0,amt:'src',cat:'sys',src:['P'],
 use:'肥満症で体力があり便秘を伴う。',
 pearls:['麻黄含有（この含有情報は資料外のため添付文書で確認）']}
];
var FM={};FORMULAS.forEach(function(f){f.id=String(f.tj);FM[f.id]=f;});
var SRC={P:'ツムラ資料',E:'PEPARS 2024',C:'ペインクリニック冊子'};
var CATS=[['all','すべて'],['acute','急性・外傷'],['sub','亜急性'],['chronic','慢性・冷え'],['spine','腰痛・下肢痛'],['joint','関節'],['neuro','神経・心因'],['muscle','筋痙攣'],['sys','全身状態']];

var SCN=[
{id:'acute',t:'周術期・外傷\n急性期',hint:'外傷直後〜術後3〜7日。可能なら3剤を2包分2で。自治体によっては併用が2剤までに制限されるため、その場合は125を軸に28か114を選ぶ。',
 picks:[['125','軸。血腫・うっ血・静脈還流の改善'],['28','皮膚の発赤・熱感・水疱など表層の炎症所見が強い'],['114','神経を扱う術式／皮膚所見が乏しく皮下の浮腫性変化が主体']],
 sets:[['125＋28（炎症所見が強い）',['125','28'],7],['125＋114（神経・浮腫）',['125','114'],7],['3剤 125＋28＋114',['125','28','114'],7]]},
{id:'bruise',t:'打撲・骨挫傷\n不顕性骨折',hint:'骨膜下血腫・骨内血腫を想定。外傷後2〜3週で不要になることが多い。',
 picks:[['89','骨周囲まで及ぶ打撲・骨挫傷・圧迫骨折。ギプス併用も'],['28','痛みが強い場合に併用'],['114','神経痛と浮腫が強い場合に併用']],
 sets:[['89 単独',['89'],14],['89＋28',['89','28'],14],['89＋114',['89','114'],14]]},
{id:'sub',t:'亜急性期\nリハ開始期',hint:'術後しばらく経ち、リハを始める時期。処方は2週間程度。',
 picks:[['1','上肢の重みによる筋牽引痛・肩こり。125を併用'],['17','上肢の浮腫・低気圧でのしびれ・手根管・腱鞘炎。125を併用'],['125','継続（血腫・うっ血の残存）']],
 sets:[['葛根湯＋125',['1','125'],14],['五苓散＋125',['17','125'],14]]},
{id:'chronic',t:'慢性期・拘縮\n冷えで悪化',hint:'拘縮が取りきれない、痛みが異常に続く場合。3〜4週で効果判定。VASだけで判断しない（体の温まり、動きの改善が先に出る）。',
 picks:[['18','冷えをきっかけに悪化する拘縮性の痛み。第一選択'],['53','全身的な血行不良（糖尿病・血管疾患既往）。「風呂で楽になる」'],['24','痛みの場所・程度が移ろう／心因性が疑われる']],
 sets:[['桂枝加朮附湯',['18'],28],['疎経活血湯',['53'],28]]},
{id:'lumbar',t:'腰痛・下肢痛',hint:'腰痛の区分はツムラ資料とペインクリニック冊子の記載を並べたもの。使い分けの根拠が薄い項目は注記している。',
 picks:[['53','冷えで増悪し瘀血を伴う腰痛（ツムラ資料）'],['107','冷え・浮腫・しびれ・下肢痛、糖尿病性神経障害'],['38','冷えに伴う腰下肢痛（PC冊子）'],['7','腰痛（PC冊子。適応の記載のみ）'],['18','毎年冬に出る腰痛など冷えがきっかけ']],
 sets:[['疎経活血湯',['53'],28],['牛車腎気丸',['107'],28]]},
{id:'joint',t:'関節痛\n変形性膝・RA',hint:'急性の強い炎症（痛風/偽痛風初期、ヘバーデン急性期、RA滑膜炎）は越婢加朮湯。慢性は冷えと腫脹の有無で分ける。',
 picks:[['20','膝関節の腫脹・疼痛（変形性膝関節症）'],['18','四肢関節が冷えると痛む、骨粗鬆症やRAの疼痛'],['53','冷えで増悪し瘀血を伴う'],['97','慢性化した関節の腫脹・疼痛（RA等）'],['28','急性の強い炎症（熱感・腫脹）。炎症性疾患ならNSAIDs併用は許容と記載']],
 sets:[['防已黄耆湯',['20'],28],['桂枝加朮附湯',['18'],28]]},
{id:'cramp',t:'筋痙攣\nこむら返り',hint:'頓服で使う。定期内服にしない。',
 picks:[['68','筋肉の痙攣に伴う痛み。頓服、1包あたり甘草約2g']],
 sets:[['芍薬甘草湯 頓服',['68'],0]]},
{id:'neuro',t:'神経障害性・心因性\n不定愁訴',hint:'神経損傷の急性期は柴苓湯、慢性の心因性・不定愁訴は柴胡含有処方。',
 picks:[['114','急性期の神経損傷・神経障害性疼痛'],['24','痛みが移ろう、更年期のイライラ・ほてり'],['54','疼痛による神経過敏・イライラ'],['41','帯状疱疹後神経痛（PC冊子）']],
 sets:[['柴苓湯',['114'],7],['加味逍遙散',['24'],28]]},
{id:'frail',t:'術後・高齢者\n体力低下',hint:'ツムラ資料とPC冊子の記載。',
 picks:[['41','高齢者のフレイル・全身倦怠感'],['108','上記に手足の冷え・貧血を伴う'],['48','術後の貧血・食欲不振・全身倦怠感（PC冊子）']],
 sets:[['補中益気湯',['41'],28],['人参養栄湯',['108'],28]]},
{id:'edema',t:'むくみ・肥満',hint:'術後・骨折後のむくみは柴苓湯、水太りは防已黄耆湯。',
 picks:[['114','術後・骨折後のむくみ'],['17','神経・間質の浮腫（柴苓湯からの切り替え先）'],['20','むくみやすく水太り体質'],['62','体力があり便秘を伴う肥満']],
 sets:[['柴苓湯',['114'],14],['防已黄耆湯',['20'],28]]}
];
var FLAGS=[['gi','胃腸が弱い'],['diu','利尿薬・ステロイド内服'],['cvu','高血圧・心疾患・排尿障害'],['cin','シナモン過敏'],['lac','乳糖不耐'],['nsaid','NSAIDs常用中']];
var PACKS={'3':'3包 分3','2':'2包 分2','1':'1包 分1','prn':'頓服 1回1包'};

/* ============ LOGIC (pure) ============ */
function r1(x){return Math.round(x*10)/10;}
function itemWarns(f,fl){var w=[];
 if(f.mao&&fl.gi)w.push(['warn','麻黄: 胃腸障害に注意。強い痛みがなければ回避か数日限定（PEPARS）']);
 if(f.mao&&fl.cvu)w.push(['warn','麻黄: 高血圧・心疾患・排尿障害では慎重に（一般的な添付文書の注意。提供資料外のため要確認）']);
 if(f.lic>0&&fl.diu)w.push(['warn','甘草 '+f.lic+'g/日: 利尿薬・ステロイド併用中は偽アルドステロン症・低カリウム血症が出やすい（PEPARS）']);
 if(f.lic>=1.5&&fl.cvu)w.push(['info','甘草: 血圧上昇・浮腫の悪化に注意']);
 if(f.acon>0&&fl.cvu)w.push(['info','附子: 動悸などの循環器症状（ツムラ資料）']);
 if(f.cinn&&fl.cin)w.push(['warn','桂皮（シナモン）含有'+(f.cinn===2?'（提供資料外・要確認）':'')+': アレルギー歴あり']);
 if(f.acute&&fl.nsaid)w.push(['info','NSAIDs併用: 筆者は外傷・術後・感染での併用を控える立場（私見でエビデンスは弱い）。RA・痛風・偽痛風発作は併用可と記載']);
 return w;}
function eff(cart){
 var n=cart.filter(function(c){return c.pack!=='prn'&&!(FM[c.id].prn&&!c.pack);}).length;
 return cart.map(function(c){var f=FM[c.id],p=c.pack;if(!p)p=f.prn?'prn':(n>=2?2:3);return {id:c.id,pack:c.pack,p:p};});}
function totals(cart){var lic=0,acon=0,licPrn=0,ext=false;
 eff(cart).forEach(function(c){var f=FM[c.id];if(f.amt==='ext')ext=true;
  if(c.p==='prn')licPrn+=f.lic/3;else{lic+=f.lic*c.p/3;acon+=f.acon*c.p/3;}});
 return {lic:lic,acon:acon,licPrn:licPrn,ext:ext};}
function cartChecks(cart,fl){var out=[],E=eff(cart),reg=E.filter(function(c){return c.p!=='prn';}),t=totals(cart),ids=cart.map(function(c){return c.id;});
 function nm(a){return a.map(function(c){return FM[c.id].name;}).join('・');}
 if(t.lic>2)out.push(['warn','甘草 計'+r1(t.lic)+'g/日（定期内服分）。筆者は2g/日以下ならほぼ発症しないとしている。むくみ・血圧・低K（ミオパチー）に注意し、足がむくんだら中止して再診するよう指導']);
 var mao=reg.filter(function(c){return FM[c.id].mao;});if(mao.length>=2)out.push(['warn','麻黄含有処方の重複（'+nm(mao)+'）。越婢加朮湯→葛根湯は同時でなく「切り替え」（麻黄量は約半分）']);
 var ac=reg.filter(function(c){return FM[c.id].acon>0;});if(ac.length>=2)out.push(['warn','附子含有処方の重複（'+nm(ac)+'）。動悸などの循環器症状に注意']);
 if(ids.indexOf('114')>=0&&ids.indexOf('17')>=0)out.push(['warn','柴苓湯は五苓散を含む合方。同時処方は重複']);
 if(reg.length>=3)out.push(['info','3剤併用は総量が多くなるため2包分2とする運用（PEPARS）。自治体により併用が2剤までに制限される場合あり']);
 if(E.some(function(c){return c.p==='prn'&&c.id==='68';}))out.push(['info','芍薬甘草湯は頓服。3包分3の定期内服だと甘草6g/日']);
 if(fl.lac)out.push(['info','乳糖不耐: エキス製剤の基材に乳糖が含まれ、稀に下痢が続く']);
 cart.forEach(function(c){itemWarns(FM[c.id],fl).forEach(function(w){out.push([w[0],FM[c.id].name+' — '+w[1]]);});});
 return out;}
function rxText(cart,days){var E=eff(cart),L=['【漢方処方】'];
 E.forEach(function(c,i){var f=FM[c.id];
  if(c.p==='prn')L.push((i+1)+') ツムラ'+f.name+'(TJ-'+f.tj+') 頓服 疼痛時1回1包 10回分');
  else L.push((i+1)+') ツムラ'+f.name+'(TJ-'+f.tj+') '+c.p+'包 分'+c.p+' 食前 '+days+'日分');});
 var t=totals(cart);L.push('※定期内服分 甘草 '+r1(t.lic)+'g/日・附子 '+r1(t.acon)+'g/日'+(t.ext?'（一部は資料外の暫定値）':''));
 return L.join('\n');}

if(typeof module!=='undefined'&&module.exports)module.exports={FORMULAS:FORMULAS,FM:FM,SCN:SCN,itemWarns:itemWarns,eff:eff,totals:totals,cartChecks:cartChecks,rxText:rxText};
if(typeof document==='undefined')return;

/* ============ UI (OrthoRef デザイン準拠) ============ */
var S={tab:'scn',scn:null,cat:'all',q:'',flags:{},cart:[],days:14,sheet:false};
try{var sv=JSON.parse(localStorage.getItem('orthoref_kampo')||'{}');if(sv.flags)S.flags=sv.flags;if(sv.cart)S.cart=sv.cart.filter(function(c){return FM[c.id];});if(sv.days)S.days=sv.days;}catch(e){}
function save(){try{localStorage.setItem('orthoref_kampo',JSON.stringify({flags:S.flags,cart:S.cart,days:S.days}));}catch(e){}}
function $(s){return document.querySelector(s);}

var css=document.createElement('style');
css.textContent='#scr-kampo{position:relative}'
+'.kp-sc-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}'
+'.kp-sc{background:var(--bg1);border:.5px solid var(--border);border-radius:12px;padding:11px 12px;color:var(--text1);font-size:13px;font-weight:600;text-align:left;line-height:1.4;cursor:pointer;-webkit-user-select:none}'
+'.kp-sc.on{border-color:var(--acc);background:rgba(45,125,210,.2);color:var(--acc2)}'
+'.kp-hint{background:rgba(45,125,210,.1);border:.5px solid rgba(45,125,210,.3);border-radius:10px;padding:10px 12px;font-size:12px;color:var(--text2);line-height:1.7;margin-bottom:10px}'
+'.kp-set{width:100%;background:none;border:1px dashed var(--acc);color:var(--acc2);border-radius:10px;padding:10px 12px;font-size:13px;text-align:left;margin-bottom:6px;cursor:pointer}'
+'.kp-role{font-size:12px;font-weight:600;color:var(--acc2);margin-bottom:4px}'
+'.kp-use{font-size:13px;line-height:1.6}'
+'.kp-amt{font-size:11px;color:var(--text2);margin:6px 0}.kp-amt b{color:var(--text1)}'
+'.kp-w{border-radius:8px;padding:7px 10px;margin:6px 0;font-size:12px;line-height:1.6}'
+'.kp-w.warn{background:rgba(255,179,71,.12);border:.5px solid rgba(255,179,71,.3);color:var(--amber)}'
+'.kp-w.info{background:rgba(72,169,248,.1);border:.5px solid rgba(72,169,248,.25);color:var(--acc2)}'
+'.kp-more{font-size:12px;color:var(--acc2);margin:6px 0 2px;cursor:pointer;-webkit-user-select:none}'
+'.kp-d ul{margin:6px 0 4px 18px;font-size:12px;color:var(--text2);line-height:1.7}'
+'.kp-src{font-size:10px;color:var(--text3);margin-top:4px}'
+'.kp-add{margin-top:8px}'
+'.kp-bar{flex-shrink:0;display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(13,27,42,.97);border-top:.5px solid var(--border)}'
+'.kp-bar span{flex:1;font-size:12px;color:var(--text2)}'
+'.kp-bar button{background:var(--acc);color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer}'
+'.kp-sheet{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);display:none;z-index:20}'
+'.kp-sheet.on{display:block}'
+'.kp-in{position:absolute;left:0;right:0;bottom:0;max-height:92%;overflow-y:auto;-webkit-overflow-scrolling:touch;background:var(--bg0);border-radius:18px 18px 0 0;padding:14px 14px 28px}'
+'.kp-row{display:flex;align-items:center;gap:8px;background:var(--bg1);border:.5px solid var(--border);border-radius:10px;padding:9px 10px;margin-bottom:6px;font-size:13px}'
+'.kp-row b{flex:1;font-weight:600}'
+'.kp-row select,.kp-row input{background:var(--bg2);border:.5px solid var(--border);border-radius:8px;color:var(--text1);padding:6px 8px;font-size:13px}'
+'.kp-x{background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;padding:0 4px}'
+'.kp-sum{background:var(--bg1);border:.5px solid var(--border);border-radius:10px;padding:10px 12px;margin:10px 0;font-size:13px}'
+'.kp-note{font-size:10px;color:var(--text3);line-height:1.7;margin:14px 2px}'
+'.kp-base details{background:var(--bg1);border:.5px solid var(--border);border-radius:12px;padding:10px 12px;margin-bottom:8px}'
+'.kp-base summary{cursor:pointer;font-size:13px;font-weight:600}'
+'.kp-base ul,.kp-base p{font-size:12px;color:var(--text2);line-height:1.8;margin:8px 0 2px}.kp-base ul{padding-left:18px}'
+'.kp-search{width:100%;background:var(--bg2);border:.5px solid var(--border);border-radius:10px;color:var(--text1);padding:10px 13px;font-size:14px;outline:none;margin-bottom:10px;-webkit-appearance:none}';
document.head.appendChild(css);

/* 画面を差し込む */
var scr=document.createElement('div');scr.className='screen';scr.id='scr-kampo';
scr.innerHTML='<div class="sub-hdr"><button class="back-btn" onclick="goBack()">‹ ホーム</button><div class="sub-hdr-title">漢方処方</div><div class="sub-hdr-sub">整形外科領域・病態から選ぶ</div></div>'
+'<div class="scroll-body" id="kp-body"></div><div class="kp-bar" id="kp-bar"></div><div class="kp-sheet" id="kp-sheet"><div class="kp-in" id="kp-in"></div></div>';
var app=document.getElementById('app'),ref=document.getElementById('add-banner')||app.querySelector('.bottom-nav');
app.insertBefore(scr,ref);

/* ホームにボタン */
var tip=document.getElementById('tip-card');
if(tip){var row=document.createElement('div');row.className='quick-row';row.style.marginTop='8px';
 row.innerHTML='<button class="qk" onclick="goto(\'scr-kampo\')" style="flex-direction:row;justify-content:center;gap:10px"><span class="qk-ico">🌿</span><span class="qk-txt" style="font-size:12px;text-align:left">漢方処方<br>病態から選ぶ・併用チェック</span></button>';
 tip.parentNode.insertBefore(row,tip);}

/* 検索に登録 */
if(typeof SEARCH_INDEX!=='undefined'){
 FORMULAS.forEach(function(f){SEARCH_INDEX.push({name:f.name+'（TJ-'+f.tj+'）',sub:'漢方・'+f.use.slice(0,38),action:function(){goto('scr-kampo');show('list',f.name);}});});
 SEARCH_INDEX.push({name:'漢方 処方 整形外科',sub:'病態から選ぶ・併用チェック・甘草/附子の合計',action:function(){goto('scr-kampo');show('scn');}});
 SCN.forEach(function(s){SEARCH_INDEX.push({name:'漢方 '+s.t.replace('\n',' '),sub:s.hint.slice(0,40),action:function(){goto('scr-kampo');show('scn',null,s.id);}});});
}

function show(tab,q,scn){S.tab=tab;if(q!==undefined&&q!==null)S.q=q;if(scn)S.scn=scn;S.cat='all';render();}
window.OrthoKampo={show:show};

var srcTxt=function(f){return '出典: '+f.src.map(function(k){return SRC[k];}).join(' / ')+(f.amt==='ext'?' ／ 甘草・附子量は資料外の暫定値（添付文書で確認）':'')+(f.maoExt?' ／ 麻黄含有は資料外':'');};
function flagBar(){var on=FLAGS.filter(function(f){return S.flags[f[0]];}).length;
 return '<div class="card" style="margin-bottom:10px"><div class="card-body" style="padding:10px 13px"><span class="form-label">患者背景（該当すると警告を表示）'+(on?' — '+on+'項目':'')+'</span><div class="radio-group">'
 +FLAGS.map(function(f){return '<button class="radio-btn'+(S.flags[f[0]]?' sel-red':'')+'" data-flag="'+f[0]+'">'+f[1]+'</button>';}).join('')+'</div></div></div>';}
function card(f,role){var inC=S.cart.some(function(c){return c.id===f.id;}),ws=itemWarns(f,S.flags);
 return '<div class="card"><div class="card-hdr"><span class="badge bb">TJ-'+f.tj+'</span><b style="font-size:15px">'+f.name+'</b>'
 +(f.mao?'<span class="badge ba">麻黄</span>':'')+(f.acon>0?'<span class="badge br">附子</span>':'')+'</div><div class="card-body">'
 +(role?'<div class="kp-role">'+role+'</div>':'')+'<div class="kp-use">'+f.use+'</div>'
 +'<div class="kp-amt">甘草 <b>'+f.lic+'</b>g ・ 附子 <b>'+f.acon+'</b>g /日（標準3包）'+(f.amt==='ext'?' ※資料外の暫定値':'')+'</div>'
 +ws.map(function(w){return '<div class="kp-w '+w[0]+'">'+w[1]+'</div>';}).join('')
 +'<div class="kp-more" data-more="'+f.id+'">ポイント・出典 ›</div><div class="kp-d" id="kp-d-'+f.id+'" style="display:none"><ul>'+f.pearls.map(function(p){return '<li>'+p+'</li>';}).join('')+'</ul><div class="kp-src">'+srcTxt(f)+'</div></div>'
 +'<button class="copy-btn kp-add'+(inC?' success':'')+'" data-add="'+f.id+'">'+(inC?'✓ 処方セットに追加済（タップで外す）':'＋ 処方セットに追加')+'</button></div></div>';}
function tabs(){var T=[['scn','病態から'],['list','処方一覧'],['base','基礎・限界']];
 return '<div class="filter-bar">'+T.map(function(t){return '<button class="flt-btn'+(S.tab===t[0]?' on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>';}).join('')+'</div>';}
function foot(){return '<div class="kp-note">出典: ツムラ「整形外科領域のおすすめ漢方処方」（監修: 田中裕之）／PEPARS No.208(2024)88-96 冨澤英明／ペインクリニック冊子。ガイドラインやRCTに基づく推奨ではなく、販促資料と単著者の経験に基づく整理を構造化したもの。最終判断は添付文書と患者個別の状態に基づくこと。</div>';}
function vScn(){var h=flagBar()+'<div class="kp-sc-grid">'+SCN.map(function(s){return '<button class="kp-sc'+(S.scn===s.id?' on':'')+'" data-scn="'+s.id+'">'+s.t.replace('\n','<br>')+'</button>';}).join('')+'</div>';
 var s=SCN.filter(function(x){return x.id===S.scn;})[0];
 if(s){h+='<div class="kp-hint">'+s.hint+'</div>'+s.sets.map(function(x,i){return '<button class="kp-set" data-set="'+s.id+':'+i+'">▶ '+x[0]+' をセットにする</button>';}).join('')+'<div style="height:6px"></div>'+s.picks.map(function(p){return card(FM[p[0]],p[1]);}).join('');}
 else h+='<div class="empty">病態を選ぶと、候補の処方と選び分けのポイントが出ます</div>';
 return h+foot();}
function vList(){var q=S.q.trim();
 var l=FORMULAS.filter(function(f){return (S.cat==='all'||f.cat===S.cat)&&(!q||(f.name+f.tj+f.use).indexOf(q)>=0);});
 return flagBar()+'<input class="kp-search" type="search" id="kp-q" placeholder="処方名・番号・症状で検索" value="'+S.q.replace(/"/g,'')+'"><div class="filter-bar">'
 +CATS.map(function(c){return '<button class="flt-btn'+(S.cat===c[0]?' on':'')+'" data-cat="'+c[0]+'">'+c[1]+'</button>';}).join('')+'</div>'
 +(l.length?l.map(function(f){return card(f);}).join(''):'<div class="empty">該当なし</div>')+foot();}
function vBase(){return '<div class="kp-base">'
 +'<details open><summary>運動器の漢方は「血流改善薬」で捉える</summary><p>筆者（冨澤）の整理では、運動器に使う漢方は微小循環に作用する血流改善薬のイメージ。外傷・術後のうっ血、血腫、浮腫を引かせたい場面と、冷えて固まって痛む慢性痛が主な出番。冷えて痛む・動かないという訴えには有効な西洋薬が乏しく、アドオンの価値が大きいとしている。</p></details>'
 +'<details><summary>気・血・水</summary><ul><li><b>気</b>: 精神・神経活動。ストレス、イライラ、抑うつ、心因性疼痛</li><li><b>血</b>: 瘀血＝血腫・うっ血など血の滞り。血虚＝低栄養・貧血・血管脆弱（透析、ステロイド、抗がん剤、長期糖尿病など）</li><li><b>水</b>: 漿液・リンパ・関節液の貯留。浮腫、関節水腫、神経の浮腫は水毒</li></ul></details>'
 +'<details><summary>押さえる生薬</summary><ul><li><b>麻黄</b>: 急性・炎症性の痛み（熱を持って腫れて痛む）。越婢加朮湯、葛根湯など</li><li><b>附子</b>: 慢性・阻血性の痛み（冷えて拘縮して痛む）。桂枝加朮附湯、牛車腎気丸、大防風湯など</li><li><b>当帰</b>: 血管新生。治りにくい局所の痛み</li><li><b>柴胡</b>: 神経過敏・心因性の過剰反応の鎮静、抗炎症</li><li><b>芍薬＋甘草</b>: 筋の攣縮による痛み。含有処方には芍薬甘草湯の作用が備わると考える</li><li><b>蒼朮</b>: 浮腫・水腫・漿液貯留</li></ul></details>'
 +'<details><summary>処方の実際（PEPARSの運用）</summary><ul><li>運動器では2〜3剤併用を勧めている。炎症・浮腫・うっ血・神経性・阻血が絡むため</li><li>1剤は3包分3、2剤は2包分2または3包分3（体格による）、3剤は2包分2</li><li>期間: 急性期は数日〜1週、亜急性期は2週、慢性期（冷え）は3〜4週で判定</li><li>生薬数が少ないほど即効性があるという筆者の印象（1〜4種は分単位、5〜10種は時間単位、11種以上は日〜週単位）</li><li>効果判定でVASを絶対視しない。体の温まりや動きの改善が先に出る。「なんかいい感じ」なら継続</li><li>同じ薬を漫然と続けない。病状・季節・体調で合う処方が変わる</li></ul></details>'
 +'<details><summary>服薬指導・副作用</summary><ul><li>基本は食前だが、飲み忘れるなら食後でもよい。お茶・コーヒーで苦味が和らぐ。温める処方は温かい飲料で</li><li><b>甘草</b>: 浮腫・偽アルドステロン症・低K。1日2g以下ならほぼ発症しないとされる。足がむくんだら中止して再診するよう伝える。ツムラ資料はミオパチーも挙げている</li><li><b>附子</b>: 動悸など。効果不十分で冷えがあればブシ末を0.5g/日程度から漸増（ツムラ資料）</li><li><b>桂皮</b>: シナモンアレルギー。問診で確認</li><li><b>麻黄</b>: 胃腸障害</li><li><b>乳糖</b>: 基材に含まれ、稀に下痢が止まらない</li></ul></details>'
 +'<details open><summary>エビデンスと限界（必読）</summary><ul><li>処方の選び分けの中心は、製薬会社（ツムラ）の販促資料と、単著者の経験に基づく総説。ガイドラインでもRCTでもない</li><li>「NSAIDsとの併用を控える」「125を優先」などは筆者の私見であり、アプリ内では警告ではなく情報扱いにしている</li><li>PEPARSは手外科向けの記事で、腰痛・膝OAなど下肢・脊椎への適用はツムラ資料とPC冊子の記載に依存する</li><li>甘草・附子量のうち「資料外」と表示したものは暫定値。処方前に添付文書で確認すること</li></ul></details></div>'+foot();}
function bar(){var t=totals(S.cart);$('#kp-bar').innerHTML='<span>'+(S.cart.length?'処方セット '+S.cart.length+'剤 ・甘草 '+r1(t.lic)+'g/日':'処方セットは空です')+'</span><button data-open="1">開く</button>';}
function sheet(){var E=eff(S.cart),t=totals(S.cart),ck=cartChecks(S.cart,S.flags);
 $('#kp-in').innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><b style="font-size:17px">処方セット</b><button class="kp-x" data-close="1">✕</button></div>'
 +(S.cart.length?E.map(function(c){var f=FM[c.id];return '<div class="kp-row"><b>'+f.name+' <small style="color:var(--text3);font-weight:400">TJ-'+f.tj+'</small></b><select data-pack="'+c.id+'">'+Object.keys(PACKS).map(function(k){return '<option value="'+k+'"'+(String(c.p)===k?' selected':'')+'>'+PACKS[k]+'</option>';}).join('')+'</select><button class="kp-x" data-rm="'+c.id+'">✕</button></div>';}).join('')
 +'<div class="kp-row"><b>日数</b><input type="number" id="kp-days" min="1" max="90" value="'+S.days+'" style="width:70px"> 日分</div>'
 +'<div class="kp-sum">定期内服分 甘草 <b>'+r1(t.lic)+'</b> g/日 ・ 附子 <b>'+r1(t.acon)+'</b> g/日'+(t.licPrn?'<br>頓服分 甘草 約'+r1(t.licPrn)+'g/回':'')+(t.ext?'<br><span style="font-size:11px;color:var(--text3)">※一部は資料外の暫定値</span>':'')+'</div>'
 +ck.map(function(w){return '<div class="kp-w '+w[0]+'">'+w[1]+'</div>';}).join('')
 +'<div class="rx-box" id="kp-rx">'+rxText(S.cart,S.days)+'</div><button class="copy-btn" data-copy="1">処方文例をコピー</button>'
 +'<div class="kp-note">コピー文は下書きです。カルテ貼り付け後に用量・用法を確認してください。</div><button class="kp-x" data-clear="1" style="font-size:12px">セットを空にする</button>'
 :'<div class="empty">病態カードの「＋処方セットに追加」で追加します</div>');
 $('#kp-sheet').classList.toggle('on',S.sheet);}
function render(){var b=$('#kp-body'),top=b.scrollTop,keep=document.activeElement&&document.activeElement.id==='kp-q';
 b.innerHTML=tabs()+(S.tab==='scn'?vScn():S.tab==='list'?vList():vBase());
 if(keep){var q=$('#kp-q');q.focus();q.setSelectionRange(q.value.length,q.value.length);}
 b.scrollTop=top;bar();sheet();}

scr.addEventListener('click',function(e){var b=e.target.closest('button,.kp-more');if(!b)return;var d=b.dataset;
 if(d.more){var el=document.getElementById('kp-d-'+d.more);el.style.display=el.style.display==='none'?'block':'none';return;}
 if(d.tab){S.tab=d.tab;$('#kp-body').scrollTop=0;}
 else if(d.scn){S.scn=S.scn===d.scn?null:d.scn;}
 else if(d.cat){S.cat=d.cat;}
 else if(d.flag){S.flags[d.flag]=!S.flags[d.flag];}
 else if(d.add){var i=-1;S.cart.forEach(function(c,k){if(c.id===d.add)i=k;});if(i>=0)S.cart.splice(i,1);else S.cart.push({id:d.add,pack:null});}
 else if(d.set){var p=d.set.split(':'),s=SCN.filter(function(x){return x.id===p[0];})[0],st=s.sets[+p[1]];S.cart=st[1].map(function(id){return {id:id,pack:null};});if(st[2])S.days=st[2];S.sheet=true;}
 else if(d.open){S.sheet=true;}
 else if(d.close){S.sheet=false;}
 else if(d.rm){S.cart=S.cart.filter(function(c){return c.id!==d.rm;});}
 else if(d.clear){S.cart=[];}
 else if(d.copy){var t=rxText(S.cart,S.days);var ok=function(){b.textContent='コピー完了 ✓';b.classList.add('success');setTimeout(function(){b.textContent='処方文例をコピー';b.classList.remove('success');},2000);};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,function(){});return;}
 else return;
 save();render();
 if(d.scn&&S.scn){var hn=$('.kp-hint');if(hn&&hn.scrollIntoView)hn.scrollIntoView({block:'start'});}});
scr.addEventListener('change',function(e){var t=e.target;
 if(t.dataset&&t.dataset.pack){S.cart.forEach(function(c){if(c.id===t.dataset.pack)c.pack=t.value==='prn'?'prn':+t.value;});save();render();}
 else if(t.id==='kp-days'){S.days=Math.max(1,Math.min(90,+t.value||1));save();render();}});
scr.addEventListener('input',function(e){if(e.target.id==='kp-q'){S.q=e.target.value;render();}});
document.getElementById('kp-sheet').addEventListener('click',function(e){if(e.target.id==='kp-sheet'){S.sheet=false;render();}});
render();
})();
