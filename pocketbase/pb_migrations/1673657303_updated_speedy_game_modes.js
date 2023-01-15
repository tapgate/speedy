migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xq0r5zigwvlrweo")

  // update
  collection.schema.addField(new SchemaField({
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
        "yellow",
        "black"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xq0r5zigwvlrweo")

  // update
  collection.schema.addField(new SchemaField({
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
  }))

  return dao.saveCollection(collection)
})
