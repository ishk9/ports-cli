import { Colors } from './Colors';

interface HeaderOptions {
  watchMode?: boolean;
}

/**
 * Renders the "ports" branded header box.
 */
export class HeaderRenderer {
  private readonly BOX_WIDTH = 65;

  render(options: HeaderOptions = {}): string {
    const title = '🔊 ports';
    const tagline = 'listening to your ports...';
    const watchLabel = 'watching · Ctrl+C exit';

    const top = `┌${'─'.repeat(this.BOX_WIDTH)}┐`;
    const bottom = `└${'─'.repeat(this.BOX_WIDTH)}┘`;

    let titleLine: string;
    let taglineLine: string;

    if (options.watchMode) {
      const gap = this.BOX_WIDTH - title.length - watchLabel.length - 2;
      titleLine = `│  ${Colors.brand(title)}${' '.repeat(Math.max(0, gap))}${Colors.watching(watchLabel)}  │`;
      taglineLine = `│  ${Colors.tagline(tagline)}${' '.repeat(this.BOX_WIDTH - tagline.length - 2)}│`;
    } else {
      titleLine = `│  ${Colors.brand(title)}${' '.repeat(this.BOX_WIDTH - title.length - 2)}│`;
      taglineLine = `│  ${Colors.tagline(tagline)}${' '.repeat(this.BOX_WIDTH - tagline.length - 2)}│`;
    }

    return [top, titleLine, taglineLine, bottom].join('\n');
  }
}
