module.exports = {
  appId: "com.notepro.desktop",
  productName: "NotePro",
  copyright: "Copyright © 2025 NotePro",
  description: "Workspace produktivitas offline untuk Windows",
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ],
    icon: "resources/icon.ico",
    publisherName: "NotePro"
  },
  nsis: {
    installerIcon: "resources/icon.ico",
    uninstallerIcon: "resources/icon.ico",
    oneClick: true,
    perMachine: false,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  files: [
    "dist/**",
    "src/main.js",
    "src/preload.js",
    "node_modules/**"
  ],
  extraResources: [
    {
      "from": "src",
      "to": "src",
      "filter": ["main.js", "preload.js", "db.js"]
    }
  ]
};
