const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
	_id: new ObjectID(),
	text: 'First test todo'
},{
	_id: new ObjectID(),
	text: 'Second test todo',
	completed: true,
	completedAt: 333
}];

beforeEach( (done) => {
	Todo.remove({}).then( () => {
		return Todo.insertMany(todos);
	}).then( () => {
		done();
	});	
});

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		var text = 'Test text todos';

		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect( (res) => {
				expect(res.body.text).toBe(text);
			})
			.end( (err, res) => {
				if (err) {
					return done(err);
				}

				Todo.find({text}).then( (todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch( (e) => {
					done(e);
				});
			});
	});

	it('should not create todo with invalid body data', (done) => {
		request(app)
			.post('/todos')
			.send({})
			.expect(400)
			.end( (err, res) => {
				if (err) {
					return done(err);
				}

				Todo.find().then( (todos) => {
					expect(todos.length).toBe(2);
					done();
				}).catch( (e) => {
					done(e);
				});
			});
	});


});


describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect( (res) => {
				expect(res.body.todos.length).toBe(2);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('should return todo doc', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect( (res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			} )
			.end(done);
	});

	it('should return 404 if todo not found', (done) => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.end(done);
	});

	it('should return 404 for non-object ids', (done) => {
		request(app)
			.get('/todos/123')
			.expect(404)
			.end(done);
	});
});

describe('DELETE /todos/:id', () => {
	it('should delete a todo doc', (done) => {
		var hexId = todos[0]._id.toHexString();
		
		request(app)
			.delete(`/todos/${hexId}`)
			.expect(200)
			.expect( (res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			} )
			.end( (err, res) => {
				if (err) {
					return done(err);
				}

				Todo.findById(hexId).then( (todo) => {
					expect(todo).toNotExist();
					done();
				}).catch( (e) => {
					done(e);
				});
			} );
	});

	it('should return 404 if todo is not found', (done) => {
		request(app)
			.delete(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.end(done);
	});

	it('should not delete anything if id is invalid', (done) => {
		request(app)
			.delete(`/todos/123`)
			.expect(404)
			.end(done);
	});
});


describe('PATCH /todos/:id', () => {
	it('should update the todo', (done) => {
		var HexId = todos[0]._id.toHexString();
		var text = 'Updated first todo';

		request(app)
			.patch(`/todos/${HexId}`)
			.send({
				text,
				completed: true
			})
			.expect(200)
			.expect( (res) => {
				expect(res.body.todo.text).toBe(text);
				expect(res.body.todo.completed).toBe(true);
				expect(res.body.todo.completedAt).toBeA('number');
			})
			.end(done);
	});

	it('should clear completedAt when todo is not completed', (done) => {
		var HexId = todos[1]._id
		var text = 'Update second todo';

		request(app)
			.patch(`/todos/${HexId}`)
			.send({
				text,
				completed: false
			})
			.expect(200)
			.expect( (res) => {
				expect(res.body.todo.text).toBe(text);
				expect(res.body.todo.completed).toBe(false);
				expect(res.body.todo.completedAt).toNotExist();
			})
			.end(done);
	});
});

describe('Get /users/me', () => {
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			.ser('x-auth', user[0].tokens[0].token)
			.expect(200)
			.expect( (res) => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email)
			})
	});

	it('should return 401 if not authenticated', (done) => {
		
	});
});
