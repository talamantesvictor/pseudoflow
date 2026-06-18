export interface ChartPalette {
   terminator: string;
   task: string;
   data: string;
   decision: string;
   arrow: string;
   loopArrow: string;
   text: string;
   whiteLabel: string;
   switchTask: string;
   caseDiamond: string;
   repeatDecision: string;
   forIncrement: string;
}

const draculaChart: ChartPalette = {
   terminator: '#4d5166',
   task: '#00ff95',
   data: '#24a7ff',
   decision: '#f1c232',
   arrow: '#4d5166',
   loopArrow: '#66295c',
   text: '#000000',
   whiteLabel: '#ffffff',
   switchTask: '#ffd23e',
   caseDiamond: '#ff7070',
   repeatDecision: '#ff66e5',
   forIncrement: '#ff7070',
};

const monokaiChart: ChartPalette = {
   terminator: '#727072',
   task: '#a6e22e',
   data: '#66d9ef',
   decision: '#f4bf75',
   arrow: '#727072',
   loopArrow: '#ae81ff',
   text: '#272822',
   whiteLabel: '#f8f8f2',
   switchTask: '#e6db74',
   caseDiamond: '#f92672',
   repeatDecision: '#ae81ff',
   forIncrement: '#fd971f',
};

const githubLightChart: ChartPalette = {
   terminator: '#d0d7de',
   task: '#54aeff',
   data: '#1f883d',
   decision: '#d4a72c',
   arrow: '#656d76',
   loopArrow: '#8250df',
   text: '#1f2328',
   whiteLabel: '#1f2328',
   switchTask: '#bf8700',
   caseDiamond: '#cf222e',
   repeatDecision: '#8250df',
   forIncrement: '#bf8700',
};

export const chartPalettes: Record<string, ChartPalette> = {
   dracula: draculaChart,
   monokai: monokaiChart,
   'github-light': githubLightChart,
};
