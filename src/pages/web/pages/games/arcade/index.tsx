import { useEffect, useRef, useState } from 'react';
import uuid from 'react-uuid';
import MobileView from '../../../../../components/mobile-view';
import { CSSDimensionsWithPixelSize, CSSPositionPixelSize } from '../../../../../utils/pixles';

enum TileSectionEnum {
  BEGINING = 'begining',
  MIDDLE = 'middle',
  END = 'end'
}

interface ITile {
  id: string;
  x: number;
  y: number;
  hasObstacle?: boolean;
}

const ArcadeGame = () => {
  const speed = 10;

  const spawnTileSpeed = 100;
  const spawnTileCount = 5;

  const spawnObstacleSpeed = 150;

  const startingTileCount = 10;
  const maxTileCount = 20;

  const mapLeftPadding = 150;
  const tileWidth = 16;
  const tileHeight = 150;

  const obstacleChance = 0.1;

  const [loading, setLoading] = useState<boolean>(false);
  const [tiles, setTiles] = useState<Map<string, ITile>>(new Map<string, ITile>([]));
  const [firstTileId, setFirstTileId] = useState<string>(`tile-0`);
  const [lastTileId, setLastTileId] = useState<string>(`tile-${startingTileCount - 1}`);
  const [tileIds, setTileIds] = useState<string[]>([]);
  const [spawnObstacle, setSpawnObstacle] = useState<boolean>(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);
  const firstTileIdRef = useRef<string>(firstTileId);
  const lastTileIdRef = useRef<string>(lastTileId);
  const tileIdsRef = useRef<string[]>(tileIds);

  const spawnTiles = (count = 1) => {
    for (let i = 0; i < count; i++) {
      spawnTile();
    }
  };

  const spawnTile = () => {
    setTiles((prev) => {
      const newTiles = new Map<string, ITile>(prev);
      const numberOfTiles = newTiles.size;

      const lastTileId = lastTileIdRef.current;
      const lastTile = newTiles.get(lastTileId);

      const id = uuid();

      if (numberOfTiles == 0) setFirstTileId(id);

      const newTile: ITile = {
        id,
        x: numberOfTiles * tileWidth,
        y: 0
      };

      if (lastTile) {
        newTile.x = lastTile.x + tileWidth;
      }

      newTiles.set(id, newTile);

      setLastTileId(id);

      setTileIds((prevId) => [...prevId, id]);

      return newTiles;
    });
  };

  const removeTile = (id: string) => {
    setTileIds((prevId) => {
      const newIds = [...prevId];
      const nextId = newIds[0];
      const lastId = newIds[newIds.length - 1];

      setTiles((prev) => {
        const newTiles = new Map<string, ITile>(prev);
        newTiles.delete(id);

        setFirstTileId(nextId);
        setLastTileId(lastId);

        return newTiles;
      });
      return newIds;
    });
  };

  const startGame = () => {
    if (loading) return;

    setTiles(new Map<string, ITile>([]));
    setTileIds([]);

    spawnTiles(startingTileCount);

    setLoading(false);
  };

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    firstTileIdRef.current = firstTileId;
  }, [firstTileId]);

  useEffect(() => {
    lastTileIdRef.current = lastTileId;
  }, [lastTileId]);

  useEffect(() => {
    tileIdsRef.current = tileIds;
  }, [tileIds]);

  useEffect(() => {
    if (spawnObstacle) {
      setTiles((prev) => {
        const newTiles = new Map<string, ITile>(prev);
        const lastTileId = lastTileIdRef.current;
        const lastTile = newTiles.get(lastTileId);

        if (lastTile) {
          lastTile.hasObstacle = true;
        }

        return newTiles;
      });
      setSpawnObstacle(false);
    }
  }, [spawnObstacle]);

  useEffect(() => {
    if (!loadingRef.current) {
      startGame();
    }

    let timeStamp = Date.now();
    let lastTileSpawn = Date.now();
    let lastObstacleSpawn = Date.now();

    const update = () => {
      const pixleSize = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--pixel-size')
      );

      const currentTime = Date.now();
      const timeDelta = currentTime - timeStamp;
      timeStamp = currentTime;

      const timeSinceLastTileSpawn = currentTime - lastTileSpawn;
      const timeSinceLastObstacleSpawn = currentTime - lastObstacleSpawn;

      const map = mapRef.current;
      const tileIds = tileIdsRef.current;

      if (map) {
        if (timeSinceLastObstacleSpawn * (timeDelta / 1000) > spawnObstacleSpeed) {
          if (Math.random() < obstacleChance) {
            setSpawnObstacle(true);
            lastObstacleSpawn = currentTime;
          }
        }

        setTiles((prev) => {
          const newTiles = new Map<string, ITile>(prev);

          for (let i = 0; i < tileIds.length; i++) {
            const tileId = tileIds[i];
            const tile = newTiles.get(tileId);

            if (tile) {
              tile.x -= speed * (timeDelta / 1000);
              const left = (tile.x + tileWidth + mapLeftPadding) * pixleSize;

              if (left < 0) {
                removeTile(tile.id);
              }
            }
          }

          if (
            timeSinceLastTileSpawn > spawnTileSpeed &&
            newTiles.size < maxTileCount * spawnTileCount
          ) {
            spawnTiles(spawnTileCount);
            lastTileSpawn = currentTime;
          }

          return newTiles;
        });
      }

      requestAnimationFrame(update);
    };

    const frame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <MobileView>
      <div className="w-full h-full" ref={mapRef}>
        <div className="absolute inset-0 bg-blue-300"></div>
        {Array.from(tiles.values()).map((tile) => (
          <div
            key={tile.id}
            id={tile.id}
            className={`absolute`}
            style={{
              ...CSSDimensionsWithPixelSize(`${tileWidth}px`, `${tileHeight}px`),
              ...CSSPositionPixelSize(`150px + ${tile.x}px`, `60% + ${tile.y}px`)
            }}>
            <div
              className={`absolute inset-0 bg-green border-t-4 border-green-600 rounded-tr-lg ${
                tile.id == firstTileId ? 'border-l-4 rounded-tl-lg' : ''
              } ${tile.id == lastTileId ? 'border-r-4 rounded-tr-lg' : ''}`}
              style={{ height: '100px' }}></div>
            {tile.hasObstacle && (
              <div className="absolute inset-0 px-6" style={{ top: '-65px' }}>
                <div className="bg-tapgate-white w-full" style={{ height: '64px' }}></div>
              </div>
            )}
            <div
              className={`absolute inset-0 bg-yellow-300 border-t-4 border-yellow-600 ${
                tile.id == firstTileId ? 'border-l-4' : ''
              } ${tile.id == lastTileId ? 'border-r-4' : ''}`}
              style={{ top: '100px' }}></div>
          </div>
        ))}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-1/4 bg-blue-500/75 border-t-4 border-blue-800/75"></div>
        <div className="absolute z-20 inset-0 flex justify-center items-center text-white font-black text-xl">
          TAP TO JUMP
        </div>
      </div>
    </MobileView>
  );
};

export default ArcadeGame;
