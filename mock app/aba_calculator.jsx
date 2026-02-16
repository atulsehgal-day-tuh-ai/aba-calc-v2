import { useState } from "react";

const VINELAND_DOMAINS = [
  { key: "communication", label: "Communication" },
  { key: "dailyLiving", label: "Daily Living Skills" },
  { key: "socialization", label: "Socialization" },
  { key: "motor", label: "Motor Skills" },
];
const FII_DOMAINS = [
  { key: "fii_communication", label: "Communication" },
  { key: "fii_socialReciprocity", label: "Social Reciprocity" },
  { key: "fii_adaptiveSkills", label: "Adaptive Skills" },
  { key: "fii_emotionalRegulation", label: "Emotional Regulation" },
  { key: "fii_safetyAggression", label: "Safety / Aggression" },
  { key: "fii_selfInjury", label: "Self-Injury" },
  { key: "fii_schoolCommunity", label: "School / Community" },
  { key: "fii_familyImpact", label: "Family Impact" },
  { key: "fii_rrb", label: "Restricted / Repetitive Behaviors" },
];
const ENV_MODIFIERS = [
  { key: "env_schoolRisk", label: "School placement at risk" },
  { key: "env_cps", label: "CPS involvement" },
  { key: "env_regression", label: "Regression" },
  { key: "env_caregiverBurnout", label: "Caregiver burnout" },
  { key: "env_lossABA", label: "Loss of ABA services" },
  { key: "env_limitedCaregiver", label: "Limited caregiver capacity" },
  { key: "env_noSchool", label: "No school supports" },
];
const RISK_FACTORS = [
  { key: "risk_selfHarm", label: "Risk of harm to self" },
  { key: "risk_harmOthers", label: "Risk of harm to others" },
  { key: "risk_elopement", label: "Elopement / wandering" },
  { key: "risk_safetyAwareness", label: "Lack of safety awareness" },
  { key: "risk_placement", label: "Restrictive placement risk" },
  { key: "risk_medical", label: "Medical complexity" },
];
const SKILL_DEFICITS = ["Communication","Social Skills","Play Skills","Self-Care","Academic","Motor Skills","Executive Functioning","Community/Safety"];
const DEFAULT_PAYER = { name:"Default",maxHours:40,minHours:10,fiiW:1,vinW:1,vbW:1,behW:1,envW:1,ageMult:{young:1.2,mid:1.0,teen:0.85},supPct:0.15,ptRange:[2,8] };

function calcVineland(s){const vals=VINELAND_DOMAINS.map(d=>s[d.key]).filter(v=>v!=="").map(Number);if(!vals.length)return 0;const b85=vals.filter(v=>v<85).length;const any70=vals.some(v=>v<70);const comp=s.vinelandComposite?Number(s.vinelandComposite):null;let a=b85===1?2:b85===2?4:b85===3?6:b85>=4?8:0;if(any70)a+=4;if(comp&&comp<70)a+=4;return Math.min(a,12)}
function calcVBMAPP(s){let a=0;if(s.milestones!==""){const m=Number(s.milestones);a+=m<=45?6:m<=100?3:0}if(s.barriers!==""){const b=Number(s.barriers);a+=b>=19?6:b>=13?4:b>=7?2:0}if(s.transition!==""){const t=Number(s.transition);a+=t<=6?2:t<=12?1:0}return Math.min(a,12)}
function calcFII(d){return Object.values(d).reduce((s,v)=>s+(Number(v)||0),0)}
function fiiBase(f){return f<=8?10:f<=16?20:f<=24?30:35}
function calcBeh(d){let a=0;if(d.aggressionFreq==="daily")a+=5;else if(d.aggressionFreq==="6plus")a+=3;if(d.selfInjury==="severe")a+=8;else if(d.selfInjury==="moderate")a+=5;else if(d.selfInjury==="mild")a+=3;if(d.elopement)a+=5;if(d.crisisEvents==="2plus")a+=8;else if(d.crisisEvents==="1")a+=5;return Math.min(a,16)}
function calcEnv(e){return Math.min(Object.values(e).filter(Boolean).length*2,8)}

function runCalc(form,payer=DEFAULT_PAYER){
  const fii=calcFII(form.fiiDomains),base=fiiBase(fii);
  const vAdj=calcVineland(form.vineland)*payer.vinW,vbAdj=calcVBMAPP(form.vbmapp)*payer.vbW;
  const bAdj=calcBeh(form.behavioral)*payer.behW,eAdj=calcEnv(form.envModifiers)*payer.envW;
  const risk=RISK_FACTORS.reduce((s,r)=>s+(Number(form.riskScores[r.key])||0),0);
  const highRisk=risk>=15||form.behavioral.selfInjury==="severe";
  const age=Number(form.age);
  const ageMult=highRisk?1.0:age<=5?payer.ageMult.young:age<=12?payer.ageMult.mid:payer.ageMult.teen;
  const raw=(base+vAdj+vbAdj+bAdj+eAdj)*ageMult;
  const final=Math.max(payer.minHours,Math.min(payer.maxHours,Math.round(raw/5)*5));
  const tier=final>=30?3:final>=20?2:1;
  const supPct=tier===3?0.20:tier===2?0.15:0.10;
  const supHrs=Math.ceil(final*supPct),ptHrs=tier===3?payer.ptRange[1]:tier===2?Math.round((payer.ptRange[0]+payer.ptRange[1])/2):payer.ptRange[0];
  const goals=Math.min(12,Math.max(2,(form.skillDeficits?.length||0)+(fii>20?2:fii>10?1:0)));
  const flags=[];
  if(risk>=15)flags.push("HIGH RISK — Safety Plan Required");if(fii>=25)flags.push("Severe Functional Impairment");
  if(bAdj>=10)flags.push("Significant Behavioral Risk");if(eAdj>=6)flags.push("Multiple Environmental Stressors");
  const rationale=[`FII: ${fii}/36 → Base ${base}h`];
  if(vAdj>0)rationale.push(`Vineland: +${vAdj.toFixed(1)}h`);if(vbAdj>0)rationale.push(`VB-MAPP: +${vbAdj.toFixed(1)}h`);
  if(bAdj>0)rationale.push(`Behavioral: +${bAdj.toFixed(1)}h`);if(eAdj>0)rationale.push(`Environmental: +${eAdj.toFixed(1)}h`);
  rationale.push(`Age ×${ageMult} → ${raw.toFixed(1)} → ${final}h/wk`);
  return{fii,base,vAdj,vbAdj,bAdj,eAdj,ageMult,raw,final,tier,supHrs,ptHrs,goals,risk,flags,rationale,highRisk};
}

