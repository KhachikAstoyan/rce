#!/bin/bash
set -e

if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <skeleton_file> <user_code_file> <test_data_file> <submission_id>"
  exit 1
fi

FILE_TO_RUN=src/com/solution/Solution.java
CLASSES_FILE=src/com/solution/Submission.java

PROBLEM_SKELETON_FILE=$1
USER_CODE_FILE=$2
TEST_DATA_FILE=$3
SUBMISSION_ID=$4

touch $CLASSES_FILE
echo "package com.solution;" >> $CLASSES_FILE
echo "import java.util.*;" >> $CLASSES_FILE

echo  >> $CLASSES_FILE
cat $USER_CODE_FILE >> $CLASSES_FILE
echo  >> $CLASSES_FILE
cat $PROBLEM_SKELETON_FILE >> $CLASSES_FILE

javac -Xlint:unchecked -cp lib/json.jar -d out src/com/solution/*.java
java -XX:-PrintWarnings -cp out:lib/json.jar com.solution.Solution $TEST_DATA_FILE

cat test-results.json
cp test-results.json /app/results/$SUBMISSION_ID.json
