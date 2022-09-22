export const tokenize = (code: string) => {
   let regex = /(["'])(?:(?=(\\?))\2.)*?\1|(?:[\\(){}[\]=&|^+<>/*%;.\:?!~-]{1,2}|(?:\w+|\d+))/g;
   let tokens = code.match(regex);
   return tokens;
}