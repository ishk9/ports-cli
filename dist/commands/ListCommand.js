"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCommand = void 0;
const PortScanner_1 = require("../core/PortScanner");
const HeaderRenderer_1 = require("../renderers/HeaderRenderer");
const TableRenderer_1 = require("../renderers/TableRenderer");
const Colors_1 = require("../renderers/Colors");
/**
 * Handles `ports` and `ports --all`.
 */
class ListCommand {
    constructor(options, scanner) {
        this.options = options;
        this.scanner = scanner ?? new PortScanner_1.PortScanner();
        this.headerRenderer = new HeaderRenderer_1.HeaderRenderer();
        this.tableRenderer = new TableRenderer_1.TableRenderer();
    }
    async execute() {
        const entries = await this.scanner.scan(!this.options.showAll);
        console.log('\n' + this.headerRenderer.render());
        console.log('');
        if (entries.length === 0) {
            console.log(`  ${Colors_1.Colors.dim('No active ports found.')}`);
        }
        else {
            console.log(this.tableRenderer.render(entries));
        }
        console.log('');
        console.log(this.buildFooter(entries.length));
        console.log('');
    }
    buildFooter(count) {
        const parts = [
            `${count} port${count !== 1 ? 's' : ''} active`,
            'Run ports <number> for details',
        ];
        if (!this.options.showAll) {
            parts.push('--all to show everything');
        }
        return '  ' + Colors_1.Colors.dim(parts.join('  ·  '));
    }
}
exports.ListCommand = ListCommand;
//# sourceMappingURL=ListCommand.js.map