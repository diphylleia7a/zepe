import {cartTotal,cartItemSchema,type State,type Draft} from './model';
import {allergyError,billingError,billingSnapshot,deliveryError,shopItemSchema,shopTotal} from './commerce';

export function validFutureDate(value:string,today:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<=today)return false;const date=new Date(value+'T12:00:00Z');return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;}
export function prepareOrder(state:State,today:string,itemId?:string):Draft{
  const items=itemId?state.cart.filter(i=>i.id===itemId):state.cart;
  const shopItems=itemId?[]:state.shopCart;
  if(!items.length&&!shopItems.length)throw new Error('Sepetin boş. Önce bir paket veya ürün seç.');
  if(items.some(i=>!cartItemSchema.safeParse(i).success)||shopItems.some(i=>!shopItemSchema.safeParse(i).success))throw new Error('Sepetindeki ürün veya paket seçimini kontrol et.');
  for(const error of [deliveryError(state.profile),allergyError(state.profile),billingError(state.billing,state.profile)])if(error)throw new Error(error);
  if(items.some(i=>!validFutureDate(i.startDate,today))||(shopItems.length&&!validFutureDate(state.shopDeliveryDate,today)))throw new Error('Teslimat başlangıcı için bugünden sonraki geçerli bir tarih seç.');
  if(state.orders.length>=50)throw new Error('Yeni taslak için eski taslaklarından birini kaldır.');
  const p=state.profile;
  return {id:'ZP-'+crypto.randomUUID().slice(0,8).toUpperCase(),created:new Date().toISOString(),items,shopItems,shopDeliveryDate:shopItems.length?state.shopDeliveryDate:undefined,total:cartTotal(items)+shopTotal(shopItems),name:p.name,phone:p.phone,address:p.address,city:'İstanbul',district:p.district,status:'draft',billing:billingSnapshot(state.billing,p),allergens:[...p.allergens],allergyNotes:p.allergyNotes,exclusions:p.exclusions};
}
