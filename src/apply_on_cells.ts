/*
 * the logic of applying a function on a set of cells
 */

/* eslint-disable prettier/prettier */
import { INotebookTracker } from '@jupyterlab/notebook'

import { Cell } from '@jupyterlab/cells'

export enum Scope {
  All, // run on all cells
  Active, // the active cell only
  Multiple, // the multiple selected if that is the case, the active cell otherwise
}

export const apply_on_cells = (
  notebookTracker: INotebookTracker,
  scope: Scope,
  to_apply: (cell: Cell) => void,
) => {
  const notebook = notebookTracker.currentWidget?.content
  if (notebook === undefined) {
    return
  }

  let actionCells
  if (scope === Scope.All) {
    actionCells = notebook.widgets.slice()
  } else {
    const activeCell = notebook.activeCell
    if (activeCell === null) {
      return
    }

    if (scope === Scope.Active) {
      actionCells = [activeCell]
    } else {
      const { anchor, head } = notebook.getContiguousSelection()
      // when only one cell is selected/active, both are null
      if (anchor === null || head === null) {
        actionCells = [activeCell]
      } else {
        actionCells = notebook.widgets.slice(anchor, head + 1)
      }
    }
  }
  // console.log(`apply_on_cells with scope=${scope} on ${actionCells.length} cells`)

  actionCells.forEach(to_apply)
}
