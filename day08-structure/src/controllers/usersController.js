const usersService = require('../services/usersService')

const getAll = async (req, res, next) => {
  try {
    const users = await usersService.getAllUsers()
    res.status(200).json(users)
  } catch (err) {
    next(err)
  }
}

const getOne = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'id must be a number' })
    }
    const user = await usersService.getUserById(id)
    res.status(200).json(user)
  } catch (err) {
    next(err)
  }
}

const create = async (req, res, next) => {
  try {
    const user = await usersService.createUser(req.body)
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
}

module.exports = { getAll, getOne, create }