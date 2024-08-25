#!/bin/bash
if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <skeleton_file> <user_code_file> <test_data_file> <submission_id>"
  exit 1
fi

FILE_TO_RUN=src/com/solution/Solution.java

PROBLEM_SKELETON_FILE=$1
USER_CODE_FILE=$2
TEST_DATA_FILE=$3
SUBMISSION_ID=$4

#sed ":a;N;$!ba;s/\n/\\n/g" $PROBLEM_SKELETON_FILE
#sed ":a;N;$!ba;s/\n/\\n/g" $USER_CODE_FILE

#USER_CODE=$(cat $USER_CODE_FILE)
#PROBLEM_SKELETON=$(cat $PROBLEM_SKELETON_FILE)

#sed -i -e "s/SUBMISSION_PLACEHOLDER/$USER_CODE/g" $FILE_TO_RUN
#sed -i -e "s/SKELETON_PLACEHOLDER/$PROBLEM_SKELETON/g" $TEMPLATE_FILE

#echo -e "task goes here\n$(cat todo.txt)" > todo.txt

echo -e "$(cat $PROBLEM_SKELETON_FILE)\n$(cat $FILE_TO_RUN)" > $FILE_TO_RUN
echo -e "$(cat $USER_CODE_FILE)\n$(cat $FILE_TO_RUN)" > $FILE_TO_RUN
echo -e "import java.io.*;\n$(cat $FILE_TO_RUN)" > $FILE_TO_RUN
echo -e "import java.nio.file.*;\n$(cat $FILE_TO_RUN)" > $FILE_TO_RUN
echo -e "import java.util.*;\n$(cat $FILE_TO_RUN)" > $FILE_TO_RUN
echo -e "import org.json.*;\n$(cat $FILE_TO_RUN)" > $FILE_TO_RUN
echo -e "package com.solution;\n$(cat $FILE_TO_RUN)" > $FILE_TO_RUN


# import java.io.*;
# cat $USER_CODE_FILE >> temp.js
# echo "" >> temp.js
# cat $PROBLEM_SKELETON_FILE >> temp.js
# echo "" >> temp.js
# cat $TEMPLATE_FILE >> temp.js

javac -cp lib/json.jar -d out $FILE_TO_RUN
java -cp out:lib/json.jar com.solution.Solution $TEST_DATA_FILE

cp test-results.json /app/results/$SUBMISSION_ID.json
