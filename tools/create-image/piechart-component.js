class PiechartComponent extends HTMLElement {
    parts
    valueInputs
    textInputs
    colorPickers

    constructor() {
        super();
        this.parts = [];
        this.parts = [
            { color: this.randomColor(), text: 'X', value: 50 },
            { color: this.randomColor(), text: 'Y', value: 30 },
            { color: this.randomColor(), text: 'Z', value: 20 }
        ];
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
        this.connectHtmlElements();
        this.initValues();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = this.html();
    }

    randomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    drawPieChart() {
        const values = this.parts.map(p => Number(this.shadowRoot.getElementById(`pieValue_${p.text}`).value));
        const labels = this.parts.map(p => this.shadowRoot.getElementById(`pieText_${p.text}`).value);
        const colors = this.parts.map(p => this.shadowRoot.getElementById(`pieColor_${p.text}`).value);
        const data = [{
            values,
            labels,
            type: 'pie',
            marker: {colors},
            textinfo: 'percent',
            textfont: {size: 24}
        }];
        const layout = {
            width: 512,
            height: 512,
            margin: {l: 0, r: 0, t: 16, b: 16}, // Viel mehr Platz unten für Legende
            showlegend: true,
            legend: {orientation: 'h', x: 0.5, xanchor: 'center', y: 1.1 }, // Legende deutlich unterhalb des Charts
            paper_bgcolor: '#f7f6fd'
        };
        if (window.Plotly) {
            Plotly.newPlot(this.shadowRoot.getElementById('plotlyDiv'), data, layout, {staticPlot: true});
        } else {
            this.shadowRoot.getElementById('plotlyDiv').innerHTML = '<span style="color:red">Plotly.js nicht geladen!</span>';
        }
    }

    updateChart() {
        this.drawPieChart();
    }

    connectHtmlElements() {
        this.valueInputs = this.parts.map(p => this.shadowRoot.getElementById(`pieValue_${p.text}`));
        this.textInputs = this.parts.map(p => this.shadowRoot.getElementById(`pieText_${p.text}`));
        this.colorPickers = this.parts.map(p => this.shadowRoot.getElementById(`pieColor_${p.text}`));
    }

    initValues() {
        this.parts.forEach((part, i) => {
            this.valueInputs[i].value = part.value;
            this.textInputs[i].value = part.text;
            this.colorPickers[i].value = part.color = this.randomColor();
        });
        this.updateChart();
    }

    addEventListeners() {
        [...this.valueInputs, ...this.textInputs, ...this.colorPickers].forEach(input => {
            input.addEventListener("input", () => this.updateChart());
        });
        this.shadowRoot.getElementById("randomizeBtn").addEventListener("click", () => this.initValues());
        this.shadowRoot.getElementById("addPartBtn").addEventListener("click", () => {
            const nextChar = String.fromCharCode(65 + this.parts.length); // A, B, C, ...
            this.addPart({color: this.randomColor(), text: nextChar, value: 10});
        });
        this.shadowRoot.querySelectorAll('.deletePartBtn').forEach(btn => {
            btn.addEventListener('click', e => {
                const idx = Number(btn.getAttribute('data-index'));
                this.deletePart(idx);
            });
        });
        // Save-Button als Arrow Function, damit this korrekt ist
        this.shadowRoot.getElementById("saveBtn").addEventListener("click", () => this.download());
    }

    download() {
        if (window.Plotly) {
            Plotly.downloadImage(this.shadowRoot.getElementById('plotlyDiv'), {
                format: 'png',
                width: 512,
                height: 512,
                filename: 'piechart'
            });
        }
    }

    html() {
        return `
        <div id="partsContainer">
            ${this.parts.map((p, i) => `
                <div>
                    <label for="pieValue_${p.text}">Wert</label>
                    <input type="number" id="pieValue_${p.text}" value="${p.value}" min="0" max="100" style="width:60px;" />
                    <label for="pieText_${p.text}">Text</label>
                    <input type="text" id="pieText_${p.text}" value="${p.text}" style="width:40px;" />
                    <label for="pieColor_${p.text}">Farbe</label>
                    <input type="color" id="pieColor_${p.text}" value="${p.color}" />
                    <button class="deletePartBtn" data-index="${i}" title="Teil löschen" style="background:none;border:none;cursor:pointer;padding:0 0.5em;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b71c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </div>
            `).join('')}
        </div>
        <button id="addPartBtn">Add Part</button>
        <button id="randomizeBtn">Randomize Colors</button>
        <button id="saveBtn">Download</button>
        <br>
        <div id="plotlyDiv" style="width:512px;height:512px;"></div>
        ${this.style()}
        `;
    }

    style() {
        return `<style>
            label, input, button {
                font-size: 1.1em;
                margin: 0.3em;
            }
            #partsContainer {
                display: flex;
                flex-direction: column;
                gap: 0.5em;
                margin-bottom: 1em;
            }
            #partsContainer > div {
                display: flex;
                align-items: center;
                gap: 0.5em;
            }
            #plotlyDiv {
                margin-top: 10px;
                box-shadow: 0 2px 12px rgba(100, 100, 150, 0.08);
                background: #f7f6fd;
            }
        </style>`
    }

    addPart(part = {color: this.randomColor(), text: 'Teil', value: 10}) {
        this.parts.push(part);
        this.render();
        this.connectHtmlElements();
        this.initValues();
        this.addEventListeners();
    }

    deletePart(index) {
        if (this.parts.length > 1) {
            this.parts.splice(index, 1);
            this.render();
            this.connectHtmlElements();
            this.initValues();
            this.addEventListeners();
        }
    }
}

customElements.define('piechart-component', PiechartComponent);
