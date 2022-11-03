import Konva from 'konva';

export function terminatorSymbol(baseSize: number, position: { x: number, y: number }, color: string = '#3f4254') {
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
         baseSize * 0.2, 0,
         baseSize * 0.4, baseSize * 0.1,
         baseSize * 0.2, baseSize * 0.2,
         0, baseSize * 0.1,
      ],
      width: baseSize * 0.4,
      height: baseSize * 0.2,
      offsetX: baseSize * 0.2,
      offsetY: baseSize * 0.1,
      fill: color,
      closed: true
   });
}

export function arrowSymbol(baseSize: number, position: { x: number, y: number }, color: string = '#3f4254') {
   return new Konva.Arrow({
      x: position.x + baseSize * 0.5,
      y: position.y,
      points: [0, 0, baseSize * 0.4, 0, baseSize * 0.4, 50],
      pointerLength: 10,
      pointerWidth: 10,
      fill: color,
      stroke: color,
      strokeWidth: 2,
   });
}

export function textLabel(label: string, position: { x: number, y: number }, dimensions: { width: number, height: number }) {
   return new Konva.Text({
      x: position.x,
      y: position.y,
      text: label,
      fontSize: 22,
      fontFamily: 'Calibri',
      align: 'center',
      verticalAlign: 'middle',
      ellipsis: true,
      width: dimensions.width * 0.84,
      height: dimensions.height * 0.7,
      offsetX: dimensions.width * 0.42,
      offsetY: dimensions.height * 0.35
   });
}