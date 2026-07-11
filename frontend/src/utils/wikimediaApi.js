/**
 * Fetches a player's image from Wikimedia Commons based on their name and country.
 * 
 * @param {string} playerName 
 * @param {string} countryName 
 * @returns {Promise<string>} The URL of the image, or the fallback image path.
 */
export const getWikimediaPlayerImage = async (playerName, countryName) => {
  if (!playerName) return '/default-player.svg';

  // Search Wikimedia for player photo
  const searchTerm = `${playerName} ${countryName} footballer`;
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&pithumbsize=300&titles=${encodeURIComponent(searchTerm)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    // -1 indicates page not found
    if (pageId !== "-1" && pages[pageId].thumbnail) {
      return pages[pageId].thumbnail.source;
    }
  } catch (error) {
    console.error('Failed to fetch player image:', error);
  }
  
  // Fallback to default player silhouette
  return '/default-player.svg';
};
