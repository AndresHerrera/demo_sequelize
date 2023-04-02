const express = require("express");
const { Sequelize, Model, DataTypes } = require('sequelize')
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
    geom: Sequelize.GEOMETRY
}, {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'testfences'
})

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
        attributes: ['id', 'name'],
        where: Sequelize.where(
            Sequelize.fn('ST_Intersects',
                Sequelize.col('geom'),
                Sequelize.fn('ST_SetSRID',
                    Sequelize.fn('ST_MakePoint',
                        req.query.lon, req.query.lat),
                    4326)), true)
    });

    res.json(fences);

});

app.listen(port, () => console.log(`demo server on port ${port}!`));