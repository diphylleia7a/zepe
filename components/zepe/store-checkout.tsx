'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,Check,MapPin,Minus,Plus,ReceiptText,ShoppingBag,Trash2} from 'lucide-react';
import {Checkbox} from '@/components/ui/checkbox';
import {toast} from 'sonner';
import {allergyError,billingError,deliveryError,shopProducts,shopTotal,type Billing} from '@/lib/commerce';
import {cartTotal,localDate,nextDate,type Draft,type Profile} from '@/lib/model';
import {validFutureDate} from '@/lib/checkout';
import {money,packages} from '@/lib/data';
import {mealSummary,quote} from '@/lib/pricing';
import {AllergenFields,BillingFields,DeliveryFields} from './checkout-fields';
import {FoodImage,useSite} from './shell';

export function SavedOrderDetails({order:o}:{order:Draft}){
  return <div className="saved-order-details">
    {!!o.shopItems?.length&&<div className="saved-products">{o.shopItems.map(i=><div className="row" key={i.id}><span>{shopProducts.find(p=>p.id===i.productId)?.name||'Mağaza ürünü'}</span><strong>{i.quantity} adet</strong></div>)}<p className="fine">Teslimat tercihi: {o.shopDeliveryDate}</p></div>}
    {o.billing&&<details><summary>Fatura ve beslenme bilgileri<ReceiptText size={16}/></summary><div className="review-grid"><div><h4>{o.billing.type==='company'?'Kurumsal':'Bireysel'} fatura</h4><p>{o.billing.type==='company'?o.billing.companyName:o.billing.name}<br/>{o.billing.email}<br/>{o.billing.address}<br/>{o.billing.district} / {o.billing.city}</p>{o.billing.type==='company'&&<p>{o.billing.taxOffice} · {o.billing.taxNumber}</p>}</div><div><h4>Alerjenler</h4><p>{o.allergens?.length?o.allergens.join(', '):'Bilinen alerji belirtilmedi.'}</p>{o.allergyNotes&&<p>{o.allergyNotes}</p>}{o.exclusions&&<p>Sevmediğin malzemeler: {o.exclusions}</p>}</div></div></details>}
  </div>;
}

