migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xq0r5zigwvlrweo")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4ie7xr2j",
    "name": "sort",
    "type": "number",
    "required": true,
    "unique": false,
    "options": {
      "min": null,
      "max": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xq0r5zigwvlrweo")

  // remove
  collection.schema.removeField("4ie7xr2j")

  return dao.saveCollection(collection)
})
