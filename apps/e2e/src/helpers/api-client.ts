import type { APIRequestContext } from '@playwright/test'

export interface Cat {
	id: string
	name: string
	age: number
	breed: string
}

export interface AuthResponse {
	access_token: string
}

export interface RegisterData {
	email: string
	password: string
	name: string
	role: string
}

export interface AuthStatus {
	authenticated: boolean
	requiresSetup?: boolean
	message?: string
	user?: {
		id: string
		email: string
		role: string
	}
}

export class ApiClient {
	private token?: string

	constructor(
		private request: APIRequestContext,
		private baseURL: string,
	) {}

	setToken(token: string) {
		this.token = token
	}

	private getHeaders() {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		}
		if (this.token) {
			headers.Authorization = `Bearer ${this.token}`
		}
		return headers
	}

	// Health endpoints
	async getHealth() {
		return this.request.get(`${this.baseURL}/health`, {
			headers: this.getHeaders(),
		})
	}

	// Auth endpoints
	async getAuthStatus(): Promise<AuthStatus> {
		const response = await this.request.get(`${this.baseURL}/auth/status`, {
			headers: this.getHeaders(),
		})
		return response.json()
	}

	async register(data: RegisterData): Promise<AuthResponse> {
		const response = await this.request.post(`${this.baseURL}/auth/register`, {
			headers: this.getHeaders(),
			data,
		})
		return response.json()
	}

	async login(email: string, password: string): Promise<AuthResponse> {
		const response = await this.request.post(`${this.baseURL}/auth/login`, {
			headers: this.getHeaders(),
			data: { email, password },
		})
		return response.json()
	}

	async getMe() {
		return this.request.get(`${this.baseURL}/auth/me`, {
			headers: this.getHeaders(),
		})
	}

	// Cats CRUD endpoints
	async createCat(data: Omit<Cat, 'id'>) {
		return this.request.post(`${this.baseURL}/cats`, {
			headers: this.getHeaders(),
			data,
		})
	}

	async getCats() {
		return this.request.get(`${this.baseURL}/cats`, {
			headers: this.getHeaders(),
		})
	}

	async getCat(id: string) {
		return this.request.get(`${this.baseURL}/cats/${id}`, {
			headers: this.getHeaders(),
		})
	}

	async updateCat(id: string, data: Partial<Cat>) {
		return this.request.put(`${this.baseURL}/cats/${id}`, {
			headers: this.getHeaders(),
			data,
		})
	}

	async deleteCat(id: string) {
		return this.request.delete(`${this.baseURL}/cats/${id}`, {
			headers: this.getHeaders(),
		})
	}

	// Discovery endpoints
	async getSchemas() {
		return this.request.get(`${this.baseURL}/discovery/schemas`, {
			headers: this.getHeaders(),
		})
	}
}
