import Konva from 'konva';

export function terminatorSymbol(baseSize: number) {
   return new Konva.Rect({
      x: baseSize * 0.4,
      y: 20,
      width: baseSize * 0.2,
      height: baseSize * 0.1,
      fill: '#3f4254',
      cornerRadius: 20,
      opacity: 1
   });
}

export function taskSymbol(baseSize: number) {
   return new Konva.Rect({
      x: baseSize * 0.25,
      y: 100,
      width: baseSize * 0.5,
      height: baseSize * 0.15,
      fill: '#00ff95',
      opacity: 1
   });
}

export function decisionSymbol(baseSize: number) {
   return new Konva.Line({
      points: [
         baseSize * 0.5,  200, 
         baseSize * 0.75, 200 + baseSize * 0.2,
         baseSize * 0.5,  200 + baseSize * 0.4,
         baseSize * 0.25, 200 + baseSize * 0.2,
      ],
      fill: '#f1c232',
      closed: true,
   });
}

export function dataSymbol(baseSize: number) {
   return new Konva.Line({
      points: [
         baseSize * 0.3,  550, 
         baseSize * 0.75, 550, 
         baseSize * 0.7,  550 + baseSize * 0.15,
         baseSize * 0.25, 550 + baseSize * 0.15
      ],
      fill: '#00D2FF',
      closed: true,
   });
}

export function arrowSymbol(baseSize: number) {
   new Konva.Arrow({
      x: baseSize * 0.5,
      y: 400 + baseSize * 0.1,
      points: [0, 0, baseSize * 0.4, 0, baseSize * 0.4, 50],
      pointerLength: 10,
      pointerWidth: 10,
      fill: '#3f4254',
      stroke: '#3f4254',
      strokeWidth: 2,
    });
}