const usersDb = require('../db/queries/users')

class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

const getAllUsers = () => {
  return usersDb.findAll()
}

const getUserById = (id) => {
  const user = usersDb.findById(id)
  if (!user) throw new AppError('user not found', 404)
  return user
}

const createUser = (data) => {
  const { name, email } = data

  if (!name || !email) {
    throw new AppError('name and email are required', 400)
  }

  const exists = usersDb.findByEmail(email)
  if (exists) throw new AppError('email already exists', 409)

  return usersDb.create({ name, email })
}

module.exports = { getAllUsers, getUserById, createUser }