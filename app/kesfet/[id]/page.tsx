import {notFound} from 'next/navigation';
import {articles} from '@/lib/data';
import {ArticlePage} from '@/components/zepe/pages';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const item=articles.find(x=>x.id===id);return {title:item?.title||'Bulunamadı'}}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!articles.some(x=>x.id===id))notFound();return <ArticlePage id={id}/>}