export function StoreCheckout(){
  const {state,save,mutate,busy,user}=useSite();
  const [p,setP]=useState<Profile>({...state.profile,name:state.profile.name||user?.name||''});
  const [billing,setBilling]=useState<Billing>({...state.billing,name:state.billing.name||state.profile.name||user?.name||'',email:state.billing.email||user?.email||''});
  const [date,setDate]=useState(state.shopDeliveryDate&&validFutureDate(state.shopDeliveryDate,localDate())?state.shopDeliveryDate:nextDate());
  const [step,setStep]=useState(0);
  const [error,setError]=useState('');
  const [consent,setConsent]=useState(false);
  const [done,setDone]=useState(false);
  const total=cartTotal(state.cart)+shopTotal(state.shopCart);
  const steps=['Sepet','Alerjenler','Teslimat','Fatura','Özet'];
  useEffect(()=>{window.scrollTo({top:0,behavior:'smooth'})},[step]);
  function stageError(s:number){
    if(s===0&&state.cart.some(i=>!validFutureDate(i.startDate,localDate())))return 'Paketlerinin başlangıç tarihini güncelle.';
    if(s===1)return allergyError(p);
    if(s===2)return deliveryError(p)||(state.shopCart.length&&!validFutureDate(date,localDate())?'Teslimat için bugünden sonraki bir tarih seç.':'');
    if(s===3)return billingError(billing,p);
    return '';
  }
  async function advance(e:React.FormEvent){
    e.preventDefault();const validation=stageError(step);if(validation){setError(validation);return;}
    if(step<4){setStep(s=>s+1);setError('');return;}
    for(let s=0;s<4;s++){const invalid=stageError(s);if(invalid){setStep(s);setError(invalid);return;}}
    if(!consent){setError('Taslak ve kişisel bilgi açıklamasını onayla.');return;}
    if(!await save({profile:p,billing,...(state.shopCart.length?{shopDeliveryDate:date}:{})}))return;
    if(await mutate('POST')){setDone(true);toast.success('Sipariş taslağın kaydedildi.');}
  }
  async function quantity(id:string,delta:number){const current=state.shopCart.find(i=>i.id===id)!;const next=current.quantity+delta;if(next<1||next>20)return;await save({shopCart:state.shopCart.map(i=>i.id===id?{...i,quantity:next}:i)});}
  if(done)return <div className="order-receipt"><span className="receipt-check"><Check size={35}/></span><span className="eyebrow">KAYDEDİLDİ</span><h1>Güzel seçimlerin hazır.</h1><p>Sepetin, alerjen tercihlerin, teslimat ve fatura bilgilerin hesabındaki sipariş taslağına kaydedildi.</p><Link href="/hesabim" className="button black">Hesabımdaki taslakları gör<ArrowRight size={17}/></Link><p className="fine">Ödeme alınmadı, fatura kesilmedi ve teslimat başlatılmadı. Taslağın Zepe ekibine otomatik gönderilmez.</p></div>;
  if(!state.cart.length&&!state.shopCart.length)return <div className="empty-state"><ShoppingBag size={45}/><h1 style={{fontSize:'2.6rem'}}>İyi şeylere yer aç.</h1><p>Henüz sepetine bir ürün veya paket eklemedin.</p><div className="empty-actions"><Link href="/magaza" className="button black">Mağazayı keşfet<ArrowRight size={17}/></Link><Link href="/paketler" className="button secondary">Paketleri incele</Link></div></div>;
  return <>
    <div className="checkout-heading"><span className="eyebrow">SENİN SEÇİMLERİN</span><h1>{['Sepetindeki iyilikler.','Seni biraz tanıyalım.','Nereye gelelim?','Fatura bilgilerin.','Her şey sana göre mi?'][step]}</h1></div>
    <nav className="checkout-steps" aria-label="Sipariş adımları">{steps.map((name,i)=><button key={name} disabled={i>step} aria-current={i===step?'step':undefined} onClick={()=>{setStep(i);setError('')}}><span>{i<step?<Check size={15}/>:i+1}</span>{name}</button>)}</nav>
    <div className="checkout-layout">
      <form id="store-checkout" className="checkout-form" onSubmit={advance} noValidate>
        {step===0&&<>
          {state.shopCart.length>0&&<section className="white-panel"><div className="row"><h2 className="checkout-section-title">Mağaza ürünleri</h2><span className="tag">{state.shopCart.reduce((s,i)=>s+i.quantity,0)} adet</span></div>{state.shopCart.map(item=>{const product=shopProducts.find(p=>p.id===item.productId)!;return <div className="store-cart-item" key={item.id}><FoodImage src={product.image} alt={product.name} className="cart-product-image"/><div><span className="fine">{product.category}</span><h3>{product.name}</h3><span className="fine">{money(product.price)} / {product.unit}</span><div className="cart-item-bottom"><div className="quantity-control"><button type="button" disabled={busy||item.quantity<=1} onClick={()=>quantity(item.id,-1)} aria-label={`${product.name} adedini azalt`}><Minus size={15}/></button><span>{item.quantity}</span><button type="button" disabled={busy||item.quantity>=20} onClick={()=>quantity(item.id,1)} aria-label={`${product.name} adedini artır`}><Plus size={15}/></button></div><strong>{money(product.price*item.quantity)}</strong></div></div><button type="button" className="icon-btn" disabled={busy} aria-label={`${product.name} sepetten çıkar`} onClick={()=>save({shopCart:state.shopCart.filter(i=>i.id!==item.id)})}><Trash2 size={17}/></button></div>})}<Link href="/magaza" className="text-link">Mağazaya devam et<ArrowRight size={16}/></Link></section>}
          {state.cart.length>0&&<section className="white-panel"><h2 className="checkout-section-title">Yemek paketleri</h2>{state.cart.map(item=>{const pkg=packages.find(p=>p.id===item.packageId)!;return <div className="store-cart-item package-cart-item" key={item.id}><FoodImage src={pkg.image} alt={pkg.name} className="cart-product-image"/><div><h3>{pkg.name}</h3><p>{item.days} gün · {item.people} kişi</p><p className="fine">{mealSummary(item)}</p><label className="form-field">Başlangıç tercihi<input type="date" className="field-input" min={nextDate()} value={item.startDate} disabled={busy} onChange={e=>save({cart:state.cart.map(i=>i.id===item.id?{...i,startDate:e.target.value}:i)})}/></label><strong>{money(quote(item).total)}</strong></div><button type="button" className="icon-btn" disabled={busy} aria-label={`${pkg.name} sepetten çıkar`} onClick={()=>save({cart:state.cart.filter(i=>i.id!==item.id)})}><Trash2 size={17}/></button></div>})}</section>}
        </>}
        {step===1&&<section className="white-panel"><AllergenFields p={p} setP={setP}/></section>}
        {step===2&&<section className="white-panel stack"><DeliveryFields p={p} setP={setP}/>{state.shopCart.length>0&&<label className="form-field">Mağaza teslimat tarihi tercihi<input type="date" required className="field-input" min={nextDate()} value={date} onChange={e=>setDate(e.target.value)}/><span className="fine">Kesin gün ve saat, adresine göre Zepe ekibiyle teyit edilir.</span></label>}{state.cart.length>0&&<p className="fine">Paketler, sepetinde belirttiğin başlangıç tarihlerine göre değerlendirilir.</p>}</section>}
        {step===3&&<section className="white-panel"><BillingFields value={billing} onChange={setBilling} profile={p}/></section>}
        {step===4&&<section className="white-panel stack"><div className="review-grid"><div><MapPin size={22}/><h3>Teslimat</h3><p>{p.name}<br/>{p.phone}<br/>{p.address}<br/>{p.district} / İstanbul</p>{state.shopCart.length>0&&<p>{date}</p>}<button type="button" className="text-link" onClick={()=>setStep(2)}>Düzenle</button></div><div><ReceiptText size={22}/><h3>{billing.type==='company'?'Kurumsal':'Bireysel'} fatura</h3><p>{billing.type==='company'?billing.companyName:billing.name}<br/>{billing.email}<br/>{billing.sameAsDelivery?'Teslimat adresiyle aynı':`${billing.address}, ${billing.district} / ${billing.city}`}</p><button type="button" className="text-link" onClick={()=>setStep(3)}>Düzenle</button></div></div><div className="review-allergens"><h3>Alerjenlerin</h3><p>{p.allergens.length?p.allergens.join(' · '):'Bilinen alerjim yok'}</p>{p.allergyNotes&&<p>{p.allergyNotes}</p>}<button type="button" className="text-link" onClick={()=>setStep(1)}>Düzenle</button></div><label className="checkbox-label checkout-consent"><Checkbox checked={consent} onCheckedChange={v=>setConsent(v===true)}/><span>Bilgilerimin, belirttiğim alerjenler ve fatura bilgilerimle birlikte hesabımdaki taslakta saklanmasını onaylıyorum. Ödeme alınmadığını, sipariş ve teslimatın ayrıca teyit edileceğini biliyorum. <Link href="/gizlilik">Gizlilik bilgisi</Link></span></label></section>}
        {error&&<p className="error-text" role="alert">{error}</p>}
        {step>0&&<button className="text-link checkout-back" type="button" onClick={()=>{setStep(s=>s-1);setError('')}}><ArrowLeft size={16}/>Önceki adım</button>}
      </form>
      <aside className="checkout-summary"><span className="eyebrow">SİPARİŞ ÖZETİN</span><h2>Gününe iyi gelsin.</h2><div className="stack">{!!state.shopCart.length&&<div className="row"><span>Mağaza ürünleri</span><strong>{money(shopTotal(state.shopCart))}</strong></div>}{!!state.cart.length&&<div className="row"><span>Yemek paketleri</span><strong>{money(cartTotal(state.cart))}</strong></div>}<div className="row"><span>Teslimat</span><span className="fine">Adresle teyit edilir</span></div></div><div className="checkout-total"><span>Tahmini toplam</span><strong>{money(total)}</strong></div><button type="submit" form="store-checkout" className="button full black" disabled={busy||(step===4&&!consent)}>{busy?'Kaydediliyor…':step===4?'Sipariş taslağını kaydet':'Devam et'}{step===4?<Check size={17}/>:<ArrowRight size={17}/>}</button><p className="fine">Örnek fiyatlandırma. Online ödeme alınmaz. Kesin fiyat, ürün uygunluğu ve teslimat Zepe tarafından onaylanır.</p></aside>
    </div>
  </>;
}
