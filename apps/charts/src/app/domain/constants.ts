export const EMPTY_OBJECT = Object.freeze({});

/*
  EMPTY_ARRAY is type casted with 'as' because freeze returns readonly
  ideally, we should've readonly in front of all types that are intended to be readonly list
*/
export const EMPTY_ARRAY = Object.freeze([]) as [];
