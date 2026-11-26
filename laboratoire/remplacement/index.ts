/* Mon Dressing - atelier de remplacement V1
   Edge Function SEPAREE de assistant-style et assistant-style-labo.
   Lecture du catalogue sous RLS utilisateur ; aucun INSERT/UPDATE/DELETE.
   Mode candidats : gratuit. Mode remplacer : 1 appel IA potentiellement payant. */
import { withSupabase } from "jsr:@supabase/server@1";

const OWNER = "6c69968a-7b73-4922-b041-71aa96a98051";
const CORS = {
  "Access-Control-Allow-Origin":"https://clairette70.github.io",
  "Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods":"POST, OPTIONS"
};
const SELECT = "id,nom,categorie,sous_categorie,couleur,matiere,coupe,style,saison,chaleur,confort,description";
type Piece = {id:number;nom:string;categorie:string;sous_categorie?:string|null;couleur?:string|null;matiere?:string|null;coupe?:string|null;style?:string|null;saison?:string|null;chaleur?:string|null;confort?:string|null;description?:string|null};
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:CORS});
const normalize=(x:unknown)=>String(x??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
function role(p:Piece):string {
  const sources=[String(p.nom||""),String(p.sous_categorie||""),String(p.categorie||"")];
  const detect=(x:string, collective=false):string=>{
    const v=normalize(x);
    if(/\brobe[s]?\s+blazer\b|\brobe[s]?\b|\bcombinaisons?\b/.test(v))return "robe";
    if(/\bmanteaux?\b|\btrench\b|\bparka\b|\bdoudoune\b|\bcaban\b/.test(v)&& !collective)return "manteau";
    if(/\bvestes?\b|\bperfectos?\b|\bblazers?\b|\bblousons?\b/.test(v)&& !collective)return "veste";
    if(/\bchaussures?\b|\bbottines?\b|\bboots?\b|\bbottes?\b|\bsantiags?\b|\bescarpins?\b|\bmocassins?\b|\bsneakers?\b|\bbaskets?\b|\bsandales?\b/.test(v))return "chaussures";
    if(/\bsacs?\b|\bcabas\b|\bpochettes?\b|\bbesaces?\b/.test(v))return "sac";
    if(/\bceintures?\b/.test(v))return "ceinture";
    if(/\bponchos?\b|\bcapes?\b/.test(v))return "poncho";
    if(/\bpantalons?\b|\bjupes?\b|\bjeans?\b|\bshorts?\b|\bleggings?\b/.test(v))return "bas";
    if(/\bchemises?\b|\bblouses?\b|\bpulls?\b|\bsweats?\b|\bt ?shirts?\b|\btee ?shirts?\b|\btops?\b|\bhauts?\b|\bgilets?\b|\bcardigans?\b/.test(v))return "haut";
    if(/\baccessoires?\b|\bbroches?\b|\bbijoux\b|\bfoulards?\b/.test(v))return "accessoire";
    return "";
  };
  for(let i=0;i<sources.length;i++){
    const v=normalize(sources[i]);
    if(i===2 && /\b(vestes?|manteaux?)\b.*\b(vestes?|manteaux?)\b/.test(v))continue;
    const r=detect(sources[i]);if(r)return r;
  }
  return "autre";
}
const validIds=(v:unknown,max:number)=>Array.isArray(v)&&v.length>0&&v.length<=max&&v.every(x=>Number.isSafeInteger(x)&&x>0)&&new Set(v).size===v.length;
const shown=(p:Piece)=>({
  id:p.id,nom:p.nom,role:role(p),couleur:p.couleur||"",matiere:p.matiere||"",
  coupe:p.coupe||"",style:p.style||"",saison:p.saison||"",chaleur:p.chaleur||"",
  confort:p.confort||"",description:String(p.description||"").slice(0,650)
});
function loadAI(){
  const provider=(Deno.env.get("LAB_AI_PROVIDER")||"").toLowerCase().trim();
  const model=Deno.env.get("LAB_AI_MODEL_STYLE")||"";
  const key=provider==="openai"?Deno.env.get("LAB_OPENAI_KEY"):
            provider==="anthropic"?Deno.env.get("LAB_ANTHROPIC_KEY"):undefined;
  return {provider,model,key};
}
async function chooseAI(outfit:Piece[],toReplace:Piece,candidates:Piece[],context:unknown):
Promise<{id:number;conseil:string}> {
  const cfg=loadAI();
  if(!cfg.key||!cfg.model||!["openai","anthropic"].includes(cfg.provider))
    throw new Error("IA_NON_CONFIGUREE");
  const system=[
    "Tu es le styliste exigeant de Mon Dressing. Choisis UN SEUL vêtement de remplacement uniquement parmi les candidats avec leurs IDs.",
    "IMPORTANT : aucun autre vêtement de la tenue ne doit changer. Les candidats sont du même rôle que la pièce remplacée.",
    "Priorité absolue : silhouette harmonieuse et flatteuse, morphologie en A, chic féminin contemporain, contraste maîtrisé (une seule pièce forte lorsque pertinent).",
    "Couleurs froides préférées sans interdits absolus. Ne pas surcharger. Respecter les coupes, matières, contraintes et météo transmises si elles sont connues.",
    "Les photos ne te sont pas transmises : ne prétends pas les voir. Ne crée ni vêtement ni propriété nouvelle.",
    "Si aucune candidate ne permet une association vraiment convaincante, renvoie id=0. Sinon un seul ID parmi candidats.",
    "Le conseil doit être bref, factuel et facultatif : 1 phrase, sans contrainte stricte de 40 mots. JSON uniquement."
  ].join("\n");
  const input={tenue_complete:outfit.map(shown),piece_a_remplacer:shown(toReplace),
    candidats:candidates.map(shown),contexte:context||{}};
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),55000);
  try{
    let res:Response;
    if(cfg.provider==="openai"){
      res=await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",signal:ctrl.signal,
        headers:{"Authorization":"Bearer "+cfg.key,"Content-Type":"application/json"},
        body:JSON.stringify({model:cfg.model,messages:[{role:"system",content:system},{role:"user",content:JSON.stringify(input)}],
          max_completion_tokens:1600,response_format:{type:"json_schema",json_schema:{
            name:"remplacement_piece_v1",strict:true,
            schema:{type:"object",properties:{id:{type:"integer"},conseil:{type:"string"}},
              required:["id","conseil"],additionalProperties:false}
          }}})
      });
    }else{
      res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",signal:ctrl.signal,
        headers:{"x-api-key":cfg.key,"anthropic-version":"2023-06-01","Content-Type":"application/json"},
        body:JSON.stringify({model:cfg.model,max_tokens:1300,system,
          messages:[{role:"user",content:JSON.stringify(input)}]})
      });
    }
    if(!res.ok){console.error("Remplacement lab API status",res.status);throw new Error("ERREUR_FOURNISSEUR");}
    const data=await res.json();
    if(cfg.provider==="openai"&&data?.choices?.[0]?.finish_reason==="length")throw new Error("REPONSE_TRONQUEE");
    const content=cfg.provider==="openai"?data?.choices?.[0]?.message?.content:
       data?.content?.filter((x:{type:string})=>x.type==="text").map((x:{text:string})=>x.text).join("");
    if(typeof content!=="string")throw new Error("FORMAT_REPONSE");
    const parsed=JSON.parse(content);
    if(!parsed||!Number.isSafeInteger(parsed.id)||typeof parsed.conseil!=="string")
      throw new Error("FORMAT_REPONSE");
    return {id:parsed.id,conseil:parsed.conseil.slice(0,500)};
  }finally{clearTimeout(timer);}
}
const handler=withSupabase({auth:"user"},async(req,ctx)=>{
  if(ctx.jwtClaims?.sub!==OWNER)return json({error:"Accès non autorisé."},403);
  if(req.method!=="POST")return json({error:"Méthode non autorisée."},405);
  try{
    const raw=await req.text();if(raw.length>15000)return json({error:"Requête trop volumineuse."},413);
    const input=JSON.parse(raw);
    if(!input||typeof input!=="object"||Array.isArray(input))return json({error:"Requête invalide."},400);
    const mode=input.mode;
    if(!["diagnostic","candidats","remplacer"].includes(mode))
      return json({error:"Mode inconnu."},400);
    const {data,error}=await ctx.supabase.from("vêtements").select(SELECT).order("id",{ascending:true}).limit(501);
    if(error){console.error("Remplacement lab catalogue",error.code);return json({error:"Catalogue inaccessible."},500);}
    const all=(data||[]) as Piece[];
    if(all.length>500)return json({error:"Le catalogue dépasse la limite de 500 pièces."},422);
    const byId=new Map(all.map(p=>[p.id,p]));
    if(mode==="diagnostic"){
      return json({status:"pret",nombre_pieces:all.length,fournisseur_configure:Boolean(loadAI().key&&loadAI().model),
        mode:"diagnostic",information:"Aucun appel IA et aucune écriture dans la base."});
    }
    const ids=input.tenue_pieces,replaceId=input.piece_a_remplacer;
    const rejected=input.ids_deja_refuses||[];
    if(!validIds(ids,18)||!Number.isSafeInteger(replaceId)||!ids.includes(replaceId)
      ||!Array.isArray(rejected)||rejected.length>100||rejected.some((v:unknown)=>!Number.isSafeInteger(v)))
      return json({error:"Tenue ou sélection de pièce invalide."},400);
    if(ids.some((id:number)=>!byId.has(id)))
      return json({error:"La tenue contient une pièce absente de ton dressing."},422);
    const outfit=ids.map((id:number)=>byId.get(id)!);
    const old=byId.get(replaceId)!;const oldRole=role(old);
    if(oldRole==="autre")return json({error:"Catégorie insuffisamment précise pour un remplacement fiable."},422);
    const blocked=new Set<number>([...ids,...rejected]);
    const candidates=all.filter(p=>role(p)===oldRole&&!blocked.has(p.id));
    if(candidates.length>120)return json({error:"Trop d'alternatives dans cette catégorie : recherche à affiner sans exclure silencieusement des vêtements."},422);
    if(!candidates.length)return json({status:"aucune_alternative",nombre_candidats:0,message:"Aucun autre vêtement compatible dans cette catégorie."});
    if(mode==="candidats"){
      return json({status:"pret",role:oldRole,nom_piece:old.nom,nombre_candidats:candidates.length,
        information:"Diagnostic gratuit : aucun appel IA. L'harmonie n'est pas encore évaluée."});
    }
    const result=await chooseAI(outfit,old,candidates,input.contexte);
    if(result.id===0)return json({status:"aucune_alternative",nombre_candidats:candidates.length,message:result.conseil||"Aucune alternative satisfaisante."});
    const selected=candidates.find(p=>p.id===result.id);
    if(!selected)return json({error:"L'IA a proposé une pièce non autorisée. Aucune modification effectuée."},422);
    const replaced=ids.map((id:number)=>id===replaceId?selected.id:id);
    if(replaced.length!==ids.length||replaced.some((id:number,i:number)=>id!==ids[i]&&ids[i]!==replaceId))
      return json({error:"Vérification du remplacement impossible."},500);
    return json({status:"remplacement_propose",nouvelle_piece_id:selected.id,ancienne_piece_id:replaceId,
      tenue_pieces:replaced,nombre_candidats:candidates.length,conseil:result.conseil,
      fournisseur:loadAI().provider,information:"Résultat provisoire ; rien n'a été enregistré."});
  }catch(e){
    console.error("Atelier remplacement",e instanceof Error?e.message:"Erreur");
    const message=e instanceof Error?e.message:"";
    const safe=message==="IA_NON_CONFIGUREE"?"IA du laboratoire non configurée.":
      message==="REPONSE_TRONQUEE"?"Réponse IA tronquée.":message==="FORMAT_REPONSE"?"Réponse IA non exploitable.":message==="ERREUR_FOURNISSEUR"?"Le fournisseur IA a renvoyé une erreur.":"Erreur du laboratoire. Aucun résultat n'a été enregistré.";
    return json({error:safe},message==="IA_NON_CONFIGUREE"?503:422);
  }
});
export default {async fetch(req:Request){
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
  const res=await handler(req);
  const headers=new Headers(res.headers);for(const [k,v] of Object.entries(CORS))headers.set(k,v);
  return new Response(res.body,{status:res.status,headers});
}};
