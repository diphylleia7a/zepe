'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="wrap page"><div className="empty-state"><h2>Bir şeyler yolunda gitmedi.</h2><p>Sayfayı yeniden yüklemeyi deneyebilirsin.</p><button className="button" onClick={reset}>Yeniden dene</button></div></div>}
