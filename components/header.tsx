"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useScroll } from "@/hooks/use-scroll";
import { Logo } from "@/components/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";
import {
	BarChart3,
	Shield,
	Lock,
	Target,
	AlertTriangle,
	Search,
	HelpCircle,
} from "lucide-react";
import { CommandMenu } from "@/components/command-menu";
import { HelpDialog } from "@/components/help-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { SettingsDialog } from "@/components/settings-dialog";

export const navLinksConfig = [
	{
		key: "home",
		href: "/",
		icon: Target,
	},
	{
		key: "analysis",
		href: "/analysis",
		icon: Target,
	},
	{
		key: "allThreats",
		href: "/threats",
		icon: AlertTriangle,
	},
	{
		key: "protectionMeasures",
		href: "/protection-measures",
		icon: Shield,
	},
	{
		key: "tacticalTasks",
		href: "/tactical-tasks",
		icon: Lock,
	},
	{
		key: "charts",
		href: "/charts",
		icon: BarChart3,
	},
];

export function Header() {
	const t = useTranslations('Navigation');
	const pathname = usePathname();
	const scrolled = useScroll(10);
	const [commandMenuOpen, setCommandMenuOpen] = React.useState(false);
	const [helpOpen, setHelpOpen] = React.useState(false);

	const navLinks = navLinksConfig.map(link => ({
		...link,
		title: t(link.key as any)
	}));

	// Обработка шортката для справки (Cmd+Shift+? или Ctrl+Shift+?)
	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
			const modifier = isMac ? e.metaKey : e.ctrlKey;
			const target = e.target as HTMLElement;
			const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
			
			// Проверяем Cmd/Ctrl + Shift + ? (на большинстве раскладок ? требует Shift)
			if (modifier && e.shiftKey && (e.key === '?' || (e.key === '/' && e.shiftKey)) && !isInput) {
				e.preventDefault();
				setHelpOpen(true);
			}
		};

		const handleOpenHelp = () => {
			setHelpOpen(true);
		};

		document.addEventListener("keydown", down);
		window.addEventListener('openHelp', handleOpenHelp);
		return () => {
			document.removeEventListener("keydown", down);
			window.removeEventListener('openHelp', handleOpenHelp);
		};
	}, []);

	return (
		<>
			<div
				className={cn(
					"sticky top-0 z-50 w-full md:transition-all md:ease-out",
					{
						"md:px-36 md:top-4": scrolled,
					}
				)}
			>
				<header
					className={cn(
						"w-full border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
						{
							"border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:shadow md:rounded-xl":
								scrolled,
						}
					)}
				>
					<nav
						className={cn(
							"flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out container mx-auto",
							{
								"md:px-6": scrolled,
							}
						)}
					>
					<Link href="/" className="rounded-md p-2">
						<Logo />
					</Link>
					<div className="hidden items-center gap-1 md:flex">
						{navLinks.slice(1).map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.href || 
								(item.href !== "/" && pathname?.startsWith(item.href));
							
							return (
								<Link key={item.href} href={item.href}>
									<Button
										variant={isActive ? "secondary" : "ghost"}
										size="sm"
										className={cn(
											"gap-2",
											isActive && "bg-secondary"
										)}
									>
										<Icon className="h-4 w-4" />
										{item.title}
									</Button>
								</Link>
							);
						})}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							className="hidden md:flex gap-2"
							onClick={() => setCommandMenuOpen(true)}
						>
							<Search className="h-4 w-4" />
							<span className="text-muted-foreground">⌘K</span>
						</Button>
						{pathname === "/" ? (
							<Button 
								variant="ghost" 
								size="sm"
								onClick={() => setHelpOpen(true)}
								title={t('openHelp')}
							>
								<HelpCircle className="h-4 w-4 mr-2" />
								<span className="hidden sm:inline">{t('help')}</span>
							</Button>
						) : (
							<Button 
								variant="ghost" 
								size="icon"
								onClick={() => setHelpOpen(true)}
								title={t('openHelp')}
							>
								<HelpCircle className="h-4 w-4" />
								<span className="sr-only">{t('openHelp')}</span>
							</Button>
						)}
						<SettingsDialog />
						<ThemeToggle />
						<MobileNav />
					</div>
				</nav>
			</header>
			</div>
			<CommandMenu open={commandMenuOpen} onOpenChange={setCommandMenuOpen} />
			<HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
		</>
	);
}
