-- V52: Prepend the original gradient slide (no backgroundImage) to the
--      hero-carousel slides array so the classic SSSY hero look is slide 1.
--
--      V48 already ran, so we patch the live config with jsonb concatenation.
--      The existing 3 photo slides become slides 2–4.

UPDATE site_sections
SET
  config = jsonb_set(
    config,
    '{slides}',
    (
      '[
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
        }
      ]'::jsonb || (config -> 'slides')
    )
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'hero-banner'
  AND component_type = 'hero-carousel';
