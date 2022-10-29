import type * as atype from "../analyzers/atypes";
import Konva from 'konva';
import { terminatorSymbol, taskSymbol, decisionSymbol, dataSymbol, arrowSymbol } from "./symbols";

let runningSentences: atype.SentencesNode[];
let space: {x: number, y: number};
let spaceBetween: number = 30;
let konvaLayer: Konva.Layer;
let commonSize: number;

// Draws the flow chart symbols and returns the vertical space used
export function grapher(sentences: atype.SentencesNode[], layer: Konva.Layer, baseSize: number): number {
   layer.removeChildren();
   space = {x: 0, y: 0};
   space.y = spaceBetween;
   runningSentences = [...sentences];
   konvaLayer = layer;
   commonSize = baseSize;
   let shouldDraw : boolean = runningSentences.length > 0;

   if (shouldDraw) {
      layer.add(terminatorSymbol(baseSize, space));
      space.y += spaceBetween + baseSize * 0.1;
   
      while (runningSentences.length) {
         const node = runningSentences.shift()!;
         addTreeNode(node);
         space.x = 0;
      }
   
      layer.add(terminatorSymbol(baseSize, space));
   }

   return space.y + spaceBetween + baseSize * 0.1;
}

function addTreeNode(node: atype.SentencesNode) {
   if (node.name === 'PrintNode' || node.name === 'ReadNode') {
      konvaLayer.add(dataSymbol(commonSize, space));
      space.y += spaceBetween + commonSize * 0.15;
   }
   else if (node.name === 'DeclarationNode' || node.name === 'AssignmentNode') {
      konvaLayer.add(taskSymbol(commonSize, space));
      space.y += spaceBetween + commonSize * 0.15;
   }
   else if (node.name === 'IfNode') {
      konvaLayer.add(decisionSymbol(commonSize, space));
      space.y += spaceBetween + commonSize * 0.3;
   }
   else if (node.name === 'SwitchNode') {
      konvaLayer.add(taskSymbol(commonSize, space));
      space.y += spaceBetween + commonSize * 0.15;
      node.cases.forEach(caseElement => {
         konvaLayer.add(decisionSymbol(commonSize, space));
         space.y += spaceBetween + commonSize * 0.3;
      });
   }
   else if (node.name === 'ForNode') {
      konvaLayer.add(decisionSymbol(commonSize, space));
      space.x += commonSize * 0.6;
      space.y += commonSize * 0.075;
      konvaLayer.add(taskSymbol(commonSize, space));
      space.y += spaceBetween * 2 + commonSize * 0.15;
   }
   else if (node.name === 'WhileNode') {
      konvaLayer.add(decisionSymbol(commonSize, space));
      space.y += spaceBetween + commonSize * 0.3;
   }
   else if (node.name === 'DowhileNode') {
      // node body sentences should be first
      konvaLayer.add(decisionSymbol(commonSize, space));
      space.y += spaceBetween + commonSize * 0.3;
   }

}