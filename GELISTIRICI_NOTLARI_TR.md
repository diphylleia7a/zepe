# Zepe — Geliştirici teslim notları

Bu paket, Zepe sitesinin son yayımlanan üçüncü sürümünün düzenlenebilir kaynak dosyalarını içerir. Önce bu dosyayı okuyun; projedeki eski README.md ilk sürümün bazı bilgilerini korur.

- Site: https://zepe.ds8sgpgh62.chatgpt.site
- Kaynak revizyonu: `c5db576c6d1ad0c9b3bcb94343c9937047941da2`
- Arşivdeki uygulama dosyaları bu Git revizyonundan değiştirilmeden alınmıştır. Bu teslim notu ayrıca eklenmiştir.
- Canlı site mevcut sahibinin erişim ayarlarını kullanır. Kaynak dosyalarını almak, Sites veya Cloudflare hesabına erişim sağlamaz.

## Teknik yapı

React 19.2.6, TypeScript, Vinext 0.0.50 / Vite 8.0.13, Tailwind CSS 4.2.1 ve Radix / shadcn bileşenleri kullanılıyor. Sayfalar Next.js App Router biçiminde düzenlenmiştir; mevcut geliştirme ve derleme süreci Vinext üzerinden çalışır. Sunucu kodu Cloudflare Workers ve D1 içindir.

Node.js gereksinimi: `>=22.13.0`. Bağımlılıkların kesin sürümleri `package-lock.json` içinde sabitlenmiştir.

## Yerel geliştirme

ZIP'i açın; `package.json` bulunan `zepe-kaynak` klasöründe çalışın. Mevcut scriptler Bash ve bazı GNU/Linux araçlarını kullanır. Windows'ta WSL/Linux ortamı kullanın. macOS'ta `npm run build` için GNU `timeout` komutunun ayrıca bulunması gerekir; `install:ci` scripti Linux `flock` ve `sha256sum` da ister.

Standart npm kurulumu ve geliştirme komutları:

```bash
npm ci
npm run dev
```

Terminalin bildirdiği yerel adresi açın. Bu komutlar mevcut kaynak yapılandırmasının giriş noktalarıdır. Bu ZIP yeni bir bilgisayarda ayrıca kurulup denenmemiştir.

Derleme ve mevcut iş mantığı testleri:

```bash
npm run build
node --test tests/business.test.mjs tests/checkout.test.mjs
```

Son kaynak hazırlığında uygulama derlemesi, TypeScript kontrolü ve 10 iş mantığı testi geçti. Tarayıcı üzerinden uçtan uca doğrulama yapılmadı.

`npm run dev` pazarlama sayfalarını ve arayüzü açar. Hesaba bağlı kayıt işlemleri için aşağıdaki kimlik ve D1 bağlantılarının da kurulması gerekir. Standart yerel geliştirme sunucusunda Sites'ın oturum açma hizmeti otomatik olarak oluşmaz.

## Dosya haritası

| Alan | Dosya / klasör |
| --- | --- |
| Ana sayfa | `components/zepe/brand-home.tsx`, `app/page.tsx` |
| Yeni görsel tasarım | `app/brand.css` |
| Ortak stiller ve değişkenler | `app/globals.css` |
| Üst menü, alt menü, hesap durumu | `components/zepe/shell.tsx` |
| Paket oluşturma akışı | `components/zepe/order-builder.tsx` |
| Sabit masaüstü seçenekleri ve mobil pencereler | `components/zepe/package-configuration.tsx` |
| Alerjen, teslimat ve fatura alanları | `components/zepe/checkout-fields.tsx` |
| Haftalık örnek menü, paket içeriği, karşılaştırma | `components/zepe/menu-information.tsx` |
| Mağaza | `components/zepe/shop.tsx`, `app/magaza/page.tsx` |
| Sepet ve checkout | `components/zepe/store-checkout.tsx` |
| Hesap ve dijital yemek planı | `components/zepe/account.tsx`, `components/zepe/planner.tsx` |
| Paketler, tarifler, yazılar, fotoğraf URL'leri | `lib/data.ts` |
| Gün / öğün / kişi fiyat hesapları | `lib/pricing.ts` |
| Ürünler, İstanbul ilçeleri, alerjenler, fatura doğrulama | `lib/commerce.ts` |
| Ortak veri modelleri | `lib/model.ts` |
| Sunucuda sipariş doğrulama ve toplam hesaplama | `lib/checkout.ts` |
| Hesap API'si | `app/api/state/route.ts` |
| Veritabanı okuma / yazma | `lib/server-store.ts` |
| D1 şeması ve SQL migration | `db/schema.ts`, `drizzle/` |
| Kimlik entegrasyonu | `app/chatgpt-auth.ts` |
| Yerel görseller | `public/images/` |
| Runtime ve derleme yapılandırması | `vite.config.ts`, `worker/index.ts`, `build/sites-vite-plugin.ts` |

