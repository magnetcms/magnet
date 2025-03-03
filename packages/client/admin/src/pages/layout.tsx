type LayoutProps = {
	children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
	return <div className="flex flex-col h-screen">{children}</div>
}

export default Layout
