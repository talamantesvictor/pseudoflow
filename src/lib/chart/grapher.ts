import type * as atype from "../analyzers/atypes";
import type Konva from 'konva';
import { terminatorSymbol, taskSymbol, decisionSymbol, dataSymbol, textLabel, arrowSymbol, loopArrowSymbol, negativeArrowSymbol, emptySymbol } from "./symbols";
import { valueBuilder } from "../code/interpreter";

let arrowsLayer: Konva.Layer;
let symbolsLayer: Konva.Layer;
let runningSentences: atype.SentencesNode[];
let baseSize: number;
let defaultVerticalSpace: number;
let defaultHorizontalSpace: number;
let horizontalSpacing: number;
let lastSymbolAttributes: any;
let nestedSymbolsAttributes: any[];
let nodeColumns: number;
let shouldConnectNestedSymbols: boolean;

// Draws the flow chart symbols and returns the vertical space used
export function grapher(sentences: atype.SentencesNode[], backLayer: Konva.Layer, frontLayer: Konva.Layer, size: number) : any {
   backLayer.removeChildren();
   frontLayer.removeChildren();
   runningSentences = [...sentences];
   arrowsLayer = backLayer;
   symbolsLayer = frontLayer;
   baseSize = size;
   defaultVerticalSpace = baseSize * 0.2;
   defaultHorizontalSpace = baseSize * 0.7;
   horizontalSpacing = baseSize;
   nestedSymbolsAttributes = [];
   
   
   let spaces = {x: 0, y: defaultVerticalSpace};

   if (runningSentences.length > 0) {
      const startSymbol = terminatorSymbol(baseSize, {
         x: baseSize * 0.5,
         y: spaces.y
      });
      lastSymbolAttributes = getSymbolAttributes(startSymbol);
      frontLayer.add(startSymbol);
      spaces.y += defaultVerticalSpace + baseSize * 0.2;
   
      while (runningSentences.length) {
         const node = runningSentences.shift()!;
         spaces.y += addTreeNodeSymbol(node, spaces);
         nodeColumns = 0;
         shouldConnectNestedSymbols = true;
      }

      const endSymbol = terminatorSymbol(baseSize, spaces);
      frontLayer.add(endSymbol);
      addArrows(endSymbol);
      spaces.y += defaultVerticalSpace;
   }

   spaces.x = horizontalSpacing;
   return spaces;
}

