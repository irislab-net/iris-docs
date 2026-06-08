// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Iris Foundation',
    tagline: 'Orchestrating Modular Leveraged Trading Stack & Dual-Ledger Architectures',
    favicon: 'img/favicon.ico',
  
    url: 'https://docs.iris.exchange', 
    baseUrl: '/',
  
    organizationName: 'your-github-username-or-org', 
    projectName: 'iris-docs', 
    deploymentBranch: 'gh-pages',
  
    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',
  
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },
  
    presets: [
      [
        'classic',
        /** @type {import('@docusaurus/preset-classic').Options} */
        ({
          docs: {
            sidebarPath: require.resolve('./sidebars.js'),
            editUrl: 'https://github.com/your-github-username-or-org/iris-docs/tree/main/',
          },
          theme: {
            customCss: require.resolve('./src/css/custom.css'),
          },
          sitemap: {
            changefreq: 'weekly',
            priority: 0.5,
            ignorePatterns: ['/tags/**'],
            filename: 'sitemap.xml',
          },
        }),
      ],
    ],
  
    themeConfig:
      /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
      ({
        image: 'assets/nft-foundations/renders/07-faceless-void.png',
        navbar: {
          title: 'Iris Docs',
          logo: {
            alt: 'Iris Logo',
            src: 'img/logo.svg',
          },
          items: [
            {
              type: 'docSidebar',
              sidebarId: 'whitepaperSidebar',
              position: 'left',
              label: 'Whitepaper',
            },
            {
              type: 'docSidebar',
              sidebarId: 'technicalSidebar',
              position: 'left',
              label: 'Technical Spec',
            },
            {
              type: 'docSidebar',
              sidebarId: 'loreSidebar',
              position: 'left',
              label: 'Foundations Lore',
            },
            {
              href: 'https://github.com/your-github-username-or-org/iris-core',
              label: 'GitHub (Core)',
              position: 'right',
            },
          ],
        },
        footer: {
          style: 'dark',
          copyright: `Copyright © ${new Date().getFullYear()} Iris Foundation. Built with absolute orchestration.`,
        },
      }),
  };
  
  module.exports = config;