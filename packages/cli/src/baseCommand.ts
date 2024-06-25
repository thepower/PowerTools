import color from '@oclif/color';
import { Command } from '@oclif/core'; import { colorize } from 'json-colorizer';

export abstract class BaseCommand extends Command {
  protected async catch(err: Error & { exitCode?: number }): Promise<any> {
    this.log(color.red(`Error: ${err.message}`));
    this.log(colorize(err));
  }
}
