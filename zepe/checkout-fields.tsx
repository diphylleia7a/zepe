'use client';
import {Check,MapPin,Wheat,Milk,Egg,Fish,Nut,Leaf,Building2,UserRound} from 'lucide-react';
import {Checkbox} from '@/components/ui/checkbox';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {allergens,allergenDetails,istanbulDistricts,type Billing,type Allergen} from '@/lib/commerce';
import type {Profile} from '@/lib/model';

export function DistrictSelect({value,onChange,required=false}:{value:string;onChange:(value:string)=>void;required?:boolean}){
  return <Select value={value} onValueChange={onChange} required={required}><SelectTrigger className="field-select" aria-label="İstanbul ilçesi"><SelectValue placeholder="İlçeni seç"/></SelectTrigger><SelectContent>{istanbulDistricts.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>;
}

export function DeliveryFields({p,setP}:{p:Profile;setP:(p:Profile)=>void}){
  return <div className="stack"><div className="istanbul-note"><MapPin size={19}/><span>Şimdilik yalnızca İstanbul'dayız.</span></div><div className="form-grid">
    <label className="form-field">Ad soyad<input className="field-input" required minLength={3} autoComplete="name" value={p.name} maxLength={100} onChange={e=>setP({...p,name:e.target.value})} placeholder="Adın ve soyadın"/></label>
    <label className="form-field">Telefon<input type="tel" className="field-input" required autoComplete="tel" pattern="[+0-9 ()-]{10,25}" value={p.phone} onChange={e=>setP({...p,phone:e.target.value})} placeholder="05xx xxx xx xx" maxLength={25}/></label>
    <label className="form-field">İl<input className="field-input locked-field" value="İstanbul" readOnly aria-readonly="true" autoComplete="address-level1"/></label>
    <label className="form-field">İlçe<DistrictSelect required value={p.district} onChange={district=>setP({...p,city:'İstanbul',district})}/></label>
  </div><label className="form-field">Açık adres<textarea className="field-input" required minLength={10} maxLength={500} autoComplete="street-address" value={p.address} onChange={e=>setP({...p,address:e.target.value,city:'İstanbul'})} placeholder="Mahalle, sokak, bina ve daire numarası" rows={3}/></label><p className="fine">Teslimat rotası ve saati açık adresine göre onaylanır.</p></div>;
}

const allergenIcons:Partial<Record<Allergen,typeof Leaf>>={Gluten:Wheat,Süt:Milk,Yumurta:Egg,Balık:Fish,Kuruyemiş:Nut,'Yer fıstığı':Nut};
export function AllergenFields({p,setP}:{p:Profile;setP:(p:Profile)=>void}){
  function toggle(a:Allergen){setP({...p,allergenStatus:'selected',allergens:p.allergens.includes(a)?p.allergens.filter(x=>x!==a):[...p.allergens,a]});}
  return <div className="allergy-fields">
    <RadioGroup value={p.allergenStatus==='unset'?'':p.allergenStatus} onValueChange={value=>setP({...p,allergenStatus:value as Profile['allergenStatus'],allergens:value==='none'?[]:p.allergens})} className="allergy-intent" aria-label="Besin alerjisi veya hassasiyetin var mı?">
      <label className={`allergy-intent-option ${p.allergenStatus==='none'?'selected':''}`}><Check size={21}/><span>Bilinen alerjim yok</span><RadioGroupItem value="none" aria-label="Bilinen alerjim yok"/></label>
      <label className={`allergy-intent-option ${p.allergenStatus==='selected'?'selected':''}`}><Leaf size={21}/><span>Alerjim / hassasiyetim var</span><RadioGroupItem value="selected" aria-label="Alerjim veya hassasiyetim var"/></label>
    </RadioGroup>
    {p.allergenStatus==='selected'&&<><p className="field-intro">Sana uygun olmayanları işaretle. Birden fazla seçebilirsin.</p><div className="allergen-grid">{allergens.map(a=>{const Icon=allergenIcons[a]||Leaf;return <label key={a} className={`allergen-option ${p.allergens.includes(a)?'selected':''}`}><Icon size={23} strokeWidth={1.5}/><div><strong>{a}</strong><span>{allergenDetails[a]}</span></div><Checkbox checked={p.allergens.includes(a)} onCheckedChange={()=>toggle(a)} aria-label={`${a} alerjisi veya hassasiyeti`}/></label>;})}</div></>}
    <label className="form-field allergy-notes">Bilmemizi istediğin başka bir şey var mı?<textarea className="field-input" value={p.allergyNotes} maxLength={500} rows={3} onChange={e=>setP({...p,allergyNotes:e.target.value})} placeholder="Listede olmayan alerjilerin, hassasiyetlerin…"/></label>
    <label className="form-field allergy-notes">Sevmediğin malzemeler <span className="fine">İsteğe bağlı</span><input className="field-input" value={p.exclusions} maxLength={300} onChange={e=>setP({...p,exclusions:e.target.value})} placeholder="Örn. mantar, patlıcan"/></label>
    <p className="allergy-note">Alerjen seçimi, alerjensiz üretim garantisi değildir. İçerik ve çapraz temas uygunluğu sipariş onayından önce Zepe ekibiyle değerlendirilir.</p>
  </div>;
}

export function BillingFields({value:b,onChange:setB,profile}:{value:Billing;onChange:(value:Billing)=>void;profile:Profile}){
  return <div className="stack">
    <RadioGroup value={b.type} onValueChange={type=>setB({...b,type:type as Billing['type']})} className="billing-type-options" aria-label="Fatura türü">
      {([{value:'individual',label:'Bireysel',Icon:UserRound},{value:'company',label:'Kurumsal',Icon:Building2}] as const).map(({value,label,Icon})=><label key={value} className={`billing-type ${b.type===value?'selected':''}`}><Icon size={23}/><span>{label}</span><RadioGroupItem value={value} aria-label={`${label} fatura`}/></label>)}
    </RadioGroup>
    {b.type==='individual'?<label className="form-field">Fatura ad soyad<input className="field-input" autoComplete="billing name" required minLength={3} maxLength={120} value={b.name} onChange={e=>setB({...b,name:e.target.value})} placeholder="Ad soyad"/></label>:<><label className="form-field">Firma unvanı<input className="field-input" autoComplete="organization" required minLength={2} maxLength={160} value={b.companyName} onChange={e=>setB({...b,companyName:e.target.value})} placeholder="Firmanın tam ticari unvanı"/></label><div className="form-grid"><label className="form-field">Vergi dairesi<input className="field-input" required minLength={2} maxLength={100} value={b.taxOffice} onChange={e=>setB({...b,taxOffice:e.target.value})}/></label><label className="form-field">Vergi / T.C. kimlik no<input className="field-input" inputMode="numeric" pattern="[0-9]{10,11}" required maxLength={11} value={b.taxNumber} onChange={e=>setB({...b,taxNumber:e.target.value.replace(/\D/g,'')})} placeholder="10 veya 11 hane"/></label></div></>}
    <label className="form-field">Fatura e-posta adresi<input type="email" className="field-input" autoComplete="email" required maxLength={150} value={b.email} onChange={e=>setB({...b,email:e.target.value})} placeholder="ornek@eposta.com"/></label>
    <label className="checkbox-label billing-same"><Checkbox checked={b.sameAsDelivery} onCheckedChange={value=>setB({...b,sameAsDelivery:value===true})}/><span>Fatura adresim teslimat adresimle aynı</span></label>
    {b.sameAsDelivery?<div className="billing-address-preview"><MapPin size={19}/><p>{profile.address||'Teslimat adresin burada görünecek.'}<br/>{profile.district} / İstanbul</p></div>:<><div className="form-grid"><label className="form-field">Fatura ili<input className="field-input" required autoComplete="billing address-level1" maxLength={50} value={b.city} onChange={e=>setB({...b,city:e.target.value})}/></label><label className="form-field">Fatura ilçesi<input className="field-input" required autoComplete="billing address-level2" maxLength={70} value={b.district} onChange={e=>setB({...b,district:e.target.value})}/></label></div><label className="form-field">Fatura açık adresi<textarea className="field-input" required minLength={10} maxLength={500} autoComplete="billing street-address" rows={3} value={b.address} onChange={e=>setB({...b,address:e.target.value})}/></label></>}
  </div>;
}
