"use client";

import { useLanguage } from "@/lib/language-context";

interface TeamMember {
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  photo?: string;
  bioEn?: string;
  bioAr?: string;
}

interface Props {
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export function TeamSection({ config = {}, data = {} }: Props) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const titleEn = (config.titleEn ?? data.titleEn ?? "Our Team") as string;
  const titleAr = (config.titleAr ?? data.titleAr ?? "فريقنا") as string;
  const title = isAr ? titleAr : titleEn;

  const raw = (data.members ?? config.members ?? []) as TeamMember[];
  const members: TeamMember[] = Array.isArray(raw) ? raw : [];

  return (
    <section className="py-16 md:py-20" style={{ background: "var(--style-color-surface)" }}>
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-soil-dark mb-10 text-center" dir={isAr ? "rtl" : "ltr"}>
            {title}
          </h2>
        )}

        {members.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No team members configured.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.map((member, i) => {
              const name = isAr ? member.nameAr : member.nameEn;
              const role = isAr ? member.roleAr : member.roleEn;
              const bio = isAr ? (member.bioAr ?? "") : (member.bioEn ?? "");
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center" dir={isAr ? "rtl" : "ltr"}>
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photo}
                      alt={name}
                      className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-gray-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-soil-sand/40 flex items-center justify-center mb-4 text-2xl font-bold text-soil-clay">
                      {name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-semibold text-soil-dark text-sm mb-0.5">{name}</h3>
                  <p className="text-xs text-soil-clay font-medium mb-2">{role}</p>
                  {bio && <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{bio}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
