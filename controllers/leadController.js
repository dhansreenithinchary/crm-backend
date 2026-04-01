const Lead = require("../models/Lead");
const csv = require("csv-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const AssignHistory = require("../models/AssignHistory"); // ✅ ADD THIS AT TOP (IMPORTANT)
const Notification = require("../models/Notification");

// GET ALL LEADS
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().populate("assignedTo", "name");

    console.log("🔥 TOTAL IN DB:", leads.length);

    res.json({ leads });

  } catch (err) {
    console.log(err);
    res.status(500).json("Error fetching leads");
  }
};

// UPDATE LEAD
exports.updateLead = async (req, res) => {
  try {
    let { interResults, response, notes } = req.body;

    // 🔥 AUTO LOGIC
    let called = false;

    if (response || notes) {
      called = true;
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        interResults,
        response,
        notes,
        called,
      },
      { returnDocument: "after" }
    );

    res.json(lead);

  } catch (err) {
    console.log(err);
    res.status(500).json("Update error");
  }
};

// ASSIGN LEADS
exports.assignLeads = async (req, res) => {
  const { leadIds, userId } = req.body;

  await Lead.updateMany(
    { _id: { $in: leadIds } },
    { assignedTo: userId }
  );

  res.json({ message: "Leads assigned successfully" });
};

exports.importLeads = async (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      results.push({
        name: data.name,
        phone: data.phone,
        source: "import",
      });
    })
    .on("end", async () => {
      await Lead.insertMany(results);
      res.json({ message: "Leads imported successfully 🚀" });
    });
};

exports.autoAssignLeads = async (req, res) => {
  try {
    const { userId, count } = req.body;

    // 🔥 GET TODAY RANGE
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 🔥 CHECK TODAY ASSIGN COUNT
    const todayAssigned = await AssignHistory.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: todayStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
        },
      },
    ]);

    const alreadyAssigned = todayAssigned[0]?.total || 0;

    // 🔥 LIMIT (300 PER DAY)
    const MAX_LIMIT = 300;

    if (alreadyAssigned >= MAX_LIMIT) {
      return res.json({
        message: `Daily limit reached (${MAX_LIMIT})`,
      });
    }

    const remaining = MAX_LIMIT - alreadyAssigned;
    const finalCount = Math.min(count, remaining);

    // 🔥 GET UNASSIGNED LEADS
    const leads = await Lead.find({ isAssigned: false }).limit(finalCount);

    if (leads.length === 0) {
      return res.json({ message: "No unassigned leads left" });
    }

    // ✅ FIX: DEFINE FIRST
    const leadIds = leads.map((l) => l._id);

    // 🔥 UPDATE LEADS
    await Lead.updateMany(
      { _id: { $in: leadIds } },
      {
        assignedTo: userId,
        isAssigned: true,
      }
    );

    // 🔥 SAVE HISTORY
    await AssignHistory.create({
      userId,
      count: leadIds.length,
    });

    // 🔔 CREATE NOTIFICATION (FIXED POSITION)
    try {
      await Notification.create({
        userId,
        message: `You received ${leadIds.length} new leads`,
      });
    } catch (err) {
      console.log("Notification error:", err.message);
    }

    res.json({
      message: `${leadIds.length} leads assigned successfully 🚀`,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json("Server error");
  }
};

exports.getUnassignedCount = async (req, res) => {
  const count = await Lead.countDocuments({ isAssigned: false });
  res.json({ count });
};