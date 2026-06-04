// ─── Auth & CRM (existing) ────────────────────────────

export type UserRole = "admin" | "sales";

export type LeadStatus =
  | "new"
  | "contacted"
  | "proposal_sent"
  | "won"
  | "lost"
  | "rejected";

export type ActivityType = "note" | "status_change" | "lead_created";

export type CRMUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  message: string;
  sourcePage: string | null;
  sourceUrl: string | null;
  status: LeadStatus;
  assignedTo: string | null;
  assignedName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadActivity = {
  id: string;
  leadId: string;
  userId: string | null;
  userName: string | null;
  type: ActivityType;
  body: string;
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus | null;
  createdAt: string;
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
  rejected: "Rejected",
};

export const LEAD_STATUSES = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[];

// ─── CMS Media ────────────────────────────────────────

export type CmsMedia = {
  id: string;
  alt: string;
  caption: string | null;
  filename: string;
  mimeType: string;
  filesize: number | null;
  width: number | null;
  height: number | null;
  url: string;
  createdAt: string;
  updatedAt: string;
};

// ─── CMS Collections ──────────────────────────────────

export type PostCategory = "packaging" | "industri" | "inovasi" | "sertifikasi" | "umum";

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  packaging: "Packaging",
  industri: "Industri",
  inovasi: "Inovasi",
  sertifikasi: "Sertifikasi",
  umum: "Umum",
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailId: string | null;
  category: PostCategory;
  content: string | null;
  tags: string[];
  author: string;
  publishedAt: string | null;
  isPublished: boolean;
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
  seoOgImageId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageId: string | null;
  gallery: GalleryItem[];
  category: string | null;
  client: string | null;
  year: number | null;
  tags: string[];
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  quote: string;
  avatarId: string | null;
  rating: number | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photoId: string | null;
  linkedinUrl: string | null;
  email: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  logoId: string | null;
  year: number | null;
  description: string | null;
  documentUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Industry = {
  id: string;
  name: string;
  icon: string | null;
  imageId: string | null;
  description: string;
  expertiseSummary: string | null;
  applications: string[];
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Innovation = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  imageId: string | null;
  tags: string[];
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  excerpt: string;
  description: string | null;
  categoryId: string | null;
  gallery: GalleryItem[];
  specifications: Specification[];
  pricingInfo: string | null;
  featured: boolean;
  sortOrder: number;
  isPublished: boolean;
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
  seoOgImageId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  isPublished: boolean;
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
  seoOgImageId: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── Shared nested types ──────────────────────────────

export type GalleryItem = {
  imageId: string;
  caption?: string;
};

export type Specification = {
  label: string;
  value: string;
};

// ─── CMS Counts (for sidebar) ─────────────────────────

export type CmsCounts = {
  cms_media: number;
  posts: number;
  projects: number;
  testimonials: number;
  team_members: number;
  certifications: number;
  industries: number;
  innovations: number;
  products: number;
  product_categories: number;
  cms_pages: number;
  cms_globals: number;
};
