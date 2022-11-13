import type * as atype from "../analyzers/atypes";
import type Konva from 'konva';
import { terminatorSymbol, taskSymbol, decisionSymbol, dataSymbol, textLabel, arrowSymbol, autoReturnArrowSymbol, loopArrowSymbol } from "./symbols";
import { valueBuilder } from "../code/interpreter";

type Vector = {x: number, y: number};
type Rect = {x: number, y: number, width: number, height: number};

let flowLayer: Konva.Layer;
let symbolsLayer: Konva.Layer;
let runningSentences: atype.SentencesNode[];
let baseSize: number;
let defaultHorizontalSpace: number;
let defaultVerticalSpace: number;
let columnSymbol: Rect[];
let chartDimensions: Vector;
let lastParentSymbol;

export function grapher(sentences: atype.SentencesNode[], backLayer: Konva.Layer, frontLayer: Konva.Layer, size: number) : any {
   // Clean the canvas
   backLayer.removeChildren();
   frontLayer.removeChildren();
   
   // Defaults
   runningSentences = [...sentences];
   flowLayer = backLayer;
   symbolsLayer = frontLayer;
   baseSize = size;
   defaultVerticalSpace = baseSize * 0.2;
   defaultHorizontalSpace = baseSize * 0.7;
   columnSymbol = [];

   chartDimensions = {
      x: baseSize, 
      y: defaultVerticalSpace
   }

   // Keep track of first column symbols to connect them
   let rootSymbols: any[] = [];

   if (runningSentences.length) {
      const startSymbol = terminatorSymbol(baseSize, {
         x: baseSize * 0.5,
         y: chartDimensions.y
      });
      const startRect = addSymbol(startSymbol);
      rootSymbols.push(startRect);
      chartDimensions.y += startRect.y  + defaultVerticalSpace * 0.5;

      while (runningSentences.length) {
         const sentenceNode = runningSentences.shift()!;
         const treeNode = readTreeNode(sentenceNode, {
            x: baseSize * 0.5,
            y: chartDimensions.y
         });

         chartDimensions.y += treeNode.y;
         chartDimensions.x = chartDimensions.x > baseSize + treeNode.x? chartDimensions.x : baseSize + treeNode.x;

         rootSymbols.push(treeNode.rect);
         addFlow(rootSymbols.at(-2), rootSymbols.at(-1));
         columnSymbol = [];
      }
      
      const endSymbol = terminatorSymbol(baseSize, {
         x: baseSize * 0.5,
         y: chartDimensions.y
      });
      const endRect = addSymbol(endSymbol);
      rootSymbols.push(endRect);
      addFlow(rootSymbols.at(-2), rootSymbols.at(-1));
      chartDimensions.y = endRect.y  + defaultVerticalSpace;
   }

   return chartDimensions;
}

