migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xq0r5zigwvlrweo")

  collection.listRule = ""
  collection.viewRule = ""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xq0r5zigwvlrweo")

  collection.listRule = null
  collection.viewRule = null

  return dao.saveCollection(collection)
})
