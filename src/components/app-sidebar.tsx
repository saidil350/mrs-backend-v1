"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BriefcaseBusiness,
  ChevronUp,
  Database,
  Factory,
  FileText,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  MessageSquareQuote,
  Newspaper,
  Package,
  Settings2,
  ShieldCheck,
  Tags,
  UsersRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutAction } from "@/app/actions/auth";
import type { CRMUser, CmsCounts } from "@/types";

type SidebarCollection = {
  label: string;
  slug: string;
  countKey: keyof CmsCounts;
  icon: React.ComponentType<{ className?: string }>;
};

const contentCollections: SidebarCollection[] = [
  { label: "Posts", slug: "posts", countKey: "posts", icon: Newspaper },
  { label: "Projects", slug: "projects", countKey: "projects", icon: BriefcaseBusiness },
  { label: "Testimonials", slug: "testimonials", countKey: "testimonials", icon: MessageSquareQuote },
  { label: "Industries", slug: "industries", countKey: "industries", icon: Factory },
  { label: "Innovations", slug: "innovations", countKey: "innovations", icon: Lightbulb },
  { label: "Products", slug: "products", countKey: "products", icon: Package },
  { label: "Product Categories", slug: "product-categories", countKey: "product_categories", icon: Tags },
  { label: "Pages", slug: "pages", countKey: "cms_pages", icon: FileText },
];

const profileCollections: SidebarCollection[] = [
  { label: "Team", slug: "team", countKey: "team_members", icon: UsersRound },
  { label: "Certifications", slug: "certifications", countKey: "certifications", icon: Award },
];

export function AppSidebar({
  user,
  counts,
}: {
  user: CRMUser;
  counts: CmsCounts;
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              tooltip="MRS CRM"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-xs font-black">M</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black tracking-wider">MRS</span>
                <span className="truncate text-xs text-muted-foreground">
                  CRM
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* CRM Section */}
        <SidebarGroup>
          <SidebarGroupLabel>CRM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard" />}
                  isActive={pathname === "/dashboard"}
                  tooltip="Dashboard"
                >
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/leads" />}
                  isActive={pathname === "/leads"}
                  tooltip="Semua Lead"
                >
                  <UsersRound />
                  <span>Semua Lead</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Collections */}
        <SidebarGroup>
          <SidebarGroupLabel>Konten</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentCollections.map((collection) => {
                const Icon = collection.icon;
                const href = `/cms/${collection.slug}`;
                return (
                  <SidebarMenuItem key={collection.slug}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={pathname.startsWith(href)}
                      tooltip={collection.label}
                    >
                      <Icon />
                      <span>{collection.label}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>
                      {counts[collection.countKey] ?? 0}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Profile Collections */}
        <SidebarGroup>
          <SidebarGroupLabel>Profil Perusahaan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileCollections.map((collection) => {
                const Icon = collection.icon;
                const href = `/cms/${collection.slug}`;
                return (
                  <SidebarMenuItem key={collection.slug}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={pathname.startsWith(href)}
                      tooltip={collection.label}
                    >
                      <Icon />
                      <span>{collection.label}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>
                      {counts[collection.countKey] ?? 0}
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Media */}
        <SidebarGroup>
          <SidebarGroupLabel>Media</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/cms/media" />}
                  isActive={pathname.startsWith("/cms/media")}
                  tooltip="Media Library"
                >
                  <Database />
                  <span>Media Library</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>
                  {counts.cms_media ?? 0}
                </SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Globals - Brand & Company */}
        <SidebarGroup>
          <SidebarGroupLabel>Brand & Profil</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/cms/globals" />}
                  isActive={pathname.startsWith("/cms/globals")}
                  tooltip="Globals"
                >
                  <Settings2 />
                  <span>Brand & Globals</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>
                  {counts.cms_globals ?? 0}
                </SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings - Admin Only */}
        {user.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Pengaturan</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/users" />}
                    isActive={pathname.startsWith("/users")}
                    tooltip="Kelola Akun"
                  >
                    <ShieldCheck />
                    <span>Kelola Akun</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent"
                  />
                }
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.role === "admin" ? "Admin" : "Sales"}
                  </span>
                </div>
                <ChevronUp className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem
                  className="w-full cursor-pointer"
                  onClick={() => { logoutAction(); }}
                >
                  <LogOut className="size-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
