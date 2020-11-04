//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import { Index2 } from "@/Core/Geometry/Index2";

export class Index3 {
  //= =================================================
  // STATIC PROPERTIES
  //= =================================================

  public static get newZero(): Index3 { return new Index3(0, 0, 0); }

  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  public i: number;

  public j: number;

  public k: number;

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(i: number, j: number, k: number) {
    this.i = i;
    this.j = j;
    this.k = k;
  }

  public /* copy constructor */ clone(): Index3 {
    return new Index3(this.i, this.j, this.k);
  }

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get size(): number { return this.i * this.j * this.k; }

  public get isZero(): boolean { return this.i === 0 && this.j === 0 && this.k === 0; }

  //= =================================================
  // INSTANCE METHODS: Getters
  //= =================================================

  public getAt(dimension: number): number {
    switch (dimension) {
      case 0: return this.i;
      case 1: return this.j;
      case 2: return this.k;
      default: return Number.NaN;
    }
  }

  public toString(): string { return `(${this.i}, ${this.j}, ${this.k})`; }

  //= =================================================
  // INSTANCE METHODS: Operations
  //= =================================================

  public copy(other: Index3): void {
    this.i = other.i;
    this.j = other.j;
    this.k = other.k;
  }

  public add(value: Index3): void {
    this.i += value.i;
    this.j += value.j;
    this.k += value.k;
  }

  public substract(value: Index3): void {
    this.i -= value.i;
    this.j -= value.j;
    this.k -= value.k;
  }

  public addIndex2(index: Index2): void {
    this.i += index.i;
    this.j += index.j;
  }
}
