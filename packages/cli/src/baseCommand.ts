import { Command } from '@oclif/core';

export abstract class BaseCommand extends Command {
  protected async catch(err: Error & { exitCode?: number }): Promise<any> {
    return super.catch(err);
  }
}
