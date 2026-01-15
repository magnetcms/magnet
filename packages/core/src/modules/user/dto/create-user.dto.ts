import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
} from 'class-validator'

export class CreateUserDto {
	@IsEmail()
	@IsNotEmpty()
	email!: string

	@IsString()
	@Length(6, 100)
	@IsNotEmpty()
	password!: string

	@IsString()
	@Length(2, 100)
	@IsNotEmpty()
	name!: string

	@IsString()
	@IsOptional()
	role?: string
}
