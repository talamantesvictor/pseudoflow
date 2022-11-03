import type * as atype from "../analyzers/atypes";
import type Konva from 'konva';
import { terminatorSymbol, taskSymbol, decisionSymbol, dataSymbol, textLabel, arrowSymbol } from "./symbols";
import { valueBuilder } from "../code/interpreter";

let arrowsLayer: Konva.Layer;
let symbolsLayer: Konva.Layer;
let runningSentences: atype.SentencesNode[];
let baseSize: number;
let defaultVerticalSpace: number;
let defaultHorizontalSpace: number;
let horizontalSpacing: number;

// Draws the flow chart symbols and returns the vertical space used
export function grapher(sentences: atype.SentencesNode[], backLayer: Konva.Layer, frontLayer: Konva.Layer, size: number) : any {
   frontLayer.removeChildren();
   runningSentences = [...sentences];
   arrowsLayer = backLayer;
   symbolsLayer = frontLayer;
   baseSize = size;
   defaultVerticalSpace = baseSize * 0.2;
   defaultHorizontalSpace = baseSize * 0.7;
   horizontalSpacing = baseSize;
   
   let dimensions = {x: baseSize * 0.5, y: defaultVerticalSpace};

   if (runningSentences.length > 0) {
      const startSymbol = terminatorSymbol(baseSize, dimensions);
      frontLayer.add(startSymbol);
      dimensions.y += defaultVerticalSpace + baseSize * 0.2;
   
      while (runningSentences.length) {
         const node = runningSentences.shift()!;
         dimensions.y += addTreeNodeSymbol(node, dimensions);
      }

      frontLayer.add(terminatorSymbol(baseSize, dimensions));
      dimensions.y += defaultVerticalSpace;
   }

   dimensions.x = horizontalSpacing;

   return dimensions;
}

