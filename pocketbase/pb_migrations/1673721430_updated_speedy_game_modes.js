migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xq0r5zigwvlrweo")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "1xmuocjf",
    "name": "timer",
    "type": "number",
    "required": true,
    "unique": false,
    "options": {
      "min": 30,
      "max": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xq0r5zigwvlrweo")

  // remove
  collection.schema.removeField("1xmuocjf")

  return dao.saveCollection(collection)
})
