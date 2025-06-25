const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  outputDir: '../spring/src/main/resources/static',
        devServer: {
                proxy: 'http://localhost:8080' // Spring Boot Server
        }
})
