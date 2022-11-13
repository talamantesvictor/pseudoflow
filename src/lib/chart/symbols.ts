import Konva from 'konva';

export function emptySymbol(position: { x: number, y: number }) {
   return new Konva.Shape({
      x: position.x,
      y: position.y,
      widh: 0,
      height: 0,
   });
}

export function terminatorSymbol(baseSize: number, position: { x: number, y: number }, color: string = '#4d5166') {
   return new Konva.Rect({
      x: position.x,
      y: position.y,
      width: baseSize * 0.2,
      height: baseSize * 0.1,
      offsetX: baseSize * 0.1,
      offsetY: baseSize * 0.05,
      fill: color,
      cornerRadius: 20,
      opacity: 1
   });
}

export function taskSymbol(baseSize: number, position: { x: number, y: number }, color: string = '#00ff95') {
   return new Konva.Rect({
      x: position.x,
      y: position.y,
      width: baseSize * 0.5,
      height: baseSize * 0.2,
      offsetX: baseSize * 0.25,
      offsetY: baseSize * 0.1,
      fill: color,
      opacity: 1
   });
}

export function dataSymbol(baseSize: number, position: { x: number, y: number }, color: string = '#24a7ff') {
   return new Konva.Line({
      x: position.x,
      y: position.y,
      points: [
         baseSize * 0.05, 0,
         baseSize * 0.5, 0,
         baseSize * 0.45, baseSize * 0.2,
         0, baseSize * 0.2
      ],
      width: baseSize * 0.5,
      height: baseSize * 0.2,
      offsetX: baseSize * 0.25,
      offsetY: baseSize * 0.1,
      fill: color,
      closed: true
   });
}

export function decisionSymbol(baseSize: number, position: { x: number, y: number }, color: string = '#f1c232') {
   return new Konva.Line({
      x: position.x,
      y: position.y,
      points: [
         baseSize * 0.25, 0,
         baseSize * 0.5, baseSize * 0.1,
         baseSize * 0.25, baseSize * 0.2,
         0, baseSize * 0.1,
      ],
      width: baseSize * 0.5,
      height: baseSize * 0.2,
      offsetX: baseSize * 0.25,
      offsetY: baseSize * 0.1,
      fill: color,
      closed: true
   });
}

export function arrowSymbol(
   origPosition: { x: number, y: number }, 
   destPosition: { x: number, y: number },
   objectDimensions: { width: number, height: number },
   verticalSpace: number,
   color: string = '#4d5166'
){
   const stroke = 6;
   let substractX = destPosition.x > origPosition.x? objectDimensions.width * 0.5 + stroke : -stroke;
   let substractY = destPosition.y > origPosition.y? objectDimensions.height * 0.5 + stroke : stroke;

   if (destPosition.x < origPosition.x && destPosition.y !== origPosition.y ) {
      substractY += verticalSpace * 0.5;
   }
   else if (destPosition.x > origPosition.x && destPosition.y !== origPosition.y ) {
      substractX = stroke;
   }

   let points = [ 0, 0, 0, destPosition.y - origPosition.y - substractY ];

   if (destPosition.x !== origPosition.x) {
      points.push(destPosition.x - origPosition.x - substractX);
      points.push(destPosition.y - origPosition.y - substractY);
   }

   return new Konva.Arrow({
      x: origPosition.x,
      y: origPosition.y,
      points: points,
      pointerLength: 10,
      pointerWidth: 20,
      stroke: color,
      strokeWidth: stroke,
   });
}

export function autoReturnArrowSymbol(
   position: {x: number, y: number},
   space: number,
   width: number,
   height: number,
   color: string = '#4d5166'
) {
   const stroke = 6;

   height -= space * 1.5;

   const points = [
      0, 0,
      space * 1.6 + width, 0,
      space * 1.6 + width, space * 0.85 + height,
      space * 1.6 + width, space * 0.85 + height,
      stroke, space * 0.85 + height
   ]

   return new Konva.Arrow({
      x: position.x,
      y: position.y,
      points: points,
      pointerLength: 10,
      pointerWidth: 20,
      stroke: color,
      strokeWidth: stroke,
   });
}

export function loopArrowSymbol(
   origPosition: {x: number, y: number}, 
   destPosition: {x: number, y: number},
   space: number,
   verticalOffset: number = 0,
   horizontalBoundary: number = 0,
   color: string = '#66295c'
) {

   const stroke = 6;
   let distanceX = origPosition.x - destPosition.x;
   let distanceY = origPosition.y - destPosition.y;

   let points: any = [];

   if (distanceX > 0 || distanceY) {

      if (horizontalBoundary) {
         horizontalBoundary = horizontalBoundary - origPosition.x;
      }

      const addHeight = verticalOffset? space: 0;

      points = [
         0, 0,
         0, verticalOffset,
         horizontalBoundary - space * 0.6, verticalOffset,
         horizontalBoundary - space * 0.6, -distanceY - addHeight,
      ]

      if (distanceX > 0) {
         points = points.concat([
            -distanceX + space, -distanceY - addHeight
         ])
      }

      points = points.concat(([
         -distanceX + space * 0.2, -distanceY - addHeight * 0.55
      ]));
   }
   else {
      points = [
         0, 0,
         -space * 1.5, 0,
         -space * 1.5, - space ,
         -stroke, - space
      ]
   }

   return new Konva.Arrow({
      x: origPosition.x,
      y: origPosition.y,
      points: points,
      pointerLength: 10,
      pointerWidth: 20,
      stroke: color,
      strokeWidth: stroke,
   });
}

export function textLabel(label: string, position: { x: number, y: number }, dimensions: { width: number, height: number }) {
   return new Konva.Text({
      x: position.x,
      y: position.y,
      text: label,
      fontSize: 26,
      fontFamily: 'Calibri',
      align: 'center',
      verticalAlign: 'middle',
      ellipsis: true,
      width: dimensions.width * 0.84,
      height: dimensions.height * 0.7,
      offsetX: dimensions.width * 0.42,
      offsetY: dimensions.height * 0.35,
   });
}