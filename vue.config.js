module.exports = {
    transpileDependencies: ['vuetify'],
    pluginOptions: {
        electronBuilder: {
            externals: ['nedb', 'puppeteer', 'fluent-ffmpeg'],
            // nodeModulesPath: ['../../node_modules', './node_modules'],
            nodeIntegration: true,
            builderOptions: {
                extraResources: ['Success.mp3'],
            },
        },
    },
    chainWebpack: (config) => {
        config.externals({ nedb: 'commonjs nedb' });
    },
};
