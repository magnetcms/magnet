import { InjectModel, Model } from '@magnet/common'
import { Injectable } from '@nestjs/common'
import { User } from './schemas/user.schema'

@Injectable()
export class UserService {
	constructor(@InjectModel(User) private readonly userModel: Model<User>) {}

	async findAll() {
		return this.userModel.find()
	}

	async findOne(query: Partial<User>) {
		return this.userModel.findOne(query)
	}

	async create(userData: Partial<User>) {
		const newUser = this.userModel.create(userData)
		return newUser
	}
}
