migrate((db) => {
  const collection = new Collection({
    "id": "xq0r5zigwvlrweo",
    "created": "2023-01-14 00:44:16.632Z",
    "updated": "2023-01-14 00:44:16.632Z",
    "name": "speedy_game_modes",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ticgytbl",
        "name": "level",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "sstfk5s7",
        "name": "speed",
        "type": "number",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null
        }
      },
      {
        "system": false,
        "id": "eee2qmzk",
        "name": "color",
        "type": "select",
        "required": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "red",
            "green",
            "blue",
            "yellow"
          ]
        }
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("xq0r5zigwvlrweo");

  return dao.deleteCollection(collection);
})
