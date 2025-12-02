const helpAssignmentService = require("../services/help/helpAssignment.service");
const helpRequestService = require("../services/help/helpRequest.service");
const helpStatusService = require("../services/help/helpStatus.service");


// ============================== HELP ASSIGNMENT CONTROLLER ==============================
exports.takeHelpRequest = async (req, res) => {
    try {
        const helperId = req.user.id;
        const helpRequestId = Number(req.params.id);

        const assignment = await helpAssignmentService.takeHelpRequest(helperId, helpRequestId);
        return res.status(201).json({ success: true, data: assignment });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

exports.confirmHelper = async (req, res) => {
    try {
        const helpRequestId = Number(req.params.id);
        const assignmentId = Number(req.body.assignmentId);

        const updated = await helpAssignmentService.confirmHelper(helpRequestId, assignmentId);
        return res.json({ success: true, data: updated });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

exports.cancelHelpRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const helpId = Number(req.params.id);

        const result = await helpAssignmentService.cancelHelpRequest(userId, helpId);
        return res.json({ success: true, data: result });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};


// ============================== HELP REQUEST CONTROLLER ==============================
exports.createHelpRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;

        const help = await helpRequestService.createHelpRequest(userId, data);
        return res.status(201).json({ success: true, data: help });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.getNearbyHelpRequests = async (req, res) => {
    try {
        const { latitude, longitude, radius } = req.query;

        const helpList = await helpRequestService.getNearbyHelpRequests(
            Number(latitude),
            Number(longitude),
            Number(radius || 5000)
        );

        return res.json({ success: true, data: helpList });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.getHelpRequestById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const help = await helpRequestService.getHelpRequestById(id);
        if (!help) {
            return res.status(404).json({ success: false, message: "Help request not found." });
        }

        return res.json({ success: true, data: help });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteHelpRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const helpId = Number(req.params.id);

        const deleted = await helpRequestService.deleteHelpRequest(userId, helpId);
        if (!deleted) {
            return res.status(403).json({ success: false, message: "Unauthorized or not found." });
        }

        return res.json({ success: true, message: "Help request deleted." });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ============================== HELP STATUS CONTROLLER ==============================
exports.markCompleted = async (req, res) => {
    try {
        const assignmentId = Number(req.params.assignmentId);

        const result = await helpStatusService.markCompleted(assignmentId);
        return res.json({ success: true, data: result });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

exports.markFailed = async (req, res) => {
    try {
        const assignmentId = Number(req.params.assignmentId);

        const result = await helpStatusService.markFailed(assignmentId);
        return res.json({ success: true, data: result });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

exports.forceTimeout = async (req, res) => {
    try {
        const helpRequestId = Number(req.params.id);

        const result = await helpStatusService.markTimeout(helpRequestId);
        return res.json({ success: true, data: result });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

exports.forceGraceCancel = async (req, res) => {
    try {
        const helpRequestId = Number(req.params.id);

        const result = await helpStatusService.markGracePeriodEnd(helpRequestId);
        return res.json({ success: true, data: result });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};
