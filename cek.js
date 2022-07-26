var os = require('os-utils')

os.cpuUsage((v) => {
    console.log(`cpu usage % ${v}`)
})