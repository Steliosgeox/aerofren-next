import { shouldHideHeaderOnRoute, shouldHideFooterOnRoute } from '@/lib/layout/route-chrome';

describe('admin chat route chrome', () => {
    it('hides the shared header on the immersive admin chat route', () => {
        expect(shouldHideHeaderOnRoute('/admin/chats')).toBe(true);
        expect(shouldHideHeaderOnRoute('/admin')).toBe(false);
    });

    it('hides the shared footer on the immersive admin chat route', () => {
        expect(shouldHideFooterOnRoute('/admin/chats')).toBe(true);
        expect(shouldHideFooterOnRoute('/contact')).toBe(false);
    });
});
