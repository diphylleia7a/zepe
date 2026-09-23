'use client';

import {useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Check,ChevronRight,Leaf,Minus,Plus,ShoppingBag} from 'lucide-react';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {toast} from 'sonner';
import {shopProducts,type ShopProduct} from '@/lib/commerce';
import {money} from '@/lib/data';
import {FoodImage,useSite} from './shell';

export function ShopPage(){
  const {state,save,busy,user}=useSite();
  const [category,setCategory]=useState('Tümü');
  const [detail,setDetail]=useState<ShopProduct|null>(null);
  const [quantity,setQuantity]=useState(1);
  const [added,setAdded]=useState(false);
  const categories=['Tümü',...new Set(shopProducts.map(p=>p.category))];
  async function add(product:ShopProduct,count=1){
    if(!user){toast.error('Sepetini kaydetmek için hesabına giriş yap.',{action:{label:'Giriş yap',onClick:()=>window.location.assign('/signin-with-chatgpt?return_to=%2Fmagaza')}});return;}
    const existing=state.shopCart.find(i=>i.productId===product.id);
    if((existing?.quantity||0)+count>20){toast.error('Bir üründen en fazla 20 adet ekleyebilirsin.');return;}
    const shopCart=existing?state.shopCart.map(i=>i.id===existing.id?{...i,quantity:i.quantity+count}:i):[...state.shopCart,{id:crypto.randomUUID(),productId:product.id,quantity:count}];
    if(await save({shopCart})){setAdded(true);toast.success(`${product.name} sepetine eklendi.`,{action:{label:'Sepeti gör',onClick:()=>window.location.assign('/sepet')}});}
  }
  return <div className="wrap page shop-page">
    <div className="shop-heading"><div><span className="eyebrow">ZEPE MAĞAZA</span><h1>Canın iyi bir şey çekti.</h1><p>Bir bowl, küçük bir mola, ferah bir yudum.<br/>Abonelik olmadan da gününe Zepe ekle.</p></div><div className="shop-heading-note"><ShoppingBag size={27} strokeWidth={1.4}/><span>Tek tek seç.<br/>Kendi sepetini yap.</span></div></div>
    <div className="catalog-notice"><span>Örnek mağaza</span><p>Ürün çeşitleri ve fiyatlar örnektir. Bu sürümde sepet ve sipariş taslağı oluşturabilirsin; online ödeme alınmaz.</p></div>
    <div className="shop-toolbar"><div className="pills" aria-label="Ürün kategorileri">{categories.map(c=><button type="button" key={c} aria-pressed={category===c} className={`pill ${category===c?'active':''}`} onClick={()=>setCategory(c)}>{c}</button>)}</div><span className="fine">{shopProducts.filter(p=>category==='Tümü'||p.category===category).length} ürün</span></div>
    <div className="shop-grid">{shopProducts.filter(p=>category==='Tümü'||p.category===category).map(p=><article className="shop-card" key={p.id}>
      <button className="shop-photo-button" aria-label={`${p.name} ürün detayları`} onClick={()=>{setDetail(p);setQuantity(1);setAdded(false)}}><FoodImage src={p.image} alt={`${p.name} için temsili sunum`} className="shop-photo"/><span className="shop-category">{p.category}</span></button>
      <div className="shop-card-body"><div className="shop-product-meta"><span>{p.unit}</span>{p.kcal!==null&&<span>{p.kcal} kcal</span>}</div><h2><button onClick={()=>{setDetail(p);setQuantity(1);setAdded(false)}}>{p.name}</button></h2><p>{p.description}</p><div className="shop-card-bottom"><strong>{money(p.price)}</strong><button className="shop-add" disabled={busy} onClick={()=>add(p)} aria-label={`${p.name} sepetine ekle`}><Plus size={20}/></button></div></div>
    </article>)}</div>
    <section className="store-subscription-note"><Leaf size={28}/><div><h2>İyi öğünleri bir rutine dönüştür.</h2><p>Günlük paketlerde ara öğünler ve programa ait içecekler zaten dahil. Yeniden sepete eklemene gerek yok.</p></div><Link className="button secondary" href="/paketler">Paketleri keşfet<ArrowRight size={17}/></Link></section>
    <Dialog open={!!detail} onOpenChange={open=>!open&&setDetail(null)}><DialogContent className="modal-body shop-detail" style={{maxWidth:740}}>{detail&&<>
      <FoodImage src={detail.image} alt={`${detail.name} için temsili sunum`} className="shop-detail-photo"/>
      <span className="eyebrow">{detail.category} · {detail.unit}</span><DialogTitle className="modal-title">{detail.name}</DialogTitle><DialogDescription>{detail.description}</DialogDescription>
      {detail.kcal!==null&&<div className="macro-grid">{[[detail.kcal,'kcal'],[detail.protein,'g protein'],[detail.carbs,'g karbonhidrat'],[detail.fat,'g yağ']].map(([n,l])=><div key={l}><strong>{n}</strong><span>{l}</span></div>)}</div>}
      <div className="product-info-grid"><div><h3>İçindekiler</h3><p>{detail.ingredients.join(', ')}.</p></div><div><h3>Alerjen bilgisi</h3><p>{detail.allergens.length?detail.allergens.join(', '):'Örnek içerik listesinde belirtilen yok.'} Çapraz temas uygunluğu ayrıca teyit edilmelidir.</p></div></div>
      <p className="fine">Temsili görsel ve örnek ürün bilgisi. Besin değerleri yaklaşık / porsiyon. Saklama ve tüketim için teslim edilen ürünün etiketini esas al.</p>
      <div className="shop-detail-actions"><div className="quantity-control"><button disabled={quantity<=1} onClick={()=>setQuantity(q=>q-1)} aria-label="Adedi azalt"><Minus size={17}/></button><span aria-live="polite">{quantity}</span><button disabled={quantity>=20} onClick={()=>setQuantity(q=>q+1)} aria-label="Adedi artır"><Plus size={17}/></button></div><button className="button black" disabled={busy} onClick={()=>add(detail,quantity)}>{money(detail.price*quantity)} · Sepete ekle<Plus size={17}/></button></div>
      {added&&<Link href="/sepet" className="text-link"><Check size={16}/>Sepetine eklendi · Sepeti gör<ChevronRight size={16}/></Link>}
    </>}</DialogContent></Dialog>
  </div>;
}
