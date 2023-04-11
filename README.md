## install

npm i

## run server 

node index.js

## puntos prueba (lon,lat)

--http://localhost:3000/check?lon=2.15600&lat=41.30314
-- 2.15600,41.30314  : fuera 

--http://localhost:3000/check?lon=2.13408&lat=41.32201
-- 2.13408,41.32201  : fuera

--http://localhost:3000/check?lon=2.16201&lat=41.31027
-- 2.16201,41.31027  : geocerca poly2

--http://localhost:3000/check?lon=2.14650&lat=41.31361 
-- 2.14650,41.31361  : geocerca poly1

--http://localhost:3000/check?lon=2.13976&lat=41.31002
-- 2.13976,41.31002  : geocerca poly3 y geocerca poly1 

## esta contenido en algun otro poligono 

-- http://localhost:3000/list-estacontenido

## esta contenido en algun otro poligono, identifica padre 

-- http://localhost:3000/list-hijopadre

## conteo de poligonos que esten dentro de otros poligonos

-- http://localhost:3000/list-conteos

## test JSON results:  https://jsonlint.com/