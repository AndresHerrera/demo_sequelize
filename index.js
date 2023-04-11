const express = require("express");
const { Op, Sequelize, Model, literal, DataTypes } = require("sequelize");
const dbConfig = require("./db");

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password, {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
    }
);

class TestFences extends Model {}
TestFences.init({
    id: { type: Sequelize.SMALLINT, primaryKey: true },
    name: Sequelize.STRING,
    geom: Sequelize.GEOMETRY,
}, {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "testfences",
});

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Test geocercas");
});

app.get("/check", async(req, res) => {
    var lat = req.query.lat;
    var lon = req.query.lon;
    console.log(`lat:${lat} , lon:${lon}`);

    //const fences = await TestFences.findAll()
    //res.json(fences)

    //attributes: ['id', 'name', 'geom'],
    const fences = await TestFences.findAll({
        attributes: ["id", "name", [literal('ST_AsGeoJSON("geom")'), "geom"]],
        where: Sequelize.where(
            Sequelize.fn(
                "ST_Intersects",
                Sequelize.col("geom"),
                Sequelize.fn(
                    "ST_SetSRID",
                    Sequelize.fn("ST_MakePoint", req.query.lon, req.query.lat),
                    4326
                )
            ),
            true
        ),
    });

    res.json(fences);
});

//TODO:  Optimizar consulta a full a Sequelize
app.get("/list-estacontenido", async(req, res) => {
    sequelize
        .query(
            `
    SELECT p1."id", p1."name", ST_AsGeoJSON(p1."geom") as geom, ST_Contains(p2."geom", p1."geom") AS is_contained
    FROM "testfences" AS p1
    LEFT JOIN "testfences" AS p2 ON ST_Contains(p2."geom", p1."geom") AND p1."id" <> p2."id";
`, {
                type: sequelize.QueryTypes.SELECT,
            }
        )
        .then((result) => {
            res.json(result);
        })
        .catch((error) => {
            console.error(error);
        });
});

//TODO:  Optimizar consulta a full a Sequelize
app.get("/list-hijopadre", async(req, res) => {
    sequelize
        .query(
            `
    SELECT p1."id" AS "contained_id", ST_AsGeoJSON(p1."geom") AS "contained_geom",  p1."name" as "contained_name",
       p2."id" AS "container_id", ST_AsGeoJSON(p2."geom") AS "container_geom",  p2."name" as "container_name"
FROM "testfences" AS p1
LEFT JOIN "testfences" AS p2 ON ST_Contains(p2."geom", p1."geom") AND p1."id" <> p2."id";
`, {
                type: sequelize.QueryTypes.SELECT,
            }
        )
        .then((result) => {
            res.json(result);
        })
        .catch((error) => {
            console.error(error);
        });
});


//TODO:  Optimizar consulta a full a Sequelize
app.get("/list-conteos", async(req, res) => {
    sequelize
        .query(
            `
            SELECT p1."id" AS "container_id", COUNT(p2."id") AS "contained_count"
            FROM "testfences" AS p1
            LEFT JOIN "testfences" AS p2 ON ST_Contains(p1."geom", p2."geom") AND p1."id" <> p2."id"
            GROUP BY p1."id";
`, {
                type: sequelize.QueryTypes.SELECT,
            }
        )
        .then((result) => {
            res.json(result);
        })
        .catch((error) => {
            console.error(error);
        });
});

app.listen(port, () => console.log(`demo server on port ${port}!`));