#!/bin/bash

echo "checking for required python packages"
for pkg in build twine hatch; do
    pip show $pkg >& /dev/null || pip install $pkg
done

echo "Current version is: $(hatch version)"

# prompt user for version number
echo "Enter new version number: "
read version

# hatch has the nasty effect of reformatting package.json
#hatch version $version
echo "bumping version to $version"
sed -i.version -e 's/\("version": "\)[^"]*/\1'$version'/' package.json

echo "diffing package.json"
git diff package.json
echo "want to go on ? (ctrl-c to abort)"
read answer

echo "cleaning dist/, and rebuilding"
rm -rf dist/*
python -m build
echo "publishing to pypi"
python -m twine upload dist/*

# commit and tag
echo "committing and tagging"
git add package.json
git commit -m "release $version"
git tag "v$version"
