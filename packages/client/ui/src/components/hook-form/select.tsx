import { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { cn } from '../../lib/utils'

type RHFSelectProps = {
	name: string
	label: string
	options: { value: string; label: string }[]
	description?: ReactElement | string
	disabled?: boolean
	multiple?: boolean
}

export const RHFSelect = ({
	name,
	label,
	options,
	description,
	disabled,
	multiple,
}: RHFSelectProps) => {
	const { control } = useFormContext()

	// Multi-select implementation using checkboxes
	if (multiple) {
		return (
			<FormField
				name={name}
				control={control}
				render={({ field }) => {
					const selectedValues: string[] = Array.isArray(field.value)
						? field.value
						: field.value
							? [field.value]
							: []

					const handleToggle = (value: string) => {
						const newValues = selectedValues.includes(value)
							? selectedValues.filter((v) => v !== value)
							: [...selectedValues, value]
						field.onChange(newValues)
					}

					return (
						<FormItem className="gap-1">
							<FormLabel>{label}</FormLabel>
							<FormControl>
								<div className="border rounded-md p-3 space-y-2">
									{options.map((option) => {
										const optionId = `${name}-${option.value}`
										return (
											<div
												key={option.value}
												className={cn(
													'flex items-center space-x-2 p-2 rounded hover:bg-muted',
													disabled && 'opacity-50',
												)}
											>
												<Checkbox
													id={optionId}
													checked={selectedValues.includes(option.value)}
													disabled={disabled}
													onCheckedChange={() => handleToggle(option.value)}
												/>
												<label
													htmlFor={optionId}
													className="text-sm cursor-pointer"
												>
													{option.label}
												</label>
											</div>
										)
									})}
								</div>
							</FormControl>
							<FormDescription>{description}</FormDescription>
							<FormMessage />
						</FormItem>
					)
				}}
			/>
		)
	}

	// Single select implementation
	return (
		<FormField
			name={name}
			control={control}
			render={({ field }) => (
				<FormItem className="gap-1">
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Select
							onValueChange={field.onChange}
							defaultValue={field.value}
							disabled={disabled}
							value={field.value}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select an option" />
							</SelectTrigger>
							<SelectContent>
								{options.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormControl>
					<FormDescription>{description}</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
