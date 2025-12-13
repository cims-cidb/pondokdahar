const orderInService = require("../services/orderInService");

exports.createOrder = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "manager_outlet") {
      const error = new Error("Hanya Manager Outlet yang boleh membuat order");
      error.status = 403;
      throw error;
    }

    const items = req.body.items || [];
    const result = await orderInService.createOrder(
      user.outlet_id,
      user.id,
      items
    );

    res.status(201).json({
      message: "Order berjaya dibuat",
      orderId: result.orderId,
    });
  } catch (err) {
    next(err);
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    const user = req.user;
    const { status, outletId } = req.query;

    const orders = await orderInService.listOrdersForUser(user, {
      status: status || null,
      outletId: outletId || null,
    });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getOrderDetail = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const data = await orderInService.getOrderDetail(id, user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.driverConfirmItems = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "driver") {
      const error = new Error("Hanya Driver yang boleh konfirmasi barang");
      error.status = 403;
      throw error;
    }

    const { id } = req.params;
    const result = await orderInService.driverConfirm(id, user.id);

    res.json({
      message: "Order telah ditandai sedang dihantar",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

exports.managerConfirmItems = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "manager_outlet") {
      const error = new Error("Hanya Manager Outlet yang boleh konfirmasi");
      error.status = 403;
      throw error;
    }

    const { id } = req.params;
    const result = await orderInService.managerConfirm(id, user.id);

    res.json({
      message: "Order telah ditandai selesai",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
