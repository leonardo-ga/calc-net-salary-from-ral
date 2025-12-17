# Calc Net Salary From RAL

An Angular web application to calculate **net salary** from your **RAL (Reddito Annuo Lordo / Annual Gross Salary)**. Designed to give Italian employees an estimate of their take-home pay after taxes and contributions.

## Features

* Input your RAL and get estimated **monthly and yearly net salary**.
* Applies **Italian tax logic** (IRPEF, INPS contributions, local taxes).
* Simple **Angular 17 front-end interface**.
* Live calculations as you input values.

## Installation

### Prerequisites

* Node.js v16+
* npm
* Angular CLI (optional)

### Steps

```bash
git clone https://github.com/leonardo-ga/calc-net-salary-from-ral.git
cd calc-net-salary-from-ral
npm install
```

### Run Development Server

```bash
ng serve
```

Open your browser at `http://localhost:4200/`. The app reloads automatically when you change source files.

### Build for Production

```bash
ng build
```

Build artifacts will be stored in `docs/`.

## How It Works

1. Enter your **annual gross salary (RAL)**.
2. The app calculates:

   * Employee **social security contributions (INPS)**
   * **Income tax (IRPEF)** based on progressive rates
   * Regional and municipal surcharges
3. Displays **monthly and yearly net salary**.

## Project Structure

```
src/
├── app/           # Angular components & logic
├── assets/        # Static assets
└── index.html     # Entry point
```

## License

MIT License © 2025 leonardo-ga

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

