// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  whitepaperSidebar: [
  {
    type: 'category',
    label: 'Whitepaper',
    items: [
      'whitepaper/public-brief',
      'whitepaper/full-academic',
      'whitepaper/abstract',
      'whitepaper/tokenomics',
      'whitepaper/roadmap',
    ],
  },
],

technicalSidebar: [
  {
    type: 'category',
    label: 'Technical Architecture',
    items: [
      'technical/ix-token-vault',
      'technical/position-lifecycle',
      'technical/phantom-nav-c1',
      'technical/governance',
      'technical/flash-lending',
      'technical/leveraged-spot-adapter',
    ],
  },
],

loreSidebar: [
  'foundation-lore/overview',
  {
    type: 'category',
    label: 'Genesis Chairs (0–14)',
    items: [
      'foundation-lore/chair-00',
      'foundation-lore/chair-01',
      'foundation-lore/chair-02',
      'foundation-lore/chair-03',
      'foundation-lore/chair-04',
      'foundation-lore/chair-05',
      'foundation-lore/chair-06',
      'foundation-lore/chair-07',
      'foundation-lore/chair-08',
      'foundation-lore/chair-09',
      'foundation-lore/chair-10',
      'foundation-lore/chair-11',
      'foundation-lore/chair-12',
      'foundation-lore/chair-13',
      'foundation-lore/chair-14',
    ],
  },
],

keepersSidebar: [
  'keepers-lore/keepers-overview',
  {
    type: 'category',
    label: 'The Five Knights',
    items: [
      'keepers-lore/iron-liquidator',
      'keepers-lore/squall-keeper',
      'keepers-lore/dust-sweeper',
      'keepers-lore/amortizer',
      'keepers-lore/gatekeeper',
    ],
  },
],

growthSidebar: [
  {
    type: 'category',
    label: 'Go-to-Market',
    items: [
      'growth/marketing-strategy',
      'growth/awareness-action-plan',
      'growth/user-onboarding-action-plan',
    ],
  },
],
};

module.exports = sidebars;
