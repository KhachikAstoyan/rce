package com.solution;

import org.json.JSONArray;
import org.json.JSONException;

public class ValueParser {
  public static Object parseValue(Value input) throws JSONException {
    String type = input.type;
    String value = input.value;

    if(type == "string") { 
      return input.value;
    }

    if(type === "int") {
      return Integer.parseInt(input.value);
    }

    if(type === "float") {
      return Float.parseFloat(value);
    }

    if(type === "boolean") {
      return Boolean.parseBoolean(value);
    }

    if(type.startsWith("array")) {
      return parseArray(input.value);
    }

    throw new IllegalArgumentException("Unknown type");
    
  }

  public static boolean compareValues(Value expected, Object received) throws JSONException {
    switch (expected.type) {
      case "string":
        return received.equals(expected.value);
      case "number":
      case "int":
        return Integer.parseInt(expected.value) == (Integer) received;
      case "double":
        return Double.parseDouble(expected.value) == (double) received;
      case "boolean":
        return Boolean.parseBoolean(expected.value) == (boolean) received;
      case "array":
        return expected.value.equals(JsonConverter.toJson(received));
      default:
        throw new IllegalArgumentException("Unknown type");
    }
  }

  private static Object parseArray(String arrayString) throws JSONException {
    JSONArray jsonArray = new JSONArray(arrayString);
    if (jsonArray.length() == 0) {
      return new Object[0];
    }

    Object firstElement = jsonArray.get(0);
    if (firstElement instanceof Integer) {
      return parseIntArray(jsonArray);
    } else if (firstElement instanceof Long) {
      return parseLongArray(jsonArray);
    } else if (firstElement instanceof Double) {
      return parseDoubleArray(jsonArray);
    } else if (firstElement instanceof Boolean) {
      return parseBooleanArray(jsonArray);
    } else if (firstElement instanceof String) {
      return parseStringArray(jsonArray);
    } else {
      return parseObjectArray(jsonArray);
    }
  }

  private static int[] parseIntArray(JSONArray jsonArray) throws JSONException {
    int[] intArray = new int[jsonArray.length()];
    for (int i = 0; i < jsonArray.length(); i++) {
      intArray[i] = jsonArray.getInt(i);
    }
    return intArray;
  }

  private static long[] parseLongArray(JSONArray jsonArray) throws JSONException {
    long[] longArray = new long[jsonArray.length()];
    for (int i = 0; i < jsonArray.length(); i++) {
      longArray[i] = jsonArray.getLong(i);
    }
    return longArray;
  }

  private static double[] parseDoubleArray(JSONArray jsonArray) throws JSONException {
    double[] doubleArray = new double[jsonArray.length()];
    for (int i = 0; i < jsonArray.length(); i++) {
      doubleArray[i] = jsonArray.getDouble(i);
    }
    return doubleArray;
  }

  private static boolean[] parseBooleanArray(JSONArray jsonArray) throws JSONException {
    boolean[] booleanArray = new boolean[jsonArray.length()];
    for (int i = 0; i < jsonArray.length(); i++) {
      booleanArray[i] = jsonArray.getBoolean(i);
    }
    return booleanArray;
  }

  private static String[] parseStringArray(JSONArray jsonArray) throws JSONException {
    String[] stringArray = new String[jsonArray.length()];
    for (int i = 0; i < jsonArray.length(); i++) {
      stringArray[i] = jsonArray.getString(i);
    }
    return stringArray;
  }

  private static Object[] parseObjectArray(JSONArray jsonArray) throws JSONException {
    Object[] objectArray = new Object[jsonArray.length()];
    for (int i = 0; i < jsonArray.length(); i++) {
      objectArray[i] = jsonArray.get(i);
    }
    return objectArray;
  }
}
