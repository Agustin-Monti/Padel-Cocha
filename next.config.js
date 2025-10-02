/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
    reactStrictMode: true,
    images: {
        domains: ['eunsyrxioxiesiwlxysy.supabase.co'], // ✅ Agregado el dominio de Supabase
    },
};

module.exports = nextConfig;