function addTreeNodeSymbol(
   node: atype.SentencesNode, 
   position: {x: number, y: number}
) {

   let verticalSpace = 0;

   if (node.name === 'PrintNode' || node.name === 'ReadNode') {
      const symbol = dataSymbol(baseSize, position);
      updateHorizontalSpacing(symbol, position);
      const dimensions = {width: symbol.attrs.width, height: symbol.attrs.height};
      const textValue = node.name === 'PrintNode'? valueBuilder(node.value, false) : node.identifier['value'];
      symbolsLayer.add(symbol)
      symbolsLayer.add(textLabel(textValue, position, dimensions));
      verticalSpace = symbol.attrs.height;

   }
   else if (node.name === 'DeclarationNode' || node.name === 'AssignmentNode') {
      const symbol = taskSymbol(baseSize, position);
      updateHorizontalSpacing(symbol, position);
      const dimensions = {width: symbol.attrs.width, height: symbol.attrs.height};
      let textValue = node.identifier;
      let builtValue = valueBuilder(node.value, false);
      if (builtValue !== undefined) {
         textValue += '=' + builtValue;
      }
      
      symbolsLayer.add(symbol);
      symbolsLayer.add(textLabel(textValue, position, dimensions));
      verticalSpace = symbol.attrs.height;

   }
   else if (node.name === 'IfNode') {
      const symbol = decisionSymbol(baseSize, position);
      updateHorizontalSpacing(symbol, position);
      const dimensions = {width: symbol.attrs.width * 0.7, height: symbol.attrs.height * 0.5};
      symbolsLayer.add(symbol);
      symbolsLayer.add(textLabel(valueBuilder(node.argument, false), position, dimensions));
      verticalSpace = symbol.attrs.height + defaultVerticalSpace;
      
      let bodySentences = [...node.body];
      while (bodySentences.length) {
         const bodyNode = bodySentences.shift()!;
         verticalSpace += addTreeNodeSymbol(bodyNode, {
            x: position.x,
            y: position.y + verticalSpace 
         });
      }

      if (node.alternative.length) {
         let alternativeSentences = [...node.alternative];
         let alternateSpace = 0;
         while (alternativeSentences.length) {
            const alternativeNode = alternativeSentences.shift()!;
            alternateSpace += addTreeNodeSymbol(alternativeNode, {
               x: position.x + defaultHorizontalSpace,
               y: position.y + alternateSpace
            });
         }

         if (alternateSpace > verticalSpace) {
            verticalSpace = alternateSpace;
         }
      }

      verticalSpace -= defaultVerticalSpace;
   }
   else if (node.name === 'SwitchNode') {
      const symbol = taskSymbol(baseSize, position, '#ffd23e');
      updateHorizontalSpacing(symbol, position);
      const dimensions = {width: symbol.attrs.width, height: symbol.attrs.height};
      symbolsLayer.add(symbol);
      symbolsLayer.add(textLabel(valueBuilder(node.argument, false), position, dimensions));
      verticalSpace = symbol.attrs.height;

      node.cases.forEach(caseElement => {
         verticalSpace += defaultVerticalSpace;
         const caseNode = decisionSymbol(baseSize, {
            x: position.x,
            y: position.y + verticalSpace
         }, '#ff7070');
         symbolsLayer.add(caseNode);

         const dimensions = {width: caseNode.attrs.width, height: caseNode.attrs.height};
         
         symbolsLayer.add(textLabel(valueBuilder(caseElement.argument, false), {
            x: position.x,
            y: position.y + verticalSpace
         }, dimensions));

         let caseSentences =  [...caseElement.body];
         let caseSpace = verticalSpace;
         verticalSpace += caseNode.attrs.height;

         while(caseSentences.length) {
            const caseNode = caseSentences.shift()!;
            caseSpace += addTreeNodeSymbol(caseNode, {
               x: position.x + defaultHorizontalSpace,
               y: position.y + caseSpace
            });
         }

         if (caseSpace > verticalSpace) {
            verticalSpace = caseSpace;
         }
         
      });
   }
   else if (node.name === 'ForNode') {
      let forPosition = {x: position.x, y: position.y};
      const symbol = decisionSymbol(baseSize, forPosition, '#ff66e5');
      const dimensions = {width: symbol.attrs.width, height: symbol.attrs.height * 0.6};
      let textValue = node.declaration.identifier + '<=' + node.to['value'];
      symbolsLayer.add(symbol);
      symbolsLayer.add(textLabel(textValue, forPosition, {
         width: dimensions.width * 0.7,
         height: dimensions.height
      }));

      forPosition.x += defaultHorizontalSpace;
      
      let forSentences = [...node.body];
      let forSpace = 0;
      while(forSentences.length) {
         const forNode = forSentences.shift()!;
         forSpace += addTreeNodeSymbol(forNode, {
            x: forPosition.x,
            y: forPosition.y + forSpace
         });
      }
      
      forPosition.y += forSpace;

      textValue = node.declaration.identifier + '=' + node.declaration.identifier + '+' + node.steps['value'];
      const tSymbol = taskSymbol(baseSize, forPosition, '#ff7070');
      updateHorizontalSpacing(tSymbol, forPosition);
      symbolsLayer.add(tSymbol);
      symbolsLayer.add(textLabel(textValue, forPosition, dimensions));

      if (forSpace > verticalSpace) {
         verticalSpace = forSpace;
      }

      verticalSpace += defaultVerticalSpace * 2;

   }
   else if (node.name === 'WhileNode') {
      const symbol = decisionSymbol(baseSize, position, '#ff66e5');
      updateHorizontalSpacing(symbol, position);
      const dimensions = {width: symbol.attrs.width * 0.7, height: symbol.attrs.height * 0.5};
      symbolsLayer.add(symbol);
      symbolsLayer.add(textLabel(valueBuilder(node.argument, false), position, dimensions));

      verticalSpace += symbol.attrs.height + defaultVerticalSpace;

      let bodySentences = [...node.body];
      while (bodySentences.length) {
         const bodyNode = bodySentences.shift()!;
         verticalSpace += addTreeNodeSymbol(bodyNode, {
            x: position.x,
            y: position.y + verticalSpace
         });
      }
      verticalSpace -= defaultVerticalSpace;

   }
   else if (node.name === 'DowhileNode') {
      let bodySentences = [...node.body];
      while (bodySentences.length) {
         const bodyNode = bodySentences.shift()!;
         verticalSpace += addTreeNodeSymbol(bodyNode, {
            x: position.x,
            y: position.y + verticalSpace
         });
      }

      const doWhilePosition = {x: position.x, y: position.y + verticalSpace};
      const symbol = decisionSymbol(baseSize, doWhilePosition, '#ff66e5');
      updateHorizontalSpacing(symbol, doWhilePosition);
      const dimensions = {width: symbol.attrs.width * 0.7, height: symbol.attrs.height * 0.5};
      symbolsLayer.add(symbol);
      symbolsLayer.add(textLabel(valueBuilder(node.argument, false), doWhilePosition, dimensions));

      verticalSpace += defaultVerticalSpace;
   }

   return verticalSpace + defaultVerticalSpace;
}

function updateHorizontalSpacing(symbol, position) {
   const width = symbol.attrs.width + position.x;
   if (width > horizontalSpacing) {
      horizontalSpacing = width;
   }
}