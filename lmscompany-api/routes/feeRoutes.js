const express = require("express");
const router = express.Router();
const feeController = require("../controllers/feeController");

//  SUMMARY (use studentId)
router.get("/summary/:studentId/:schoolCode", feeController.getSummary);

//  HISTORY (use studentId)
router.get("/history/:studentId/:schoolCode", feeController.getHistory);

//  CREATE FEE MASTER
router.post("/master/create", feeController.createFeeMaster);

// FEE RECEIPT (use paymentId instead)
router.get("/fee-receipt/:paymentId", feeController.getFeeReceipt);

// ADD PAYMENT
router.post("/pay", feeController.addPayment);

router.get("/pending-fees/:studentId", feeController.getPendingFees);

router.post("/pay-pending", feeController.payPendingFees);
router.get("/pending-count/:studentId", feeController.getPendingCountByStudent);



module.exports = router;
