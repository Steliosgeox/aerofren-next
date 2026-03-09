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
    const cores = navigator.hardwareConcurrency ?? 0;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    // Flag low-power: mobile, ≤4 logical cores (i5-3rd-gen = 4), or ≤2 GB RAM
    const isLowPower = isMobile || (cores > 0 && cores <= 4) || (typeof mem === "number" && mem <= 2);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    return { isMobile, isSafari, isLowPower, pixelRatio };
};
