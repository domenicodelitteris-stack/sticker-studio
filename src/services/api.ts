// Base URL per le Azure Functions
const API_BASE_URL = "/api";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Chiama la Azure Function /api/test
 */
export async function testApi(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
  try {
    console.log("🚀 Chiamata Azure Function /api/test...");
    
    const response = await fetch(`${API_BASE_URL}/test`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("✅ Risposta Azure Function:", data);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("❌ Errore API:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
}

/**
 * Esempio di chiamata GET generica
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
}

/**
 * Esempio di chiamata POST generica
 */
export async function apiPost<T, B>(endpoint: string, body: B): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
}
