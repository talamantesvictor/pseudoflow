export const tokenize = (code: string) => {
   // remove comments
   code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');
   // separate values to tokenize
   let regex = /(["'])(?:(?=(\\?))\2.)*?\1|(?:[\\(){}[\]=&|^+<>/*%;.\:?!~-]{1,2}|(?:\w+|\d+))/g;
   let tokens = code.match(regex);

   return tokens;
}