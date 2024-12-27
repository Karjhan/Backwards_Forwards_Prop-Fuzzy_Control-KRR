export interface NavbarProps{
    openBasic: boolean,
    links: Array<NavbarLink>,
    brandName?: string,
    setOpenBasic: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface NavbarLink{
    name: string,
    href: string
}