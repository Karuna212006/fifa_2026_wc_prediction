// ──────────────────────────────────────────────────────────────────────────────
// Real FIFA World Cup 2026 Statistics (sourced from FIFA.com & verified sources)
// Last verified: July 2026 (tournament concluded July 19, 2026)
// ──────────────────────────────────────────────────────────────────────────────
export const fallbackStats = {
  topScorers: [
    { id: 'f1', name: 'Kylian Mbappé', countryCode: 'fr', country: 'France', team: 'Paris Saint-Germain', goals: 10, photo: null },
    { id: 'f2', name: 'Lionel Messi', countryCode: 'ar', country: 'Argentina', team: 'Inter Miami', goals: 8, photo: null },
    { id: 'f3', name: 'Erling Haaland', countryCode: 'no', country: 'Norway', team: 'Manchester City', goals: 7, photo: null },
    { id: 'f4', name: 'Jude Bellingham', countryCode: 'gb-eng', country: 'England', team: 'Real Madrid', goals: 7, photo: null },
    { id: 'f5', name: 'Ousmane Dembélé', countryCode: 'fr', country: 'France', team: 'Paris Saint-Germain', goals: 6, photo: null },
    { id: 'f6', name: 'Harry Kane', countryCode: 'gb-eng', country: 'England', team: 'Bayern Munich', goals: 6, photo: null },
  ],
  assists: [
    // Source: FIFA.com official stats — Michael Olise led with 5 assists
    { id: 'fa1', name: 'Michael Olise', countryCode: 'fr', country: 'France', team: 'Bayern Munich', assists: 5, photo: null },
    { id: 'fa2', name: 'Bruno Guimarães', countryCode: 'br', country: 'Brazil', team: 'Newcastle United', assists: 4, photo: null },
    { id: 'fa3', name: 'Kylian Mbappé', countryCode: 'fr', country: 'France', team: 'Paris Saint-Germain', assists: 4, photo: null },
    { id: 'fa4', name: 'Lionel Messi', countryCode: 'ar', country: 'Argentina', team: 'Inter Miami', assists: 4, photo: null },
    { id: 'fa5', name: 'Lamine Yamal', countryCode: 'es', country: 'Spain', team: 'Barcelona', assists: 3, photo: null },
    { id: 'fa6', name: 'Vinícius Júnior', countryCode: 'br', country: 'Brazil', team: 'Real Madrid', assists: 3, photo: null },
  ],
  yellowCards: [
    // Source: Argentina had most team yellow cards (15 total). Leandro Paredes, Otamendi, Romero, L. Martínez were most carded Argentine players
    { id: 'fy1', name: 'Leandro Paredes', countryCode: 'ar', country: 'Argentina', team: 'Roma', yellowCards: 3, photo: null },
    { id: 'fy2', name: 'Nicolás Otamendi', countryCode: 'ar', country: 'Argentina', team: 'Benfica', yellowCards: 3, photo: null },
    { id: 'fy3', name: 'Cristian Romero', countryCode: 'ar', country: 'Argentina', team: 'Tottenham Hotspur', yellowCards: 3, photo: null },
    { id: 'fy4', name: 'Lisandro Martínez', countryCode: 'ar', country: 'Argentina', team: 'Manchester United', yellowCards: 3, photo: null },
    { id: 'fy5', name: 'Bruno Guimarães', countryCode: 'br', country: 'Brazil', team: 'Newcastle United', yellowCards: 2, photo: null },
    { id: 'fy6', name: 'Vinícius Júnior', countryCode: 'br', country: 'Brazil', team: 'Real Madrid', yellowCards: 2, photo: null },
  ],
  redCards: [
    // Source: Opening match (South Africa 3 red cards + Mexico 1); Enzo Fernández in the Final vs Spain
    { id: 'fr1', name: 'Sphephelo Sithole', countryCode: 'za', country: 'South Africa', team: 'TS Galaxy', redCards: 1, photo: null },
    { id: 'fr2', name: 'Themba Zwane', countryCode: 'za', country: 'South Africa', team: 'Mamelodi Sundowns', redCards: 1, photo: null },
    { id: 'fr3', name: 'César Montes', countryCode: 'mx', country: 'Mexico', team: 'Monterrey', redCards: 1, photo: null },
    { id: 'fr4', name: 'Enzo Fernández', countryCode: 'ar', country: 'Argentina', team: 'Chelsea', redCards: 1, photo: null },
  ],
  cleanSheets: [
    // Source: Unai Simón won Golden Glove with RECORD 7 clean sheets (tournament record, 650 consecutive mins without conceding)
    { id: 'fc1', name: 'Unai Simón', countryCode: 'es', country: 'Spain', team: 'Athletic Club', cleanSheets: 7, photo: null },
    { id: 'fc2', name: 'Emiliano Martínez', countryCode: 'ar', country: 'Argentina', team: 'Aston Villa', cleanSheets: 4, photo: null },
    { id: 'fc3', name: 'Mike Maignan', countryCode: 'fr', country: 'France', team: 'AC Milan', cleanSheets: 4, photo: null },
    { id: 'fc4', name: 'Alisson Becker', countryCode: 'br', country: 'Brazil', team: 'Liverpool', cleanSheets: 3, photo: null },
    { id: 'fc5', name: 'Jordan Pickford', countryCode: 'gb-eng', country: 'England', team: 'Everton', cleanSheets: 3, photo: null },
  ],
  lastManualUpdate: "2026-07-27"
};
