'use client';
import { useState } from 'react';

interface CityEntry {
  city: string;
  state: string;
  count: number;
}

interface CitiesMapClientProps {
  cities: CityEntry[];
  total: number;
}

// UF → nome completo
const STATE_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

// SVG paths simplificados de cada estado do Brasil
// viewBox="0 0 1000 1100"
const STATE_PATHS: Record<string, string> = {
  AC: 'M 82,520 L 60,540 L 55,570 L 80,590 L 120,580 L 150,600 L 165,580 L 155,555 L 130,540 Z',
  AM: 'M 82,520 L 130,540 L 155,555 L 165,580 L 200,575 L 240,560 L 280,540 L 300,510 L 310,480 L 290,450 L 260,420 L 220,400 L 180,390 L 150,400 L 120,420 L 95,450 L 80,480 Z',
  RR: 'M 180,390 L 220,400 L 260,420 L 280,390 L 270,360 L 250,330 L 220,310 L 190,320 L 170,350 Z',
  AP: 'M 310,380 L 330,360 L 350,340 L 360,310 L 340,290 L 310,300 L 295,330 L 300,360 Z',
  PA: 'M 280,540 L 300,510 L 310,480 L 300,450 L 310,410 L 310,380 L 300,360 L 295,330 L 340,320 L 370,330 L 400,340 L 430,360 L 450,390 L 460,420 L 450,450 L 430,470 L 420,500 L 410,530 L 390,550 L 360,560 L 330,555 L 300,545 Z',
  TO: 'M 430,470 L 450,450 L 460,420 L 450,390 L 460,360 L 480,340 L 490,370 L 500,400 L 510,430 L 500,460 L 490,490 L 480,510 L 460,520 L 445,505 Z',
  MA: 'M 410,530 L 430,510 L 445,505 L 460,520 L 480,510 L 490,490 L 500,460 L 510,430 L 530,420 L 550,430 L 560,450 L 550,480 L 530,500 L 510,510 L 490,520 L 470,535 L 450,545 L 430,545 Z',
  PI: 'M 530,420 L 550,430 L 560,450 L 550,480 L 570,490 L 590,480 L 600,460 L 590,430 L 575,410 L 555,400 Z',
  CE: 'M 590,430 L 600,460 L 590,480 L 600,490 L 620,480 L 640,470 L 650,450 L 640,430 L 620,415 L 600,415 Z',
  RN: 'M 640,430 L 650,450 L 660,440 L 670,420 L 660,405 L 645,408 Z',
  PB: 'M 640,470 L 650,460 L 660,440 L 670,450 L 670,465 L 655,475 Z',
  PE: 'M 590,480 L 600,490 L 610,500 L 630,498 L 650,490 L 665,480 L 670,465 L 655,475 L 640,470 L 620,480 Z',
  AL: 'M 630,498 L 640,505 L 650,508 L 655,498 L 645,490 L 635,492 Z',
  SE: 'M 615,510 L 625,515 L 635,512 L 640,505 L 630,498 L 620,500 Z',
  BA: 'M 510,510 L 530,500 L 550,480 L 570,490 L 590,480 L 610,500 L 620,500 L 615,510 L 605,525 L 590,540 L 570,555 L 550,565 L 530,570 L 510,565 L 495,550 L 490,530 L 495,515 Z',
  GO: 'M 430,560 L 460,555 L 480,560 L 495,550 L 490,530 L 490,510 L 480,510 L 470,535 L 450,545 L 440,555 Z',
  DF: 'M 480,555 L 488,548 L 495,555 L 488,562 Z',
  MG: 'M 510,565 L 530,570 L 550,565 L 570,555 L 590,565 L 600,580 L 590,600 L 570,615 L 550,620 L 520,618 L 500,610 L 490,595 L 490,575 L 500,560 Z',
  ES: 'M 590,600 L 600,595 L 612,600 L 615,615 L 605,625 L 592,618 Z',
  RJ: 'M 560,625 L 575,620 L 590,625 L 600,635 L 590,645 L 570,648 L 555,640 L 553,628 Z',
  SP: 'M 490,595 L 500,610 L 520,618 L 550,620 L 570,615 L 575,625 L 560,635 L 540,645 L 510,648 L 485,640 L 468,625 L 465,605 L 475,590 Z',
  PR: 'M 465,640 L 485,640 L 510,648 L 530,655 L 520,670 L 500,678 L 475,675 L 455,662 L 452,648 Z',
  SC: 'M 455,662 L 475,675 L 500,678 L 510,688 L 495,698 L 472,698 L 455,685 L 450,672 Z',
  RS: 'M 450,700 L 472,698 L 495,698 L 510,705 L 505,725 L 490,740 L 468,748 L 448,742 L 435,725 L 435,710 Z',
  MS: 'M 420,580 L 430,560 L 440,555 L 450,545 L 465,555 L 480,560 L 490,575 L 490,595 L 475,605 L 460,615 L 440,618 L 420,610 L 408,595 Z',
  MT: 'M 280,540 L 300,545 L 330,555 L 360,560 L 390,550 L 410,530 L 430,545 L 440,555 L 430,560 L 420,580 L 408,595 L 395,590 L 370,575 L 340,565 L 310,560 L 285,555 Z',
  RO: 'M 165,580 L 200,575 L 240,560 L 280,540 L 285,555 L 260,565 L 230,570 L 200,580 L 175,595 L 162,590 Z',
  RR_EXTRA: '',
};

