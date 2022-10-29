import Konva from 'konva';

export function terminatorSymbol(baseSize: number, space: {x: number, y: number}) {
   return new Konva.Rect({
      x: space.x + baseSize * 0.4,
      y: space.y,
      width: baseSize * 0.2,
      height: baseSize * 0.1,
      fill: '#3f4254',
      cornerRadius: 20,
      opacity: 1
   });
}

export function taskSymbol(baseSize: number, space: {x: number, y: number}) {
   return new Konva.Rect({
      x: space.x + baseSize * 0.25,
      y: space.y,
      width: baseSize * 0.5,
      height: baseSize * 0.15,
      fill: '#00ff95',
      opacity: 1
   });
}

export function decisionSymbol(baseSize: number, space: {x: number, y: number}) {
   return new Konva.Line({
      points: [
         space.x + baseSize * 0.5,  space.y, 
         space.x + baseSize * 0.65, space.y + baseSize * 0.15,
         space.x + baseSize * 0.5,  space.y + baseSize * 0.3,
         space.x + baseSize * 0.35, space.y + baseSize * 0.15,
      ],
      fill: '#f1c232',
      closed: true,
   });
}

export function dataSymbol(baseSize: number, space: {x: number, y: number}) {
   return new Konva.Line({
      points: [
         space.x + baseSize * 0.3,  space.y, 
         space.x + baseSize * 0.75, space.y, 
         space.x + baseSize * 0.7,  space.y + baseSize * 0.15,
         space.x + baseSize * 0.25, space.y + baseSize * 0.15
      ],
      fill: '#00D2FF',
      closed: true,
   });
}

export function arrowSymbol(baseSize: number, space: {x: number, y: number}) {
   return new Konva.Arrow({
      x: space.x + baseSize * 0.5,
      y: space.y,
      points: [0, 0, baseSize * 0.4, 0, baseSize * 0.4, 50],
      pointerLength: 10,
      pointerWidth: 10,
      fill: '#3f4254',
      stroke: '#3f4254',
      strokeWidth: 2,
    });
}