#!/bin/bash

SLIMERDIR=`dirname $0`
SLIMERDIR=`cd $SLIMERDIR;pwd`
CURRENTDIR=`pwd`

cd $SLIMERDIR

if [ "$1" == "nightly" ]
then
    VERSION="nightly"
else
    VERSION=`grep "^Version=" src/application.ini`
    VERSION=${VERSION:8}
fi

TARGETDIR="$SLIMERDIR/_dist/slimerjs-$VERSION"

if [ -d "$TARGETDIR" ]
then
    rm -rf $TARGETDIR/*
else
    mkdir -p "$TARGETDIR"
fi

# copy files
cp src/application.ini $TARGETDIR
cp src/slimerjs $TARGETDIR
cp src/slimerjs.bat $TARGETDIR
cp README.md $TARGETDIR
cp LICENSE $TARGETDIR
cd src

# set the build date
BUILDDATE=`date +%Y%m%d`
sed -i -e "s/BuildID=.*/BuildID=$BUILDDATE/g" application.ini

# zip chrome files into omni.ja
zip -r $TARGETDIR/omni.ja chrome/ components/ defaults/ modules/ chrome.manifest --exclude @../package_exclude.lst

# create the final package
cd $SLIMERDIR/_dist
zip -r "slimerjs-$VERSION.zip" "slimerjs-$VERSION"

cd $CURRENTDIR
echo "The package is in $SLIMERDIR/_dist/slimerjs-$VERSION.zip"
