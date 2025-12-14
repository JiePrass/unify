const missionService = require('../services/missions/admin-missions.service')

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
