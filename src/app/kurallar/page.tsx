import Link from "next/link";
import { ArrowLeft, Heart, ShieldCheck, Flag, LifeBuoy } from "lucide-react";

export const metadata = { title: "Topluluk kuralları" };

const KURALLAR = [
  {
    baslik: "Önce empati",
    metin:
      "Buradaki herkes bir yük taşıyor. Yargılamadan, küçümsemeden yaklaş. Katılmadığın bir şey olsa bile nazik kal — kimse burada saldırıya uğramak için değil, nefes almak için.",
  },
  {
    baslik: "Toksisiteye yer yok",
    metin:
      "Hakaret, alay, nefret söylemi, ayrımcılık ve taciz kesinlikle yasak. Bir kişiyi hedef alan, aşağılayan içerikler kaldırılır.",
  },
  {
    baslik: "Anonimliğe saygı",
    metin:
      "Birinin kimliğini ifşa etmeye çalışmak, başkasının özel bilgilerini paylaşmak yasak. Kendi güvenliğin için de kişisel bilgilerini (adres, telefon, TC) paylaşma.",
  },
  {
    baslik: "Tavsiye ver, teşhis koyma",
    metin:
      "Deneyimini paylaşmak değerlidir ama tıbbi/psikolojik teşhis yerine geçmez. Ciddi durumlarda kişiyi uzman desteğe yönlendir.",
  },
  {
    baslik: "Kriz anları",
    metin:
      "Kendine zarar verme veya intihar düşüncesi içeren bir paylaşım görürsen, onu bildir ve mümkünse kişiyi destek hatlarına yönlendir. Bu içerikler hafife alınmaz.",
  },
  {
    baslik: "Spam ve reklam yok",
    metin:
      "Ürün/hizmet tanıtımı, bağlantı yağmuru, tekrarlayan içerik burada yer bulamaz. Bu bir dayanışma alanı, pazar yeri değil.",
  },
];

export default function KurallarPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Akışa dön
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Heart className="h-5 w-5" />
          </span>
          <h1 className="text-xl font-semibold">Topluluk kuralları</h1>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Burayı güvenli tutan şey teknoloji değil, birbirimize gösterdiğimiz özen. Birkaç
          basit ilkeye birlikte uyalım.
        </p>
      </header>

      <ol className="space-y-3">
        {KURALLAR.map((k, i) => (
          <li
            key={k.baslik}
            className="rounded-2xl border border-border bg-card/60 p-4"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-primary">{i + 1}.</span>
              <h2 className="text-base font-semibold">{k.baslik}</h2>
            </div>
            <p className="mt-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              {k.metin}
            </p>
          </li>
        ))}
      </ol>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <Flag className="h-5 w-5 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">Kural ihlali gördün mü?</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Her gönderi ve tavsiyedeki <strong>Bildir</strong> ile moderasyona ulaştır.
            İncelenip gerekirse kaldırılır.
          </p>
        </div>
        <Link
          href="/destek"
          className="rounded-2xl border border-border bg-card/40 p-4 transition hover:border-primary/40"
        >
          <LifeBuoy className="h-5 w-5 text-sensitive" />
          <h3 className="mt-2 text-sm font-semibold">Desteğe mi ihtiyacın var?</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Ücretsiz ve gizli destek hatlarına göz at →
          </p>
        </Link>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        Bu kurallar zamanla topluluğun ihtiyacına göre gelişebilir.
      </div>
    </div>
  );
}
