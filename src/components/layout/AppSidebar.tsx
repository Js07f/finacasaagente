import { MessageSquare, Target, BarChart3, Settings, Wallet } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Chat", url: "/", icon: MessageSquare, description: "Converse com seu agente" },
  { title: "Metas", url: "/metas", icon: Target, description: "Suas metas financeiras" },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, description: "Insights e gráficos" },
  { title: "Configurações", url: "/configuracoes", icon: Settings, description: "Preferências do app" },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-sidebar-foreground">FinançasPro</span>
              <span className="text-xs text-muted-foreground">Seu agente financeiro</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "transition-colors",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!isCollapsed && (
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">
              💡 Dica: Use o chat para registrar gastos de forma natural!
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
