import Link from 'next/link';
export default function NotFound(){return <div className="wrap page"><div className="empty-state"><span className="eyebrow" style={{justifyContent:'center'}}>404</span><h1 style={{margin:'20px 0'}}>Bu sayfayı bulamadık.</h1><p>Güzel bir başlangıç için ana sayfaya dönebilirsin.</p><Link href="/" className="button">Ana sayfaya dön</Link></div></div>}
