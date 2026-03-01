import * as THREE from "three";

/**
 * Theme presets for the NexusHero metaball shader.
 * Maps to AEROFREN's dark/light/dim themes.
 */

export interface ThemePreset {
    sphereCount: number;
    ambientIntensity: number;
    diffuseIntensity: number;
    specularIntensity: number;
    specularPower: number;
    fresnelPower: number;
    backgroundColor: THREE.Color;
    sphereColor: THREE.Color;
    lightColor: THREE.Color;
    lightPosition: THREE.Vector3;
    smoothness: number;
    contrast: number;
    fogDensity: number;
    cursorGlowIntensity: number;
    cursorGlowRadius: number;
    cursorGlowColor: THREE.Color;
}

export const createPresets = (isMobile: boolean): Record<string, ThemePreset> => ({
    // DARK THEME - Deep blue industrial water aesthetic (Holographic style)
    dark: {
        sphereCount: isMobile ? 3 : 4,
        ambientIntensity: 0.10,
        diffuseIntensity: 1.0,
        specularIntensity: 0.65,
        specularPower: 1,
        fresnelPower: 1.0,
        backgroundColor: new THREE.Color(0x06101f), // AEROFREN dark bg
        sphereColor: new THREE.Color(0x0a1628),
        lightColor: new THREE.Color(0x5cb8ff), // AEROFREN accent blue
        lightPosition: new THREE.Vector3(0.8, 1, 0.8),
        smoothness: 0.8,
        contrast: 2.0,
        fogDensity: 0.1,
        cursorGlowIntensity: 0.6,
        cursorGlowRadius: 1.4,
        cursorGlowColor: new THREE.Color(0x00bae2), // AEROFREN cyan
    },
    // LIGHT THEME - Vibrant Turquoise Glass (Beautiful Aesthetics)
    light: {
        sphereCount: isMobile ? 3 : 4,
        ambientIntensity: 0.40,
        diffuseIntensity: 1.5,
        specularIntensity: 1.2,
        specularPower: 3.0,
        fresnelPower: 1.5,
        backgroundColor: new THREE.Color(0xe0f7fa), // Beautiful light cyan/turquoise air-like bg
        sphereColor: new THREE.Color(0x00e5ff), // VIBRANT Turquoise/Cyan spheres
        lightColor: new THREE.Color(0xffffff), // Pure white light for perfect glass reflections
        lightPosition: new THREE.Vector3(0.8, 1.0, 0.8),
        smoothness: 0.8,
        contrast: 1.5, // Restored contrast so colors pop!
        fogDensity: 0.03, // Reduced fog so the spheres don't wash out to grey
        cursorGlowIntensity: 0.6,
        cursorGlowRadius: 1.5,
        cursorGlowColor: new THREE.Color(0x00bae2),
    },
    // DIM THEME - Purple accent, moody industrial
    dim: {
        sphereCount: isMobile ? 3 : 4,
        ambientIntensity: 0.10,
        diffuseIntensity: 1.0,
        specularIntensity: 0.65,
        specularPower: 1,
        fresnelPower: 1.0,
        backgroundColor: new THREE.Color(0x15202b),
        sphereColor: new THREE.Color(0x192734),
        lightColor: new THREE.Color(0x9f7aea), // Purple accent
        lightPosition: new THREE.Vector3(0.7, 1.2, 0.7),
        smoothness: 0.8,
        contrast: 2.0,
        fogDensity: 0.08,
        cursorGlowIntensity: 0.7,
        cursorGlowRadius: 1.5,
        cursorGlowColor: new THREE.Color(0x9f7aea), // Purple glow
    },
});
