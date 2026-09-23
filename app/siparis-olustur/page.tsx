import {OrderBuilder} from '@/components/zepe/order-builder';
export const metadata={title:'Aboneliğini oluştur'};
export default async function Page({searchParams}:{searchParams:Promise<{paket?:string}>}){const p=await searchParams;return <OrderBuilder initialPackage={p.paket}/>}
