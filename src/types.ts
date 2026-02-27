// SQLite table types for Electron app

export interface User {
	id: number;
	name: string;
	email: string;
	password: string;
	role: string;
	created_at: string; // ISO date string
	updated_at: string; // ISO date string
}

export interface Sale {
	id: number;
	items: string; // JSON string or serialized items
	total_amount: number;
	payment_method: string;
	created_at: string;
	updated_at: string;
}

export interface Category {
	id: number;
	name: string;
	created_at: string;
	updated_at: string;
}

export interface Product {
	id: number;
	name: string;
	sku: string;
	price: number;
	image?: string;
	category_id?: number | null;
	quantity: number;
	description?: string;
	created_at: string;
	updated_at: string;
}
