export function shouldHideHeaderOnRoute(pathname: string | null): boolean {
    return pathname === '/admin/chats';
}

export function shouldHideFooterOnRoute(pathname: string | null): boolean {
    return pathname === '/admin/chats';
}
