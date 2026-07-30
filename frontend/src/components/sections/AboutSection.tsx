"use client";
import { useLanguage } from "@/lib/language-context";

interface Objective {
  numberAr?: string;
  numberEn?: string;
  icon?: string;
  titleAr?: string;
  titleEn?: string;
  bodyAr?: string;
  bodyEn?: string;
}

interface MembershipType {
  icon?: string;
  titleAr?: string;
  titleEn?: string;
  descAr?: string;
  descEn?: string;
}

interface Founder {
  nameAr?: string;
  nameEn?: string;
  birthplaceAr?: string;
  birthplaceEn?: string;
  birthdate?: string;
  qualificationAr?: string;
  qualificationEn?: string;
  roleAr?: string;
  roleEn?: string;
  residenceAr?: string;
  residenceEn?: string;
  phone?: string;
}

interface GovernanceRole {
  icon?: string;
  titleAr?: string;
  titleEn?: string;
  descAr?: string;
  descEn?: string;
}

interface Props {
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
  componentType?: string;
}

// ─── Generic About Section (legacy / homepage use) ─────────────────────────
export function AboutSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const title    = isAr ? ((config.titleAr ?? config.title ?? "") as string)   : ((config.titleEn ?? config.title ?? "") as string);
  const bodyText = isAr ? ((config.bodyAr  ?? config.body  ?? "") as string)   : ((config.bodyEn  ?? config.body  ?? "") as string);
  const image    = (config.image as string) ?? "";
  const mission  = isAr ? ((config.missionAr ?? config.mission ?? "") as string) : ((config.missionEn ?? config.mission ?? "") as string);
  const vision   = isAr ? ((config.visionAr  ?? config.vision  ?? "") as string) : ((config.visionEn  ?? config.vision  ?? "") as string);
  const imagePosition = (config.imagePosition as string) ?? "right";
  const values = (Array.isArray(data.values) ? data.values : []) as Array<{ labelEn?: string; labelAr?: string; icon?: string }>;

  return (
    <section
      className="py-16 md:py-24"
      style={{ background: "var(--style-color-bg)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className={`flex flex-col ${imagePosition === "left" ? "md:flex-row-reverse" : "md:flex-row"} gap-12 items-center`}>
          {/* Text */}
          <div className="flex-1 max-w-xl space-y-6">
            {title && (
              <h2 className="text-2xl md:text-4xl font-bold leading-tight" style={{ color: "var(--style-color-text, #1a3a2a)" }}>
                {title}
              </h2>
            )}
            {bodyText && <p className="text-gray-500 leading-relaxed">{bodyText}</p>}
            {(mission || vision) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mission && (
                  <div className="p-4 rounded-xl border border-green-100 bg-green-50">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1 text-green-700">{isAr ? "رسالتنا" : "Mission"}</p>
                    <p className="text-sm text-gray-600">{mission}</p>
                  </div>
                )}
                {vision && (
                  <div className="p-4 rounded-xl border border-green-100 bg-green-50">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1 text-green-700">{isAr ? "رؤيتنا" : "Vision"}</p>
                    <p className="text-sm text-gray-600">{vision}</p>
                  </div>
                )}
              </div>
            )}
            {values.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {values.map((v, i) => {
                  const label = isAr ? (v.labelAr ?? v.labelEn ?? "") : (v.labelEn ?? "");
                  return (
                    <span key={i} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700">
                      {v.icon && <span>{v.icon}</span>} {label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          {/* Image */}
          <div className="flex-1 w-full max-w-lg">
            <div className="rounded-2xl overflow-hidden aspect-square bg-gray-100 shadow-lg">
              {image ? (
                <img src={image} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Hero Banner ────────────────────────────────────────────────────────────
export function AboutHeroBanner({ data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const title       = isAr ? (data.titleAr    as string ?? "") : (data.titleEn    as string ?? "");
  const subtitle    = isAr ? (data.subtitleAr as string ?? "") : (data.subtitleEn as string ?? "");
  const badge       = isAr ? (data.badgeAr    as string ?? "") : (data.badgeEn    as string ?? "");
  const description = isAr ? (data.descriptionAr as string ?? "") : (data.descriptionEn as string ?? "");

  return (
    <section
      className="relative py-20 md:py-32 bg-gradient-to-br from-green-900 via-green-800 to-green-700 overflow-hidden"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-green-600 opacity-20 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-green-500 opacity-15 pointer-events-none" />

      <div className="relative container mx-auto px-4 max-w-4xl text-center text-white">
        {badge && (
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/20 text-white border border-white/30">
            {badge}
          </span>
        )}
        {title && (
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg md:text-xl text-green-100 font-medium mb-6">{subtitle}</p>
        )}
        {description && (
          <p className="text-base md:text-lg text-green-100/80 leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Society Overview ───────────────────────────────────────────────────────
export function AboutOverviewSection({ data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const heading     = isAr ? (data.headingAr as string ?? "") : (data.headingEn as string ?? "");
  const paragraphs  = isAr
    ? (data.paragraphsAr as string[] ?? [])
    : (data.paragraphsEn as string[] ?? []);
  const classifications = isAr
    ? (data.classificationsAr as string[] ?? [])
    : (data.classificationsEn as string[] ?? []);

  return (
    <section className="py-16 md:py-20 bg-white" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-4xl">
        {heading && (
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-8 text-center">{heading}</h2>
        )}
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-gray-600 leading-relaxed text-base md:text-lg">{p}</p>
          ))}
        </div>
        {classifications.length > 0 && (
          <div className="mt-10">
            <p className="text-sm font-semibold text-green-700 uppercase tracking-widest mb-4 text-center">
              {isAr ? "تصنيفات الجمعية" : "Society Classifications"}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {classifications.map((c, i) => (
                <span key={i} className="px-5 py-2 rounded-full bg-green-50 border border-green-200 text-green-800 font-medium text-sm">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Founding Decree Image ──────────────────────────────────────────────────
export function AboutDecreeSection({ data = {} }: Props) {
  const { language } = useLanguage();
  const isAr    = language === "ar";
  const heading = isAr ? (data.headingAr as string ?? "") : (data.headingEn as string ?? "");
  const caption = isAr ? (data.captionAr as string ?? "") : (data.captionEn as string ?? "");
  const imageUrl = data.imageUrl as string ?? "";
  const imageAlt = data.imageAlt as string ?? heading;

  return (
    <section className="py-14 bg-gray-50" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-2xl text-center">
        {heading && (
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-8">{heading}</h2>
        )}
        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white inline-block w-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-auto object-contain"
            />
          ) : (
            <div className="w-full aspect-[3/4] flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-8 gap-3">
              <svg className="w-16 h-16 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm">{isAr ? "وثيقة التأسيس الرسمية" : "Official Founding Decree"}</span>
            </div>
          )}
        </div>
        {caption && (
          <p className="mt-4 text-sm text-gray-500 italic">{caption}</p>
        )}
      </div>
    </section>
  );
}

// ─── 10 Objectives ──────────────────────────────────────────────────────────
export function AboutObjectivesSection({ data = {} }: Props) {
  const { language } = useLanguage();
  const isAr      = language === "ar";
  const heading   = isAr ? (data.headingAr    as string ?? "") : (data.headingEn    as string ?? "");
  const subheading = isAr ? (data.subheadingAr as string ?? "") : (data.subheadingEn as string ?? "");
  const objectives = (Array.isArray(data.objectives) ? data.objectives : []) as Objective[];

  return (
    <section className="py-16 md:py-20 bg-green-50" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          {heading && <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-2">{heading}</h2>}
          {subheading && <p className="text-sm text-green-700 font-medium">{subheading}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {objectives.map((obj, i) => {
            const num   = isAr ? (obj.numberAr ?? String(i + 1)) : (obj.numberEn ?? String(i + 1));
            const title = isAr ? (obj.titleAr ?? "") : (obj.titleEn ?? "");
            const body  = isAr ? (obj.bodyAr  ?? "") : (obj.bodyEn  ?? "");
            return (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-2xl bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                  {obj.icon ? (
                    <span className="text-xl">{obj.icon}</span>
                  ) : (
                    <span className="text-sm font-bold text-green-700">{num}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-green-900 text-sm mb-1">{title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Membership Types ────────────────────────────────────────────────────────
export function AboutMembershipSection({ data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const heading           = isAr ? (data.headingAr           as string ?? "") : (data.headingEn           as string ?? "");
  const subheading        = isAr ? (data.subheadingAr        as string ?? "") : (data.subheadingEn        as string ?? "");
  const conditionsHeading = isAr ? (data.conditionsHeadingAr as string ?? "") : (data.conditionsHeadingEn as string ?? "");
  const fees              = isAr ? (data.feesAr              as string ?? "") : (data.feesEn              as string ?? "");
  const membershipTypes   = (Array.isArray(data.membershipTypes) ? data.membershipTypes : []) as MembershipType[];
  const conditions = isAr
    ? (data.conditionsAr as string[] ?? [])
    : (data.conditionsEn as string[] ?? []);

  return (
    <section className="py-16 md:py-20 bg-white" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          {heading    && <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-2">{heading}</h2>}
          {subheading && <p className="text-sm text-green-700 font-medium">{subheading}</p>}
        </div>

        {/* Membership type cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {membershipTypes.map((mt, i) => {
            const title = isAr ? (mt.titleAr ?? "") : (mt.titleEn ?? "");
            const desc  = isAr ? (mt.descAr  ?? "") : (mt.descEn  ?? "");
            return (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl border border-green-100 bg-green-50 hover:shadow-md transition-shadow">
                {mt.icon && <span className="text-4xl mb-3">{mt.icon}</span>}
                <h3 className="font-bold text-green-900 text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>

        {/* Conditions */}
        {conditions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {conditionsHeading && (
                <h3 className="font-bold text-green-900 text-lg mb-4">{conditionsHeading}</h3>
              )}
              <ul className="space-y-2">
                {conditions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            {fees && (
              <div className="flex items-center justify-center md:justify-start">
                <div className="p-6 rounded-2xl bg-green-900 text-white text-center max-w-xs w-full">
                  <p className="text-xs font-bold uppercase tracking-widest text-green-200 mb-3">
                    {isAr ? "رسوم العضوية" : "Membership Fees"}
                  </p>
                  <p className="text-sm leading-relaxed font-medium">{fees}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Governance Structure ────────────────────────────────────────────────────
export function AboutGovernanceSection({ data = {} }: Props) {
  const { language } = useLanguage();
  const isAr     = language === "ar";
  const heading  = isAr ? (data.headingAr  as string ?? "") : (data.headingEn  as string ?? "");
  const intro    = isAr ? (data.introAr    as string ?? "") : (data.introEn    as string ?? "");
  const boardSize = isAr ? (data.boardSizeAr as string ?? "") : (data.boardSizeEn as string ?? "");
  const term      = isAr ? (data.termAr      as string ?? "") : (data.termEn      as string ?? "");
  const elections = isAr ? (data.electionsAr as string ?? "") : (data.electionsEn as string ?? "");
  const roles     = (Array.isArray(data.roles) ? data.roles : []) as GovernanceRole[];

  return (
    <section className="py-16 md:py-20 bg-green-50" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          {heading && <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-3">{heading}</h2>}
          {intro   && <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">{intro}</p>}
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {roles.map((role, i) => {
            const title = isAr ? (role.titleAr ?? "") : (role.titleEn ?? "");
            const desc  = isAr ? (role.descAr  ?? "") : (role.descEn  ?? "");
            return (
              <div key={i} className="p-5 rounded-2xl bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  {role.icon && <span className="text-2xl">{role.icon}</span>}
                  <h3 className="font-bold text-green-900 text-sm">{title}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap justify-center gap-4">
          {[boardSize, term, elections].filter(Boolean).map((info, i) => (
            <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-green-200 text-sm text-green-800 font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              {info}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Founding Members Table ──────────────────────────────────────────────────
export function AboutFoundersSection({ data = {} }: Props) {
  const { language } = useLanguage();
  const isAr     = language === "ar";
  const heading   = isAr ? (data.headingAr   as string ?? "") : (data.headingEn   as string ?? "");
  const subheading = isAr ? (data.subheadingAr as string ?? "") : (data.subheadingEn as string ?? "");
  const intro      = isAr ? (data.introAr      as string ?? "") : (data.introEn      as string ?? "");
  const founders   = (Array.isArray(data.founders) ? data.founders : []) as Founder[];

  const roleColour = (role: string) => {
    if (role.includes("رئيس") || role.includes("President"))        return "bg-amber-100 text-amber-800";
    if (role.includes("نائب") || role.includes("Vice"))             return "bg-blue-100 text-blue-800";
    if (role.includes("أمين الصندوق") || role.includes("Treasurer")) return "bg-purple-100 text-purple-800";
    if (role.includes("أمين السر") || role.includes("Secretary"))    return "bg-cyan-100 text-cyan-800";
    if (role.includes("مجلس") || role.includes("Board"))             return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <section className="py-16 md:py-20 bg-white" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          {heading    && <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-2">{heading}</h2>}
          {subheading && <p className="text-sm text-green-700 font-medium mb-3">{subheading}</p>}
          {intro      && <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">{intro}</p>}
        </div>

        {/* Cards grid — mobile friendly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {founders.map((f, i) => {
            const name        = isAr ? (f.nameAr        ?? f.nameEn ?? "") : (f.nameEn        ?? f.nameAr ?? "");
            const role        = isAr ? (f.roleAr        ?? "")             : (f.roleEn        ?? "");
            const qualification = isAr ? (f.qualificationAr ?? "") : (f.qualificationEn ?? "");
            const birthplace  = isAr ? (f.birthplaceAr  ?? "")             : (f.birthplaceEn  ?? "");
            const residence   = isAr ? (f.residenceAr   ?? "")             : (f.residenceEn   ?? "");
            return (
              <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                {/* Avatar initial */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-800 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-green-900 text-sm truncate">{name}</p>
                    <p className="text-xs text-gray-400">{birthplace}{f.birthdate ? ` • ${f.birthdate}` : ""}</p>
                  </div>
                </div>
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${roleColour(role)}`}>
                  {role}
                </span>
                <div className="space-y-1 text-xs text-gray-500">
                  <p className="flex items-start gap-1.5">
                    <span className="mt-0.5">🎓</span>
                    <span>{qualification}</span>
                  </p>
                  {residence && (
                    <p className="flex items-start gap-1.5">
                      <span className="mt-0.5">📍</span>
                      <span>{residence}</span>
                    </p>
                  )}
                  {f.phone && (
                    <p className="flex items-start gap-1.5">
                      <span className="mt-0.5">📞</span>
                      <a href={`tel:${f.phone}`} className="text-green-700 hover:underline">{f.phone}</a>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full table — visible on larger screens */}
        <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-800 text-white">
                {[
                  isAr ? "#" : "#",
                  isAr ? "الاسم" : "Name",
                  isAr ? "المؤهل" : "Qualification",
                  isAr ? "الصفة" : "Role",
                  isAr ? "مكان الولادة" : "Birthplace",
                  isAr ? "تاريخ الولادة" : "Birthdate",
                  isAr ? "مكان الإقامة" : "Residence",
                  isAr ? "الهاتف" : "Phone",
                ].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-right font-semibold text-xs tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {founders.map((f, i) => {
                const name        = isAr ? (f.nameAr        ?? f.nameEn ?? "") : (f.nameEn        ?? f.nameAr ?? "");
                const role        = isAr ? (f.roleAr        ?? "")             : (f.roleEn        ?? "");
                const qualification = isAr ? (f.qualificationAr ?? "") : (f.qualificationEn ?? "");
                const birthplace  = isAr ? (f.birthplaceAr  ?? "")             : (f.birthplaceEn  ?? "");
                const residence   = isAr ? (f.residenceAr   ?? "")             : (f.residenceEn   ?? "");
                return (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-green-900">{name}</td>
                    <td className="px-4 py-3 text-gray-600">{qualification}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${roleColour(role)}`}>{role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{birthplace}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{f.birthdate}</td>
                    <td className="px-4 py-3 text-gray-600">{residence}</td>
                    <td className="px-4 py-3">
                      {f.phone
                        ? <a href={`tel:${f.phone}`} className="text-green-700 hover:underline font-mono text-xs">{f.phone}</a>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
