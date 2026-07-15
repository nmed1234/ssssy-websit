/**
 * DEFAULT_PROPS — the initial props given to a newly created block.
 *
 * When the user drags a block type onto the canvas, we call
 * `getDefaultProps(type)` to pre-populate it with sensible placeholder values
 * so the block is immediately visible and clearly labelled.
 */

import type { BlockProps } from "@/types/block";

const DEFAULT_PROPS: Record<string, BlockProps> = {

  // ─── Layout containers ──────────────────────────────────────────────────────

  section: {
    title: "New Section",
    titleAr: "",
    paddingTop: "4rem",
    paddingBottom: "4rem",
    bgType: "none",
    visibility: "ALWAYS",
  },

  row: {
    gap: "1.5rem",
    wrap: "wrap",
    align: "stretch",
    justify: "start",
    visibility: "ALWAYS",
  },

  column: {
    width: "",        // empty = flex: 1 (equal width)
    flexGrow: 1,
    visibility: "ALWAYS",
  },

  grid: {
    columns: 3,
    columnsMobile: 1,
    gap: "1.5rem",
    visibility: "ALWAYS",
  },

  flexbox: {
    direction: "row",
    wrap: "wrap",
    justify: "start",
    align: "stretch",
    gap: "1rem",
    visibility: "ALWAYS",
  },

  tabs: {
    title: "",
    visibility: "ALWAYS",
  },

  accordion: {
    title: "Accordion",
    items: [
      { title: "First Panel",  titleAr: "", content: "Content for the first panel.", contentAr: "" },
      { title: "Second Panel", titleAr: "", content: "Content for the second panel.", contentAr: "" },
    ],
    visibility: "ALWAYS",
  },

  "card-group": {
    title: "Card Group",
    titleAr: "",
    columns: 3,
    columnsMobile: 1,
    gap: "1.5rem",
    visibility: "ALWAYS",
  },

  // ─── Content leaf blocks ────────────────────────────────────────────────────

  heading: {
    text: "New Heading",
    textAr: "",
    level: "2",
    fontWeight: "bold",
    visibility: "ALWAYS",
  },

  paragraph: {
    text: "Start typing your paragraph here…",
    textAr: "",
    visibility: "ALWAYS",
  },

  "rich-text": {
    html: "<p>Start typing rich content here…</p>",
    htmlAr: "",
    visibility: "ALWAYS",
  },

  image: {
    src: "",
    alt: "Image",
    objectFit: "cover",
    visibility: "ALWAYS",
  },

  video: {
    src: "",
    caption: "",
    visibility: "ALWAYS",
  },

  button: {
    label: "Click Here",
    labelAr: "اضغط هنا",
    href: "#",
    target: "_self",
    variant: "primary",
    visibility: "ALWAYS",
  },

  divider: {
    thickness: "1px",
    width: "100%",
    visibility: "ALWAYS",
  },

  spacer: {
    height: "2rem",
    visibility: "ALWAYS",
  },

  blockquote: {
    text: "An inspiring quote goes here.",
    textAr: "",
    attribution: "— Author Name",
    attributionAr: "",
    visibility: "ALWAYS",
  },

  alert: {
    title: "Information",
    titleAr: "",
    message: "This is an informational alert.",
    messageAr: "",
    variant: "info",
    visibility: "ALWAYS",
  },

  banner: {
    title: "Banner Heading",
    titleAr: "",
    text: "A short description that supports the heading.",
    textAr: "",
    buttonLabel: "Learn More",
    buttonLabelAr: "اعرف المزيد",
    buttonUrl: "#",
    visibility: "ALWAYS",
  },

  hero: {
    title: "Page Title",
    titleAr: "",
    subtitle: "A compelling subtitle that explains what this page is about.",
    subtitleAr: "",
    buttonLabel: "Get Started",
    buttonLabelAr: "ابدأ الآن",
    buttonUrl: "#",
    minHeight: "480px",
    textAlign: "center",
    overlayColor: "rgba(0,0,0,0.4)",
    paddingTop: "6rem",
    paddingBottom: "6rem",
    visibility: "ALWAYS",
  },

  cta: {
    title: "Call to Action",
    titleAr: "",
    text: "Convince your visitors to take the next step.",
    textAr: "",
    buttonLabel: "Take Action",
    buttonLabelAr: "اتخذ إجراءً",
    buttonUrl: "#",
    textAlign: "center",
    paddingTop: "4rem",
    paddingBottom: "4rem",
    visibility: "ALWAYS",
  },

  card: {
    title: "Card Title",
    titleAr: "",
    text: "A short description for this card.",
    textAr: "",
    buttonLabel: "Read More",
    buttonLabelAr: "اقرأ المزيد",
    buttonUrl: "#",
    visibility: "ALWAYS",
  },

  // ─── Interactive / repeating-item blocks ───────────────────────────────────

  stats: {
    title: "Our Impact",
    titleAr: "",
    columns: 4,
    items: [
      { value: "500+",   label: "Members",      labelAr: "عضو" },
      { value: "120+",   label: "Publications", labelAr: "منشور" },
      { value: "50+",    label: "Events",       labelAr: "فعالية" },
      { value: "20+",    label: "Years",        labelAr: "عاماً" },
    ],
    paddingTop: "3rem",
    paddingBottom: "3rem",
    visibility: "ALWAYS",
  },

  testimonial: {
    title: "What People Say",
    titleAr: "",
    items: [
      { quote: "This is a wonderful organisation that has made a real difference.", quoteAr: "", name: "Dr. Ahmad Al-Rashid", role: "Researcher", avatar: "" },
    ],
    visibility: "ALWAYS",
  },

  team: {
    title: "Our Team",
    titleAr: "",
    columns: 4,
    items: [
      { avatar: "", name: "Team Member", nameAr: "", role: "Position", roleAr: "", bio: "", bioAr: "" },
    ],
    visibility: "ALWAYS",
  },

  faq: {
    title: "Frequently Asked Questions",
    titleAr: "الأسئلة المتكررة",
    items: [
      { question: "What is this organisation?", questionAr: "", answer: "We are the Syrian Soil Science Society.", answerAr: "" },
    ],
    visibility: "ALWAYS",
  },

  timeline: {
    title: "Our History",
    titleAr: "",
    items: [
      { date: "2024", title: "Founded",         titleAr: "", content: "The society was established.", contentAr: "" },
      { date: "2025", title: "First Conference", titleAr: "", content: "We held our inaugural conference.", contentAr: "" },
    ],
    visibility: "ALWAYS",
  },

  gallery: {
    title: "Gallery",
    titleAr: "",
    columns: 3,
    columnsMobile: 1,
    items: [
      { src: "", alt: "Image 1", caption: "" },
      { src: "", alt: "Image 2", caption: "" },
    ],
    visibility: "ALWAYS",
  },

  carousel: {
    title: "",
    items: [
      { src: "", title: "Slide 1", content: "" },
      { src: "", title: "Slide 2", content: "" },
    ],
    visibility: "ALWAYS",
  },

  "pricing-table": {
    title: "Pricing",
    titleAr: "",
    items: [
      { name: "Basic",    price: "Free",  period: "",       description: "For individuals",   cta: "Sign Up",  url: "#", featured: false },
      { name: "Standard", price: "$10",   period: "/month", description: "For small teams",   cta: "Sign Up",  url: "#", featured: true  },
      { name: "Pro",      price: "$30",   period: "/month", description: "For organisations", cta: "Contact",  url: "#", featured: false },
    ],
    visibility: "ALWAYS",
  },

  progress: {
    title: "",
    items: [
      { label: "Research",   value: 85, color: "" },
      { label: "Education",  value: 70, color: "" },
      { label: "Outreach",   value: 60, color: "" },
    ],
    visibility: "ALWAYS",
  },

  // ─── Dynamic / embed blocks ────────────────────────────────────────────────

  "news-feed": {
    title: "Latest News",
    titleAr: "آخر الأخبار",
    limit: 6,
    columns: 3,
    visibility: "ALWAYS",
  },

  "events-feed": {
    title: "Upcoming Events",
    titleAr: "الفعاليات القادمة",
    limit: 6,
    columns: 3,
    visibility: "ALWAYS",
  },

  "contact-form": {
    title: "Contact Us",
    titleAr: "تواصل معنا",
    visibility: "ALWAYS",
  },

  "newsletter-form": {
    title: "Stay Updated",
    titleAr: "ابقَ على اطلاع",
    text: "Subscribe to our newsletter for the latest news.",
    textAr: "",
    buttonLabel: "Subscribe",
    buttonLabelAr: "اشترك",
    visibility: "ALWAYS",
  },

  map: {
    title: "Find Us",
    titleAr: "موقعنا",
    embedUrl: "",
    address: "Damascus, Syria",
    visibility: "ALWAYS",
  },

  // ─── Vision/Mission section default panels ─────────────────────────────────

  "about-overview-section": {
    heading: "Society Overview",
    headingAr: "نظرة عامة",
    paragraphs: [
      {
        textEn: "The Syrian Soil Science Society (SSSSY) is a professional, non-profit scientific organization dedicated to the advancement of soil science in Syria.",
        textAr: "الجمعية السورية لعلوم التربة (ج.س.ع.ت) هي منظمة مهنية غير ربحية مكرسة لتطوير علوم التربة في سوريا.",
      },
    ],
    visibility: "ALWAYS",
  },

  "about-hero-banner": {
    title: "About the Syrian Soil Science Society",
    titleAr: "عن الجمعية السورية لعلوم التربة",
    subtitle: "Learn about our society, our history, and our commitment to advancing soil science in Syria.",
    subtitleAr: "تعرّف على جمعيتنا وتاريخها والتزامنا بتقدم علوم التربة في سوريا.",
    primaryButtonLabel: "",
    primaryButtonLabelAr: "",
    primaryButtonUrl: "",
    secondaryButtonLabel: "",
    secondaryButtonLabelAr: "",
    secondaryButtonUrl: "",
    visibility: "ALWAYS",
  },

  "board-hero-banner": {
    title: "Board of Directors",
    titleAr: "مجلس الإدارة",
    subtitle: "Meet the dedicated leaders guiding our society.",
    subtitleAr: "تعرّف على القادة المتفانين الذين يقودون مجتمعنا.",
    visibility: "ALWAYS",
  },

  "contact-hero-banner": {
    title: "Contact Us",
    titleAr: "اتصل بنا",
    subtitle: "We'd love to hear from you.",
    subtitleAr: "يسعدنا التواصل معك.",
    visibility: "ALWAYS",
  },

  "newsletter-hero-banner": {
    title: "Newsletter",
    titleAr: "النشرة الإخبارية",
    subtitle: "Stay updated with our latest news and publications.",
    subtitleAr: "ابقَ على اطلاع بأحدث أخبارنا ومنشوراتنا.",
    visibility: "ALWAYS",
  },

  "president-message-hero-banner": {
    title: "President's Message",
    titleAr: "رسالة الرئيس",
    subtitle: "",
    subtitleAr: "",
    visibility: "ALWAYS",
  },

  "publications-hero-banner": {
    title: "Our Publications",
    titleAr: "منشوراتنا",
    subtitle: "",
    subtitleAr: "",
    visibility: "ALWAYS",
  },

  "about-vision-mission-section": {
    heading: "Vision, Mission & Objectives",
    headingAr: "الرؤية والرسالة والأهداف",
    subheading: "Our guiding principles that shape every initiative and program we undertake.",
    subheadingAr: "مبادئنا التوجيهية التي تشكل كل مبادرة وبرنامج نضطلع به.",
    items: [
      {
        icon: "Target",
        title: "Our Vision",
        titleAr: "رؤيتنا",
        content: "To be the leading scientific authority on soil science in Syria and the region, fostering a future where soils are managed sustainably.",
        contentAr: "أن نكون السلطة العلمية الرائدة في علوم التربة في سوريا والمنطقة.",
        color: "from-forest to-forest-light",
      },
      {
        icon: "Eye",
        title: "Our Mission",
        titleAr: "رسالتنا",
        content: "To advance soil science through research, education, and advocacy, promoting sustainable land use practices.",
        contentAr: "تعزيز علوم التربة من خلال البحث والتعليم والمناصرة.",
        color: "from-soil-clay to-soil-dark",
      },
      {
        icon: "List",
        title: "Our Objectives",
        titleAr: "أهدافنا",
        content: "1) Promote soil research. 2) Facilitate knowledge exchange. 3) Support education and training. 4) Advocate for soil-friendly policies.",
        contentAr: "١) تعزيز بحوث التربة. ٢) تسهيل تبادل المعرفة. ٣) دعم التعليم.",
        color: "from-forest-light to-forest",
      },
    ],
    paddingTop: "4rem",
    paddingBottom: "4rem",
    bgType: "solid",
    backgroundColor: "#f5f0e8",
    visibility: "ALWAYS",
  },
};

/**
 * Returns the default props for a block type.
 * If no specific defaults are defined, returns a minimal skeleton.
 */
export function getDefaultProps(type: string): BlockProps {
  return { ...(DEFAULT_PROPS[type] ?? { title: "", visibility: "ALWAYS" }) };
}
