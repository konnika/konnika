class IconComponent extends HTMLElement {
    canvas
    ctx
    colorPicker
    textColorPicker
    transparentCheckbox
    nameInput
    textInput
    emojiPickerBtn
    emojiPopup

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

    draw(ctx, width, height, text, backgroundColor, textColor, lineCount, isTransparent) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, width, height);
        if (!isTransparent) {
            ctx.fillStyle = backgroundColor;
            ctx.beginPath();
            ctx.roundRect(0, 0, width, height, (width + height) / 2 / 5);
            ctx.fill();
        }
        let fontSize = 360;
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = "center";
        const lines = text.split(',');
        let textSize = ctx.measureText(lines[0]);
        while (textSize.width > width * 0.6) {
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
        this.draw(ctx, this.canvas.width, this.canvas.height, this.textInput.value, this.colorPicker.value, this.textColorPicker.value, null, this.transparentCheckbox.checked);
    }

    connectHtmlElements() {
        this.colorPicker = this.shadowRoot.getElementById("colorPicker");
        this.textColorPicker = this.shadowRoot.getElementById("textColorPicker");
        this.transparentCheckbox = this.shadowRoot.getElementById("transparentCheckbox");
        this.nameInput = this.shadowRoot.getElementById("nameInput");
        this.textInput = this.shadowRoot.getElementById("textInput");
        this.canvas = this.shadowRoot.getElementById("labCanvas");
        this.emojiPickerBtn = this.shadowRoot.getElementById("emojiPickerBtn");
        this.emojiPopup = this.shadowRoot.getElementById("emojiPopup");
    }

    initValues() {
        // Initialfarben setzen
        this.colorPicker.value = '#0ddeb4';
        this.textColorPicker.value = '#1969ae';
        this.updateCanvas();
    }

    addEventListeners() {
        this.colorPicker.addEventListener("input", () => this.updateCanvas());
        this.textColorPicker.addEventListener("input", () => this.updateCanvas());
        this.transparentCheckbox.addEventListener("change", () => this.updateCanvas());
        this.textInput.addEventListener("input", () => this.updateCanvas());
        this.shadowRoot.getElementById("saveBtn").addEventListener("click", () => this.download());
        this.shadowRoot.getElementById("randomizeBtn").addEventListener("click", () => {
            this.colorPicker.value = this.randomColor();
            this.textColorPicker.value = this.randomColor();
            this.updateCanvas();
        });
        this.emojiPickerBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggleEmojiPopup();
        });
        this.shadowRoot.querySelectorAll(".emoji-item").forEach(emoji => {
            emoji.addEventListener("click", () => this.insertEmoji(emoji.textContent));
        });
        // Close popup when clicking outside
        document.addEventListener("click", (e) => {
            if (this.emojiPopup.style.display === "block" && !this.emojiPopup.contains(e.target)) {
                this.emojiPopup.style.display = "none";
            }
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

    toggleEmojiPopup() {
        const isVisible = this.emojiPopup.style.display === "block";
        this.emojiPopup.style.display = isVisible ? "none" : "block";
    }

    insertEmoji(emoji) {
        this.textInput.value = emoji;
        this.updateCanvas();
        this.emojiPopup.style.display = "none";
    }

    generateEmojiHTML() {
        return EMOJI_DATA.map(category => `
            <div class="emoji-category">
                <div class="emoji-category-title">${category.title}</div>
                ${category.emojis.map(emoji => `<span class="emoji-item">${emoji}</span>`).join('')}
            </div>
        `).join('');
    }

    html() {
        return `<div>
            <label for="nameInput">Icon name</label>
            <input type="text" id="nameInput" value="favicon" style="margin-right: 0px;"/>
            <span style="margin-left: 0px;">.png</span>
        </div>
        <div>
            <label for="textInput">Icon text</label>
            <input type="text" id="textInput" value="DI,VA"/>
            <button id="emojiPickerBtn" type="button">😀</button>
            <div id="emojiPopup" class="emoji-popup">
                ${this.generateEmojiHTML()}
            </div>
        </div>
        <div>
            <label for="colorPicker">Background color</label>
            <input type="color" id="colorPicker"/>
            <label for="transparentCheckbox" style="margin-left: 10px;">Transparent</label>
            <input type="checkbox" id="transparentCheckbox"/>
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
            #emojiPickerBtn {
            font-size: 1.2em;
            padding: 0.2em 0.5em;
            cursor: pointer;
            border: 1px solid #ccc;
            background: white;
            border-radius: 4px;
        }
            #emojiPickerBtn:hover {
            background: #f0f0f0;
        }
            .emoji-popup {
            display: none;
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 600px;
            max-height: 400px;
            overflow-y: auto;
            z-index: 1000;
            margin-top: 5px;
        }
            .emoji-category {
            margin-bottom: 15px;
        }
            .emoji-category-title {
            font-weight: bold;
            font-size: 0.9em;
            color: #555;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }
            .emoji-item {
            display: inline-block;
            font-size: 1.5em;
            padding: 5px;
            cursor: pointer;
            border-radius: 4px;
            transition: background 0.2s;
        }
            .emoji-item:hover {
            background: #f0f0f0;
        }
        </style>
            `;
    }
}

customElements.define('icon-component', IconComponent);
