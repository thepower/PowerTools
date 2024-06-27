import { Command } from '@oclif/core';
import { color } from '@oclif/color';

export abstract class BaseCommand extends Command {
  protected async catch(err: Error & { exitCode?: number }): Promise<any> {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return this.log(color.red(err.message));
  }
}
