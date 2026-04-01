const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  const { userId } = req.query;

  const data = await Notification.find({ userId })
    .sort({ createdAt: -1 });

  res.json(data);
};