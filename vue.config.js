module.exports = {
    transpileDependencies: ['vuetify'],
    pluginOptions: {
        electronBuilder: {
            externals: ['nedb', 'puppeteer', 'fluent-ffmpeg'],
            // nodeModulesPath: ['../../node_modules', './node_modules'],
            nodeIntegration: true,
            builderOptions: {
                appId: "com.dtproxy.app",
                productName: "DTProxy Multiple Tool",
                target: "NSIS",
                directories: {
                    "output": "build/app"
                },
                nsis: {
                    "allowToChangeInstallationDirectory": true,
                    "oneClick": false
                },
                fileAssociations: [
                    {
                        ext: 'ico',
                        icon: 'app-icon.ico'
                    }
                ]
            },
        },
    },
    chainWebpack: (config) => {
        config.externals({ nedb: 'commonjs nedb' });
    },
};