export function CitiesMapClient({ cities, total }: CitiesMapClientProps) {
  const statesWithWalkers = new Set(cities.map((c) => c.state));
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = selected ? cities.filter((c) => c.state === selected) : cities;
  const selectedName = selected ? STATE_NAMES[selected] ?? selected : null;
  const selectedCount = selected ? cities.filter((c) => c.state === selected).reduce((s, c) => s + c.count, 0) : null;

  return (
    <div className="cities-map-wrap">
      {/* mapa SVG */}
      <div className="cities-map-svg-wrap">
        <svg
          viewBox="0 0 750 830"
          className="cities-map-svg"
          aria-label="Mapa do Brasil — selecione um estado"
        >
          {Object.entries(STATE_PATHS).map(([uf, d]) => {
            if (!d) return null;
            const hasWalkers = statesWithWalkers.has(uf);
            const isSelected = selected === uf;
            return (
              <path
                key={uf}
                d={d}
                className={[
                  'cities-map-state',
                  hasWalkers ? 'has-walkers' : 'no-walkers',
                  isSelected ? 'selected' : '',
                ].join(' ')}
                onClick={() => setSelected(isSelected ? null : uf)}
                aria-label={STATE_NAMES[uf] ?? uf}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(isSelected ? null : uf)}
              >
                <title>{STATE_NAMES[uf] ?? uf}{hasWalkers ? ` — ${cities.filter(c => c.state === uf).reduce((s,c)=>s+c.count,0)} walker(s)` : ' — sem walkers ainda'}</title>
              </path>
            );
          })}
        </svg>

        {/* legenda */}
        <div className="cities-map-legend">
          <span className="cities-map-legend-item has-walkers">Com walkers</span>
          <span className="cities-map-legend-item no-walkers">Sem walkers</span>
        </div>
      </div>

      {/* lista de cidades */}
      <div className="cities-map-list">
        <div className="cities-map-list-header">
          {selectedName ? (
            <>
              <span className="cities-map-list-state">{selectedName}</span>
              <span className="cities-map-list-count">{selectedCount} walker{selectedCount !== 1 ? 's' : ''}</span>
              <button className="cities-map-clear" onClick={() => setSelected(null)}>✕ Limpar filtro</button>
            </>
          ) : (
            <span className="cities-map-list-state">Todos os estados — {total} {total === 1 ? 'cidade' : 'cidades'}</span>
          )}
        </div>

        <div className="cities-map-chips">
          {filtered.length === 0 ? (
            <p className="cities-map-empty">Nenhum walker neste estado ainda.</p>
          ) : (
            filtered.map(({ city, state, count }) => (
              <div key={`${city}-${state}`} className="lp-city-chip">
                <span className="lp-city-dot" />
                <span className="lp-city-name">{city}</span>
                <span className="lp-city-state">{state}</span>
                <span className="lp-city-count">{count} walker{count > 1 ? 's' : ''}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
