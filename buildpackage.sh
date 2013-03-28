#!/bin/bash

CURRENTDIR=`dirname $0`


VERSION=`grep "^Version=" src/application.ini`
VERSION=${VERSION:8}

TARGETDIR="$CURRENTDIR/dist/slimerjs-$VERSION"

if [ ! -d "$TARGETDIR" ]
then
    mkdir -p "$TARGETDIR"
fi

cp src/application.ini $TARGETDIR
cp src/slimerjs $TARGETDIR
cp src/slimerjs.bat $TARGETDIR
cd src
zip -r ../$TARGETDIR/omni.ja chrome/ components/ defaults/ modules/ chrome.manifest
cd ..
cd $CURRENTDIR/dist
zip -r "slimerjs-$VERSION.zip" "slimerjs-$VERSION"

echo ""
echo "The package is here: dist/slimerjs-$VERSION.zip"

