import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '@magnet/ui/components'
import { names } from '@magnet/utils'
import {
	AudioWaveform,
	Boxes,
	BookOpen,
	Command,
	Database,
	GalleryVerticalEnd,
	Settings2,
} from 'lucide-react'
import * as React from 'react'
import { useAdmin } from '~/contexts/useAdmin'
import { EnvSwitcher } from './EnvSwitcher'
import { NavMain } from './NavMain'
import { NavProjects } from './NavProjects'
import { NavUser } from './NavUser'

const staticData = {
	user: {
		name: 'shadcn',
		email: 'm@example.com',
		avatar: '/avatars/shadcn.jpg',
	},
	environments: [
		{ name: 'Development', logo: GalleryVerticalEnd, plan: 'Enterprise' },
		{ name: 'Homologation', logo: AudioWaveform, plan: 'Startup' },
		{ name: 'Production', logo: Command, plan: 'Free' },
	],
	projects: [{ name: 'Documentation', url: '/', icon: BookOpen }],
}

export const AppSidebar = ({
	...props
}: React.ComponentProps<typeof Sidebar>) => {
	const { schemas, settings } = useAdmin()

	const contentManagerItems = schemas?.map((item: string) => {
		const name = names(item)
		return {
			title: name.title,
			url: `/content-manager/${name.key}`,
		}
	}) || [{ title: 'No Content Available', url: '/' }]

	const settingsItems = settings?.map((item: string) => {
		const name = names(item)
		return {
			title: name.title,
			url: `/settings/${name.key}`,
		}
	}) || [{ title: 'No Settings Available', url: '/' }]

	const sidebarMenus = [
		{
			title: 'Content Manager',
			url: '/',
			icon: Database,
			isActive: true,
			items: contentManagerItems,
		},
		{
			title: 'Playground',
			url: '/playground',
			icon: Boxes,
			items: [
				{ title: 'All Schemas', url: '/playground' },
				{ title: 'Create New', url: '/playground/new' },
				...contentManagerItems.map((item) => ({
					title: item.title,
					url: `/playground/${item.url.split('/').pop()}`,
				})),
			],
		},
		{
			title: 'Settings',
			url: '/',
			icon: Settings2,
			items: settingsItems,
		},
	]

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<EnvSwitcher environments={staticData.environments} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={sidebarMenus} />
				<NavProjects projects={staticData.projects} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={staticData.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
