let users = [
  { id: 1, name: 'Alice', email: 'alice@test.com' },
  { id: 2, name: 'Bob', email: 'bob@test.com' },
]

const findAll = () => users

const findById = (id) => users.find(u => u.id === id)

const findByEmail = (email) => users.find(u => u.email === email)

const create = (data) => {
  const user = { id: users.length + 1, ...data }
  users.push(user)
  return user
}

module.exports = { findAll, findById, findByEmail, create }