## Veritabanı ve hesap sistemi

Mevcut D1 binding adı `DB`'dir. `zepe_accounts` tablosunda kullanıcı kimliği, JSON hesap durumu, sürüm sayacı ve güncellenme zamanı tutulur. Şema `db/schema.ts` içinde, ilk migration `drizzle/0000_pink_oracle.sql` içindedir. Yeni ortamda kendi D1 veritabanınızı bağlayıp migration'ı uygulayın. `vite.config.ts` içindeki yerel database ID bir yer tutucudur; canlı veritabanı kimliği değildir.

Hesap API'si, Sites tarafından doğrulanmış kullanıcı başlıklarını ve platformun oturum açma yollarını kullanır. `/signin-with-chatgpt` ve `/signout-with-chatgpt` bu kaynakta bağımsız bir kimlik sağlayıcı olarak uygulanmış değildir. Başka bir barındırma ortamına geçişte güvenilir sunucu oturumu / kimlik doğrulaması kurulmalı ve API yetkilendirmesi buna uyarlanmalıdır. İnternetten gelen, istemcinin kendisinin yazabildiği `oai-authenticated-user-*` başlıklarına doğrudan güvenilmemelidir.

Gerçek kullanıcı kayıtları, canlı D1 yedeği, oturum bilgileri, API anahtarları ve altyapı erişimleri bu arşivde bulunmaz. `node_modules`, derlenmiş çıktılar, önbellekler, `.env` dosyaları ve Git geçmişi dahil değildir.

## Mevcut ticari işlevlerin sınırı

- Paket ve ürün seçimi, adet değişikliği, alerjen bildirimi, İstanbul adresi, bireysel / kurumsal fatura alanları ve sipariş taslağı kaydı vardır.
- Ana öğünler ve gün sayısı değiştikçe paket tutarı hesaplanır. Ara öğünler ve programa ait detoks içecekleri otomatik dahildir.
- Ödeme sağlayıcısı, kart tahsilatı, e-fatura düzenleme, canlı stok yönetimi ve operasyon ekibine otomatik sipariş iletimi bağlı değildir.
- Mağazadaki bağımsız ürünler / fiyatlar ve kısmi paket tarifeleri örnektir. Gerçek satış öncesinde Zepe tarafından onaylanan katalog, fiyatlar ve operasyon koşullarıyla güncellenmelidir.
- Menü ve besin değerleri örnektir. Alerjen seçimleri bir üretim veya çapraz temas garantisi oluşturmaz.

## Görseller ve barındırma

Yerel iki yemek görseli arşivdedir. Bazı menü fotoğrafları `lib/data.ts` üzerinden dış URL'lerle yüklenir; tüm fotoğraflar yerel dosya değildir. Kaynak ve fotoğraf kredileri `app/kaynaklar/page.tsx` içinde bulunur. Görseller temsili sunumlardır.

Mevcut `.openai/hosting.json`, bu Sites projesinin kimliğini ve mantıksal veritabanı bağlantısını taşır; erişim anahtarı değildir. Bu arşivde değişmeden korunmuştur. Yeni ve bağımsız bir proje oluşturulacaksa barındırma yapılandırmasını o projenin kendi kaynaklarına göre hazırlayın.

Başka bir sunucuya taşıma, alan adı / DNS değişikliği veya kaynak depo erişimi bu teslim kapsamında yapılmamıştır. Canlı site değiştirilmemiştir.
