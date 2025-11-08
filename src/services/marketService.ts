import { http } from './http';

export type Auction = {
  id: number;
  name: string;
  level: number;
  world: string;
  vocation: string;
  bid: number;
  endDate: string; // ISO
  url: string;
};

type Filters = {
  world?: string;
  vocation?: string;
  minLevel?: number;
  maxLevel?: number;
};

export async function getAuctions(filters: Filters): Promise<Auction[]> {
  // TROCAR DEPOIS: monte a URL do provedor real (TibiaData/ExevoPan) e mapeie o retorno
  // const { data } = await http.get('<URL_DO_PROVEDOR>', { params: { ...filters } });
  // return data.auctions.map(mapper);

  // MVP: dado local só pra habilitar a tela do front
  const sample: Auction[] = [{
    id: 123,
    name: 'Dodaq',
    level: 331,
    world: 'Issobra',
    vocation: 'Paladin',
    bid: 1450,
    endDate: new Date(Date.now() + 36e5).toISOString(),
    url: 'https://www.tibia.com/charactertrade/?auctionid=123'
  }];

  return sample.filter(a => {
    if (filters.world && a.world !== filters.world) return false;
    if (filters.vocation && a.vocation.toLowerCase() !== filters.vocation.toLowerCase()) return false;
    if (filters.minLevel && a.level < filters.minLevel) return false;
    if (filters.maxLevel && a.level > filters.maxLevel) return false;
    return true;
  });
}