function addTreeNodeSymbol(
   node: atype.SentencesNode, 
   position: {x: number, y: number},
   column: number = 0
) {

   let verticalSpace = 0;

   nodeColumns = column > nodeColumns? column : nodeColumns;
   position.x = defaultHorizontalSpace * column + baseSize * 0.5;

   if (node.name === 'PrintNode' || node.name === 'ReadNode') {
      const symbol = dataSymbol(baseSize, position, node.name === 'PrintNode'? '#24a7ff' : '#00ff95');
      updateHorizontalSpacing(symbol);
      const dimensions = {width: symbol.attrs.width, height: symbol.attrs.height};
      const textValue = node.name === 'PrintNode'? valueBuilder(node.value, false) : node.identifier['value'];
      symbolsLayer.add(symbol)
      symbolsLayer.add(textLabel(textValue, position, dimensions));
      verticalSpace = symbol.attrs.height;

      addArrows(symbol);
      lastSymbolAttributes = getSymbolAttributes(symbol);

   }
   else if (node.name === 'DeclarationNode' || node.name === 'AssignmentNode') {
      const symbol = taskSymbol(baseSize, position);
      updateHorizontalSpacing(symbol);
      const dimensions = {width: symbol.attrs.width, height: symbol.attrs.height};
      let textValue = node.identifier;
      let builtValue = valueBuilder(node.value, false);
      if (builtValue !== undefined) {
         textValue += '=' + builtValue;
      }
      
      symbolsLayer.add(symbol);
      symbolsLayer.add(textLabel(textValue, position, dimensions));
      verticalSpace = symbol.attrs.height;

      addArrows(symbol);
      lastSymbolAttributes = getSymbolAttributes(symbol);

   }
   else if (node.name === 'IfNode') {
      const symbol = decisionSymbol(baseSize, position);
      updateHorizontalSpacing(symbol);
      const dimensions = {width: symbol.attrs.width * 0.7, height: symbol.attrs.height * 0.5};
      symbolsLayer.add(symbol);
      symbolsLayer.add(textLabel(valueBuilder(node.argument, false), position, dimensions));
      verticalSpace = symbol.attrs.height + defaultVerticalSpace;

      addArrows(symbol);
      lastSymbolAttributes = getSymbolAttributes(symbol);
   
      let firstSymbolAttributes = lastSymbolAttributes;
      let bodySentences = [...node.body];
      while (bodySentences.length) {
         const bodyNode = bodySentences.shift()!;
         verticalSpace += addTreeNodeSymbol(bodyNode, {
            x: position.x,
            y: position.y + verticalSpace 
         }, column);
      }

      firstSymbolAttributes = lastSymbolAttributes;
      nestedSymbolsAttributes[column] = lastSymbolAttributes;

      if (node.alternative.length) {
         lastSymbolAttributes = getSymbolAttributes(symbol);
         let alternativeSentences = [...node.alternative];
         let alternateSpace = 0;

         if (column < nodeColumns) {
            column = nodeColumns
         }

         while (alternativeSentences.length) {
            const alternativeNode = alternativeSentences.shift()!;
            alternateSpace += addTreeNodeSymbol(alternativeNode, {
               x: position.x,
               y: position.y + alternateSpace
            }, column + 1);

            nestedSymbolsAttributes[column + 1] = lastSymbolAttributes;
         }

         if (alternateSpace > verticalSpace) {
            verticalSpace = alternateSpace;
         }

      }
      else {
         arrowsLayer.add(negativeArrowSymbol(
            {x: position.x, y: position.y},
            {x: nestedSymbolsAttributes[column].x, y: nestedSymbolsAttributes[column].y},
            nestedSymbolsAttributes[column].height
         ));
      }

      lastSymbolAttributes = nestedSymbolsAttributes[column];
      shouldConnectNestedSymbols = true;
      nodeColumns = column;
      verticalSpace -= defaultVerticalSpace * 0.85;
   }
   else if (node.name === 'SwitchNode') {
      const symbol = taskSymbol(baseSize, position, '#ffd23e');
      updateHorizontalSpacing(symbol);
      const dimensions = {width: symbol.attrs.width, height: symbol.attrs.height};
      symbolsLayer.add(symbol);
      symbolsLayer.add(textLabel(valueBuilder(node.argument, false), position, dimensions));
      verticalSpace = symbol.attrs.height;


      addArrows(symbol);
      lastSymbolAttributes = getSymbolAttributes(symbol);

      node.cases.forEach(caseElement => {
         verticalSpace += defaultVerticalSpace;
         const caseNode = decisionSymbol(baseSize, {
            x: position.x,
            y: position.y + verticalSpace
         }, '#ff7070');
         symbolsLayer.add(caseNode);

         addArrows(caseNode);
         lastSymbolAttributes = getSymbolAttributes(caseNode);

         const dimensions = {width: caseNode.attrs.width, height: caseNode.attrs.height};
         
         symbolsLayer.add(textLabel(valueBuilder(caseElement.argument, false), {
            x: position.x,
            y: position.y + verticalSpace
         }, dimensions));

         let caseSentences =  [...caseElement.body];
         let caseSpace = verticalSpace;
         verticalSpace += caseNode.attrs.height;

         if (caseSentences.length) {
            while(caseSentences.length) {
               const caseNode = caseSentences.shift()!;
               caseSpace += addTreeNodeSymbol(caseNode, {
                  x: position.x + defaultHorizontalSpace,
                  y: position.y + caseSpace
               }, column + 1);
            }

            nestedSymbolsAttributes[nodeColumns] = lastSymbolAttributes;
            shouldConnectNestedSymbols = true;
            nodeColumns = column;
         }

         if (caseSpace > verticalSpace) {
            verticalSpace = caseSpace;
         }

         lastSymbolAttributes = getSymbolAttributes(symbol);
         
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

      addArrows(symbol);
      lastSymbolAttributes = getSymbolAttributes(symbol);

      forPosition.x += defaultHorizontalSpace;
      
      let forSentences = [...node.body];
      let forSpace = 0;
      let horizontalSpace = 0;
      while(forSentences.length) {
         const forNode = forSentences.shift()!;
         forSpace += addTreeNodeSymbol(forNode, {
            x: forPosition.x,
            y: forPosition.y + forSpace
         }, column + 1);

      }
      if (nestedSymbolsAttributes[nodeColumns+1])
         horizontalSpace = nestedSymbolsAttributes[nodeColumns+1].x + nestedSymbolsAttributes[nodeColumns].width;
      else if (horizontalSpace)
         horizontalSpace = lastSymbolAttributes.x + lastSymbolAttributes.width;
      
      forPosition.y += forSpace;
      shouldConnectNestedSymbols = true;
      // nodeColumns = column;

      textValue = node.declaration.identifier + '=' + node.declaration.identifier + '+' + node.steps['value'];
      const tSymbol = taskSymbol(baseSize, forPosition, '#ff7070');
      updateHorizontalSpacing(tSymbol);
      symbolsLayer.add(tSymbol);
      symbolsLayer.add(textLabel(textValue, forPosition, dimensions));
      addArrows(tSymbol);
      lastSymbolAttributes = getSymbolAttributes(symbol);

      const tSymbolAttributes: any = getSymbolAttributes(tSymbol);
      arrowsLayer.add(loopArrowSymbol(
         {x: tSymbolAttributes.x, y: tSymbolAttributes.y},
         {x: lastSymbolAttributes.x, y : lastSymbolAttributes.y},
         lastSymbolAttributes.height,
         0,
         horizontalSpace
      ));

      if (forSpace > verticalSpace) {
         verticalSpace = forSpace;
      }

      verticalSpace += defaultVerticalSpace;

   }
   else if (node.name === 'WhileNode') {
      const symbol = decisionSymbol(baseSize, position, '#ff66e5');
      updateHorizontalSpacing(symbol);
      const dimensions = {width: symbol.attrs.width * 0.7, height: symbol.attrs.height * 0.5};
      symbolsLayer.add(symbol);
      symbolsLayer.add(textLabel(valueBuilder(node.argument, false), position, dimensions));

      addArrows(symbol);
      lastSymbolAttributes = getSymbolAttributes(symbol);

      let bodySentences = [...node.body];
      let whileSpace = 0;
      let horizontalSpace = 0;
      if (bodySentences.length) {

         while (bodySentences.length) {
            const bodyNode = bodySentences.shift()!;
            const vSpace = addTreeNodeSymbol(bodyNode, {
               x: position.x,
               y: position.y + verticalSpace
            }, column + 1);

            whileSpace = vSpace
            verticalSpace += vSpace;

            if (nestedSymbolsAttributes[nodeColumns+1])
               horizontalSpace = nestedSymbolsAttributes[nodeColumns+1].x + nestedSymbolsAttributes[nodeColumns].width;
            else
               horizontalSpace = lastSymbolAttributes.x + lastSymbolAttributes.width;

            nodeColumns = column;
            shouldConnectNestedSymbols = true;
         }
         verticalSpace -= defaultVerticalSpace;
      }
      else {
         verticalSpace += defaultVerticalSpace;
      }
      
      shouldConnectNestedSymbols = true;
      if (nestedSymbolsAttributes[column + 1]) {
         delete nestedSymbolsAttributes[column + 1];
      }

      const symbolAttributes: any = getSymbolAttributes(symbol);
      arrowsLayer.add(loopArrowSymbol(
         {x: lastSymbolAttributes.x, y: lastSymbolAttributes.y},
         {x: symbolAttributes.x, y: symbolAttributes.y },
         symbolAttributes.height,
         whileSpace,
         horizontalSpace
      ));

      const empty = emptySymbol({
         x: lastSymbolAttributes.x,
         y: lastSymbolAttributes.y + whileSpace
      })
      addArrows(empty, false);


      lastSymbolAttributes = getSymbolAttributes(symbol);
      verticalSpace += defaultVerticalSpace;
   }
   else if (node.name === 'DowhileNode') {
      let bodySentences = [...node.body];
      let startLoop: any = undefined;
      while (bodySentences.length) {
         const bodyNode = bodySentences.shift()!;
         verticalSpace += addTreeNodeSymbol(bodyNode, {
            x: position.x,
            y: position.y + verticalSpace
         });

         if (!startLoop) {
            startLoop = lastSymbolAttributes;
         }
      }

      const doWhilePosition = {x: position.x, y: position.y + verticalSpace};
      const symbol = decisionSymbol(baseSize, doWhilePosition, '#ff66e5');
      updateHorizontalSpacing(symbol);
      const dimensions = {width: symbol.attrs.width * 0.7, height: symbol.attrs.height * 0.5};
      symbolsLayer.add(symbol);
      symbolsLayer.add(textLabel(valueBuilder(node.argument, false), doWhilePosition, dimensions));
      verticalSpace += defaultVerticalSpace;

      addArrows(symbol);
      lastSymbolAttributes = getSymbolAttributes(symbol);

      if (!startLoop) {
         startLoop = lastSymbolAttributes;
      }

      arrowsLayer.add(loopArrowSymbol(
         {x: lastSymbolAttributes.x, y: lastSymbolAttributes.y},
         {x: startLoop.x, y: startLoop.y },
         startLoop.height
      ));
   }

   return verticalSpace + defaultVerticalSpace;
}

function updateHorizontalSpacing(symbol?) {
   const width = symbol.attrs.width + symbol.attrs.x;
   if (width > horizontalSpacing) {
      horizontalSpacing = width;
   }
}

function addArrows(currentSymbol, drawRegularArrow = true) {
   if (drawRegularArrow) {
      arrowsLayer.add(arrowSymbol(
         {x: lastSymbolAttributes.x, y: lastSymbolAttributes.y},
         {x: currentSymbol.attrs.x, y: currentSymbol.attrs.y},
         {width: currentSymbol.attrs.width, height: currentSymbol.attrs.height },
         defaultVerticalSpace
      ));
   }

   if (shouldConnectNestedSymbols) {
      shouldConnectNestedSymbols = false;

      for (let index = nodeColumns; index < nestedSymbolsAttributes.length; index++) {
         if (nestedSymbolsAttributes[index]) {
            const element = nestedSymbolsAttributes[index];
            arrowsLayer.add(arrowSymbol(
               {x: element.x, y: element.y},
               {x: currentSymbol.attrs.x, y: currentSymbol.attrs.y},
               {width: currentSymbol.attrs.width, height: currentSymbol.attrs.height },
               defaultVerticalSpace
            ));
   
            delete nestedSymbolsAttributes[index];

         }
      }
   }
}

function getSymbolAttributes(symbol) {
   let newAttrs = {};
   for (const [key, value] of Object.entries(symbol.attrs)) {
      newAttrs[key] = value;
   }

   return newAttrs;
}