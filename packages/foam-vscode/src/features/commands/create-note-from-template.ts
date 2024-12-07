import { commands, ExtensionContext } from 'vscode';
import {
  aksUserForTrainingNote,
  askUserForTemplate,
  NoteFactory,
} from '../../services/templates';
import { Resolver } from '../../services/variable-resolver';

export default async function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(
      'foam-vscode.create-note-from-template',
      async () => {
        const templateUri = await askUserForTemplate();
        var training_note = await aksUserForTrainingNote();

        if (templateUri) {
          const resolver = new Resolver(new Map(), new Date());

          await NoteFactory.createFromTemplate(
            templateUri,
            resolver,
            training_note
          );
        }
      }
    )
  );
}