function readTreeNode(node: atype.SentencesNode, position: Vector): any {

   let treeNodeRect: Rect | undefined = undefined;
   let treeNodeDimensions : Vector = {
      x: 0, 
      y: 0
   };

   if (node.name === 'PrintNode' || node.name === 'ReadNode') {
      const color = node.name === 'PrintNode'? '#24a7ff' : '#00ff95';
      const dataNode = dataSymbol(baseSize, position, color);
      treeNodeRect = addSymbol(dataNode);

      const textValue = node.name === 'PrintNode'? valueBuilder(node.value, false) : node.identifier['value'];
      const textNode = textLabel(textValue, position, {
         width: treeNodeRect.width,
         height: treeNodeRect.height
      });
      symbolsLayer.add(textNode);

      treeNodeDimensions.y = treeNodeRect.height * 0.5 + defaultVerticalSpace;
   }
   else if (node.name === 'DeclarationNode' || node.name === 'AssignmentNode') {
      const taskNode = taskSymbol(baseSize, position);
      treeNodeRect = addSymbol(taskNode);

      let textValue = node.identifier;
      let builtValue = valueBuilder(node.value, false);
      if (builtValue !== undefined) {
         textValue += '=' + builtValue;
      }
      const textNode = textLabel(textValue, position, {
         width: treeNodeRect.width,
         height: treeNodeRect.height
      });
      symbolsLayer.add(textNode);

      treeNodeDimensions.y = treeNodeRect.height * 0.5 + defaultVerticalSpace;
   }
   else if (node.name === 'IfNode') {
      // First symbol
      const decisionNode = decisionSymbol(baseSize, position);
      treeNodeRect = addSymbol(decisionNode);

      // Symbol text
      let textValue = valueBuilder(node.argument, false);
      const textNode = textLabel(textValue, position, {
         width: treeNodeRect.width * 0.6,
         height: treeNodeRect.height
      });
      symbolsLayer.add(textNode);

      // Add vertical space after inserting the first symbol
      treeNodeDimensions.y = treeNodeRect.height * 0.5 + defaultVerticalSpace;

      // Keep track of the last inserted node 
      // to correctly draw the flow
      let lastBodyRect: Rect = treeNodeRect;

      // Variables to keep track of dimensions
      let nodeWidth = 0;
      let widerBodyNode = 0;
      let widerAlternativeNode = 0;
      let bodyHeight = treeNodeDimensions.y;
      let alternativeHeight = 0;

      // Iterate body sentences
      let bodySentences = [...node.body];
      while (bodySentences.length) {
         const bodySentence = bodySentences.shift()!;
         const bodyTreeNode = readTreeNode(bodySentence, {
            x: position.x,
            y: position.y + bodyHeight
         });

         addFlow(lastBodyRect, bodyTreeNode.rect);
         lastBodyRect = bodyTreeNode.rect;
         nodeWidth += bodyTreeNode.x;
         bodyHeight += bodyTreeNode.y;

         widerBodyNode = widerBodyNode > nodeWidth? widerBodyNode : nodeWidth;
         nodeWidth = 0;
      }

      treeNodeDimensions.x = widerBodyNode;

      if (node.alternative.length) {
         let lastAlternativeRect: Rect = treeNodeRect;
         let alternativeSentences = [...node.alternative];
         while(alternativeSentences.length) {
            nodeWidth = defaultHorizontalSpace + treeNodeDimensions.x;
            const alternativeSentence = alternativeSentences.shift()!;
            const alternativeTreeNode = readTreeNode(alternativeSentence, {
               x: position.x + nodeWidth,
               y: position.y + alternativeHeight
            });
            
            addFlow(lastAlternativeRect, alternativeTreeNode.rect);
            lastAlternativeRect = alternativeTreeNode.rect;
            nodeWidth += alternativeTreeNode.x;
            alternativeHeight += alternativeTreeNode.y;  

            widerAlternativeNode = widerAlternativeNode > nodeWidth? widerAlternativeNode : nodeWidth;
         }

         const returningFlowHeight = bodyHeight > alternativeHeight? bodyHeight : alternativeHeight;
         let hasFlow = setNestedReturnFlows({
            x: position.x,
            y: position.y + returningFlowHeight
         });

      }
      else {
         bodyHeight = bodyHeight > 0? bodyHeight : treeNodeRect.height + defaultVerticalSpace * 0.5;
         flowLayer.add(autoReturnArrowSymbol(
            position, defaultVerticalSpace, treeNodeDimensions.x, bodyHeight
         ));
      }

      treeNodeDimensions.x = widerBodyNode > widerAlternativeNode? widerBodyNode : widerAlternativeNode;
      treeNodeDimensions.y = bodyHeight > alternativeHeight? bodyHeight : alternativeHeight;
      treeNodeDimensions.y += defaultVerticalSpace * 0.5;
      console.log('xxx', treeNodeDimensions.x);
   }
   else if (node.name === 'SwitchNode') {
      // First symbol
      const taskNode = taskSymbol(baseSize, position, '#ffd23e');
      treeNodeRect = addSymbol(taskNode);

      // Symbol text
      let textValue = valueBuilder(node.argument, false);
      const textNode = textLabel(textValue, position, {
         width: treeNodeRect.width * 0.6,
         height: treeNodeRect.height
      });
      symbolsLayer.add(textNode);

      // Add vertical space after inserting the first symbol
      treeNodeDimensions.y = treeNodeRect.height * 0.5 + defaultVerticalSpace;

      // Keep track of the last inserted node 
      // to correctly draw the flow
      let lastCaseRect: any = treeNodeRect;
      
      // Variable to keep track of dimensions
      let nodeWidth = 0;
      let widerNode = 0;

      // Iterate the switch cases
      node.cases.forEach(caseElement => {
         const caseNode = decisionSymbol(baseSize, {
            x: position.x,
            y: position.y + treeNodeDimensions.y
         }, '#ff7070');

         const caseRect = addSymbol(caseNode);
         addFlow(lastCaseRect, caseRect);
         lastCaseRect = caseRect;

         let textValue = valueBuilder(caseElement.argument, false);
         const textNode = textLabel(
            textValue, 
            {
               x: caseRect.x,
               y: caseRect.y
            }, 
            {
               width: caseRect.width * 0.6,
               height: caseRect.height
            }
         );
         symbolsLayer.add(textNode);
         
         // Iterate body sentences
         let bodySentences = [...caseElement.body];
         if (bodySentences.length) {
            let lastNodeRect: any = lastCaseRect;

            while(bodySentences.length) {
               const caseNode = bodySentences.shift()!;
               const bodyTreeNode = readTreeNode(caseNode, {
                  x: position.x + defaultHorizontalSpace,
                  y: position.y + treeNodeDimensions.y
               });
      
               addFlow(lastNodeRect, bodyTreeNode.rect);
               lastNodeRect = bodyTreeNode.rect;
               nodeWidth += bodyTreeNode.x;
               treeNodeDimensions.y += bodyTreeNode.y;
            }

            widerNode = widerNode > nodeWidth? widerNode : nodeWidth;
            treeNodeDimensions.y +=  defaultVerticalSpace * 0.5;
            nodeWidth = 0;
         }
         else {
            // No case sentences?
            // Add short return
            const lastCaseVector = { x: lastCaseRect.x, y: lastCaseRect.y };
            const totalHeight = lastCaseRect.height + defaultVerticalSpace * 0.5;
            flowLayer.add(autoReturnArrowSymbol( lastCaseVector, defaultVerticalSpace, 0, totalHeight ));
            treeNodeDimensions.y += lastCaseRect.height + defaultVerticalSpace;
         }

         treeNodeDimensions.x = widerNode + defaultHorizontalSpace;

         setNestedReturnFlows({
            x: position.x,
            y: position.y + treeNodeDimensions.y - defaultVerticalSpace * 0.5
         });
      });

   }
   else if (node.name === 'ForNode') {
      // Add top margin to leave room for the
      // returning "iteration" arrow
      position.y += defaultVerticalSpace * 0.5;

      // First symbol
      const decisionNode = decisionSymbol(baseSize, position, '#ff66e5');
      treeNodeRect = addSymbol(decisionNode);

      // Symbol text
      let textValue = node.declaration.identifier + '<=' + node.to['value'];
      let textNode = textLabel(textValue, position, {
         width: treeNodeRect.width * 0.6,
         height: treeNodeRect.height
      });
      symbolsLayer.add(textNode);

      // Structure sentences are added to the right
      treeNodeDimensions.x += defaultHorizontalSpace;
      
      // Variables to keep track of dimensions
      let lastNodeRect = treeNodeRect;
      let nodeWidth = 0;
      let widerNode = treeNodeDimensions.x + defaultHorizontalSpace * 0.2;
      
      // Iterate body sentences
      let bodySentences = [...node.body];
      while(bodySentences.length) {
         const bodyNode = bodySentences.shift()!;
         const bodyTreeNode = readTreeNode(bodyNode, {
            x: position.x + treeNodeDimensions.x,
            y: position.y + treeNodeDimensions.y
         });

         addFlow(lastNodeRect, bodyTreeNode.rect);
         lastNodeRect = bodyTreeNode.rect;
         nodeWidth += bodyTreeNode.x;
         treeNodeDimensions.y += bodyTreeNode.y;
                  
         nodeWidth += defaultHorizontalSpace * 1.2;
         widerNode = widerNode > nodeWidth ? widerNode : nodeWidth;
         nodeWidth = 0;
      }

      // Add For's increment symbol
      const taskNode = taskSymbol(baseSize, {
         x: position.x + treeNodeDimensions.x,
         y: position.y + treeNodeDimensions.y
      }, '#ff7070');
      const forLoopTask = addSymbol(taskNode);

      textValue = node.declaration.identifier + '=' + node.declaration.identifier + '+' + node.steps['value'];
      textNode = textLabel(
         textValue, 
         {
            x: position.x + treeNodeDimensions.x,
            y: position.y + treeNodeDimensions.y
         }, 
         {
            width: forLoopTask.width,
            height: forLoopTask.height
         }
      );
      symbolsLayer.add(textNode);
      addFlow(lastNodeRect, forLoopTask);

      // Remove from returns list
      delete columnSymbol[getColumnFromPosX(position.x + treeNodeDimensions.x )];

      // Update dimensions
      widerNode = widerNode > nodeWidth? widerNode : nodeWidth;
      treeNodeDimensions.x = widerNode;
      treeNodeDimensions.y += defaultVerticalSpace * 2.5;

      // Loop
      flowLayer.add(
         loopArrowSymbol(
            {x: forLoopTask.x, y: forLoopTask.y},
            {x: treeNodeRect.x, y: treeNodeRect.y},
            treeNodeRect.height,
            baseSize * 0.2,
            position.x + widerNode + defaultHorizontalSpace * 0.5
         )
      );

   }
   else if (node.name === 'WhileNode') {
      // Add top margin to leave room for the
      // returning "iteration" arrow
      position.y += defaultVerticalSpace * 0.5;

      // First symbol
      const decisionNode = decisionSymbol(baseSize, position, '#ff66e5');
      treeNodeRect = addSymbol(decisionNode);
      
      // Symbol text
      let textValue = valueBuilder(node.argument, false);
      let textNode = textLabel(textValue, position, {
         width: treeNodeRect.width * 0.6,
         height: treeNodeRect.height
      });
      symbolsLayer.add(textNode);
      
      // Variables to keep track of dimensions
      let lastNodeRect = treeNodeRect;
      let nodeWidth = 0;
      let widerNode = 0;
      let lastRowPosition = baseSize * 0.2;
      treeNodeDimensions.x += defaultHorizontalSpace;

      // Iterate body sentences
      let bodySentences = [...node.body];
      if (bodySentences.length) {

         while (bodySentences.length) {
            const bodyNode = bodySentences.shift()!;
            const bodyTreeNode = readTreeNode(bodyNode, {
               x: position.x + treeNodeDimensions.x,
               y: position.y + treeNodeDimensions.y
            });

            nodeWidth += bodyTreeNode.x;
            lastRowPosition = bodyTreeNode.y;
            treeNodeDimensions.y += lastRowPosition;
            addFlow(lastNodeRect, bodyTreeNode.rect);
            lastNodeRect = bodyTreeNode.rect;

            nodeWidth += defaultHorizontalSpace * 1.2;
            widerNode = widerNode > nodeWidth ? widerNode : nodeWidth;
            nodeWidth = 0;
         }

         // Remove from returns list
         delete columnSymbol[getColumnFromPosX(
            position.x + treeNodeDimensions.x + defaultHorizontalSpace 
         )];
         
      }
      else {
         treeNodeDimensions.y += defaultVerticalSpace;
      }

      // Update dimensions
      widerNode = widerNode > nodeWidth ? widerNode : nodeWidth;
      treeNodeDimensions.x = widerNode;
      treeNodeDimensions.y += defaultVerticalSpace;

      // Update Y position used to draw the 
      // vertical offset for returning arrow
      lastRowPosition = lastRowPosition - defaultVerticalSpace > baseSize * 0.2? lastRowPosition - defaultVerticalSpace : baseSize * 0.2;

      // Loop
      flowLayer.add(
         loopArrowSymbol(
            {x: lastNodeRect.x, y: lastNodeRect.y},
            {x: treeNodeRect.x, y: treeNodeRect.y},
            treeNodeRect.height,
            lastRowPosition,
            position.x + widerNode + defaultHorizontalSpace * 0.5
         )
      );
   }
   else if (node.name === 'DowhileNode') {

      // Variables to keep track of dimensions
      let lastNodeRect: any;
      let nodeWidth = 0;
      let widerNode = 0;

      // Iterate body sentences
      let bodySentences = [...node.body];
      if (bodySentences.length) {

         while (bodySentences.length) {
            const bodyNode = bodySentences.shift()!;
            const bodyTreeNode = readTreeNode(bodyNode, {
               x: position.x + treeNodeDimensions.x,
               y: position.y + treeNodeDimensions.y
            });

            if (!treeNodeRect) {
               treeNodeRect = bodyTreeNode.rect;
            }
            else {
               addFlow(lastNodeRect, bodyTreeNode.rect);
            }

            nodeWidth += bodyTreeNode.x + defaultHorizontalSpace * 0.2;
            lastNodeRect = bodyTreeNode.rect;
            treeNodeDimensions.y += bodyTreeNode.y;

            widerNode = widerNode > nodeWidth ? widerNode : nodeWidth;
            nodeWidth = 0;
         }
      }
      else {
         position.y += defaultVerticalSpace * 0.5;
      }

      position.y += treeNodeDimensions.y;

      // Last symbol
      const decisionNode = decisionSymbol(baseSize, position, '#ff66e5');
      const decisionRect = addSymbol(decisionNode);
      lastNodeRect = lastNodeRect? lastNodeRect : decisionRect;
      treeNodeRect = treeNodeRect? treeNodeRect : decisionRect;
      
      // Symbol text
      let textValue = valueBuilder(node.argument, false);
      let textNode = textLabel(textValue, position, {
         width: lastNodeRect.width * 0.6,
         height: lastNodeRect.height
      });
      symbolsLayer.add(textNode);

      addFlow(lastNodeRect, decisionRect);

      // Loop
      flowLayer.add(
         loopArrowSymbol(
            {x: decisionRect.x, y: decisionRect.y},
            {x: treeNodeRect.x + treeNodeRect.width * 0.5, y: treeNodeRect.y},
            treeNodeRect.height,
            0,
            position.x + widerNode + defaultHorizontalSpace * 0.5
         )
      );

      // Update dimensions
      treeNodeDimensions.x = widerNode;
      treeNodeDimensions.y += treeNodeRect.height * 0.5 + defaultVerticalSpace * 1.5;
   }

   return {
      x: treeNodeDimensions.x,
      y: treeNodeDimensions.y,
      rect: treeNodeRect!
   };
}

