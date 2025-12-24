const missionService = require('../services/missions.service')

exports.getMyMissions = async (req, res) => {
    const userId = req.user.id
    const missions = await missionService.getUserMissions(userId)
    res.json(missions)
}
