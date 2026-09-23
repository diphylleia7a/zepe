'use client';

import {useEffect,useId,useState} from 'react';
import {ArrowRight,Check,Cookie,Leaf,Moon,Sun,Sunrise,X} from 'lucide-react';
import {Checkbox} from '@/components/ui/checkbox';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {Sheet,SheetClose,SheetContent,SheetDescription,SheetTitle} from '@/components/ui/sheet';
import {packages,money} from '@/lib/data';
import {pricing,mealNames,type MealKey,type quote} from '@/lib/pricing';
import {Choice,FoodImage} from './shell';

const mealSlots=[
  {key:'breakfast',label:'Sabah',Icon:Sunrise},
  {key:'lunch',label:'Öğle',Icon:Sun},
  {key:'dinner',label:'Akşam',Icon:Moon},
] as const;

type ControlsProps={
  packageId:string;
  days:number;
  people:string;
  meals:MealKey[];
  onDaysChange:(days:number)=>void;
  onPeopleChange:(people:string)=>void;
  onMealChange:(meal:MealKey)=>void;
};
type ConfigurationProps=ControlsProps&{
  price:ReturnType<typeof quote>;
  valid:boolean;
  busy:boolean;
};

export function PackageOptions({packageId,onPackageChange,days}:{
  packageId:string;
  onPackageChange:(id:string)=>void;
  days:number;
}){
  const cfg=pricing[packageId];
  return <>
    <section className="order-section subscription-section">
      <div className="order-section-title">
        <span>01</span>
        <div><h2 id="subscription-title">Hangi abonelik sana göre?</h2><p>Hedefine ve günlük düzenine uygun olanı seç.</p></div>
      </div>
      <RadioGroup value={packageId} onValueChange={onPackageChange} className="subscription-grid" aria-labelledby="subscription-title">
        {packages.map(p=><label key={p.id} className={`subscription-option ${packageId===p.id?'selected':''}`}>
          <FoodImage src={p.image} alt="" className="subscription-photo"/>
          <div><h3>{p.name}</h3><p>{p.description}</p></div>
          <RadioGroupItem value={p.id} aria-label={p.name} className="subscription-radio"/>
        </label>)}
      </RadioGroup>
    </section>
    <section className="builder-perks" aria-labelledby="included-title">
      <span className="eyebrow"><Check size={14}/>Paketine dahil</span>
      <h2 id="included-title">{cfg.snacks>0?'Günün küçük iyi molaları.':'Gün boyu iyi eşlikçiler.'}</h2>
      <p>{cfg.snacks>0?'Ana öğünlerini sen seç. Aralarına eşlik eden küçük molalar, paketinde hazır.':'Meyve ve sebze içecekleri, seçtiğin programın bir parçası. Ayrı ayrı eklemene gerek yok.'}</p>
      <div className="builder-perk-items">
        {cfg.snacks>0&&<div className="builder-perk-item">
          <span className="builder-perk-icon"><Cookie size={30} strokeWidth={1.5}/></span>
          <div><h3><strong>{cfg.snacks}</strong> ara öğün <span>/ gün</span></h3><p>Kişi başı, {days} günde {days*cfg.snacks} küçük mola.</p></div>
          <span className="builder-included-label"><Check size={13}/>Dahil</span>
        </div>}
        {cfg.drinkCount>0&&<div className="builder-perk-item">
          <span className="builder-perk-icon"><Leaf size={30} strokeWidth={1.5}/></span>
          <div><h3><strong>{cfg.drinkCount}</strong> detoks içeceği <span>/ gün</span></h3><p>Kişi başı, {days} günde {days*cfg.drinkCount} meyve-sebze içeceği.</p></div>
          <span className="builder-included-label"><Check size={13}/>Dahil</span>
        </div>}
      </div>
      <p className="builder-perks-note">Adetler seçtiğin pakete göre belirlenir. Günlük ve toplam paket fiyatının içindedir.</p>
    </section>
  </>;
}

