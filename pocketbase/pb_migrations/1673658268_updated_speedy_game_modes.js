migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xq0r5zigwvlrweo")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4ie7xr2j",
    "name": "index",
    "type": "number",
    "required": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xq0r5zigwvlrweo")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4ie7xr2j",
    "name": "index",
    "type": "number",
    "required": true,
    "unique": false,
    "options": {
      "min": 0,
      "max": null
    }
  }))

  return dao.saveCollection(collection)
})
