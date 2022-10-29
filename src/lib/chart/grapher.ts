import type * as atype from "../analyzers/atypes";
import Konva from 'konva';
import { terminatorSymbol, taskSymbol, decisionSymbol, dataSymbol, arrowSymbol } from "./symbols";

let runningSentences: atype.SentencesNode[];
let space: {x: number, y: number};
let spaceBetween: number = 30;

// Draws the flow chart symbols and returns the vertical space used
export function grapher(sentences: atype.SentencesNode[], layer: Konva.Layer, baseSize: number): number {
   layer.removeChildren();
   space = {x: 0, y: 0};
   space.y = spaceBetween;
   runningSentences = [...sentences];
   let shouldDraw : boolean = runningSentences.length > 0;

   if (shouldDraw) {
      layer.add(terminatorSymbol(baseSize, space));
      space.y += spaceBetween + baseSize * 0.1;
   
      while (runningSentences.length) {
         const node = runningSentences.shift()!;
   
         if (node.name === 'PrintNode' || node.name === 'ReadNode') {
            layer.add(dataSymbol(baseSize, space));
            space.y += spaceBetween + baseSize * 0.15;
         }
         else if (node.name === 'IfNode') {
            layer.add(decisionSymbol(baseSize, space));
            space.y += spaceBetween + baseSize * 0.3;
         }
         else if (node.name === 'DeclarationNode' || node.name === 'AssignmentNode') {
            layer.add(taskSymbol(baseSize, space));
            space.y += spaceBetween + baseSize * 0.15;
         }
      }
   
      layer.add(terminatorSymbol(baseSize, space));
   }

   return space.y + spaceBetween + baseSize * 0.1;
}