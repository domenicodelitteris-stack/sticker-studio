// Base URL per le Azure Functions (da configurare in produzione)
const API_BASE_URL = "/api";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Funzione di test - simula una chiamata API
 * In produzione, questa chiamerà le Azure Functions
 */
export async function testApi(): Promise<ApiResponse<{ message: string }>> {
  try {
    // Simula una chiamata API (in produzione sarà: fetch(`${API_BASE_URL}/test`))
    console.log("🚀 Chiamata API in corso...");
    
    // Simula un delay di rete
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const response = {
      success: true,
      data: {
        message: "API chiamata con successo! Timestamp: " + new Date().toISOString(),
      },
    };
    
    console.log("✅ Risposta API:", response);
    return response;
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
