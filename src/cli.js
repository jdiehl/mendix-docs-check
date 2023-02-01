const { checkLinks } = require('./commands/checkLinks')

exports.cli = () => {
  const { program } = require('commander')

  program
    .name('docsy-check')
    .description('Check docsy websites')
    .version('0.0.1')

  program.command('links')
    .description('Check all links')
    .action(checkLinks)

  program.parse()
}
