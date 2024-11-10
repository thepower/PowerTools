import { Command } from '@oclif/core'

export abstract class BaseCommand extends Command {
  protected override async catch(err: Error & { exitCode?: number }): Promise<any> {
    return super.catch(err)
  }
}
