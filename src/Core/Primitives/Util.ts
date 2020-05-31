//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

export class Util
{
  public static isEmpty(value: string): boolean { return !value || value.length === 0; }
  public static equalsIgnoreCase(value1: string, value2: string): boolean { return value1.toLowerCase() === value2.toLowerCase(); }

  public static cocatinate(name: string, value?: any): string
  {
    if (value === undefined || value === null)
      return ", " + name;
    return ", " + name + ": " + value;
  }
}

