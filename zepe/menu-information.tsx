'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Check,ChevronRight,Cookie,Leaf,Moon,Sun,Sunrise,Truck} from 'lucide-react';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from '@/components/ui/table';
import {packages,recipes,money,type Recipe} from '@/lib/data';
import {pricing,mealNames} from '@/lib/pricing';
import {FoodImage,Choice} from './shell';

const days=['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
const drinkExamples=['Elma, salatalık & ıspanak','Havuç, portakal & zencefil','Pancar, elma & limon','Ananas, salatalık & nane','Armut, ıspanak & limon','Elma, havuç & zencefil'];
export function WeeklyMenu({packageId,onRecipe}:{packageId?:string;onRecipe:(r:Recipe)=>void}){
  const [selected,setSelected]=useState(packageId||'dengeli-beslenme');
  const [day,setDay]=useState(0);
  useEffect(()=>{if(packageId)setSelected(packageId)},[packageId]);
  const cfg=pricing[selected];
  const pkg=packages.find(p=>p.id===selected)!;
  const meals=cfg.defaults.map((key,i)=>{
    const slot=key==='breakfast'?'Kahvaltı':key==='lunch'?'Öğle':'Akşam';let pool=recipes.filter(r=>r.category===slot);
    if(selected==='yuksek-protein'&&key!=='breakfast')pool=pool.filter(r=>r.protein>=30);
    return {label:slot,recipe:pool[(day+i)%pool.length],Icon:key==='breakfast'?Sunrise:key==='lunch'?Sun:Moon};
  });
  const snackPool=recipes.filter(r=>r.category==='Ara öğün');
  const snacks=Array.from({length:cfg.snacks},(_,i)=>({label:`${i+1}. ara öğün`,recipe:snackPool[(day+i)%snackPool.length],Icon:Cookie}));
  const shown=[...meals,...snacks];
  const kcal=shown.reduce((s,m)=>s+m.recipe.kcal,0),protein=shown.reduce((s,m)=>s+m.recipe.protein,0);
  return <section className="weekly-menu" aria-label="Paketlere göre örnek haftalık menü">
    <div className="weekly-menu-heading"><div><span className="eyebrow">MUTFAKTAN BİR ÖRNEK</span><h2>Haftana neler eşlik etsin?</h2></div>{!packageId&&<div className="weekly-package-choice"><label className="form-field">Paket<Choice label="Örnek menü paketi" value={selected} onChange={setSelected} options={packages.map(p=>({value:p.id,label:p.name}))}/></label></div>}</div>
    <p className="menu-disclaimer">Bu menü bir örnektir; güncel üretim takvimi değildir. Öğünler, porsiyonlar ve alerjen uygunluğu Zepe ekibiyle kişisel planına göre netleşir.</p>
    <div className="weekly-day-picker" aria-label="Örnek menü günü">{days.map((d,i)=><button key={d} aria-pressed={day===i} className={day===i?'selected':''} onClick={()=>setDay(i)}><span>0{i+1}</span><strong>{d.slice(0,3)}</strong><span className="sr-only">{d}</span></button>)}</div>
    <div className="weekly-day-title"><div><h3>{days[day]}</h3><p>{pkg.name} · {cfg.defaults.length>0?`${cfg.defaults.length} ana öğün`:''}{cfg.snacks>0?` + ${cfg.snacks} ara öğün`:''}{cfg.drinkCount>0?` ${cfg.drinkCount} içecek`:''}</p></div>{!cfg.drinkCount&&<div className="weekly-nutrition"><strong>~{kcal}<span> kcal</span></strong><span>{protein} g protein · örnek gün</span></div>}</div>
    <div className="weekly-meals">{shown.map((m,i)=><button className="weekly-meal" key={`${m.label}-${i}`} onClick={()=>onRecipe(m.recipe)}><span className="weekly-slot"><m.Icon size={21}/>{m.label}{m.Icon===Cookie&&<small>Pakete dahil</small>}</span><FoodImage src={m.recipe.image} alt={`${m.recipe.name}, temsili sunum`} className=""/><div className="weekly-meal-copy"><h4>{m.recipe.name}</h4><p>{m.recipe.description}</p><span className="fine">{m.recipe.kcal} kcal · {m.recipe.protein} g protein</span><span className="weekly-allergens">Alerjenler: {m.recipe.allergens.length?m.recipe.allergens.join(', '):'İçerikte belirtilen yok'}</span></div><ChevronRight size={19}/></button>)}</div>
    {cfg.drinkCount>0&&<div className="weekly-drinks"><div><Leaf size={25}/><h3>{cfg.drinkCount} meyve & sebze içeceği</h3><span className="tag"><Check size={13}/>Otomatik dahil</span></div><p>Örnek içecek eşleşmeleri. Gerçek çeşitler ve içerikler, program öncesi paylaşılır.</p><ol>{drinkExamples.slice(0,cfg.drinkCount).map((d,i)=><li key={d}><span>0{i+1}</span>{d}</li>)}</ol></div>}
    <p className="fine section-footnote">Besin değerleri yaklaşık ve örnek porsiyonlar içindir. İçerikte alerjen belirtilmemesi, çapraz temas bulunmadığı anlamına gelmez.</p>
  </section>;
}

export function PackageFacts({id}:{id:string}){const cfg=pricing[id];return <section className="package-facts"><h2>Paketin içinde ne var?</h2><div className="package-fact-grid">{cfg.max>0&&<div><Sun size={24}/><strong>{cfg.defaults.length} ana öğün</strong><span>{cfg.defaults.map(k=>mealNames[k]).join(' · ')}</span></div>}{cfg.snacks>0&&<div><Cookie size={24}/><strong>{cfg.snacks} ara öğün</strong><span>Her gün otomatik dahil</span></div>}{cfg.drinkCount>0&&<div><Leaf size={24}/><strong>{cfg.drinkCount} içecek</strong><span>Her gün otomatik dahil</span></div>}<div><Truck size={24}/><strong>İstanbul teslimatı</strong><span>Evine veya ofisine</span></div></div><div className="package-detail-notes"><details><summary>Porsiyon ve menü nasıl belirleniyor?</summary><p>Seçtiğin öğün düzeni, beslenme tercihlerin ve günlük ihtiyaçların diyetisyen görüşmesinde değerlendirilir. Buradaki menüler örnektir; teslim edilecek içerik ve porsiyonlar ayrıca netleşir.</p></details><details><summary>Alerjim veya sevmediğim malzemeler varsa?</summary><p>Paket oluştururken alerjenlerini ve sevmediğin malzemeleri ekleyebilirsin. Alerjen seçimi bir üretim garantisi değildir; içerik ve çapraz temas uygunluğunu Zepe ekibiyle sipariş öncesinde teyit etmelisin.</p></details><details><summary>Teslimat ve saklama</summary><p>Hizmet yalnızca İstanbul içindir. İlçeni ve açık adresini seçtikten sonra uygun gün ve saat adresine göre teyit edilir. Öğünlerini teslim aldığında ürün etiketindeki saklama, ısıtma ve son tüketim talimatlarını izle.</p></details></div></section>}

export function PriceComparison(){const [days,setDays]=useState('5');return <section className="price-comparison" id="karsilastir"><div className="section-head"><div><span className="eyebrow">BİR BAKIŞTA PAKETLER</span><h2>Ritmine uygun olanı bul.</h2></div><div style={{minWidth:160}}><label className="form-field">Karşılaştırma süresi<Choice label="Karşılaştırma gün sayısı" value={days} onChange={setDays} options={[1,3,5,15,30].map(n=>({value:String(n),label:`${n} gün`}))}/></label></div></div><Table><TableHeader><TableRow><TableHead>Paket</TableHead><TableHead>Standart günlük içerik</TableHead><TableHead>Günlük başlangıç</TableHead><TableHead>{days} gün / 1 kişi</TableHead><TableHead><span className="sr-only">Paket ayrıntıları</span></TableHead></TableRow></TableHeader><TableBody>{packages.map(p=>{const cfg=pricing[p.id],supported=cfg.days.includes(Number(days));return <TableRow key={p.id}><TableCell><strong>{p.name}</strong></TableCell><TableCell>{cfg.defaults.length?`${cfg.defaults.length} ana öğün`:''}{cfg.snacks?` + ${cfg.snacks} ara öğün`:''}{cfg.drinkCount?`${cfg.defaults.length?' + ':''}${cfg.drinkCount} içecek`:''}</TableCell><TableCell>{money(p.price)}</TableCell><TableCell>{supported?<strong>{money(p.price*Number(days))}</strong>:<span className="fine">Bu süre yok</span>}</TableCell><TableCell><Link href={`/paketler/${p.id}`} className="text-link" aria-label={`${p.name} paketini incele`}>İncele<ArrowRight size={15}/></Link></TableCell></TableRow>})}</TableBody></Table><p className="fine section-footnote">Standart içerik ve günlük başlangıç fiyatı üzerinden örnek hesaplamadır. Öğün değişiklikleri fiyatı etkileyebilir; kesin içerik, fiyat ve teslimat ayrıca onaylanır.</p></section>}
