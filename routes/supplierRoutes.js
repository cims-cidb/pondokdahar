const express = require("express");
const router = express.Router();

const supplierController = require("../controllers/supplierController");

router.get("/", supplierController.getAllSuppliers);
router.get("/:id", supplierController.getSupplierById);
router.get("/:supplierId/items", supplierController.getSupplierItems);
router.post("/", supplierController.createSupplier);
router.put("/:id", supplierController.updateSupplier);
router.delete("/:id", supplierController.deleteSupplier);
router.post("/:supplierId/items", supplierController.addSupplierItem);

module.exports = router;
