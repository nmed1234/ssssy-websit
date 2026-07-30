/**
 * block-types.ts
 * Block type definitions and palette registry for the Custom Section Builder.
 */
import type { BlockType } from "@/types";

export interface BlockPaletteItem {
  type: BlockType;
  label: string;
  labelAr: string;
  icon: string;           // emoji or lucide icon name
  description: string;
  category: 'Core' | 'Advanced' | 'Dynamic';
  defaultProps: Record<string, unknown>;
}

export const BLOCK_PALETTE: BlockPaletteItem[] = [
  // ── Core ─────────────────────────────────────────────────────────────────
  {
    type: 'heading',
    label: 'Heading',
    labelAr: 'عنوان',
    icon: 'H',
    description: 'Title or section heading',
    category: 'Core',
    defaultProps: { textEn: 'Section Heading', textAr: 'عنوان القسم', level: 'h2', align: 'left' },
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    labelAr: 'فقرة',
    icon: '¶',
    description: 'Body text paragraph',
    category: 'Core',
    defaultProps: { textEn: 'Add your paragraph text here. This is sample body content that you can replace with your own text.', textAr: 'أضف نص الفقرة هنا. هذا محتوى نص عينة يمكنك استبداله بنصك الخاص.', align: 'left' },
  },
  {
    type: 'image',
    label: 'Image',
    labelAr: 'صورة',
    icon: '🖼',
    description: 'Single image with optional caption',
    category: 'Core',
    defaultProps: { src: '', altEn: 'Image description', altAr: 'وصف الصورة', captionEn: '', captionAr: '', width: '100%', rounded: true },
  },
  {
    type: 'button',
    label: 'Button',
    labelAr: 'زر',
    icon: '⬛',
    description: 'Action button with label and URL',
    category: 'Core',
    defaultProps: { labelEn: 'Click Here', labelAr: 'انقر هنا', url: '#', variant: 'primary', align: 'left' },
  },
  {
    type: 'divider',
    label: 'Divider',
    labelAr: 'فاصل',
    icon: '—',
    description: 'Horizontal dividing line',
    category: 'Core',
    defaultProps: { style: 'solid', color: 'border-gray-200', thickness: '1px', margin: 'my-8' },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    labelAr: 'مسافة',
    icon: '↕',
    description: 'Empty vertical space',
    category: 'Core',
    defaultProps: { height: 'h-8' },
  },
  {
    type: 'columns',
    label: 'Columns / Grid',
    labelAr: 'أعمدة / شبكة',
    icon: '⊞',
    description: '1–4 column layout container',
    category: 'Core',
    defaultProps: { columnCount: 2, gap: 'md' },
  },
  {
    type: 'video',
    label: 'Video',
    labelAr: 'فيديو',
    icon: '▶',
    description: 'Embedded video (YouTube / URL)',
    category: 'Core',
    defaultProps: { src: '', autoplay: false, controls: true, captionEn: '', captionAr: '' },
  },
  {
    type: 'icon',
    label: 'Icon',
    labelAr: 'أيقونة',
    icon: '★',
    description: 'Decorative icon with optional label',
    category: 'Core',
    defaultProps: { name: 'leaf', size: '48px', color: 'text-forest', labelEn: '', labelAr: '', align: 'center' },
  },
  {
    type: 'card',
    label: 'Card',
    labelAr: 'بطاقة',
    icon: '🃏',
    description: 'Content card with title, description and optional image',
    category: 'Core',
    defaultProps: { titleEn: 'Card Title', titleAr: 'عنوان البطاقة', descriptionEn: 'Card description text goes here.', descriptionAr: 'نص وصف البطاقة هنا.', image: '', linkUrl: '', linkLabelEn: 'Read More', linkLabelAr: 'اقرأ المزيد' },
  },
  // ── Advanced ──────────────────────────────────────────────────────────────
  {
    type: 'accordion',
    label: 'Accordion / FAQ',
    labelAr: 'أكورديون / أسئلة',
    icon: '≡',
    description: 'Collapsible question and answer items',
    category: 'Advanced',
    defaultProps: {
      items: [
        { questionEn: 'First Question', questionAr: 'السؤال الأول', answerEn: 'Answer to the first question.', answerAr: 'الإجابة على السؤال الأول.' },
        { questionEn: 'Second Question', questionAr: 'السؤال الثاني', answerEn: 'Answer to the second question.', answerAr: 'الإجابة على السؤال الثاني.' },
      ],
    },
  },
  {
    type: 'timeline',
    label: 'Timeline',
    labelAr: 'جدول زمني',
    icon: '⏱',
    description: 'Vertical timeline of events or milestones',
    category: 'Advanced',
    defaultProps: {
      items: [
        { year: '2020', titleEn: 'Milestone One', titleAr: 'الإنجاز الأول', descriptionEn: 'Description of this milestone.', descriptionAr: 'وصف هذا الإنجاز.' },
        { year: '2022', titleEn: 'Milestone Two', titleAr: 'الإنجاز الثاني', descriptionEn: 'Description of this milestone.', descriptionAr: 'وصف هذا الإنجاز.' },
      ],
    },
  },
  {
    type: 'team-grid',
    label: 'Team Grid',
    labelAr: 'شبكة الفريق',
    icon: '👥',
    description: 'Grid of team member cards',
    category: 'Advanced',
    defaultProps: {
      members: [
        { nameEn: 'Team Member', nameAr: 'عضو الفريق', roleEn: 'Role', roleAr: 'الدور', photo: '', bioEn: '', bioAr: '' },
      ],
    },
  },
  {
    type: 'map',
    label: 'Map Embed',
    labelAr: 'خريطة مضمّنة',
    icon: '🗺',
    description: 'Embedded Google Maps or OpenStreetMap',
    category: 'Advanced',
    defaultProps: { embedUrl: '', height: '400px', captionEn: '', captionAr: '' },
  },
  {
    type: 'form-embed',
    label: 'Form Embed',
    labelAr: 'نموذج مضمّن',
    icon: '📋',
    description: 'Embed an external form via URL or HTML',
    category: 'Advanced',
    defaultProps: { embedHtml: '', height: '500px' },
  },
  {
    type: 'alert',
    label: 'Alert / Banner',
    labelAr: 'تنبيه / بانر',
    icon: '⚠',
    description: 'Info, warning, or success alert box',
    category: 'Advanced',
    defaultProps: { variant: 'info', messageEn: 'This is an important notice.', messageAr: 'هذا إشعار مهم.', dismissible: false },
  },
  {
    type: 'quote',
    label: 'Quote',
    labelAr: 'اقتباس',
    icon: '"',
    description: 'Pull quote with optional attribution',
    category: 'Advanced',
    defaultProps: { textEn: 'A meaningful quote goes here.', textAr: 'اقتباس ذو معنى يذهب هنا.', authorEn: 'Author Name', authorAr: 'اسم المؤلف', authorRoleEn: '', authorRoleAr: '' },
  },
  {
    type: 'code',
    label: 'Code Block',
    labelAr: 'كتلة كود',
    icon: '</>',
    description: 'Syntax-highlighted code snippet',
    category: 'Advanced',
    defaultProps: { language: 'javascript', code: '// Your code here' },
  },
  {
    type: 'html',
    label: 'HTML Embed',
    labelAr: 'تضمين HTML',
    icon: '{}',
    description: 'Raw HTML for custom embeds',
    category: 'Advanced',
    defaultProps: { rawHtml: '<p>Custom HTML content</p>' },
  },
  // ── Dynamic ───────────────────────────────────────────────────────────────
  {
    type: 'latest-news',
    label: 'Latest News',
    labelAr: 'آخر الأخبار',
    icon: '📰',
    description: 'Dynamic feed of latest news articles',
    category: 'Dynamic',
    defaultProps: { count: 3, layout: 'grid', titleEn: 'Latest News', titleAr: 'آخر الأخبار' },
  },
  {
    type: 'upcoming-events',
    label: 'Upcoming Events',
    labelAr: 'الفعاليات القادمة',
    icon: '📅',
    description: 'Dynamic list of upcoming events',
    category: 'Dynamic',
    defaultProps: { count: 3, titleEn: 'Upcoming Events', titleAr: 'الفعاليات القادمة' },
  },
  {
    type: 'publications-carousel',
    label: 'Publications Carousel',
    labelAr: 'كاروسيل المنشورات',
    icon: '📚',
    description: 'Scrolling carousel of publications',
    category: 'Dynamic',
    defaultProps: { titleEn: 'Recent Publications', titleAr: 'المنشورات الأخيرة', viewAllUrl: '/publications' },
  },
  {
    type: 'board-members',
    label: 'Board Members',
    labelAr: 'أعضاء المجلس',
    icon: '🏛',
    description: 'Dynamic grid of board member profiles',
    category: 'Dynamic',
    defaultProps: { titleEn: 'Board Members', titleAr: 'أعضاء المجلس', layout: 'grid' },
  },
  {
    type: 'statistics-counter',
    label: 'Statistics Counter',
    labelAr: 'عدّاد إحصائيات',
    icon: '📊',
    description: 'Animated counters for key statistics',
    category: 'Dynamic',
    defaultProps: {
      titleEn: 'Our Impact',
      titleAr: 'أثرنا',
      items: [
        { value: '500+', labelEn: 'Members', labelAr: 'عضو' },
        { value: '150+', labelEn: 'Publications', labelAr: 'منشور' },
      ],
    },
  },
];

export const BLOCK_CATEGORIES = ['Core', 'Advanced', 'Dynamic'] as const;
export type BlockCategory = typeof BLOCK_CATEGORIES[number];
