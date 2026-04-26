/**
 * Theme definitions for artistic map rendering.
 * Each theme defines fog, lighting, sky, and terrain settings.
 */

const themes = {

    'dark-cinematic': {
        name: 'Dark Cinematic',
        description: 'Cyberpunk night city with neon glow',
        previewColors: ['#0a0a2e', '#ff00ff', '#00ffff'],
        fog: {
            'range': [0.5, 8],
            'color': 'hsla(250, 40%, 15%, 1)',
            'horizon-blend': 0.03,
            'star-intensity': 0.8,
            'vertical-range': [20, 80]
        },
        ambient: { r: 20, g: 15, b: 60, intensity: 0.4 },
        directional: { r: 180, g: 120, b: 255, intensity: 0.5, shadowIntensity: 0.8 },
        sky: { opacity: 1, color: 'hsl(260, 80%, 20%)', sunIntensity: 5 },
        terrainExaggeration: 1.5,
        useDynamicLighting: false
    },

    'clean-minimalist': {
        name: 'Clean Minimalist',
        description: 'Museum exhibit diorama',
        previewColors: ['#f0ece2', '#b8c4cc', '#a3b18a'],
        fog: {
            'range': [1, 12],
            'color': 'hsla(30, 10%, 92%, 1)',
            'horizon-blend': 0.05,
            'star-intensity': 0,
            'vertical-range': [40, 120]
        },
        ambient: { r: 240, g: 235, b: 225, intensity: 0.85 },
        directional: { r: 255, g: 250, b: 240, intensity: 0.2, shadowIntensity: 0.3 },
        sky: { opacity: 0.6, color: 'hsl(210, 20%, 85%)', sunIntensity: 8 },
        terrainExaggeration: 1.2,
        useDynamicLighting: false
    },

    'vivid-terrain': {
        name: 'Vivid Terrain',
        description: 'Satellite-style rich landscape',
        previewColors: ['#1a5276', '#27ae60', '#f39c12'],
        fog: {
            'range': [1, 14],
            'color': 'hsla(200, 30%, 60%, 1)',
            'horizon-blend': 0.02,
            'star-intensity': 0.3,
            'vertical-range': [30, 100]
        },
        ambient: { r: 255, g: 248, b: 230, intensity: 0.75 },
        directional: { r: 255, g: 240, b: 200, intensity: 0.4, shadowIntensity: 1.0 },
        sky: { opacity: 1, color: 'hsl(210, 80%, 60%)', sunIntensity: 15 },
        terrainExaggeration: 2.0,
        useDynamicLighting: true
    },

    'tilt-shift': {
        name: 'Tilt-Shift Miniature',
        description: 'Toy-like miniature model railway',
        previewColors: ['#ffeaa7', '#fab1a0', '#81ecec'],
        fog: {
            'range': [0.5, 6],
            'color': 'hsla(40, 40%, 80%, 1)',
            'horizon-blend': 0.08,
            'star-intensity': 0,
            'vertical-range': [10, 50]
        },
        ambient: { r: 255, g: 245, b: 220, intensity: 0.8 },
        directional: { r: 255, g: 230, b: 180, intensity: 0.5, shadowIntensity: 1.2 },
        sky: { opacity: 0.8, color: 'hsl(200, 60%, 70%)', sunIntensity: 20 },
        terrainExaggeration: 1.8,
        useDynamicLighting: false
    }

};

export default themes;
