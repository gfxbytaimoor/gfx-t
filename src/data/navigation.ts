export type NavItem = {
  href: string;
  label: string;
  /** Chapter index shown in the header status label, e.g. "02 — About". */
  index: string;
};

export const navigation: NavItem[] = [
  { href: "/", label: "Home", index: "01" },
  { href: "/about", label: "About", index: "02" },
  { href: "/services", label: "Services", index: "03" },
  { href: "/portfolio", label: "Portfolio", index: "04" },
  { href: "/clients", label: "Clients", index: "05" },
  { href: "/management", label: "Management", index: "06" },
  { href: "/contact", label: "Contact", index: "07" },
];

export const findNavItem = (pathname: string) =>
  navigation.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  ) ?? navigation[0];