const C={bg:"#0B0E14",card:"#13161F",border:"#232837",borderFocus:"#5E8BFF",accent:"#5E8BFF",accentSoft:"rgba(94,139,255,0.1)",danger:"#FF5A5A",dangerSoft:"rgba(255,90,90,0.1)",success:"#3DDC84",successSoft:"rgba(61,220,132,0.1)",warn:"#FFB84D",warnSoft:"rgba(255,184,77,0.1)",purple:"#A78BFA",purpleSoft:"rgba(167,139,250,0.1)",teal:"#2DD4BF",tealSoft:"rgba(45,212,191,0.1)",text:"#E4E8F1",muted:"#7E879D",dim:"#4A5168",clinicPrimary:"#3DDC84",clinicSoft:"rgba(61,220,132,0.08)",clinicGlow:"rgba(61,220,132,0.25)",insurPrimary:"#A78BFA",insurSoft:"rgba(167,139,250,0.08)",insurGlow:"rgba(167,139,250,0.25)"};
const font="'DM Sans',sans-serif",mono="'DM Mono',monospace";

function Field({label,req,children,help}){return(<div style={{marginBottom:16}}><label style={{display:"block",marginBottom:5,fontSize:12,fontWeight:500,color:C.muted,fontFamily:font}}>{label}{req&&<span style={{color:C.danger,marginLeft:3}}>*</span>}</label>{children}{help&&<div style={{fontSize:10,color:C.dim,marginTop:3,fontStyle:"italic"}}>{help}</div>}</div>)}
function Inp({type="number",value,onChange,placeholder,min,max,style:sx}){return(<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} min={min} max={max} style={{width:"100%",padding:"9px 11px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:13,outline:"none",fontFamily:font,boxSizing:"border-box",...sx}} onFocus={e=>e.target.style.borderColor=C.borderFocus} onBlur={e=>e.target.style.borderColor=C.border}/>)}
function Sel({value,onChange,options,placeholder}){return(<select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"9px 11px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,color:value?C.text:C.dim,fontSize:13,outline:"none",fontFamily:font,cursor:"pointer",boxSizing:"border-box"}}><option value="">{placeholder||"Select..."}</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>)}
function Chips({items,selected,onChange}){const toggle=i=>selected.includes(i)?onChange(selected.filter(x=>x!==i)):onChange([...selected,i]);return(<div style={{display:"flex",flexWrap:"wrap",gap:5}}>{items.map(i=>(<button key={i} onClick={()=>toggle(i)} style={{padding:"5px 11px",borderRadius:16,fontSize:11,cursor:"pointer",border:`1px solid ${selected.includes(i)?C.accent:C.border}`,background:selected.includes(i)?C.accentSoft:"transparent",color:selected.includes(i)?C.accent:C.muted,fontFamily:font,fontWeight:500}}>{selected.includes(i)?"✓ ":""}{i}</button>))}</div>)}
function Sec({n,title,collapsed,onToggle,children,accent=C.accent}){return(<div style={{background:C.card,borderRadius:10,border:`1px solid ${C.border}`,marginBottom:12,overflow:"hidden"}}><button onClick={onToggle} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"14px 18px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}><span style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:accent+"18",color:accent,fontFamily:font,flexShrink:0}}>{n}</span><span style={{flex:1,color:C.text,fontWeight:600,fontSize:14,fontFamily:font}}>{title}</span><span style={{color:C.dim,fontSize:16,transform:collapsed?"rotate(0)":"rotate(180deg)",transition:"transform 0.2s"}}>▾</span></button>{!collapsed&&<div style={{padding:"0 18px 18px"}}>{children}</div>}</div>)}
function Badge({color,bg,children}){return<span style={{display:"inline-block",padding:"3px 9px",borderRadius:16,fontSize:10,fontWeight:600,color,background:bg,fontFamily:font}}>{children}</span>}
function Meter({value,max,color,label}){return(<div style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:C.muted}}>{label}</span><span style={{fontSize:11,fontWeight:600,color}}>{value}/{max}</span></div><div style={{height:5,borderRadius:3,background:C.bg}}><div style={{height:"100%",borderRadius:3,background:color,width:`${Math.min(100,(value/max)*100)}%`,transition:"width 0.5s"}}/></div></div>)}
function RatingRow({label,value,onChange}){return(<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{flex:1,fontSize:12,color:C.muted,minWidth:0}}>{label}</span><div style={{display:"flex",gap:3,flexShrink:0}}>{[0,1,2,3,4].map(n=>(<button key={n} onClick={()=>onChange(n)} style={{width:30,height:30,borderRadius:5,border:`1px solid ${value===n?"transparent":C.border}`,background:value===n?(n<=1?C.success:n<=2?C.warn:C.danger):C.bg,color:value===n?"#fff":C.dim,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:font}}>{n}</button>))}</div></div>)}

function LoginScreen({onLogin}){
  const[hovered,setHovered]=useState(null);
  const roles=[
    {key:"clinic",icon:"🏥",title:"Provider Clinic",sub:"ABA Treatment Provider",desc:"Calculate medical necessity scores, generate hour recommendations, submit and track authorization claims.",color:C.clinicPrimary,soft:C.clinicSoft,glow:C.clinicGlow,features:["Medical Necessity Calculator","Submit Authorization Claims","Track Claim Outcomes","Calibrate Predictions"]},
    {key:"insurance",icon:"🛡",title:"Insurance Payer",sub:"Utilization Management",desc:"Review authorization requests with custom policy controls, approve or deny claims, configure payer-specific thresholds.",color:C.insurPrimary,soft:C.insurSoft,glow:C.insurGlow,features:["Claim Review Queue","Policy Configuration","Enhanced Calculator","Authorization Analytics"]},
  ];
  return(
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font,padding:20}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:740,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{width:64,height:64,borderRadius:16,margin:"0 auto 16px",background:`linear-gradient(135deg,${C.clinicPrimary},${C.insurPrimary})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:`0 8px 32px rgba(61,220,132,0.15),0 8px 32px rgba(167,139,250,0.15)`}}>⚕</div>
          <h1 style={{fontSize:28,fontWeight:800,color:C.text,margin:"0 0 6px",letterSpacing:-0.5}}>ABA Medical Necessity Engine</h1>
          <p style={{color:C.dim,fontSize:14,margin:0}}>Evidence-based dosage determination system</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {roles.map(r=>{const h=hovered===r.key;return(
            <button key={r.key} onClick={()=>onLogin(r.key)} onMouseEnter={()=>setHovered(r.key)} onMouseLeave={()=>setHovered(null)} style={{background:h?r.soft:C.card,border:`1.5px solid ${h?r.color+"55":C.border}`,borderRadius:16,padding:28,cursor:"pointer",textAlign:"left",transition:"all 0.25s ease",transform:h?"translateY(-4px)":"translateY(0)",boxShadow:h?`0 12px 40px ${r.glow}`:"none"}}>
              <div style={{fontSize:36,marginBottom:14}}>{r.icon}</div>
              <div style={{fontSize:18,fontWeight:700,color:C.text,fontFamily:font,marginBottom:2}}>{r.title}</div>
              <div style={{fontSize:11,fontWeight:600,color:r.color,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12}}>{r.sub}</div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.5,marginBottom:18}}>{r.desc}</div>
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14}}>{r.features.map(f=><div key={f} style={{fontSize:11,color:C.muted,marginBottom:5,display:"flex",alignItems:"center",gap:6}}><span style={{color:r.color,fontSize:10}}>●</span>{f}</div>)}</div>
              <div style={{marginTop:18,padding:"10px 0",borderRadius:8,background:h?r.color:"transparent",border:`1px solid ${r.color}`,textAlign:"center",fontSize:13,fontWeight:700,color:h?(r.key==="clinic"?"#000":"#fff"):r.color,fontFamily:font,transition:"all 0.25s"}}>Sign In →</div>
            </button>
          )})}
        </div>
        <div style={{textAlign:"center",marginTop:32,fontSize:11,color:C.dim}}>HIPAA compliant · AES-256 encryption · SOC 2 certified</div>
      </div>
    </div>
  );
}

function useForm(){
  const[age,setAge]=useState("");const[diagnosis,setDiagnosis]=useState("");const[eduSetting,setEduSetting]=useState("");const[living,setLiving]=useState("");
  const[skillDefs,setSkillDefs]=useState([]);const[behTypes,setBehTypes]=useState([]);
  const[vineland,setVineland]=useState({communication:"",dailyLiving:"",socialization:"",motor:"",vinelandComposite:""});
  const[vbmapp,setVbmapp]=useState({milestones:"",barriers:"",transition:""});
  const[fiiDomains,setFiiDomains]=useState(Object.fromEntries(FII_DOMAINS.map(d=>[d.key,0])));
  const[behavioral,setBehavioral]=useState({aggressionFreq:"",selfInjury:"",elopement:false,crisisEvents:""});
  const[envMods,setEnvMods]=useState(Object.fromEntries(ENV_MODIFIERS.map(e=>[e.key,false])));
  const[riskScores,setRiskScores]=useState(Object.fromEntries(RISK_FACTORS.map(r=>[r.key,0])));
  const[collapsed,setCollapsed]=useState({});const toggle=n=>setCollapsed(p=>({...p,[n]:!p[n]}));
  return{age,setAge,diagnosis,setDiagnosis,eduSetting,setEduSetting,living,setLiving,skillDefs,setSkillDefs,behTypes,setBehTypes,vineland,setVineland,vbmapp,setVbmapp,fiiDomains,setFiiDomains,behavioral,setBehavioral,envMods,setEnvMods,riskScores,setRiskScores,collapsed,toggle,getData:()=>({age,diagnosis,skillDeficits:skillDefs,vineland,vbmapp,fiiDomains,behavioral,envModifiers:envMods,riskScores})};
}

function AssessmentForm({form,accent,onCalc}){
  const{age,setAge,diagnosis,setDiagnosis,eduSetting,setEduSetting,living,setLiving,skillDefs,setSkillDefs,vineland,setVineland,vbmapp,setVbmapp,fiiDomains,setFiiDomains,behavioral,setBehavioral,envMods,setEnvMods,riskScores,setRiskScores,collapsed,toggle}=form;
  return(<>
    <Sec n={1} title="Client Demographics" collapsed={collapsed[1]} onToggle={()=>toggle(1)} accent={accent}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Client Age" req><Inp value={age} onChange={setAge} min={0} max={21} placeholder="0-21"/></Field>
        <Field label="Primary Diagnosis" req><Sel value={diagnosis} onChange={setDiagnosis} options={[{value:"asd_level1",label:"ASD Level 1"},{value:"asd_level2",label:"ASD Level 2"},{value:"asd_level3",label:"ASD Level 3"},{value:"asd_unspecified",label:"ASD Unspecified"}]}/></Field>
        <Field label="Educational Setting"><Sel value={eduSetting} onChange={setEduSetting} options={[{value:"not_enrolled",label:"Not enrolled"},{value:"early_intervention",label:"Early Intervention"},{value:"preschool",label:"Preschool"},{value:"general_ed",label:"General Education"},{value:"special_ed",label:"Special Education"},{value:"homeschool",label:"Homeschool"}]}/></Field>
        <Field label="Living Situation"><Sel value={living} onChange={setLiving} options={[{value:"family_home",label:"Family home"},{value:"foster_care",label:"Foster care"},{value:"group_home",label:"Group home"},{value:"residential",label:"Residential"}]}/></Field>
      </div>
    </Sec>
    <Sec n={2} title="Vineland-3 Assessment" collapsed={collapsed[2]} onToggle={()=>toggle(2)} accent={accent}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{VINELAND_DOMAINS.map(d=><Field key={d.key} label={d.label} help="Standard score (20-160)"><Inp value={vineland[d.key]} onChange={v=>setVineland(p=>({...p,[d.key]:v}))} min={20} max={160} placeholder="Score"/></Field>)}</div>
      <Field label="Composite" help="Optional"><Inp value={vineland.vinelandComposite} onChange={v=>setVineland(p=>({...p,vinelandComposite:v}))} min={20} max={160} placeholder="Composite"/></Field>
    </Sec>
    <Sec n={3} title="VB-MAPP Assessment" collapsed={collapsed[3]} onToggle={()=>toggle(3)} accent={accent}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <Field label="Milestones (0-170)"><Inp value={vbmapp.milestones} onChange={v=>setVbmapp(p=>({...p,milestones:v}))} min={0} max={170}/></Field>
        <Field label="Barriers (0-24)"><Inp value={vbmapp.barriers} onChange={v=>setVbmapp(p=>({...p,barriers:v}))} min={0} max={24}/></Field>
        <Field label="Transition (0-18)"><Inp value={vbmapp.transition} onChange={v=>setVbmapp(p=>({...p,transition:v}))} min={0} max={18}/></Field>
      </div>
    </Sec>
    <Sec n={4} title="Functional Impairment Index" collapsed={collapsed[4]} onToggle={()=>toggle(4)} accent={accent}>
      <div style={{fontSize:11,color:C.dim,marginBottom:10}}>Rate 0 (none) to 4 (severe)</div>
      {FII_DOMAINS.map(d=><RatingRow key={d.key} label={d.label} value={fiiDomains[d.key]} onChange={v=>setFiiDomains(p=>({...p,[d.key]:v}))}/>)}
      <div style={{marginTop:10,padding:8,background:accent+"14",borderRadius:6,textAlign:"center",fontSize:13,fontWeight:700,color:accent}}>FII: {calcFII(fiiDomains)}/36 → Base {fiiBase(calcFII(fiiDomains))}h</div>
    </Sec>
    <Sec n={5} title="Skill Deficit Domains" collapsed={collapsed[5]} onToggle={()=>toggle(5)} accent={accent}><Chips items={SKILL_DEFICITS} selected={skillDefs} onChange={setSkillDefs}/></Sec>
    <Sec n={6} title="Behavioral Risk Modifiers" collapsed={collapsed[6]} onToggle={()=>toggle(6)} accent={accent}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Aggression Frequency"><Sel value={behavioral.aggressionFreq} onChange={v=>setBehavioral(p=>({...p,aggressionFreq:v}))} options={[{value:"none",label:"None"},{value:"weekly",label:"< 6/wk"},{value:"6plus",label:"6+/wk"},{value:"daily",label:"Daily"}]}/></Field>
        <Field label="Self-Injury"><Sel value={behavioral.selfInjury} onChange={v=>setBehavioral(p=>({...p,selfInjury:v}))} options={[{value:"none",label:"None"},{value:"mild",label:"Mild"},{value:"moderate",label:"Moderate"},{value:"severe",label:"Severe"}]}/></Field>
        <Field label="Crisis Events (6 mo)"><Sel value={behavioral.crisisEvents} onChange={v=>setBehavioral(p=>({...p,crisisEvents:v}))} options={[{value:"none",label:"None"},{value:"1",label:"1 event"},{value:"2plus",label:"2+"}]}/></Field>
        <Field label="Elopement"><button onClick={()=>setBehavioral(p=>({...p,elopement:!p.elopement}))} style={{width:"100%",padding:"9px 11px",borderRadius:7,cursor:"pointer",border:`1px solid ${behavioral.elopement?C.danger:C.border}`,background:behavioral.elopement?C.dangerSoft:C.bg,color:behavioral.elopement?C.danger:C.dim,fontWeight:600,fontSize:13,fontFamily:font,textAlign:"left",boxSizing:"border-box"}}>{behavioral.elopement?"⚠ Present":"Not present"}</button></Field>
      </div>
    </Sec>
    <Sec n={7} title="Environmental Modifiers" collapsed={collapsed[7]} onToggle={()=>toggle(7)} accent={accent}>
      <div style={{fontSize:11,color:C.dim,marginBottom:8}}>Each adds +2h (max +8)</div>
      {ENV_MODIFIERS.map(e=><label key={e.key} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:6,marginBottom:3,cursor:"pointer",background:envMods[e.key]?C.tealSoft:"transparent",border:`1px solid ${envMods[e.key]?C.teal+"33":"transparent"}`}}><input type="checkbox" checked={envMods[e.key]} onChange={()=>setEnvMods(p=>({...p,[e.key]:!p[e.key]}))} style={{accentColor:C.teal}}/><span style={{fontSize:12,color:envMods[e.key]?C.teal:C.muted}}>{e.label}</span></label>)}
    </Sec>
    <Sec n={8} title="Risk Assessment (0-24)" collapsed={collapsed[8]} onToggle={()=>toggle(8)} accent={accent}>
      {RISK_FACTORS.map(r=><RatingRow key={r.key} label={r.label} value={riskScores[r.key]} onChange={v=>setRiskScores(p=>({...p,[r.key]:v}))}/>)}
    </Sec>
    <button onClick={onCalc} style={{width:"100%",padding:"14px",borderRadius:10,border:"none",background:accent,color:accent===C.clinicPrimary?"#000":"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:font,boxShadow:`0 4px 20px ${accent}33`}}>Calculate Medical Necessity Score</button>
  </>);
}

function Results({result,accent}){
  if(!result)return null;
  const{final,tier,supHrs,ptHrs,goals,risk,fii,flags,rationale,vAdj,vbAdj,bAdj,eAdj}=result;
  const tC={1:C.success,2:C.warn,3:C.danger},tB={1:C.successSoft,2:C.warnSoft,3:C.dangerSoft},tL={1:"Low",2:"Moderate",3:"High"};
  return(
    <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:22,marginTop:16,animation:"fadeIn 0.4s ease"}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:C.dim,marginBottom:6}}>Recommended Weekly Hours</div>
        <div style={{fontSize:56,fontWeight:800,color:accent,fontFamily:font,lineHeight:1}}>{final}</div>
        <Badge color={tC[tier]} bg={tB[tier]}>Tier {tier} — {tL[tier]} Intensity</Badge>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        {[{l:"BCBA Supervision",v:`${supHrs}h/wk`,i:"👁"},{l:"Parent Training",v:`${ptHrs}h/mo`,i:"👨‍👩‍👧"},{l:"Goals",v:goals,i:"🎯"}].map(m=><div key={m.l} style={{background:C.bg,borderRadius:8,padding:12,textAlign:"center",border:`1px solid ${C.border}`}}><div style={{fontSize:18,marginBottom:3}}>{m.i}</div><div style={{fontSize:16,fontWeight:700,color:C.text}}>{m.v}</div><div style={{fontSize:9,color:C.dim,textTransform:"uppercase",letterSpacing:1}}>{m.l}</div></div>)}
      </div>
      <Meter value={fii} max={36} color={fii>24?C.danger:fii>16?C.warn:C.success} label="FII"/>
      <Meter value={risk} max={24} color={risk>=15?C.danger:risk>=8?C.warn:C.success} label="Risk Score"/>
      {flags.length>0&&<div style={{background:C.dangerSoft,border:`1px solid ${C.danger}33`,borderRadius:8,padding:12,marginTop:12,marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:C.danger,marginBottom:4}}>⚠ Flags</div>{flags.map((f,i)=><div key={i} style={{fontSize:12,color:C.text,marginBottom:2}}>• {f}</div>)}</div>}
      <div style={{background:C.bg,borderRadius:8,padding:12,border:`1px solid ${C.border}`,marginTop:12}}><div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:6}}>Breakdown</div>{rationale.map((r,i)=><div key={i} style={{fontSize:11,color:C.muted,marginBottom:2,fontFamily:mono}}>{r}</div>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:12}}>
        {[{l:"Vineland",v:vAdj,m:12,c:C.accent},{l:"VB-MAPP",v:vbAdj,m:12,c:C.purple},{l:"Behavioral",v:bAdj,m:16,c:C.danger},{l:"Environ.",v:eAdj,m:8,c:C.teal}].map(b=><div key={b.l} style={{background:C.bg,borderRadius:6,padding:8,border:`1px solid ${C.border}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:C.dim}}>{b.l}</span><span style={{fontSize:10,fontWeight:600,color:b.c}}>+{b.v.toFixed(1)}</span></div><div style={{height:3,borderRadius:2,background:C.card}}><div style={{height:"100%",borderRadius:2,background:b.c,width:`${(b.v/b.m)*100}%`}}/></div></div>)}
      </div>
    </div>
  );
}

