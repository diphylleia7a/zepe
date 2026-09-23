import { PlanPage } from '@/components/zepe/planner';
import {getChatGPTUser,chatGPTSignInPath} from '@/app/chatgpt-auth';
export const dynamic='force-dynamic';
export const metadata={title:'Haftalık planım'};
export default async function Page(){const user=await getChatGPTUser();if(!user)return <div className="wrap page"><div className="empty-state"><h2>Sana ait bir alan.</h2><p>Planını, favorilerini ve sipariş taslaklarını hesabında sakla.</p><a href={chatGPTSignInPath('/planim')} target="_top" className="button">ChatGPT ile giriş yap</a></div></div>;return <PlanPage/>}
