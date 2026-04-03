"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderRenderer = void 0;
const Colors_1 = require("./Colors");
/**
 * Renders the "ports" branded header box.
 */
class HeaderRenderer {
    constructor() {
        this.BOX_WIDTH = 65;
    }
    render(options = {}) {
        const title = '🔊 ports';
        const tagline = 'listening to your ports...';
        const watchLabel = 'watching · Ctrl+C exit';
        const top = `┌${'─'.repeat(this.BOX_WIDTH)}┐`;
        const bottom = `└${'─'.repeat(this.BOX_WIDTH)}┘`;
        let titleLine;
        let taglineLine;
        if (options.watchMode) {
            const gap = this.BOX_WIDTH - title.length - watchLabel.length - 2;
            titleLine = `│  ${Colors_1.Colors.brand(title)}${' '.repeat(Math.max(0, gap))}${Colors_1.Colors.watching(watchLabel)}  │`;
            taglineLine = `│  ${Colors_1.Colors.tagline(tagline)}${' '.repeat(this.BOX_WIDTH - tagline.length - 2)}│`;
        }
        else {
            titleLine = `│  ${Colors_1.Colors.brand(title)}${' '.repeat(this.BOX_WIDTH - title.length - 2)}│`;
            taglineLine = `│  ${Colors_1.Colors.tagline(tagline)}${' '.repeat(this.BOX_WIDTH - tagline.length - 2)}│`;
        }
        return [top, titleLine, taglineLine, bottom].join('\n');
    }
}
exports.HeaderRenderer = HeaderRenderer;
//# sourceMappingURL=HeaderRenderer.js.map