import { Logger } from '@platypus/platypus-core';
import chalk from 'chalk';
import _debug from 'debug';

const d = _debug('platypus-cli:general');

export class Log extends Logger {
  debug(msg: string, ..._optionalParams: any[]): void {
    d(msg);
  }
  success(msg: string, ..._optionalParams: any[]): void {
    console.info(chalk.green(msg));
  }
  info(msg: string, ..._optionalParams: any[]): void {
    console.info(chalk.blueBright(msg));
  }
  warn(msg: string, ..._optionalParams: any[]): void {
    console.warn(chalk.yellow(msg));
  }
  error(msg: string, ..._optionalParams: any[]): void {
    console.error(chalk.red(msg));
  }
  fatal(msg: string, ..._optionalParams: any[]): void {
    this.error(msg, _optionalParams);
  }
  log(msg: string, ..._optionalParams: any[]): void {
    console.log(chalk.cyan(msg));
  }
}
export default new Log();
