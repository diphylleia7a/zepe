import { AccountPage } from '@/components/zepe/account';
import {getChatGPTUser,chatGPTSignInPath} from '@/app/chatgpt-auth';
export const dynamic='force-dynamic';
export const metadata={title:'Hesabım'};
export default async function Page(){const user=await getChatGPTUser();if(!user)return <div className="wrap page"><div className="empty-state"><h2>Sana ait bir alan.</h2><p>Planını, favorilerini ve sipariş taslaklarını hesabında sakla.</p><a href={chatGPTSignInPath('/hesabim')} target="_top" className="button">ChatGPT ile giriş yap</a></div></div>;return <AccountPage/>}
