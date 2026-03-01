/**
 * Device detection for NexusHero shader and renderer configuration.
 * Determines mobile, Safari, and low-power status for compile-time shader branching.
 */

export interface DeviceInfo {
    isMobile: boolean;
    isSafari: boolean;
    isLowPower: boolean;
    pixelRatio: number;
}

export const getDeviceInfo = (): DeviceInfo => {
    if (typeof window === "undefined") {
        return { isMobile: false, isSafari: false, isLowPower: false, pixelRatio: 1 };
    }
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isLowPower = isMobile || Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    return { isMobile, isSafari, isLowPower, pixelRatio };
};
