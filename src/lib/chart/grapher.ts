import type * as atype from "../analyzers/atypes";
import Konva from 'konva';
import { terminatorSymbol, taskSymbol, decisionSymbol, dataSymbol, textLabel, arrowSymbol } from "./symbols";
import { valueBuilder } from "../code/interpreter";

let konvaLayer: Konva.Layer;
let runningSentences: atype.SentencesNode[];
let spaceKeeper: {x: number, y: number};
let baseSize: number;
let defaultVerticalSpace: number;
let defaultHorizontalSpace: number;

// Draws the flow chart symbols and returns the vertical space used
export function grapher(sentences: atype.SentencesNode[], layer: Konva.Layer, size: number) {
   layer.removeChildren();
   runningSentences = [...sentences];
   konvaLayer = layer;
   baseSize = size;
   defaultVerticalSpace = baseSize * 0.2;
   defaultHorizontalSpace = baseSize * 0.7;
   spaceKeeper = {x: 0, y: defaultVerticalSpace};

   if (runningSentences.length > 0) {
      layer.add(terminatorSymbol(baseSize, spaceKeeper));
      spaceKeeper.y += defaultVerticalSpace + baseSize * 0.1;
   
      while (runningSentences.length) {
         const node = runningSentences.shift()!;
         spaceKeeper.y += addTreeNode(node, spaceKeeper);
      }
      layer.add(terminatorSymbol(baseSize, spaceKeeper));
   }
}

