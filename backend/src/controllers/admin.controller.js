const missionService = require('../services/admin/admin-missions.service')
const cancelHelpRequestService = require('../services/admin/admin-cancel-help.service')
const dashboardService = require ('../services/admin/admin-dashboard.service')

// ======================== Missions Management ========================
exports.createMission = async (req, res) => {
    const mission = await missionService.createMission(req.body)
    res.status(201).json(mission)
}

exports.getAllMissions = async (req, res) => {
    const missions = await missionService.getAllMissions()
    res.json(missions)
}

exports.getMissionById = async (req, res) => {
    const mission = await missionService.getMissionById(
        Number(req.params.id)
    )
    res.json(mission)
}

exports.deleteMission = async (req, res) => {
    await missionService.deleteMission(Number(req.params.id))
    res.json({ message: 'Misi berhasil dihapus' })
}

// ======================== Cancel Events Report ========================
exports.getCancelHelpRequest = async (req, res) => {
    try {
        const {
            actor,
            stage,
            minViolationScore,
            from,
            to,
            onlyPending,
        } = req.query;

        const parsedOnlyPending =
            onlyPending === "true"
                ? true
                : onlyPending === "false"
                ? false
                : undefined;

        const data =
            await cancelHelpRequestService.getCancelHelpRequestForAdmin({
                actor,
                stage,
                minViolationScore: minViolationScore
                    ? Number(minViolationScore)
                    : undefined,
                from,
                to,
                onlyPending: parsedOnlyPending,
            });

        return res.json({
            success: true,
            data,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};


exports.executeCancelHelpRequestPenalty = async (req, res) => {
    try {
        const cancelHelpRequestId = Number(req.params.id);
        const adminId = req.user.id;
        const { targetUserId, notes } = req.body || {};

        const options = {
            targetUserId: targetUserId ? Number(targetUserId) : null,
            notes,
        };

        const result = await cancelHelpRequestService.executePenalty(
            cancelHelpRequestId,
            adminId,
            options
        );

        return res.json({
            success: true,
            message: 'Penalty executed successfully',
            data: result,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

exports.getCancelHelpRequestDetail = async (req, res) => {
    try {
        const cancelHelpRequestId = Number(req.params.id);
        const result = await cancelHelpRequestService.getCancelHelpRequestDetail(cancelHelpRequestId);

        return res.json({
            success: true,
            data: result,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

// ======================== DASHBOARD ========================
exports.getDashboardData = async (req, res) => {
    try {
        const year = req.query.year
            ? Number(req.query.year)
            : new Date().getFullYear();

        const data =
            await dashboardService.getDashboardData(year);

        return res.json({
            success: true,
            data,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
