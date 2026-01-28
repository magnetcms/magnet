import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type PrivateRouteProps = {
	redirectTo?: string
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
	redirectTo = '/auth',
}) => {
	const { isAuthenticated, isLoading, error } = useAuth()

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
			</div>
		)
	}

	// Redirect to auth if not authenticated or if there's an auth error (e.g., 401)
	if (!isAuthenticated || error) {
		return <Navigate to={redirectTo} replace />
	}

	return <Outlet />
}
