import { useMediaQuery } from "@/hooks/use-media-query";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuIcon, XIcon, Target, AlertTriangle, Shield, Lock, BarChart3 } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { navLinksConfig } from "@/components/header";

export function MobileNav() {
	const t = useTranslations('Navigation');
	const pathname = usePathname();
	const [open, setOpen] = React.useState(false);
	const { isMobile } = useMediaQuery();

	const navLinks = navLinksConfig.map(link => ({
		...link,
		title: t(link.key as any)
	}));

	// 🚫 Disable body scroll when open
	React.useEffect(() => {
		if (open && isMobile) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		// Cleanup on unmount too
		return () => {
			document.body.style.overflow = "";
		};
	}, [open, isMobile]);

	return (
		<>
			<Button
				aria-controls="mobile-menu"
				aria-expanded={open}
				aria-label="Toggle menu"
				className="md:hidden"
				onClick={() => setOpen(!open)}
				size="icon"
				variant="outline"
			>
				{open ? (
					<XIcon className="size-4.5" />
				) : (
					<MenuIcon className="size-4.5" />
				)}
			</Button>
			{open &&
				createPortal(
					<div
						className={cn(
							"bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50",
							"fixed top-14 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-t md:hidden"
						)}
						id="mobile-menu"
					>
						<div
							className={cn(
								"data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
								"size-full p-4"
							)}
							data-slot={open ? "open" : "closed"}
						>
							<div className="grid gap-y-2">
								{navLinks.map((item) => {
									const Icon = item.icon;
									const isActive = pathname === item.href || 
										(item.href !== "/" && pathname?.startsWith(item.href));
									
									return (
										<Link
											key={item.href}
											href={item.href}
											onClick={() => setOpen(false)}
										>
											<Button
												variant={isActive ? "secondary" : "ghost"}
												className={cn(
													"w-full justify-start gap-2",
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
						</div>
					</div>,
					document.body
				)}
		</>
	);
}
