#! /usr/bin/env node

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');
const { exec } = require('child_process');

const argv = yargs(hideBin(process.argv))
    .demandCommand(1, 'You must provide a port number')
    .check((argv) => {
        if (argv._.length > 1) {
            throw new Error('You must provide exactly 1 port number. Provided ' + argv._.length + ' arguments')
        }
        if (isNaN(argv._[0])) {
            throw new Error('Port must be a number')
        }
        if (argv._[0] < 1 || argv._[0] > 65535) {
            throw new Error('Port must be between 1 and 65535')
        }
        return true;
    })
    .help()
    .argv;

function parseOutput(output) {
    const lines = output.split('\n')
    const header = lines[0]
    const pidHeader = header.split(/\s+/).filter(value => value == "PID").join(" ")

    const values = lines[1]
    const pidVal = values.split(/\s+/)
    let text = []
    text.push(pidHeader, pidVal[1])
    return text
}

exec(`lsof -i :${argv._[0]}`, (error, stdout, stderr) => {
    if (error) {
        if (error.code == 1) {
            console.log(`No process is using port ${argv._[0]}`)
            return
        }
        else {
            console.error(`Error: ${error}`)
            return
        }     
    }
    
    const parsedOutput = parseOutput(stdout)
    console.log(parsedOutput[0])
    console.log(parsedOutput[1])
})

console.log('Port: ' + argv._[0])
