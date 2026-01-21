const db = require("../config/db");

// ----------------------------------------------------------
// GET SUMMARY (total fee + total paid)
// ----------------------------------------------------------
exports.getSummary = async (req, res) => {
  try {
    const { studentId, schoolCode } = req.params;

    const [[master]] = await db.query(
      `SELECT feeMasterId, totalFeeAmount
       FROM fee_master1
       WHERE studentId=? AND schoolCode=?`,
      [studentId, schoolCode]
    );

    if (!master) {
      return res.json({ exists: false });
    }

    const [[stats]] = await db.query(
      `SELECT 
         IFNULL(SUM(payingNow),0) AS totalPaid,
         MIN(CASE WHEN pendingAmount > 0 THEN dueDate END) AS nextDueDate
       FROM fee_payments1
       WHERE feeMasterId=?`,
      [master.feeMasterId]
    );

    const totalPaid = Number(stats.totalPaid);
    const totalFee = Number(master.totalFeeAmount);
    const pendingAmount = totalFee - totalPaid;

    return res.json({
      exists: true,
      summary: {
        totalFee,
        totalPaid,
        pendingAmount,
        nextDueDate: stats.nextDueDate
      }
    });

  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
};



// ----------------------------------------------------------
// GET PAYMENT HISTORY
// ----------------------------------------------------------
exports.getHistory = async (req, res) => {
  try {
    const { studentId, schoolCode } = req.params;

    const [[master]] = await db.query(
      `SELECT feeMasterId 
       FROM fee_master1 
       WHERE studentId=? AND schoolCode=?`,
      [studentId, schoolCode]
    );

    if (!master) return res.json({ payments: [] });

    const [payments] = await db.query(
      `SELECT *
       FROM fee_payments1
       WHERE feeMasterId=?
       ORDER BY paymentDate DESC`,
      [master.feeMasterId]
    );

    return res.json({ payments });

  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
};


// ----------------------------------------------------------
// CREATE FEE MASTER (ONLY IF NOT EXISTS)
// ----------------------------------------------------------
exports.createFeeMaster = async (req, res) => {
  try {
    const { admissionId, studentId, schoolCode, totalFeeAmount } = req.body;

    if (!admissionId || !studentId || !schoolCode || !totalFeeAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [existing] = await db.query(
      `SELECT feeMasterId 
       FROM fee_master1 
       WHERE admissionId=? AND schoolCode=?`,
      [admissionId, schoolCode]
    );

    if (existing.length) {
      return res.json({
        success: true,
        feeMasterId: existing[0].feeMasterId,
        message: "Fee master already exists"
      });
    }

    const [insert] = await db.query(
      `INSERT INTO fee_master1
       (admissionId, studentId, schoolCode, totalFeeAmount)
       VALUES (?, ?, ?, ?)`,
      [admissionId, studentId, schoolCode, totalFeeAmount]
    );

    return res.json({
      success: true,
      feeMasterId: insert.insertId,
      message: "Fee master created successfully"
    });

  } catch (err) {
    console.error("CREATE MASTER ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
};




exports.addPayment = async (req, res) => {
  try {
    const {
      studentId,
      schoolCode,
      payingNow = 0,
      pendingAmount = 0, // not trusted from frontend
      dueDate,
      feeBreakup = {},
      pendingFeeBreakup = {},
      totalAmount = 0
    } = req.body;

    if (!studentId || !schoolCode) {
      return res.status(400).json({ error: "Missing studentId or schoolCode" });
    }

    // -----------------------------------
    // 🔹 Find or Create Fee Master
    // -----------------------------------
    let [[master]] = await db.query(
      `SELECT feeMasterId, totalFeeAmount 
       FROM fee_master1 
       WHERE studentId=? AND schoolCode=?`,
      [studentId, schoolCode]
    );

    if (!master) {
      const [insertMaster] = await db.query(
        `INSERT INTO fee_master1
         (studentId, schoolCode, totalFeeAmount)
         VALUES (?, ?, ?)`,
        [studentId, schoolCode, totalAmount]
      );

      master = {
        feeMasterId: insertMaster.insertId,
        totalFeeAmount: totalAmount
      };
    }

    // -----------------------------------
    // 🔹 Get Previous Pending Amount
    // -----------------------------------
    const [[lastPayment]] = await db.query(
      `SELECT pendingAmount
       FROM fee_payments1
       WHERE feeMasterId=?
       ORDER BY paymentId DESC
       LIMIT 1`,
      [master.feeMasterId]
    );

    const previousPending = lastPayment
      ? Number(lastPayment.pendingAmount)
      : Number(master.totalFeeAmount);

    // -----------------------------------
    // 🔹 Calculate New Pending Safely
    // -----------------------------------
    let pendingFinal = previousPending - Number(payingNow);

    if (pendingFinal < 0) pendingFinal = 0;

    // -----------------------------------
    // 🔹 Due Date Logic
    // -----------------------------------
    const finalDueDate = pendingFinal > 0 ? dueDate : null;

    // -----------------------------------
    // 🔹 Insert Payment Record
    // -----------------------------------
    const [paymentResult] = await db.query(
      `INSERT INTO fee_payments1
       (feeMasterId, studentId, payingNow, pendingAmount,
        paymentDate, dueDate, schoolCode)
       VALUES (?, ?, ?, ?, CURDATE(), ?, ?)`,
      [
        master.feeMasterId,
        studentId,
        payingNow,
        pendingFinal,
        finalDueDate,
        schoolCode
      ]
    );

    const paymentId = paymentResult.insertId;

    // -----------------------------------
    // 🔹 Insert PAID Items
    // -----------------------------------
    for (const [feeHead, data] of Object.entries(feeBreakup)) {
      await db.query(
        `INSERT INTO fee_payment_items
         (paymentId, feeHead, amount, note, status)
         VALUES (?, ?, ?, ?, 'PAID')`,
        [paymentId, feeHead, data.amount || 0, data.note || null]
      );
    }

    // -----------------------------------
    // 🔹 Insert PENDING Items
    // -----------------------------------
    for (const [feeHead, data] of Object.entries(pendingFeeBreakup)) {
      await db.query(
        `INSERT INTO fee_payment_items
         (paymentId, feeHead, amount, note, status)
         VALUES (?, ?, ?, ?, 'PENDING')`,
        [paymentId, feeHead, data.amount || 0, data.note || null]
      );
    }

    return res.json({
      success: true,
      message: "Payment saved successfully",
      paymentId,
      previousPending,
      pendingFinal
    });

  } catch (err) {
    console.error("ADD PAYMENT ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
};






exports.getFeeReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const [[payment]] = await db.query(
      `SELECT * FROM fee_payments1 WHERE paymentId=?`,
      [paymentId]
    );

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const [items] = await db.query(
      `SELECT * FROM fee_payment_items WHERE paymentId=?`,
      [paymentId]
    );

    return res.json({
      success: true,
      payment,
      items
    });

  } catch (err) {
    console.error("RECEIPT ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
};


exports.getDueAlerts = async (req, res) => {
  try {
    const [dues] = await db.query(
      `SELECT 
         fm.admissionId,
         fm.studentId,
         fm.schoolCode,
         fp.pendingAmount,
         fp.dueDate
       FROM fee_payments1 fp
       JOIN fee_master1 fm ON fm.feeMasterId = fp.feeMasterId
       WHERE fp.pendingAmount > 0
         AND fp.dueDate IS NOT NULL
         AND fp.dueDate < CURDATE()
       ORDER BY fp.dueDate ASC`
    );

    return res.json({
      success: true,
      dues
    });

  } catch (err) {
    console.error("DUE ALERT ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
};



exports.getPendingFees = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [rows] = await db.query(`
      SELECT 
        fpi.itemId,
        fpi.feeHead,
        fpi.amount,
        fpi.note,
        fpi.status,
        fpi.feeMasterId,
        fp.paymentId,
        fp.studentId,
        fp.dueDate,
        fp.paymentDate
      FROM fee_payment_items fpi
      JOIN fee_payments1 fp 
        ON fp.paymentId = fpi.paymentId
      WHERE fp.studentId = ?
      ORDER BY fp.paymentDate ASC, fpi.itemId ASC
    `, [studentId]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error("Get All Fees Error:", error);
    res.status(500).json({ success:false, message: "Server error" });
  }
};





exports.getPendingCountByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [[row]] = await db.query(
      `SELECT COUNT(*) AS pendingCount
       FROM fee_payment_items fpi
       JOIN fee_payments1 fp 
         ON fp.paymentId = fpi.paymentId
       WHERE fpi.status = 'PENDING'
       AND fp.studentId = ?`,
      [studentId]
    );

    res.json({
      success: true,
      count: row.pendingCount || 0
    });

  } catch (err) {
    console.error("PENDING COUNT ERROR:", err);
    res.status(500).json({ error: "Server Error" });
  }
};


exports.payPendingFees = async (req, res) => {
  const conn = await db.getConnection();
  try {
    console.log("===== PAY PENDING FEES START =====");
    console.log("Incoming request body:", req.body);

    const { studentId, feeMasterId, selectedItems } = req.body;

    if (!studentId || !feeMasterId || !selectedItems?.length) {
      console.warn("❌ Missing required data", { studentId, feeMasterId, selectedItems });
      return res.status(400).json({ message: "Missing required data" });
    }

    await conn.beginTransaction();
    console.log("Transaction started");

    const totalPaid = selectedItems.reduce(
      (sum, i) => sum + Number(i.amount),
      0
    );
    console.log("Total amount to pay:", totalPaid);

    // 🔹 Get last pending
    const [[lastPayment]] = await conn.query(
      `SELECT pendingAmount 
       FROM fee_payments1
       WHERE feeMasterId=?
       ORDER BY paymentId DESC
       LIMIT 1`,
      [feeMasterId]
    );
    console.log("Last payment fetched:", lastPayment);

    const previousPending = lastPayment?.pendingAmount || 0;
    const newPending = Math.max(previousPending - totalPaid, 0);
    console.log("Previous pending:", previousPending, "New pending after payment:", newPending);

    // 🔹 Insert new payment
    const [paymentResult] = await conn.query(`
      INSERT INTO fee_payments1
      (feeMasterId, studentId, payingNow, pendingAmount, paymentDate)
      VALUES (?, ?, ?, ?, NOW())
    `, [feeMasterId, studentId, totalPaid, newPending]);
    const newPaymentId = paymentResult.insertId;
    console.log("Inserted new payment with ID:", newPaymentId);

    // 🔹 Insert payment items as PAID
    for (const item of selectedItems) {
      console.log("Inserting PAID item:", item);
      await conn.query(`
        INSERT INTO fee_payment_items
        (paymentId, feeHead, amount, note, status, feeMasterId)
        VALUES (?, ?, ?, ?, 'PAID', ?)
      `, [
        newPaymentId,
        item.feeHead,
        item.amount,
        "Paid from pending",
        feeMasterId
      ]);
    }
    console.log("All selected items marked as PAID");

    // 🔹 Mark old pending as PAID
    console.log("Updating old pending items:", selectedItems.map(i => i.itemId));
    await conn.query(`
      UPDATE fee_payment_items
      SET status='PAID'
      WHERE itemId IN (?)
    `, [selectedItems.map(i => i.itemId)]);
    console.log("Old pending items updated to PAID");

    await conn.commit();
    console.log("Transaction committed successfully");

    res.json({
      success: true,
      message: "Pending fees paid successfully",
      newPending
    });

  } catch (err) {
    await conn.rollback();
    console.error("❌ Pay Pending Fees Error:", err);
    res.status(500).json({ message: "Payment failed" });
  } finally {
    conn.release();
    console.log("Connection released");
    console.log("===== PAY PENDING FEES END =====");
  }
};



