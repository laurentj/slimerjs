#!/usr/bin/env bash

CURRENTDIR=`pwd`
SLIMERDIR=`dirname $0`
SLIMERDIR=`cd $SLIMERDIR;pwd`

cd $SLIMERDIR

VERSION=`grep "^Version=" src/application.ini`
VERSION=${VERSION:8}

TARGETDIR="$SLIMERDIR/_dist/slimerjs-$VERSION"

if [ -d "$TARGETDIR" ]
then
    rm -rf $TARGETDIR/*
else
    mkdir -p "$TARGETDIR"
fi

# copy files
cd src

cp application.ini $TARGETDIR
cp slimerjs $TARGETDIR
cp slimerjs.bat $TARGETDIR
cp slimerjs.py $TARGETDIR
cp LICENSE $TARGETDIR
cp README.md $TARGETDIR
cp slimerjs-node $TARGETDIR
cp phantom-protocol.js $TARGETDIR


mkdir -p $TARGETDIR/chrome/
cp -a chrome/icons $TARGETDIR/chrome/
cp -a vendors $TARGETDIR/

# zip chrome files into omni.ja
zip -r $TARGETDIR/omni.ja chrome/ components/ defaults/ modules/ chrome.manifest --exclude @package_exclude.lst

# set the build date
cd $TARGETDIR
BUILDDATE=`date +%Y%m%d`
sed -i -e "s/BuildID=.*/BuildID=$BUILDDATE/g" application.ini

# create the final package
cd $SLIMERDIR/_dist
zip -r "slimerjs-$VERSION.zip" "slimerjs-$VERSION"
tar cjf "slimerjs-$VERSION.tar.bz2" "slimerjs-$VERSION"
cd $CURRENTDIR
echo ""
echo "slimerjs-$VERSION.zip and slimerjs-$VERSION.tar.bz2 are in $SLIMERDIR/_dist/"

