# jupyterlab_celltagsclasses

[![Github Actions Status](https://github.com/parmentelat/jupyterlab-celltagsclasses/workflows/Build/badge.svg)](https://github.com/parmentelat/jupyterlab-celltagsclasses/actions/workflows/build.yml)

An extension to expose cell tags as CSS classes

## Requirements

- JupyterLab >= 4.0.0

## Install

To install the extension, execute:

```bash
pip install jupyterlab_celltagsclasses
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab_celltagsclasses
```

## What it does

each cell has its widget (the DOM element) classes kept in sync in terms of the cell's tags;  
for example, adding tag `foobar` will result in the current cell having class `cell-tag-foobar` added

specifically the DOM elements that are decorated have the `.jpCell` class set by jlab, like so, where we have set tag `celltagsclasses-test1`

![](media/screenshot.png)

## Development

See the documentation on Jlab extensions for more details; the gist of it is

### Development install

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_celltagsclasses directory
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

### Development uninstall

```bash
pip uninstall jupyterlab_celltagsclasses
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlab-celltagsclasses` within that folder.

### Packaging the extension

See [RELEASE](RELEASE.md)
