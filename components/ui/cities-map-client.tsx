'use client';
import { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = '/brazil-states.geojson';

interface CityEntry {
  city: string;
  state: string;
  count: number;
}

interface CitiesMapClientProps {
  cities: CityEntry[];
  total: number;
}

const STATE_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

export function CitiesMapClient({ cities, total }: CitiesMapClientProps) {
  const statesWithWalkers = new Set(cities.map((c) => c.state));
  const [selected, setSelected] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ uf: string; x: number; y: number } | null>(null);

  const filtered = selected ? cities.filter((c) => c.state === selected) : cities;
  const selectedName = selected ? STATE_NAMES[selected] ?? selected : null;
  const selectedCount = selected
    ? cities.filter((c) => c.state === selected).reduce((s, c) => s + c.count, 0)
    : null;

  const walkersByState = (uf: string) =>
    cities.filter((c) => c.state === uf).reduce((s, c) => s + c.count, 0);

  return (
    <div className="cities-map-wrap">
      {/* mapa */}
      <div className="cities-map-svg-wrap">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [-54, -15], scale: 680 }}
          width={500}
          height={520}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const uf: string = geo.properties.sigla;
                const hasWalkers = statesWithWalkers.has(uf);
                const isSelected = selected === uf;
                const wCount = walkersByState(uf);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => setSelected(isSelected ? null : uf)}
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGPathElement)
                        .closest('svg')!
                        .getBoundingClientRect();
                      setTooltip({ uf, x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: {
                        fill: isSelected
                          ? '#22c55e'
                          : hasWalkers
                          ? 'rgba(34,197,94,0.30)'
                          : 'rgba(255,255,255,0.07)',
                        stroke: isSelected ? '#86efac' : 'rgba(255,255,255,0.18)',
                        strokeWidth: isSelected ? 1.5 : 0.8,
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'fill .18s',
                      },
                      hover: {
                        fill: isSelected
                          ? '#16a34a'
                          : hasWalkers
                          ? 'rgba(34,197,94,0.60)'
                          : 'rgba(255,255,255,0.14)',
                        stroke: 'rgba(255,255,255,0.35)',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: { fill: '#15803d', outline: 'none' },
                    }}
                    aria-label={`${STATE_NAMES[uf] ?? uf}${hasWalkers ? ` — ${wCount} walker(s)` : ''}`}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* tooltip */}
        {tooltip && (
          <div
            className="cities-map-tooltip"
            style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
            aria-hidden="true"
          >
            <strong>{STATE_NAMES[tooltip.uf] ?? tooltip.uf}</strong>
            {statesWithWalkers.has(tooltip.uf) ? (
              <span> — {walkersByState(tooltip.uf)} walker{walkersByState(tooltip.uf) !== 1 ? 's' : ''}</span>
            ) : (
              <span className="cities-map-tooltip-none"> sem walkers</span>
            )}
          </div>
        )}

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
              <span className="cities-map-list-count">
                {selectedCount} walker{selectedCount !== 1 ? 's' : ''}
              </span>
              <button className="cities-map-clear" onClick={() => setSelected(null)}>
                ✕ Limpar filtro
              </button>
            </>
          ) : (
            <span className="cities-map-list-state">
              Todos os estados — {total} {total === 1 ? 'cidade' : 'cidades'}
            </span>
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
