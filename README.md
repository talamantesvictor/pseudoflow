# PseudoFlow

A free and open source software developed to help programming students learn about control structures by using pseudocode and generating ANSI standard flowcharts of their algorithms in real-time.

[Visit the site](https://www.pseudoflow.app)

![PseudoFlow App](https://www.pseudoflow.app/assets/images/pseudoflow-screenshot.png)

## Features

- **Real-time flowcharts** — Generates ANSI standard flowcharts as you type, rendered with Konva.js on an interactive zoomable canvas.
- **Built-in interpreter** — Run your pseudocode directly in the app with step-by-step execution, variable tracking, and input/output support.
- **Bilingual pseudocode** — Switch between English and Spanish keywords in the Settings panel without changing the language of the UI.
- **Cross-platform** — Desktop apps for Linux, macOS, and Windows (via Tauri), plus a fully functional web version.
- **Code editor** — Custom editor with syntax highlighting, line numbers, tab indentation, and code templates.
- **File management** — Native open/save dialogs on desktop, Blob download on web, with tab-based file naming.

---

## Language Reference

The pseudocode language can be switched between English and Spanish in the app **Settings**.

<table>
  <thead>
    <tr>
      <th style="width:16%">Category</th>
      <th style="width:10%">Language</th>
      <th style="width:40%">Syntax</th>
      <th style="width:34%">Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">Variable declaration</td>
      <td>English</td>
      <td><code>declare</code></td>
      <td><code>declare x = 10</code></td>
    </tr>
    <tr>
      <td>Español</td>
      <td><code>declarar</code></td>
      <td><code>declarar x = 10</code></td>
    </tr>
    <tr>
      <td rowspan="2">Output</td>
      <td>English</td>
      <td><code>print</code></td>
      <td><code>print "Hello World"</code></td>
    </tr>
    <tr>
      <td>Español</td>
      <td><code>imprimir</code></td>
      <td><code>imprimir "Hola Mundo"</code></td>
    </tr>
    <tr>
      <td rowspan="2">Input</td>
      <td>English</td>
      <td><code>read</code></td>
      <td><code>read name</code></td>
    </tr>
    <tr>
      <td>Español</td>
      <td><code>leer</code></td>
      <td><code>leer nombre</code></td>
    </tr>
    <tr>
      <td rowspan="2">If-Else</td>
      <td>English</td>
      <td><code>if</code> … <code>else</code> … <code>endif</code></td>
      <td><code>if (x &gt; 0) print "pos" else print "neg" endif</code></td>
    </tr>
    <tr>
      <td>Español</td>
      <td><code>si</code> … <code>sino</code> … <code>finsi</code></td>
      <td><code>si (x &gt; 0) imprimir "pos" sino imprimir "neg" finsi</code></td>
    </tr>
    <tr>
      <td rowspan="2">Switch-Case</td>
      <td>English</td>
      <td><code>switch</code> … <code>case</code> … <code>endcase</code> … <code>endswitch</code></td>
      <td><code>switch (x) case 1: print "one" endcase case 2: print "two" endcase endswitch</code></td>
    </tr>
    <tr>
      <td>Español</td>
      <td><code>seleccion</code> … <code>caso</code> … <code>fincaso</code> … <code>finseleccion</code></td>
      <td><code>seleccion (x) caso 1: imprimir "uno" fincaso caso 2: imprimir "dos" fincaso finseleccion</code></td>
    </tr>
    <tr>
      <td rowspan="2">Repeat (For)</td>
      <td>English</td>
      <td><code>repeat</code> … <code>for … until … steps</code> … <code>endrepeat</code></td>
      <td><code>repeat (for i = 0 until 10 steps 1) print i endrepeat</code></td>
    </tr>
    <tr>
      <td>Español</td>
      <td><code>repite</code> … <code>para … hasta … pasos</code> … <code>finrepite</code></td>
      <td><code>repite (para i = 0 hasta 10 pasos 1) imprimir i finrepite</code></td>
    </tr>
    <tr>
      <td rowspan="2">While</td>
      <td>English</td>
      <td><code>while</code> … <code>endwhile</code></td>
      <td><code>while (x &gt; 0) print x endwhile</code></td>
    </tr>
    <tr>
      <td>Español</td>
      <td><code>mientras</code> … <code>finmientras</code></td>
      <td><code>mientras (x &gt; 0) imprimir x finmientras</code></td>
    </tr>
    <tr>
      <td rowspan="2">Do-While</td>
      <td>English</td>
      <td><code>dowhile</code> … <code>enddowhile</code></td>
      <td><code>dowhile (x &gt; 0) print x enddowhile</code></td>
    </tr>
    <tr>
      <td>Español</td>
      <td><code>hacermientras</code> … <code>finhacermientras</code></td>
      <td><code>hacermientras (x &gt; 0) imprimir x finhacermientras</code></td>
    </tr>
    <tr>
      <td>Assignment</td>
      <td>—</td>
      <td><code>=</code></td>
      <td><code>x = 5</code></td>
    </tr>
    <tr>
      <td>Arithmetic</td>
      <td>—</td>
      <td><code>+</code> <code>-</code> <code>*</code> <code>/</code> <code>%</code></td>
      <td>Standard operators</td>
    </tr>
    <tr>
      <td>Relational</td>
      <td>—</td>
      <td><code>==</code> <code>!=</code> <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code></td>
      <td>Comparison</td>
    </tr>
    <tr>
      <td rowspan="2">Boolean</td>
      <td>English</td>
      <td><code>and</code> / <code>or</code></td>
      <td>Logical operators</td>
    </tr>
    <tr>
      <td>Español</td>
      <td><code>y</code> / <code>o</code></td>
      <td>Operadores lógicos</td>
    </tr>
    <tr>
      <td>Array literal</td>
      <td>—</td>
      <td><code>[1, 2, 3]</code></td>
      <td>Comma-separated elements</td>
    </tr>
    <tr>
      <td>Array index</td>
      <td>—</td>
      <td><code>arr[i]</code></td>
      <td>Zero-based indexing</td>
    </tr>
    <tr>
      <td rowspan="2">Array length</td>
      <td>English</td>
      <td><code>.length</code></td>
      <td><code>arr.length</code></td>
    </tr>
    <tr>
      <td>Español</td>
      <td><code>.longitud</code></td>
      <td><code>arr.longitud</code></td>
    </tr>
    <tr>
      <td>Single line comment</td>
      <td>—</td>
      <td><code>//</code></td>
      <td><code>// this is a comment</code></td>
    </tr>
    <tr>
      <td>Multi line comment</td>
      <td>—</td>
      <td><code>/* */</code></td>
      <td><code>/* block comment */</code></td>
    </tr>
  </tbody>
</table>

Strings can be enclosed in single (`'`) or double (`"`) quotes.

---

## Target Platforms

- Linux
- macOS
- Windows
- Web

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [Svelte 3](https://svelte.dev/) + TypeScript |
| Styling | SCSS |
| Flowchart canvas | [Konva.js](https://konvajs.org/) |
| Desktop shell | [Tauri](https://tauri.app/) v1 (Rust) |
| Bundler | [Vite](https://vitejs.dev/) 3 |
| L10n | Custom JSON-based i18n (EN / ES) |

---

## Development

This project is currently under active development, with planned features in the pipeline. We dedicate our free time to making progress and improving PseudoFlow. We would like to express our gratitude for the support of everyone involved and sincerely appreciate your collaboration and feedback as we collectively shape the future of PseudoFlow.

If you are interested in contributing and are unsure where to start, please feel free to reach out to [@talamantesvictor](https://github.com/talamantesvictor) to get started.

**Roadmap:** [https://github.com/users/talamantesvictor/projects/1](https://github.com/users/talamantesvictor/projects/1)

---

## Donations

By donating, you are helping the author support this and other open-source projects and activities, contributing to a better and freer world where we can all pursue and do what we love.

<a href='https://ko-fi.com/Q5Q4D7835' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

---

## About the author

Victor Talamantes, a dedicated programmer and tech enthusiast, started coding at the age of 12 and soon began earning income through his own video game portal. In addition to his studies, he founded a Video Game Programmers Association and went on to establish Binmatter, a highly respected software development company in Mexico. Recently, Victor has expanded his influence as a digital creator, producing video content on platforms such as YouTube and TikTok.

[Visit Victor's site](https://www.victortalamantes.com) (Spanish)

---

## License

BSD 3-Clause License.
