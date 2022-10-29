import type * as atype from "../analyzers/atypes";
import Konva from 'konva';
import { terminatorSymbol, taskSymbol, decisionSymbol, dataSymbol, arrowSymbol } from "./symbols";

let runningSentences: atype.SentencesNode[];
let vspace: number;
let spaceBetween: number = 30;

// Draws the flow chart symbols and returns the vertical space used
export function grapher(sentences: atype.SentencesNode[], layer: Konva.Layer, baseSize: number): number {
   layer.removeChildren();
   vspace = spaceBetween;
   runningSentences = [...sentences];
   let shouldDraw : boolean = runningSentences.length > 0;

   if (shouldDraw) {
      layer.add(terminatorSymbol(baseSize, vspace));
      vspace += spaceBetween + baseSize * 0.1;
   
      while (runningSentences.length) {
         const node = runningSentences.shift()!;
   
         if (node.name === 'PrintNode' || node.name === 'ReadNode') {
            layer.add(dataSymbol(baseSize, vspace));
            vspace += spaceBetween + baseSize * 0.15;
         }
         else if (node.name === 'IfNode') {
            layer.add(decisionSymbol(baseSize, vspace));
            vspace += spaceBetween + baseSize * 0.3;
         }
         else if (node.name === 'DeclarationNode' || node.name === 'AssignmentNode') {
            layer.add(taskSymbol(baseSize, vspace));
            vspace += spaceBetween + baseSize * 0.15;
         }
      }
   
      layer.add(terminatorSymbol(baseSize, vspace));
   }

   return vspace + spaceBetween + baseSize * 0.1;
}