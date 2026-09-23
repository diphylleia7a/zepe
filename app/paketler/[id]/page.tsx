import {notFound} from 'next/navigation';
import {packages} from '@/lib/data';
import {PackageDetail} from '@/components/zepe/pages';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const item=packages.find(x=>x.id===id);return {title:item?.name||'Bulunamadı'}}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!packages.some(x=>x.id===id))notFound();return <PackageDetail id={id}/>}
