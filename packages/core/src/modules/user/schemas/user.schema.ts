import { Prop, Schema } from '@magnet/common'
import { hash } from 'bcryptjs'

@Schema()
export class User {
	@Prop({ required: true, unique: true })
	email!: string

	@Prop({ required: true })
	password!: string

	@Prop({ required: true })
	name!: string

	@Prop()
	role!: string

	async hashPassword() {
		this.password = await hash(this.password, 10)
	}
}