function addSymbol(symbol) {
   symbolsLayer.add(symbol);
   
   const returnRect = {
      x: symbol.attrs.x,
      y: symbol.attrs.y,
      width: symbol.attrs.width,
      height: symbol.attrs.height
   };

   const column = getColumnFromPosX(symbol.attrs.x);
   if (column > 0) {
      const columnRect = columnSymbol[column];
      if (!columnRect || columnRect.y < symbol.attrs.y) {
         columnSymbol[column] = returnRect;
      }
   }

   return returnRect;
}

function addFlow(rect1, rect2) {
   const arrow = arrowSymbol(
      {x: rect1.x, y: rect1.y},
      {x: rect2.x, y: rect2.y},
      {width: rect2.width, height: rect2.height },
      defaultVerticalSpace
   );

   flowLayer.add(arrow);
}

function setNestedReturnFlows(destPosition) {
   let flowFound = false;

   columnSymbol.forEach((symbol, index) => {
      if (symbol) {
         if (symbol.x > destPosition.x) {
            flowFound = true;
            flowLayer.add(arrowSymbol(
               {x: symbol.x, y: symbol.y},
               {x: destPosition.x, y: destPosition.y},
               {width: 0, height: 0 },
               defaultVerticalSpace
            ));

            delete columnSymbol[index];
         }
      }
   });

   return flowFound;
}

function getColumnFromPosX(x: number) {
   return Math.round( (x - baseSize * 0.5) / defaultHorizontalSpace );
}