import type { Metadata } from 'next';
import './globals.css';
import './brand.css';
import { Shell } from '@/components/zepe/shell';
export const metadata: Metadata = {title:{default:'Zepe — İyi beslen. İyi hisset.',template:'%s | Zepe'},description:'Hayatına uyum sağlayan taze öğünler. Zepe ile paketini seç, menünü keşfet ve sana özel beslenme planını oluştur.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><body><Shell>{children}</Shell></body></html>}
