const Lead = require("../models/Lead");

// =====================================================
// 🔥 DASHBOARD STATS (FILTERED)
// =====================================================
exports.getDashboardStats = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    let filter = {};

    // ✅ STRICT DATE CHECK
    if (startDate && startDate !== "null") {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate || startDate);
      end.setHours(23, 59, 59, 999);

      filter.createdAt = { $gte: start, $lte: end };
    }

    console.log("📊 STATS FILTER:", filter);

    const total = await Lead.countDocuments(filter);

    const called = await Lead.countDocuments({
      ...filter,
      called: true,
    });

    const notCalled = await Lead.countDocuments({
      ...filter,
      called: false,
    });

    const interested = await Lead.countDocuments({
      ...filter,
      response: "interested",
    });

    res.json({
      total,
      called,
      notCalled,
      interested,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json("Dashboard error");
  }
};

// =====================================================
// 🔥 ANALYTICS (FULL FIXED)
// =====================================================
exports.getAnalytics = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    // ✅ DEFAULT = LAST 7 DAYS
    if (!startDate || startDate === "null") {
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - 6);

      startDate = past;
      endDate = today;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate || startDate);
    end.setHours(23, 59, 59, 999);

    console.log("📅 ANALYTICS FILTER:", start, "→", end);

    // =====================================================
    // 🔥 TREND (ONLY INTERESTED)
    // =====================================================
    const trend = [];

    let current = new Date(start);

    while (current <= end) {
      const dayStart = new Date(current);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(current);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await Lead.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        response: "interested", // ✅ KPI FIX
      });

      trend.push({
        date: dayStart.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        leads: count,
      });

      current.setDate(current.getDate() + 1);
    }

    // =====================================================
    // 🔥 RESPONSE (FILTERED)
    // =====================================================
    const responseData = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$response",
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = [
      { name: "Interested", value: 0 },
      { name: "Not Interested", value: 0 },
      { name: "No Answer", value: 0 },
      { name: "Callback", value: 0 },
    ];

    responseData.forEach((r) => {
      if (r._id === "interested") formatted[0].value = r.count;
      if (r._id === "not_interested") formatted[1].value = r.count;
      if (r._id === "no_answer") formatted[2].value = r.count;
      if (r._id === "callback") formatted[3].value = r.count;
    });

    res.json({
      trend,
      response: formatted,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json("Analytics error");
  }
};