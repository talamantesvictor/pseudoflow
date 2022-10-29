import type * as atype from "../analyzers/atypes";
import Konva from 'konva';
import { terminatorSymbol, taskSymbol, decisionSymbol, dataSymbol, arrowSymbol } from "./symbols";

let runningSentences: atype.SentencesNode[];
let spaceKeeper: {x: number, y: number};
let spaceBetween: number = 40;
let konvaLayer: Konva.Layer;
let commonSize: number;

// Draws the flow chart symbols and returns the vertical space used
export function grapher(sentences: atype.SentencesNode[], layer: Konva.Layer, baseSize: number): number {
   layer.removeChildren();
   spaceKeeper = {x: 0, y: 0};
   spaceKeeper.y = spaceBetween;
   runningSentences = [...sentences];
   konvaLayer = layer;
   commonSize = baseSize;
   let shouldDraw : boolean = runningSentences.length > 0;

   if (shouldDraw) {
      layer.add(terminatorSymbol(baseSize, spaceKeeper));
      spaceKeeper.y += spaceBetween + baseSize * 0.1;
   
      while (runningSentences.length) {
         const node = runningSentences.shift()!;
         spaceKeeper.y += addTreeNode(node, spaceKeeper);
         spaceKeeper.x = 0;
      }
      layer.add(terminatorSymbol(baseSize, spaceKeeper));
   }
   return spaceKeeper.y + spaceBetween + baseSize * 0.1;
}

function addTreeNode(node: atype.SentencesNode, space: {x: number, y: number}) {
   let addVerticalSpace = 0;

   if (node.name === 'PrintNode' || node.name === 'ReadNode') {
      konvaLayer.add(dataSymbol(commonSize, space));
      addVerticalSpace = spaceBetween + commonSize * 0.15;
   }
   else if (node.name === 'DeclarationNode' || node.name === 'AssignmentNode') {
      konvaLayer.add(taskSymbol(commonSize, space));
      addVerticalSpace = spaceBetween + commonSize * 0.15;
   }
   else if (node.name === 'IfNode') {
      konvaLayer.add(decisionSymbol(commonSize, space));
      addVerticalSpace += spaceBetween + commonSize * 0.3;
      
      let bodySentences = [...node.body];
      while (bodySentences.length) {
         const bodyNode = bodySentences.shift()!;
         addVerticalSpace += addTreeNode(bodyNode, {
            x: space.x,
            y: space.y + addVerticalSpace
         });
      }

      if (node.alternative.length) {
         let alternativeSentences = [...node.alternative];
         let addAlternateSpace = 0;
         while (alternativeSentences.length) {
            const alternativeNode = alternativeSentences.shift()!;
            addAlternateSpace += addTreeNode(alternativeNode, {
               x: space.x + commonSize * 0.7,
               y: space.y + commonSize * 0.075 + addAlternateSpace
            });
         }
         if (addAlternateSpace > addVerticalSpace) {
            addVerticalSpace = addAlternateSpace + spaceBetween;
         }
      }
   }
   else if (node.name === 'SwitchNode') {
      konvaLayer.add(taskSymbol(commonSize, space));
      addVerticalSpace += spaceBetween + commonSize * 0.15;
      node.cases.forEach(caseElement => {
         konvaLayer.add(decisionSymbol(commonSize, space));
         addVerticalSpace += spaceBetween + commonSize * 0.3;
      });
   }
   else if (node.name === 'ForNode') {
      konvaLayer.add(decisionSymbol(commonSize, space));
      space.x += commonSize * 0.7;
      addVerticalSpace += commonSize * 0.075;
      konvaLayer.add(taskSymbol(commonSize, space));
      addVerticalSpace += spaceBetween * 2 + commonSize * 0.15;
   }
   else if (node.name === 'WhileNode') {
      konvaLayer.add(decisionSymbol(commonSize, space));
      addVerticalSpace += spaceBetween + commonSize * 0.3;
   }
   else if (node.name === 'DowhileNode') {
      // node body sentences should be first
      konvaLayer.add(decisionSymbol(commonSize, space));
      addVerticalSpace += spaceBetween + commonSize * 0.3;
   }

   return addVerticalSpace;
}