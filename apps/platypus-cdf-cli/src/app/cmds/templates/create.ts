import { Arguments, Argv } from 'yargs';
import { CreateSolutionDTO } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const command = 'create <name>';

export const desc = 'Create a template group';

export const builder = (yargs: Argv<CreateSolutionDTO>): Argv =>
  yargs
    .positional('name', {
      type: 'string',
      description: 'Template group external id',
      demandOption: true,
    })
    .option('description', {
      type: 'string',
      default: '',
      description: "Template group's description",
    })
    .option('owner', {
      type: 'string',
      default: '',
      description: 'Who is the owner of this template group',
    });

export const handler = async (args: Arguments<CreateSolutionDTO>) => {
  const client = getCogniteSDKClient();

  try {
    await client.templates.groups.create([
      {
        externalId: args.name,
        description: args.description,
        owners: [args.owner],
      },
    ]);
    console.log(`Template group "${args.name}" is created successfully`);
  } catch (error) {
    console.error(error);
  }
};
