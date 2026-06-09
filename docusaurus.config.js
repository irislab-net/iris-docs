// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Iris Foundation',
  tagline: 'Orchestrating Modular Leveraged Trading Stack & Dual-Ledger Architectures',
  favicon: 'img/logo.svg',

  url: 'https://docs.iris.exchange',
  baseUrl: '/',

  organizationName: 'irislab-net',
  projectName: 'iris-whitepaper',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

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
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/irislab-net/iris-whitepaper/tree/main/',
          exclude: ['**/_internal/**', '**/aic/**'],
        },
        blog: false,
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
      image: 'assets/nft-foundations/renders/7-faceless-void.png',
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
            label: 'Foundation',
          },
          {
            type: 'docSidebar',
            sidebarId: 'keepersSidebar',
            position: 'left',
            label: 'Keepers',
          },
          {
            type: 'docSidebar',
            sidebarId: 'growthSidebar',
            position: 'left',
            label: 'Growth',
          },
          {
            href: 'https://github.com/irislab-net/iris-core',
            label: 'GitHub (Core)',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              { label: 'Whitepaper', to: '/whitepaper/public-brief' },
              { label: 'Technical Spec', to: '/technical/ix-token-vault' },
              { label: 'Foundation', to: '/foundation-lore/overview' },
              { label: 'Keepers', to: '/keepers-lore/keepers-overview' },
            ],
          },
          {
            title: 'Repositories',
            items: [
              { label: 'iris-core', href: 'https://github.com/irislab-net/iris-core' },
              { label: 'iris-governance', href: 'https://github.com/irislab-net/iris-governance' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Iris Foundation. Built with absolute orchestration.`,
      },
    }),
};

module.exports = config;
