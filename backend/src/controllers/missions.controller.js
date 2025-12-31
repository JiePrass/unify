const missionService = require('../services/missions.service')

exports.getMyMissions = async (req, res) => {
    const userId = req.user.id
    const missions = await missionService.getUserMissions(userId)
    res.json(missions)
}

exports.getMissionById = async (req, res) => {
    const userId = req.user.id
    const missionId = Number(req.params.id)
    const data = await missionService.getMissionById(missionId, userId)

    return res.json({
        success: true,
        data,
    });
}
