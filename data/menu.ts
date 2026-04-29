import { BarChart3, Building2, Calculator, FileSearch, FileText, Fingerprint, LayoutDashboard, ReceiptText, ShieldCheck, Users, UserCog, WalletCards, Landmark, ClipboardList, BriefcaseBusiness, Rocket } from "lucide-react";

export type MenuItem = { key: string; label: string; icon: any; section: "Principal" | "Administração" | "Controle"; };

export const menuItems: MenuItem[] = [
  { key: "painel-geral", label: "Painel Geral", icon: LayoutDashboard, section: "Principal" },
  { key: "clientes", label: "Clientes", icon: Users, section: "Principal" },
  { key: "fiscal", label: "Fiscal", icon: ReceiptText, section: "Principal" },
  { key: "contabil", label: "Contábil", icon: Calculator, section: "Principal" },
  { key: "folha", label: "Folha de Pagamento", icon: WalletCards, section: "Principal" },
  { key: "paralegal", label: "Paralegal", icon: FileText, section: "Principal" },
  { key: "nfse", label: "NFS-e", icon: Building2, section: "Principal" },
  { key: "gestao", label: "Gestão do Escritório", icon: BriefcaseBusiness, section: "Principal" },
  { key: "estrategico", label: "Estratégico", icon: BarChart3, section: "Principal" },
  { key: "onboarding", label: "Onboarding", icon: Rocket, section: "Principal" },
  { key: "usuarios", label: "Usuários", icon: UserCog, section: "Administração" },
  { key: "seguranca", label: "Segurança", icon: ShieldCheck, section: "Administração" },
  { key: "configuracoes", label: "Configurações", icon: Landmark, section: "Administração" },
  { key: "relatorios", label: "Relatórios", icon: ClipboardList, section: "Controle" },
  { key: "auditoria", label: "Auditoria / Log", icon: Fingerprint, section: "Controle" }
];
