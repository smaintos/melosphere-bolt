// Système d'événements simple pour la communication entre composants
type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  // S'abonner à un événement
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Retourner une fonction de désabonnement
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  // Publier un événement
  publish(event: string, ...args: any[]): void {
    const callbacks = this.events[event] || [];
    callbacks.forEach(callback => callback(...args));
  }
}

// Événements disponibles dans l'application
export enum AppEvents {
  PROFILE_UPDATED = 'profile-updated',
}

// Instance singleton de EventBus
export const eventBus = new EventBus(); 