function PackageControls({packageId,days,people,meals,onDaysChange,onPeopleChange,onMealChange,section}:ControlsProps&{section?:'meals'|'days'}){
  const cfg=pricing[packageId];
  const ruleId=useId();
  const mealRule=cfg.max===1?'Her gün 1 ana öğün seç.':cfg.min===cfg.max?`Her gün ${cfg.min} ana öğün seç.`:'Gününe uyan öğünleri seç.';
  function mealOption({key,label,Icon}:typeof mealSlots[number]){
    const checked=meals.includes(key);
    const unavailable=!cfg.allowed.includes(key);
    const disabled=unavailable||(!checked&&cfg.max>1&&meals.length>=cfg.max);
    return <label key={key} className={`builder-meal-option ${checked?'selected':''} ${disabled?'unavailable':''}`}>
      {cfg.max===1
        ?<RadioGroupItem value={key} disabled={unavailable} aria-label={mealNames[key]} className="builder-meal-input"/>
        :<Checkbox checked={checked} disabled={disabled} onCheckedChange={()=>onMealChange(key)} aria-label={mealNames[key]} className="builder-meal-input"/>}
      <Icon size={25} strokeWidth={1.5}/>
      <span>{label}</span>
      {unavailable&&<span className="sr-only">Bu pakette yer almıyor.</span>}
    </label>;
  }
  return <div className="builder-controls">
    {section!=='days'&&cfg.max>0&&<fieldset className="builder-control-group">
      <legend>Hangi öğünler?</legend>
      <p id={ruleId} className="builder-control-hint">{mealRule}</p>
      {cfg.max===1
        ?<RadioGroup value={meals[0]} onValueChange={value=>onMealChange(value as MealKey)} className="builder-meal-options" aria-label="Ana öğün" aria-describedby={ruleId} orientation="horizontal">{mealSlots.map(mealOption)}</RadioGroup>
        :<div className="builder-meal-options" role="group" aria-label="Ana öğünler" aria-describedby={ruleId}>{mealSlots.map(mealOption)}</div>}
    </fieldset>}
    {section!=='days'&&cfg.max===0&&<div className="builder-drink-program"><Leaf size={23}/><div><strong>İçeceklerden oluşan program</strong><p>Bu pakette ana öğün seçimi yok.</p></div></div>}
    {section!=='meals'&&<fieldset className="builder-control-group">
      <legend>Kaç gün?</legend>
      <RadioGroup value={String(days)} onValueChange={value=>onDaysChange(Number(value))} className="builder-day-options" style={{gridTemplateColumns:`repeat(${cfg.days.length},minmax(0,1fr))`}} aria-label="Paket süresi" orientation="horizontal">
        {cfg.days.map(n=><label key={n} className={`builder-day-option ${days===n?'selected':''}`}>
          <RadioGroupItem value={String(n)} aria-label={`${n} gün`} className="sr-only"/>
          <strong>{n}</strong><span>gün</span>
        </label>)}
      </RadioGroup>
    </fieldset>}
    {section!=='meals'&&<div className="builder-people-row"><span>Kaç kişi?</span><div><Choice label="Kişi sayısı" value={people} onChange={onPeopleChange} options={[1,2,3,4].map(n=>({value:String(n),label:`${n} kişi`}))}/></div></div>}
    <section className="builder-included" aria-label="Her gün paketine dahil olanlar">
      <div className="builder-included-heading"><span><Check size={14}/>Paketine dahil</span><small>Her gün</small></div>
      <ul>
        {cfg.snacks>0&&<li><Cookie size={16}/>{cfg.snacks} ara öğün</li>}
        {cfg.drinkCount>0&&<li><Leaf size={16}/>{cfg.drinkCount} detoks içeceği</li>}
      </ul>
    </section>
  </div>;
}

function ConfigurationPrice({price,days,people}:{price:ReturnType<typeof quote>;days:number;people:string}){
  return <div className="builder-price" aria-live="polite" aria-atomic="true">
    <div><span>Tahmini toplam</span><strong>{money(price.total)}</strong></div>
    <div><p><b>{money(price.daily)}</b> / kişi / gün</p><p>{days} gün · {people} kişi</p></div>
  </div>;
}

export function PackageConfigurator(props:ConfigurationProps){
  const pkg=packages.find(p=>p.id===props.packageId)!;
  const cfg=pricing[props.packageId];
  return <aside className="order-summary builder-configurator" aria-label="Paket seçimlerin">
    <div className="builder-configurator-scroll">
      <div className="builder-configurator-heading"><span className="eyebrow">Senin paketin</span><h2>{pkg.name}</h2></div>
      <PackageControls {...props}/>
    </div>
    <div className="builder-configurator-footer">
      {!props.valid&&<p className="builder-selection-error" role="status">{cfg.min===cfg.max?`${cfg.min} ana öğün seçmelisin.`:'Devam etmek için en az 1 ana öğün seç.'}</p>}
      <ConfigurationPrice {...props}/>
      <button type="submit" form="order-builder" className="button full black desktop-continue" disabled={props.busy||!props.valid}>Devam et<ArrowRight size={17}/></button>
      <p className="builder-price-note">Örnek fiyatlandırma. Kesin fiyat ve teslimat Zepe ile onaylanır. Bu adımda ödeme alınmaz.</p>
    </div>
  </aside>;
}

export function PackageControlsSheet(props:ConfigurationProps&{open:boolean;onOpenChange:(open:boolean)=>void;initialSection?:'meals'|'days'}){
  const pkg=packages.find(p=>p.id===props.packageId)!;
  const [section,setSection]=useState<'meals'|'days'>(props.initialSection||'meals');
  useEffect(()=>{if(props.open)setSection(props.initialSection||'meals')},[props.open,props.initialSection]);
  return <Sheet open={props.open} onOpenChange={props.onOpenChange}>
    <SheetContent side="bottom" className="builder-controls-sheet" showCloseButton={false}>
      <div className="builder-sheet-heading"><div><SheetTitle>Paketini düzenle</SheetTitle><SheetDescription>{pkg.name}</SheetDescription></div><SheetClose asChild><button type="button" className="icon-btn" aria-label="Paket seçimlerini kapat"><X size={22}/></button></SheetClose></div>
      <div className="sheet-step-nav" aria-label="Paket seçimi adımları"><button type="button" aria-current={section==='meals'?'step':undefined} onClick={()=>setSection('meals')}>01 Öğünler</button><button type="button" aria-current={section==='days'?'step':undefined} onClick={()=>setSection('days')}>02 Günler & kişi</button></div>
      <div className="builder-sheet-scroll"><PackageControls {...props} section={section}/></div>
      <div className="builder-sheet-footer">
        {!props.valid&&<p className="builder-selection-error" role="status">Bu paket için {pricing[props.packageId].min===pricing[props.packageId].max?pricing[props.packageId].min:`en az ${pricing[props.packageId].min}`} ana öğün seç.</p>}
        <ConfigurationPrice {...props}/>
        {section==='meals'?<button type="button" className="button full black" disabled={!props.valid} onClick={()=>setSection('days')}>Günleri seç<ArrowRight size={17}/></button>:<SheetClose asChild><button type="button" className="button full black" disabled={!props.valid}>Seçimlerimi kaydet<Check size={17}/></button></SheetClose>}
      </div>
    </SheetContent>
  </Sheet>;
}
