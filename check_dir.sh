#!/bin/sh

#各階層のファイル数をチェック

#for file in `ls -a` 
for file in `find . -type d` 
do
    for dir in `find $file -type d`
    do
        if [ $dir = ".." ]; then
          #echo $dir;
          #continue;
          exit;
        fi 
        #number=`find $dir -type d | wc -l`
        number=`find $dir -type f -maxdepth 1 | wc -l`
        #echo "The $dir has directories $number"
        #if [ $number -gt 4 ]; then
        if [ $number -ge 4 ]; then
          echo "The $dir has files $number"
        fi
    done
done
