// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    whitepaperSidebar: [
      {
        type: 'category',
        label: '📖 Ecosystem Whitepaper',
        items: [
          'whitepaper/abstract',
          'whitepaper/tokenomics',
          'whitepaper/roadmap',
        ],
      },
    ],
  
    technicalSidebar: [
      {
        type: 'category',
        label: '💻 Technical Architecture',
        items: [
          'technical/ix-token-vault',
          'technical/position-lifecycle',
          'technical/phantom-nav-c1',
        ],
      },
    ],
  
    loreSidebar: [
      {
        type: 'category',
        label: '🔮 Foundation Kingdoms',
        items: [
          'foundation-lore/overview',
          'foundation-lore/king-solaris',
          'foundation-lore/faceless-void',
        ],
      },
    ],
  };
  
module.exports = sidebars;