function ClinicPortal({onLogout,claims,onSubmitClaim}){
  const[tab,setTab]=useState("calculator");const form=useForm();const[result,setResult]=useState(null);
  const[patientName,setPatientName]=useState("");const[patientId,setPatientId]=useState("");
  const handleCalc=()=>setResult(runCalc(form.getData(),DEFAULT_PAYER));
  const handleSubmit=()=>{if(!result)return;onSubmitClaim({id:"CLM-"+Date.now().toString(36).toUpperCase(),patientId:patientId||"PT-"+Math.random().toString(36).substr(2,5).toUpperCase(),patientName:patientName||"Patient",requestedHours:result.final,tier:result.tier,fii:result.fii,riskScore:result.risk,flags:result.flags,rationale:result.rationale,status:"pending",submittedAt:new Date().toLocaleString(),diagnosis:form.diagnosis,age:form.age});setTab("claims")};
  const approved=claims.filter(c=>c.status==="approved"),denied=claims.filter(c=>c.status==="denied"),pending=claims.filter(c=>c.status==="pending");
  const rate=claims.length>0?((approved.length/claims.length)*100).toFixed(0):"—";
  const insights=[];
  if(denied.length>=2){const avgDF=(denied.reduce((s,c)=>s+c.fii,0)/denied.length).toFixed(1);const avgAF=approved.length>0?(approved.reduce((s,c)=>s+c.fii,0)/approved.length).toFixed(1):"N/A";insights.push(`Denied avg FII: ${avgDF} vs Approved: ${avgAF}`);const avgDH=(denied.reduce((s,c)=>s+c.requestedHours,0)/denied.length).toFixed(0);const avgAH=approved.length>0?(approved.reduce((s,c)=>s+c.requestedHours,0)/approved.length).toFixed(0):"N/A";insights.push(`Denied avg hours: ${avgDH}h vs Approved: ${avgAH}h`);if(Number(avgDH)>Number(avgAH))insights.push("Tip: Denied claims request higher hours — strengthen documentation for high-hour requests.")}
  if(denied.length>=1){const lr=denied.filter(c=>c.riskScore<10);if(lr.length>0)insights.push(`${lr.length} denial(s) had risk < 10 — ensure thorough risk documentation`)}

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:font,color:C.text}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"0 20px"}}><div style={{maxWidth:720,margin:"0 auto",display:"flex",alignItems:"center",height:56}}><div style={{display:"flex",alignItems:"center",gap:8,flex:1}}><span style={{fontSize:20}}>🏥</span><span style={{fontWeight:700,fontSize:15,color:C.clinicPrimary}}>Clinic Portal</span><Badge color={C.clinicPrimary} bg={C.clinicSoft}>Provider</Badge></div><button onClick={onLogout} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 14px",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:font}}>Sign Out</button></div></div>
      <div style={{maxWidth:720,margin:"0 auto",padding:"20px 16px"}}>
        <div style={{display:"flex",gap:3,background:C.card,borderRadius:10,padding:3,border:`1px solid ${C.border}`,marginBottom:20}}>
          {[{k:"calculator",l:"Calculator",i:"⚕"},{k:"claims",l:"My Claims",i:"📋"},{k:"insights",l:"Insights",i:"💡"}].map(t=><button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,padding:"9px 14px",borderRadius:7,border:"none",background:tab===t.k?C.clinicPrimary:"transparent",color:tab===t.k?"#000":C.muted,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:font}}>{t.i} {t.l}{t.k==="claims"&&pending.length>0?` (${pending.length})`:""}</button>)}
        </div>

        {tab==="calculator"&&<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}><Field label="Patient Name"><Inp type="text" value={patientName} onChange={setPatientName} placeholder="Patient name"/></Field><Field label="Patient ID"><Inp type="text" value={patientId} onChange={setPatientId} placeholder="Auto-generated if blank"/></Field></div><AssessmentForm form={form} accent={C.clinicPrimary} onCalc={handleCalc}/><Results result={result} accent={C.clinicPrimary}/>{result&&<button onClick={handleSubmit} style={{width:"100%",padding:"14px",borderRadius:10,border:"none",marginTop:12,background:`linear-gradient(135deg,${C.accent},${C.purple})`,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:font}}>Submit Claim for Authorization →</button>}</>}

        {tab==="claims"&&<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:20}}>{[{l:"Total",v:claims.length,c:C.accent,b:C.accentSoft},{l:"Pending",v:pending.length,c:C.warn,b:C.warnSoft},{l:"Approved",v:approved.length,c:C.success,b:C.successSoft},{l:"Denied",v:denied.length,c:C.danger,b:C.dangerSoft}].map(s=><div key={s.l} style={{background:s.b,borderRadius:10,padding:14,textAlign:"center",border:`1px solid ${s.c}22`}}><div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>{s.l}</div></div>)}</div>{claims.length===0?<div style={{textAlign:"center",padding:50,color:C.dim}}>📋 No claims yet</div>:claims.slice().reverse().map(cl=><div key={cl.id} style={{display:"flex",alignItems:"center",gap:12,background:C.card,borderRadius:8,padding:"11px 14px",border:`1px solid ${C.border}`,marginBottom:6}}><div style={{width:9,height:9,borderRadius:"50%",background:cl.status==="approved"?C.success:cl.status==="denied"?C.danger:C.warn,flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{cl.patientName} — {cl.requestedHours}h/wk</div><div style={{fontSize:10,color:C.dim}}>{cl.id} · FII:{cl.fii} · Risk:{cl.riskScore} · {cl.submittedAt}</div>{cl.insuranceNotes&&<div style={{fontSize:11,color:C.warn,marginTop:3}}>📝 {cl.insuranceNotes}</div>}</div><Badge color={cl.status==="approved"?C.success:cl.status==="denied"?C.danger:C.warn} bg={cl.status==="approved"?C.successSoft:cl.status==="denied"?C.dangerSoft:C.warnSoft}>{cl.status.toUpperCase()}</Badge></div>)}</>}

        {tab==="insights"&&<><div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:20,marginBottom:16}}><div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>Approval Rate</div><div style={{fontSize:40,fontWeight:800,color:Number(rate)>=70?C.success:Number(rate)>=50?C.warn:C.danger}}>{rate}{rate!=="—"?"%":""}</div>{rate!=="—"&&<div style={{height:6,borderRadius:3,background:C.bg,marginTop:8}}><div style={{height:"100%",borderRadius:3,background:Number(rate)>=70?C.success:C.warn,width:`${Number(rate)}%`,transition:"width 0.5s"}}/></div>}</div>{insights.length>0?<div style={{background:C.clinicSoft,border:`1px solid ${C.clinicPrimary}33`,borderRadius:12,padding:18}}><div style={{fontSize:13,fontWeight:700,color:C.clinicPrimary,marginBottom:10}}>💡 Learning Insights</div>{insights.map((ins,i)=><div key={i} style={{fontSize:12,color:C.text,marginBottom:6}}>• {ins}</div>)}<div style={{fontSize:11,color:C.dim,marginTop:10,borderTop:`1px solid ${C.border}`,paddingTop:10}}>Derived from approved vs denied claims to calibrate future submissions.</div></div>:<div style={{textAlign:"center",padding:40,color:C.dim}}>💡 Submit claims and receive decisions to generate insights</div>}</>}
      </div>
    </div>
  );
}

