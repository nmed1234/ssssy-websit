"use client";
import { useLanguage } from "@/lib/language-context";

interface Props { config?: Record<string, unknown>; data?: Record<string, unknown>; }

export function MapLocationSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const title = isAr ? ((config.titleAr ?? config.title ?? "") as string) : ((config.titleEn ?? config.title ?? "") as string);

  // Template format stores location in data.locations[0], schema format stores in config.*
  const locations = (Array.isArray(data.locations) ? data.locations : []) as Record<string, unknown>[];
  const loc0 = locations[0] ?? {};

  const address  = isAr
    ? ((loc0.addressAr ?? config.addressAr ?? config.address ?? "") as string)
    : ((loc0.addressEn ?? config.addressEn ?? config.address ?? "") as string);
  const phone    = ((loc0.phone ?? config.phone ?? "") as string);
  const email    = ((loc0.email ?? config.email ?? "") as string);
  const embedUrl = ((loc0.mapEmbedUrl ?? loc0.embedUrl ?? config.embedUrl ?? "") as string);
  const height   = (config.mapHeight as string) ?? "400px";

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-bg)" }} dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: "var(--style-color-text, #1a3a2a)" }}>{title}</h2>}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="space-y-5">
            {address && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{isAr ? "العنوان" : "Address"}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{address}</p>
              </div>
            )}
            {phone && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{isAr ? "الهاتف" : "Phone"}</p>
                <a href={`tel:${phone}`} className="text-sm text-gray-700 hover:underline">{phone}</a>
              </div>
            )}
            {email && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{isAr ? "البريد" : "Email"}</p>
                <a href={`mailto:${email}`} className="text-sm text-gray-700 hover:underline">{email}</a>
              </div>
            )}
            {!address && !phone && !email && (
              <p className="text-sm text-gray-400">Configure location details in settings.</p>
            )}
          </div>
          <div className="md:col-span-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
            {embedUrl ? (
              <iframe src={embedUrl} width="100%" height="100%" loading="lazy" allowFullScreen className="block border-0" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Map embed URL not set</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
