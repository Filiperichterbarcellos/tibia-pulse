import axios from 'axios';
import * as cheerio from 'cheerio';

export type CharacterSummary = {
  name: string;
  world?: string;
  vocation?: string;
  level?: number;
  residence?: string;
  guild?: string;
  last_login?: string;
};

export async function getCharacter(name: string): Promise<CharacterSummary> {
  const url = `https://www.tibia.com/community/?subtopic=characters&name=${encodeURIComponent(
    name
  )}`;

  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Tibia Pulse)' },
    });

    const $ = cheerio.load(data);
    const nameLabel = $('td:contains("Name:")').next().text().trim();
    const world = $('td:contains("World:")').next().text().trim();
    const vocation = $('td:contains("Vocation:")').next().text().trim();
    const levelText = $('td:contains("Level:")').next().text().trim();
    const level = parseInt(levelText, 10);
    const residence = $('td:contains("Residence:")').next().text().trim();
    const guild =
      $('td:contains("Guild membership:")').next().text().trim() || undefined;
    const last_login = $('td:contains("Last Login:")').next().text().trim();

    if (!nameLabel) {
      const title = $('title').text();
      if (title.includes('Character Information')) {
        throw Object.assign(new Error('not-found'), { code: 404 });
      }
    }

    return {
      name: nameLabel || name,
      world,
      vocation,
      level: isNaN(level) ? undefined : level,
      residence,
      guild,
      last_login,
    };
  } catch (err: any) {
    if (err.code === 404) {
      throw err;
    }
    console.error('[Tibia.com] scraping error:', err.message);
    const e: any = new Error('upstream failure');
    e.code = 502;
    throw e;
  }
}
