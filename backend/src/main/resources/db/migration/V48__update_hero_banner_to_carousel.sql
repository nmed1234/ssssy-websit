-- V48: Convert hero-banner site_section to hero-carousel component type.
--      Slide 1: original gradient background (no photo) — the classic SSSY hero look.
--      Slides 2-4: Unsplash soil/agriculture photography.

UPDATE site_sections
SET
  component_type = 'hero-carousel',
  config = '{
    "transitionStyle": "slide",
    "autoplay": true,
    "autoplayInterval": 5000,
    "showArrows": true,
    "showDots": true,
    "slides": [
      {
        "titleEn": "Advancing Soil Science in Syria",
        "titleAr": "\u062a\u0637\u0648\u064a\u0631 \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0641\u064a \u0633\u0648\u0631\u064a\u0627",
        "subtitleAr": "\u062c\u0645\u0639\u064a\u0629 \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0627\u0644\u0633\u0648\u0631\u064a\u0629",
        "descriptionEn": "Advancing soil science research, education, and sustainable land management in Syria.",
        "descriptionAr": "\u062a\u0639\u0632\u064a\u0632 \u0623\u0628\u062d\u0627\u062b \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0648\u0627\u0644\u062a\u0639\u0644\u064a\u0645 \u0648\u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u062f\u0627\u0645\u0629 \u0644\u0644\u0623\u0631\u0627\u0636\u064a \u0641\u064a \u0633\u0648\u0631\u064a\u0627",
        "primaryButtonLabelEn": "Join Us",
        "primaryButtonLabelAr": "\u0627\u0646\u0636\u0645 \u0625\u0644\u064a\u0646\u0627",
        "primaryButtonUrl": "/members",
        "secondaryButtonLabelEn": "Learn More",
        "secondaryButtonLabelAr": "\u0627\u0639\u0631\u0641 \u0627\u0644\u0645\u0632\u064a\u062f",
        "secondaryButtonUrl": "/about",
        "backgroundImage": ""
      },
      {
        "titleEn": "Advancing Soil Science in Syria",
        "titleAr": "\u062a\u0637\u0648\u064a\u0631 \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0641\u064a \u0633\u0648\u0631\u064a\u0627",
        "subtitleAr": "\u062c\u0645\u0639\u064a\u0629 \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0627\u0644\u0633\u0648\u0631\u064a\u0629",
        "descriptionEn": "Leading research, education, and sustainable land management across Syria\u2019s diverse agricultural regions.",
        "descriptionAr": "\u0642\u064a\u0627\u062f\u0629 \u0627\u0644\u0628\u062d\u062b \u0627\u0644\u0639\u0644\u0645\u064a \u0648\u0627\u0644\u062a\u0639\u0644\u064a\u0645 \u0648\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0623\u0631\u0627\u0636\u064a \u0627\u0644\u0645\u0633\u062a\u062f\u0627\u0645\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0632\u0631\u0627\u0639\u064a\u0629 \u0627\u0644\u0645\u062a\u0646\u0648\u0639\u0629 \u0641\u064a \u0633\u0648\u0631\u064a\u0627",
        "primaryButtonLabelEn": "Join Us",
        "primaryButtonLabelAr": "\u0627\u0646\u0636\u0645 \u0625\u0644\u064a\u0646\u0627",
        "primaryButtonUrl": "/members",
        "secondaryButtonLabelEn": "Learn More",
        "secondaryButtonLabelAr": "\u0627\u0639\u0631\u0641 \u0627\u0644\u0645\u0632\u064a\u062f",
        "secondaryButtonUrl": "/about",
        "backgroundImage": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1920&auto=format&fit=crop"
      },
      {
        "titleEn": "Sustainable Land Management",
        "titleAr": "\u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u062f\u0627\u0645\u0629 \u0644\u0644\u0623\u0631\u0627\u0636\u064a",
        "subtitleAr": "\u0635\u0648\u0646 \u0627\u0644\u062a\u0631\u0628\u0629 \u0644\u0644\u0623\u062c\u064a\u0627\u0644 \u0627\u0644\u0642\u0627\u062f\u0645\u0629",
        "descriptionEn": "Promoting best practices in soil conservation and sustainable agriculture for food security and environmental health.",
        "descriptionAr": "\u062a\u0639\u0632\u064a\u0632 \u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062a \u0641\u064a \u0635\u0648\u0646 \u0627\u0644\u062a\u0631\u0628\u0629 \u0648\u0627\u0644\u0632\u0631\u0627\u0639\u0629 \u0627\u0644\u0645\u0633\u062a\u062f\u0627\u0645\u0629 \u0645\u0646 \u0623\u062c\u0644 \u0627\u0644\u0623\u0645\u0646 \u0627\u0644\u063a\u0630\u0627\u0626\u064a \u0648\u0627\u0644\u0635\u062d\u0629 \u0627\u0644\u0628\u064a\u0626\u064a\u0629",
        "primaryButtonLabelEn": "Our Research",
        "primaryButtonLabelAr": "\u0623\u0628\u062d\u0627\u062b\u0646\u0627",
        "primaryButtonUrl": "/publications",
        "secondaryButtonLabelEn": "Events",
        "secondaryButtonLabelAr": "\u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a",
        "secondaryButtonUrl": "/events",
        "backgroundImage": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1920&auto=format&fit=crop"
      },
      {
        "titleEn": "Connect with Soil Scientists",
        "titleAr": "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0639\u0644\u0645\u0627\u0621 \u0627\u0644\u062a\u0631\u0628\u0629",
        "subtitleAr": "\u0634\u0628\u0643\u0629 \u0639\u0644\u0645\u064a\u0629 \u0645\u062a\u062e\u0635\u0635\u0629",
        "descriptionEn": "Join our network of researchers, educators, and practitioners dedicated to advancing soil science across the region.",
        "descriptionAr": "\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0634\u0628\u0643\u062a\u0646\u0627 \u0645\u0646 \u0627\u0644\u0628\u0627\u062d\u062b\u064a\u0646 \u0648\u0627\u0644\u0645\u0639\u0644\u0645\u064a\u0646 \u0648\u0627\u0644\u0645\u0645\u0627\u0631\u0633\u064a\u0646 \u0627\u0644\u0645\u0643\u0631\u0633\u064a\u0646 \u0644\u062a\u0637\u0648\u064a\u0631 \u0639\u0644\u0648\u0645 \u0627\u0644\u062a\u0631\u0628\u0629 \u0641\u064a \u0627\u0644\u0645\u0646\u0637\u0642\u0629",
        "primaryButtonLabelEn": "Become a Member",
        "primaryButtonLabelAr": "\u0643\u0646 \u0639\u0636\u0648\u064b\u0627",
        "primaryButtonUrl": "/members",
        "secondaryButtonLabelEn": "Contact Us",
        "secondaryButtonLabelAr": "\u0627\u062a\u0635\u0644 \u0628\u0646\u0627",
        "secondaryButtonUrl": "/contact",
        "backgroundImage": "https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=1920&auto=format&fit=crop"
      }
    ]
  }'::jsonb,
  data    = '{}'::jsonb,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'hero-banner';
