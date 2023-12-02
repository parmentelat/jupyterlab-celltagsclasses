import { JupyterFrontEnd } from '@jupyterlab/application'
import { Scope, apply_on_cells } from './apply_on_cells'
import { INotebookTracker } from '@jupyterlab/notebook'
import { ICommandPalette } from '@jupyterlab/apputils'
import { Cell } from '@jupyterlab/cells'

// apply_on_cell calls action on a Cell (Widget) object
// use cell.model if a CellModel is needed
  const cell_action = (cell: Cell) => {
  console.log('cell_action on', cell.node)
}

// act on models
// like so for example
const model_action = (cell: Cell) => {
  console.log('model_action on', cell.node)
  const model = cell.model
  const source = cell.model.sharedModel.getSource()
  model.sharedModel.setSource(source.toUpperCase())
}

export const create_test_commands = (
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
  palette: ICommandPalette,
) => {
  const add_command = (
    suffix: string,
    label: string,
    scope: Scope,
    keys: string[],
    the_function: (cell: Cell) => void,
    ) => {
    const command = `celltagsclasses:${suffix}`
    app.commands.addCommand(command, {
      label,
      execute: () => {
        console.log(label)
        apply_on_cells(notebookTracker, scope, the_function)
      },
    })
    palette.addItem({ command, category: 'celltagsclasses' })
    app.commands.addKeyBinding({
      command,
      keys,
      selector: '.jp-Notebook',
    })
  }

  // MODEL
  add_command(
    'single-model',
    'perform model action on single active cell',
    Scope.Active,
    ['Alt-K', 'Alt-1'],
    model_action,
  )
  add_command(
    'multiple-model',
    'perform model action on multiple selected cells',
    Scope.Multiple,
    ['Alt-K', 'Alt-2'],
    model_action,
  )
  add_command(
    'all-model',
    'perform model action on all cells',
    Scope.All,
    ['Alt-K', 'Alt-3'],
    model_action,
  )
  // CELL
  add_command(
    'single-cell',
    'perform action on single active cell',
    Scope.Active,
    ['Alt-K', 'Alt-4'],
    cell_action,
  )
  add_command(
    'multiple-cell',
    'perform action on multiple selected cells',
    Scope.Multiple,
    ['Alt-K', 'Alt-5'],
    cell_action,
  )
  add_command(
    'all-cell',
    'perform action on all cells', Scope.All,
    [ 'Alt-K', 'Alt-6'],
    cell_action,
  )
}
