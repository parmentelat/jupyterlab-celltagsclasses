/*
 * for attaching keybindings later on, see
 * https://towardsdatascience.com/how-to-customize-jupyterlab-keyboard-shortcuts-72321f73753d
 */

/* eslint-disable prettier/prettier */

import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application'

import { INotebookTracker } from '@jupyterlab/notebook'

import { ICellModel, Cell } from '@jupyterlab/cells'

/**
 * Initialization data for the jupyterlab-celltagsclasses extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-celltagsclasses:plugin',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, notebookTracker: INotebookTracker) => {
    console.log('extension jupyterlab-celltagsclasses is activating')

    const class_for_tag = (tag: string) => `cell-tag-${tag}`

    notebookTracker.widgetAdded.connect((_, panel) => {
      const notebookModel = panel.content.model
      if (notebookModel === null) {
        return
      }

      notebookModel.cells.changed.connect((cellList, change) => {
        if (change.type !== 'add') {
          return
        }
        change.newValues.forEach(cellModel => {
          // compute widgets attached to cellModel
          const cellWidgets =
            notebookTracker.currentWidget?.content.widgets.filter(
              (cell: Cell, index: number) => cell.model.id === cellModel.id,
            )
          if (cellWidgets === undefined || cellWidgets?.length === 0) {
            // console.warn('could not find cell widget for cell model', cellModel)
            return
          }
          // console.debug( `found ${cellWidgets?.length} cell widgets`, cellWidgets[0] )

          // add classes for pre-existing tags
          cellModel.getMetadata('tags')?.forEach((tag: string) =>
            cellWidgets?.forEach(cellWidget => {
              // console.debug( `adding initial class for tag ${class_for_tag(tag)}` )
              cellWidget.addClass(class_for_tag(tag))
            }),
          )

          // react to changes in tags
          cellModel.metadataChanged.connect((sender: ICellModel, change) => {
            // console.debug('metadata changed', sender, change)
            if (change.key !== 'tags') {
              // console.debug("ignoring non-tags metadata change")
              return
            }
            // does not seem useful to recompute this
            // const cellWidgets = notebookTracker.currentWidget?.content.widgets.filter(
            //   (cell: Cell, index: number) => (cell.model.id === cellModel.id)
            // )
            if (change.type === 'change') {
              // console.debug('change', change, change.newValue)
              // compute difference between old and new tags
              const oldTags = change.oldValue as string[]
              const newTags = change.newValue as string[]
              const addedTags = newTags.filter(tag => !oldTags.includes(tag))
              const removedTags = oldTags.filter(tag => !newTags.includes(tag))
              // console.debug('addedTags', addedTags)
              // console.debug('removedTags', removedTags)
              cellWidgets.forEach(cellWidget => {
                addedTags.forEach(tag => {
                  console.debug(`adding class for tag ${class_for_tag(tag)}`)
                  cellWidget.addClass(class_for_tag(tag))
                })
                removedTags.forEach(tag => {
                  console.debug(`removing class for tag ${class_for_tag(tag)}`)
                  cellWidget.removeClass(class_for_tag(tag))
                })
              })
            } else if (change.type === 'add') {
              console.debug('celltagsclasses: add', change, change.newValue)
              cellWidgets.forEach(cellWidget => {
                for (const tag of change.newValue) {
                  // console.debug(`adding class for tag ${class_for_tag(tag)}`)
                  cellWidget.addClass(class_for_tag(tag))
                }
              })
            } else if (change.type === 'remove') {
              console.debug('celltagsclasses: remove', change, change.newValue)
              cellWidgets.forEach(cellWidget => {
                for (const tag of change.newValue) {
                  // console.debug(`removing class for tag ${class_for_tag(tag)}`)
                  cellWidget.removeClass(class_for_tag(tag))
                }
              })
            }
          })
        })
      })
    })
  },
}

export default plugin

// re-export metadata helper functions
export {
  md_get,
  md_set,
  md_unset,
  md_has,
  md_insert,
  md_remove,
  md_toggle,
  md_toggle_multi,
  md_clean,
} from './metadata'

export { Scope, apply_on_cells } from './apply_on_cells'
