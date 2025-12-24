const missionService = require('../services/admin/admin-missions.service')
const cancelEventService = require('../services/admin/admin-report.service')

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
exports.getCancelEvents = async (req, res) => {
    try {
        const {
            actor,
            stage,
            minViolationScore,
            from,
            to,
        } = req.query;

        const data = await cancelEventService.getCancelEventsForAdmin({
            actor,
            stage,
            minViolationScore: minViolationScore
                ? Number(minViolationScore)
                : undefined,
            from,
            to,
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