function addTreeNode(
   node: atype.SentencesNode, 
   space: {x: number, y: number}, 
   shouldCenterVertically: boolean = false
) {
   const verticalSpaceToCenter = shouldCenterVertically? baseSize * 0.075 : 0;
   let addVerticalSpace = 0;

   if (node.name === 'PrintNode' || node.name === 'ReadNode') {
      konvaLayer.add(dataSymbol(baseSize, {
         x: space.x,
         y: space.y + verticalSpaceToCenter
      }));

      const textValue = node.name === 'PrintNode'? valueBuilder(node.value, false) : node.identifier['value'];
      
      konvaLayer.add(textLabel(textValue, baseSize, {
         x: space.x + baseSize * 0.31,
         y: space.y + verticalSpaceToCenter
      }));

      addVerticalSpace = defaultVerticalSpace + baseSize * 0.15;
   }
   else if (node.name === 'DeclarationNode' || node.name === 'AssignmentNode') {
      konvaLayer.add(taskSymbol(baseSize, {
         x: space.x,
         y: space.y + verticalSpaceToCenter
      }));

      let textValue = node.identifier;
      let builtValue = valueBuilder(node.value, false);
      if (builtValue !== undefined) {
         textValue += '=' + builtValue;
      }

      konvaLayer.add(textLabel(textValue, baseSize, {
         x: space.x + baseSize * 0.31,
         y: space.y + verticalSpaceToCenter
      }));

      addVerticalSpace = defaultVerticalSpace + baseSize * 0.15;
   }
   else if (node.name === 'IfNode') {
      konvaLayer.add(decisionSymbol(baseSize, space));

      konvaLayer.add(textLabel(valueBuilder(node.argument, false), baseSize, {
         x: space.x + baseSize * 0.4,
         y: space.y + baseSize * 0.075
      }, baseSize * 0.2));

      addVerticalSpace += defaultVerticalSpace + baseSize * 0.3;
      
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
               x: space.x + baseSize * 0.7,
               y: space.y + addAlternateSpace
            }, true);
         }
         if (addAlternateSpace > addVerticalSpace) {
            addVerticalSpace = addAlternateSpace + defaultVerticalSpace;
         }
      }
   }
   else if (node.name === 'SwitchNode') {
      konvaLayer.add(taskSymbol(baseSize, space, '#ffd23e'));

      konvaLayer.add(textLabel(valueBuilder(node.argument, false), baseSize, {
         x: space.x + baseSize * 0.31,
         y: space.y
      }));

      addVerticalSpace += defaultVerticalSpace + baseSize * 0.15;
      node.cases.forEach(caseElement => {
         konvaLayer.add(decisionSymbol(baseSize, {
            x: space.x,
            y: space.y + addVerticalSpace
         }, '#ff7070'));

         konvaLayer.add(textLabel(valueBuilder(caseElement.argument, false), baseSize, {
            x: space.x + baseSize * 0.4,
            y: space.y + baseSize * 0.075 + addVerticalSpace
         }, baseSize * 0.2));

         let caseSentences =  [...caseElement.body];
         let addCaseSpace = addVerticalSpace;

         addVerticalSpace += defaultVerticalSpace + baseSize * 0.3;

         while(caseSentences.length) {
            const caseNode = caseSentences.shift()!;
            addCaseSpace += addTreeNode(caseNode, {
               x: space.x + baseSize * 0.7,
               y: space.y + addCaseSpace
            }, true);
         }
         if (addCaseSpace > addVerticalSpace) {
            addVerticalSpace = addCaseSpace + defaultVerticalSpace;
         }
      });
   }
   else if (node.name === 'ForNode') {
      konvaLayer.add(decisionSymbol(baseSize, space, '#ff66e5'));

      let textValue = node.declaration.identifier + '<=' + node.to['value'];

      konvaLayer.add(textLabel(textValue, baseSize, {
         x: space.x + baseSize * 0.4,
         y: space.y + baseSize * 0.075 + addVerticalSpace
      }, baseSize * 0.2));

      space.x += baseSize * 0.7;
      addVerticalSpace += defaultVerticalSpace * 2 + baseSize * 0.15;

      let addForSpace = baseSize * 0.075

      konvaLayer.add(taskSymbol(baseSize, {
         x: space.x,
         y: space.y + addForSpace
      }, '#ff7070'));

      textValue = node.declaration.identifier + '=' + node.declaration.identifier + '+' + node.steps['value'];

      konvaLayer.add(textLabel(textValue, baseSize, {
         x: space.x + baseSize * 0.31,
         y: space.y + addForSpace
      }));

      addForSpace = baseSize * 0.075 + defaultVerticalSpace;

      let forSentences = [...node.body];

      while(forSentences.length) {
         const caseNode = forSentences.shift()!;
         addForSpace += addTreeNode(caseNode, {
            x: space.x,
            y: space.y + defaultVerticalSpace + addForSpace
         });
      }
      if (addForSpace > addVerticalSpace) {
         addVerticalSpace = addForSpace + defaultVerticalSpace;
      }

   }
   else if (node.name === 'WhileNode') {
      konvaLayer.add(decisionSymbol(baseSize, space, '#ff66e5'));

      konvaLayer.add(textLabel(valueBuilder(node.argument, false), baseSize, {
         x: space.x + baseSize * 0.4,
         y: space.y + baseSize * 0.075
      }, baseSize * 0.2));

      addVerticalSpace += defaultVerticalSpace + baseSize * 0.3;

      let bodySentences = [...node.body];
      while (bodySentences.length) {
         const bodyNode = bodySentences.shift()!;
         addVerticalSpace += addTreeNode(bodyNode, {
            x: space.x,
            y: space.y + addVerticalSpace
         });
      }
   }
   else if (node.name === 'DowhileNode') {
      let bodySentences = [...node.body];
      while (bodySentences.length) {
         const bodyNode = bodySentences.shift()!;
         addVerticalSpace += addTreeNode(bodyNode, {
            x: space.x,
            y: space.y + addVerticalSpace
         });
      }

      konvaLayer.add(decisionSymbol(baseSize, {
         x: space.x,
         y: space.y + addVerticalSpace
      }, '#ff66e5'));

      konvaLayer.add(textLabel(valueBuilder(node.argument, false), baseSize, {
         x: space.x + baseSize * 0.4,
         y: space.y + baseSize * 0.075 + addVerticalSpace
      }, baseSize * 0.2));

      addVerticalSpace += defaultVerticalSpace + baseSize * 0.3;
   }

   return addVerticalSpace;
}