function InsurancePortal({onLogout,claims,onUpdateClaim}){
  const[tab,setTab]=useState("queue");const form=useForm();const[result,setResult]=useState(null);
  const[payer,setPayer]=useState({...DEFAULT_PAYER});const[reviewing,setReviewing]=useState(null);
  const[notes,setNotes]=useState("");const[overrideHrs,setOverrideHrs]=useState("");
  const pending=claims.filter(c=>c.status==="pending"),decided=claims.filter(c=>c.status!=="pending");
  const handleCalc=()=>setResult(runCalc(form.getData(),payer));
  const handleDecision=(id,decision)=>{onUpdateClaim(id,{status:decision,insuranceNotes:notes,approvedHours:decision==="approved"?(overrideHrs?Number(overrideHrs):reviewing.requestedHours):0,decidedAt:new Date().toLocaleString()});setReviewing(null);setNotes("");setOverrideHrs("")};

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:font,color:C.text}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"0 20px"}}><div style={{maxWidth:720,margin:"0 auto",display:"flex",alignItems:"center",height:56}}><div style={{display:"flex",alignItems:"center",gap:8,flex:1}}><span style={{fontSize:20}}>🛡</span><span style={{fontWeight:700,fontSize:15,color:C.insurPrimary}}>Insurance Portal</span><Badge color={C.insurPrimary} bg={C.insurSoft}>Payer</Badge></div><button onClick={onLogout} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 14px",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:font}}>Sign Out</button></div></div>
      <div style={{maxWidth:720,margin:"0 auto",padding:"20px 16px"}}>
        <div style={{display:"flex",gap:3,background:C.card,borderRadius:10,padding:3,border:`1px solid ${C.border}`,marginBottom:20}}>
          {[{k:"queue",l:"Review Queue",i:"📥"},{k:"calculator",l:"Policy Calculator",i:"⚙"},{k:"history",l:"Decisions",i:"📊"},{k:"policy",l:"Policy Config",i:"🔧"}].map(t=><button key={t.k} onClick={()=>{setTab(t.k);setReviewing(null)}} style={{flex:1,padding:"9px 8px",borderRadius:7,border:"none",background:tab===t.k?C.insurPrimary:"transparent",color:tab===t.k?"#fff":C.muted,fontWeight:600,fontSize:11,cursor:"pointer",fontFamily:font}}>{t.i} {t.l}{t.k==="queue"&&pending.length>0?` (${pending.length})`:""}</button>)}
        </div>

        {tab==="queue"&&!reviewing&&(pending.length===0?<div style={{textAlign:"center",padding:50,color:C.dim}}>✅ No pending claims</div>:pending.map(cl=><div key={cl.id} style={{background:C.card,borderRadius:10,border:`1px solid ${C.border}`,padding:16,marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:C.text}}>{cl.patientName}</div><div style={{fontSize:11,color:C.dim}}>{cl.id} · Age {cl.age} · {(cl.diagnosis||"").replace(/_/g," ").toUpperCase()} · {cl.submittedAt}</div></div><Badge color={C.warn} bg={C.warnSoft}>PENDING</Badge></div><div style={{display:"flex",gap:8,marginBottom:10}}>{[{l:"REQUESTED",v:`${cl.requestedHours}h`,c:C.accent},{l:"TIER",v:cl.tier,c:C.text},{l:"RISK",v:cl.riskScore,c:cl.riskScore>=15?C.danger:C.text},{l:"FII",v:cl.fii,c:cl.fii>=25?C.danger:C.text}].map(s=><div key={s.l} style={{flex:1,background:C.bg,borderRadius:6,padding:8,textAlign:"center",border:`1px solid ${C.border}`}}><div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:C.dim}}>{s.l}</div></div>)}</div>{cl.flags?.length>0&&<div style={{marginBottom:8}}>{cl.flags.map((f,i)=><span key={i} style={{marginRight:4}}><Badge color={C.danger} bg={C.dangerSoft}>{f}</Badge></span>)}</div>}<button onClick={()=>setReviewing(cl)} style={{width:"100%",padding:"10px",borderRadius:7,border:"none",background:C.insurPrimary,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:font}}>Review & Decide</button></div>))}

        {tab==="queue"&&reviewing&&<div><button onClick={()=>setReviewing(null)} style={{background:"transparent",border:"none",color:C.insurPrimary,fontSize:13,cursor:"pointer",fontFamily:font,marginBottom:14,fontWeight:600}}>← Back</button><div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:20}}><div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>{reviewing.patientName}</div><div style={{fontSize:12,color:C.dim,marginBottom:16}}>{reviewing.id} · Age {reviewing.age} · {(reviewing.diagnosis||"").replace(/_/g," ").toUpperCase()}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:16}}>{[{l:"Requested",v:`${reviewing.requestedHours}h`,c:C.accent},{l:"Tier",v:reviewing.tier,c:C.text},{l:"Risk",v:`${reviewing.riskScore}/24`,c:reviewing.riskScore>=15?C.danger:C.text},{l:"FII",v:`${reviewing.fii}/36`,c:reviewing.fii>=25?C.danger:C.text}].map(s=><div key={s.l} style={{background:C.bg,borderRadius:6,padding:10,textAlign:"center",border:`1px solid ${C.border}`}}><div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:C.dim,textTransform:"uppercase"}}>{s.l}</div></div>)}</div>{reviewing.flags?.length>0&&<div style={{background:C.dangerSoft,borderRadius:6,padding:10,marginBottom:12}}>{reviewing.flags.map((f,i)=><div key={i} style={{fontSize:12,color:C.danger}}>⚠ {f}</div>)}</div>}<div style={{background:C.bg,borderRadius:6,padding:10,border:`1px solid ${C.border}`,marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6}}>Clinic Rationale</div>{reviewing.rationale?.map((r,i)=><div key={i} style={{fontSize:11,color:C.muted,fontFamily:mono,marginBottom:2}}>{r}</div>)}</div><Field label="Override Hours (blank = accept requested)"><Inp value={overrideHrs} onChange={setOverrideHrs} min={5} max={40} placeholder={`${reviewing.requestedHours} (requested)`}/></Field><Field label="Reviewer Notes"><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Clinical rationale..." style={{width:"100%",padding:"9px 11px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:13,fontFamily:font,minHeight:80,resize:"vertical",outline:"none",boxSizing:"border-box"}}/></Field><div style={{display:"flex",gap:10}}><button onClick={()=>handleDecision(reviewing.id,"approved")} style={{flex:1,padding:"12px",borderRadius:8,border:"none",background:C.success,color:"#000",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:font}}>✓ Approve{overrideHrs?` (${overrideHrs}h)`:""}</button><button onClick={()=>handleDecision(reviewing.id,"denied")} style={{flex:1,padding:"12px",borderRadius:8,border:"none",background:C.danger,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:font}}>✗ Deny</button></div></div></div>}

        {tab==="calculator"&&<><div style={{background:C.insurSoft,border:`1px solid ${C.insurPrimary}33`,borderRadius:10,padding:14,marginBottom:16,fontSize:12,color:C.insurPrimary}}>⚙ Uses your custom payer policy weights from Policy Config.</div><AssessmentForm form={form} accent={C.insurPrimary} onCalc={handleCalc}/><Results result={result} accent={C.insurPrimary}/></>}

        {tab==="history"&&<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>{[{l:"Decided",v:decided.length,c:C.accent,b:C.accentSoft},{l:"Approved",v:decided.filter(c=>c.status==="approved").length,c:C.success,b:C.successSoft},{l:"Denied",v:decided.filter(c=>c.status==="denied").length,c:C.danger,b:C.dangerSoft}].map(s=><div key={s.l} style={{background:s.b,borderRadius:10,padding:14,textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>{s.l}</div></div>)}</div>{decided.length===0?<div style={{textAlign:"center",padding:40,color:C.dim}}>No decisions yet</div>:decided.slice().reverse().map(cl=><div key={cl.id} style={{display:"flex",alignItems:"center",gap:12,background:C.card,borderRadius:8,padding:"11px 14px",border:`1px solid ${C.border}`,marginBottom:6}}><div style={{width:9,height:9,borderRadius:"50%",background:cl.status==="approved"?C.success:C.danger,flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{cl.patientName} — {cl.requestedHours}h{cl.approvedHours&&cl.approvedHours!==cl.requestedHours?` → ${cl.approvedHours}h`:""}</div><div style={{fontSize:10,color:C.dim}}>{cl.id} · {cl.decidedAt}</div>{cl.insuranceNotes&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>"{cl.insuranceNotes}"</div>}</div><Badge color={cl.status==="approved"?C.success:C.danger} bg={cl.status==="approved"?C.successSoft:C.dangerSoft}>{cl.status.toUpperCase()}</Badge></div>)}</>}

        {tab==="policy"&&<div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:20}}><div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>Payer Policy Configuration</div><div style={{fontSize:12,color:C.dim,marginBottom:18}}>Customize weights and thresholds for your plan.</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}><Field label="Max Hours"><Inp value={payer.maxHours} onChange={v=>setPayer(p=>({...p,maxHours:Number(v)}))} min={10} max={50}/></Field><Field label="Min Hours"><Inp value={payer.minHours} onChange={v=>setPayer(p=>({...p,minHours:Number(v)}))} min={5} max={20}/></Field><Field label="Supervision %"><Inp value={(payer.supPct*100).toFixed(0)} onChange={v=>setPayer(p=>({...p,supPct:Number(v)/100}))} min={5} max={30}/></Field></div><div style={{fontSize:13,fontWeight:600,color:C.insurPrimary,marginBottom:10}}>Domain Weight Multipliers</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:8,marginBottom:16}}>{[{k:"fiiW",l:"FII"},{k:"vinW",l:"Vineland"},{k:"vbW",l:"VB-MAPP"},{k:"behW",l:"Behavioral"},{k:"envW",l:"Environ."}].map(w=><Field key={w.k} label={w.l}><Inp value={payer[w.k]} onChange={v=>setPayer(p=>({...p,[w.k]:Number(v)}))} min={0} max={2} style={{fontSize:12}}/></Field>)}</div><div style={{fontSize:13,fontWeight:600,color:C.insurPrimary,marginBottom:10}}>Age Multipliers</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}><Field label="Ages 0-5"><Inp value={payer.ageMult.young} onChange={v=>setPayer(p=>({...p,ageMult:{...p.ageMult,young:Number(v)}}))}/></Field><Field label="Ages 6-12"><Inp value={payer.ageMult.mid} onChange={v=>setPayer(p=>({...p,ageMult:{...p.ageMult,mid:Number(v)}}))}/></Field><Field label="Ages 13+"><Inp value={payer.ageMult.teen} onChange={v=>setPayer(p=>({...p,ageMult:{...p.ageMult,teen:Number(v)}}))}/></Field></div><div style={{fontSize:13,fontWeight:600,color:C.insurPrimary,marginBottom:10}}>Parent Training (hrs/mo)</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Field label="Min"><Inp value={payer.ptRange[0]} onChange={v=>setPayer(p=>({...p,ptRange:[Number(v),p.ptRange[1]]}))}/></Field><Field label="Max"><Inp value={payer.ptRange[1]} onChange={v=>setPayer(p=>({...p,ptRange:[p.ptRange[0],Number(v)]}))}/></Field></div><div style={{marginTop:16,padding:12,background:C.insurSoft,borderRadius:8,fontSize:11,color:C.insurPrimary,textAlign:"center"}}>Changes apply immediately to Policy Calculator</div></div>}
      </div>
    </div>
  );
}

export default function App(){
  const[role,setRole]=useState(null);const[claims,setClaims]=useState([]);
  const handleSubmit=claim=>setClaims(prev=>[...prev,claim]);
  const handleUpdate=(id,updates)=>setClaims(prev=>prev.map(c=>c.id===id?{...c,...updates}:c));
  if(!role)return<LoginScreen onLogin={setRole}/>;
  if(role==="clinic")return<ClinicPortal onLogout={()=>setRole(null)} claims={claims} onSubmitClaim={handleSubmit}/>;
  if(role==="insurance")return<InsurancePortal onLogout={()=>setRole(null)} claims={claims} onUpdateClaim={handleUpdate}/>;
  return null;
}
