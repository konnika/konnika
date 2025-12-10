class IconComponent extends HTMLElement {
    canvas
    ctx
    colorPicker
    textColorPicker
    nameInput
    textInput

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
        this.connectHtmlElements();
        this.initValues();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = this.html()
    }

    randomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    draw(ctx, width, height, text, backgroundColor, textColor, lineCount) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = backgroundColor;
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, (width + height) / 2 / 5);
        ctx.fill();
        let fontSize = 360;
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = "center";
        const lines = text.split(',');
        let textSize = ctx.measureText(lines[0]);
        while (textSize.width > width * 0.9) {
            fontSize *= 0.95;
            ctx.font = `bold ${fontSize}px Arial`;
            textSize = ctx.measureText(lines[0]); // TODO use the longest line AND consider lineCount
        }
        const textHeight = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent;
        const y = height / 2;
        if (lines.length === 1) {
            ctx.fillText(lines[0], width / 2, y + textHeight / 2);
        } else if (lines.length === 2) {
            ctx.fillText(lines[0], width / 2, y - textHeight * 0.05);
            ctx.fillText(lines[1], width / 2, y + textHeight);
        } else if (lines.length === 3) {
            ctx.fillText(lines[0], width / 2, y - textHeight * 0.9);
            ctx.fillText(lines[1], width / 2, y + textHeight * 0.15);
            ctx.fillText(lines[2], width / 2, y + textHeight * 1.2);
        } // TODO write a loop instead of hardcoding
    }

    updateCanvas() {
        const ctx = this.canvas.getContext("2d");
        this.draw(ctx, this.canvas.width, this.canvas.height, this.textInput.value, this.colorPicker.value, this.textColorPicker.value);
    }

    connectHtmlElements() {
        this.colorPicker = this.shadowRoot.getElementById("colorPicker");
        this.textColorPicker = this.shadowRoot.getElementById("textColorPicker");
        this.nameInput = this.shadowRoot.getElementById("nameInput");
        this.textInput = this.shadowRoot.getElementById("textInput");
        this.canvas = this.shadowRoot.getElementById("labCanvas");
    }

    initValues() {
        // Initialfarben setzen
        this.colorPicker.value = this.randomColor();
        this.textColorPicker.value = this.randomColor();
        this.updateCanvas();
    }

    addEventListeners() {
        this.colorPicker.addEventListener("input", () => this.updateCanvas());
        this.textColorPicker.addEventListener("input", () => this.updateCanvas());
        this.textInput.addEventListener("input", () => this.updateCanvas());
        this.shadowRoot.getElementById("saveBtn").addEventListener("click", () => this.download());
        this.shadowRoot.getElementById("randomizeBtn").addEventListener("click", () => {
            this.colorPicker.value = this.randomColor();
            this.textColorPicker.value = this.randomColor();
            this.updateCanvas();
        });
    }

    download() {
        const imageURL = this.canvas.toDataURL("image/png");
        const name = this.nameInput.value || "favicon";
        const a = document.createElement("a");
        a.href = imageURL;
        a.download = `${name}.png`;
        a.click();
    }

    html() {
        return `<div>
            <label for="nameInput">Icon name</label>
            <input type="text" id="nameInput" value="favicon" style="margin-right: 0px;"/>
            <span style="margin-left: 0px;">.png</span>
        </div>
        <div>
            <label for="textInput">Icon text</label>
            <input type="text" id="textInput" value="GA#2"/>
        </div>
        <div>
            <label for="colorPicker">Background color</label>
            <input type="color" id="colorPicker"/>
        </div>
        <div>
            <label for="textColorPicker">Text color</label>
            <input type="color" id="textColorPicker"/>
        </div>
        <button id="randomizeBtn">Randomize Colors</button>
        <br>
        <canvas id="labCanvas" width="512" height="512"></canvas>
        <br>
        <button id="saveBtn">Download</button>
        ${this.style()}`;
    }

    style() {
        return `<style>
            label, input, button {
            font-size: 1.1em;
            margin: 0.3em;
        }
            canvas {
            margin-top: 10px;
            box-shadow: 0 2px 12px rgba(100, 100, 150, 0.08);
        }
        </style>
            `;
    }
}

customElements.define('icon-component', IconComponent);
