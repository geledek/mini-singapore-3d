/**
 * Environment configuration loader
 * These values are replaced at build time by rollup
 * DO NOT use process.env directly - these are build-time constants
 */

const envConfig = {
    // These will be replaced by rollup's replace plugin at build time
    mapboxAccessToken: 'BUILD_MAPBOX_ACCESS_TOKEN',
    ltaAccountKey: 'BUILD_LTA_ACCOUNT_KEY',
    googleAnalyticsId: 'BUILD_GOOGLE_ANALYTICS_ID',
    proxyUrl: 'BUILD_PROXY_URL',
    shareUrl: 'BUILD_SHARE_URL',
    lastStaticUpdate: 'BUILD_LAST_STATIC_UPDATE'
};

export default envConfig;
