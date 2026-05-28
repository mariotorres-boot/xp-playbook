import { LayoutDashboard, Columns3, List, RotateCcw, CalendarRange, Users, LogOut, FileBarChart, Database } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { useProjectStore } from '@/store/useProjectStore';

const navItems = [
  { title: 'Panel', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Tableros', url: '/boards', icon: Columns3 },
  { title: 'Backlog', url: '/backlog', icon: List },
  { title: 'Iteraciones', url: '/iterations', icon: RotateCcw },
  { title: 'Planificación', url: '/releases', icon: CalendarRange },
  { title: 'Equipo y Grupos', url: '/team', icon: Users },
  { title: 'Reportes', url: '/reports', icon: FileBarChart },
  { title: 'Respaldos', url: '/backup', icon: Database },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const logout = useProjectStore((s) => s.logout);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {!collapsed && <span className="font-bold text-sidebar-primary text-base tracking-tight">XP Manager</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/60"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenuButton onClick={logout} className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60">
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
