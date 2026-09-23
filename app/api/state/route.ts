import {headers} from 'next/headers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {readState,writeState} from '@/lib/server-store';
import {patchSchema} from '@/lib/model';
import {prepareOrder} from '@/lib/checkout';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
async function identity(){const h=await headers();const user=await getChatGPTUser();const id=h.get('oai-authenticated-user-id');return user&&id?{...user,id}:null;}
export async function GET(){try{const user=await identity();if(!user)return json({error:'Hesabına giriş yapman gerekiyor.'},401);const data=await readState(user.id);return json({...data,user:{name:user.fullName||'',email:user.email}})}catch(e){console.error('Zepe account read unavailable');return json({error:'Hesabın şu an yüklenemiyor. Tekrar deneyebilirsin.'},503)}}
export async function PUT(request:Request){return mutate(request,'patch')}
export async function POST(request:Request){return mutate(request,'draft')}
export async function DELETE(request:Request){return mutate(request,'delete')}
async function mutate(request:Request,mode:string){try{if(request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Geçersiz istek.'},403);const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'Geçersiz kaynak.'},403);const user=await identity();if(!user)return json({error:'Hesabına giriş yapman gerekiyor.'},401);const text=await request.text();if(text.length>70000)return json({error:'İstek çok büyük.'},413);let body;try{body=JSON.parse(text)}catch{return json({error:'Geçersiz veri.'},400)}if(!Number.isInteger(body.version)||body.version<0)return json({error:'Geçersiz sürüm.'},400);const current=await readState(user.id);if(current.version!==body.version)return json({error:'Hesabın başka bir sekmede güncellendi. Sayfayı yenileyip tekrar dene.'},409);let state=current.state;
if(mode==='patch'){const parsed=patchSchema.safeParse(body.patch);if(!parsed.success)return json({error:parsed.error.issues[0]?.message||'Bilgilerini kontrol et.'},400);state={...state,...parsed.data};}
if(mode==='draft'){if(body.itemId!==undefined&&typeof body.itemId!=='string')return json({error:'Geçersiz paket seçimi.'},400);const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());let order;try{order=prepareOrder(state,today,body.itemId)}catch(e){return json({error:e instanceof Error?e.message:'Sipariş bilgilerini kontrol et.'},400)}state={...state,cart:body.itemId?state.cart.filter(i=>i.id!==body.itemId):[],shopCart:body.itemId?state.shopCart:[],orders:[order,...state.orders]};}
if(mode==='delete'){if(typeof body.id!=='string')return json({error:'Geçersiz taslak.'},400);state={...state,orders:state.orders.filter(o=>o.id!==body.id)};}
const version=await writeState(user.id,state,body.version);return json({state,version});
}catch(e){if(e instanceof Error&&e.message==='CONFLICT')return json({error:'Hesabın güncellendi. Sayfayı yenileyip tekrar dene.'},409);console.error('Zepe account save unavailable');return json({error:'Kaydedemedik. Bilgilerin ekranda duruyor; tekrar deneyebilirsin.'},503)}}
